import cv2
import numpy as np
from typing import Tuple, List, Optional
import logging

logger = logging.getLogger("sentinelgrid.enhancer")

class CCTVEnhancer:
    """
    Advanced Surveillance Image Enhancement Engine for Extreme CCTV Conditions:
      - Low-light & Nighttime darkness (underexposure)
      - Direct Headlight / Sun Glare (overexposure & wash-out)
      - Severe atmospheric degradation (fog, rain, smog, dust)
      - Heavy compression artifacts & sensor digital grain
      - Perspective skew / angled pole mounting
    """

    @staticmethod
    def analyze_lighting_condition(image: np.ndarray) -> str:
        """
        Determines the optical condition of the frame/crop:
        Returns: 'NIGHT_DARK', 'DAY_GLARE', 'LOW_CONTRAST_FOG', or 'NORMAL'
        """
        if image is None or image.size == 0:
            return "NORMAL"

        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY) if len(image.shape) == 3 else image
        mean_lum = np.mean(gray)
        std_lum = np.std(gray)

        if mean_lum < 55:
            return "NIGHT_DARK"
        elif mean_lum > 200:
            return "DAY_GLARE"
        elif std_lum < 32:
            return "LOW_CONTRAST_FOG"
        else:
            return "NORMAL"

    @staticmethod
    def adaptive_gamma_correction(image: np.ndarray, target_midpoint: float = 0.5) -> np.ndarray:
        """
        Dynamically calculates and applies optimal gamma correction based on mean luminance:
        gamma = log(target_midpoint) / log(mean_luminance / 255.0)
        Brightens pitch-black night frames and tames overexposed daytime glare.
        """
        if image is None or image.size == 0:
            return image

        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY) if len(image.shape) == 3 else image
        mean_val = float(np.mean(gray)) / 255.0

        if mean_val <= 0.05:
            gamma = 0.45  # Strong brightening for near-black frames
        elif mean_val >= 0.85:
            gamma = 1.75  # Tone down blinding glare
        else:
            gamma = np.log(target_midpoint) / np.log(max(0.01, mean_val))
            gamma = np.clip(gamma, 0.4, 2.2)

        # Build lookup table for fast execution
        inv_gamma = 1.0 / gamma
        table = np.array([((i / 255.0) ** inv_gamma) * 255 for i in np.arange(0, 256)]).astype("uint8")
        return cv2.LUT(image, table)

    @classmethod
    def enhance_frame_for_detection(cls, frame: np.ndarray) -> np.ndarray:
        """
        Full-frame enhancement pipeline for extreme CCTV conditions prior to YOLO detection:
        - Balances illumination across frame
        - Boosts vehicle silhouettes in night/shadow regions
        - Preserves edge structure for accurate bounding box detection
        """
        if frame is None or frame.size == 0:
            return frame

        condition = cls.analyze_lighting_condition(frame)
        if condition == "NORMAL":
            return frame

        try:
            # Convert to LAB color space for luminance equalization without color distortion
            lab = cv2.cvtColor(frame, cv2.COLOR_BGR2LAB)
            l_channel, a_channel, b_channel = cv2.split(lab)

            if condition == "NIGHT_DARK":
                # Adaptive gamma brightening + high-contrast CLAHE on L channel
                l_bright = cls.adaptive_gamma_correction(l_channel, target_midpoint=0.55)
                clahe = cv2.createCLAHE(clipLimit=3.5, tileGridSize=(8, 8))
                l_enhanced = clahe.apply(l_bright)
            elif condition == "DAY_GLARE":
                # Glare suppression + moderate CLAHE
                l_toned = cls.adaptive_gamma_correction(l_channel, target_midpoint=0.45)
                clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
                l_enhanced = clahe.apply(l_toned)
            else:  # LOW_CONTRAST_FOG
                # Defogging / contrast stretch
                clahe = cv2.createCLAHE(clipLimit=4.0, tileGridSize=(8, 8))
                l_enhanced = clahe.apply(l_channel)

            merged_lab = cv2.merge((l_enhanced, a_channel, b_channel))
            enhanced_bgr = cv2.cvtColor(merged_lab, cv2.COLOR_LAB2BGR)
            return enhanced_bgr
        except Exception as e:
            logger.warning(f"Frame enhancement fallback: {e}")
            return frame

    @classmethod
    def enhance_plate_roi(cls, plate_crop: np.ndarray) -> List[np.ndarray]:
        """
        Multi-candidate super-resolution & binarization generator for extreme condition ANPR.
        Returns a list of 4 specialized enhanced candidate crops:
          1. Super-Resolution CLAHE + Bilateral Filter (all-purpose)
          2. Morphological Top-Hat/Black-Hat (isolates dirty / low-contrast letters)
          3. Gamma-adjusted High-Pass Sharpen (recovers underexposed / night plates)
          4. Adaptive Gaussian Binarized (sharp black-and-white character strokes)
        """
        if plate_crop is None or plate_crop.size == 0:
            return []

        h, w = plate_crop.shape[:2]
        # Super-resolution upscale: ensure plate height is at least 70px for OCR accuracy
        target_h = max(70, h)
        scale = target_h / float(max(1, h))
        target_w = int(w * scale)
        
        # Bicubic interpolation for smooth character edge scaling
        upscaled = cv2.resize(plate_crop, (target_w, target_h), interpolation=cv2.INTER_CUBIC)
        gray = cv2.cvtColor(upscaled, cv2.COLOR_BGR2GRAY) if len(upscaled.shape) == 3 else upscaled

        candidates = []

        # Candidate 1: Bilateral Denoise + CLAHE
        try:
            denoised = cv2.bilateralFilter(gray, 9, 65, 65)
            clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(6, 6))
            c1 = clahe.apply(denoised)
            candidates.append(c1)
        except Exception:
            candidates.append(gray)

        # Candidate 2: Morphological Black-Hat / Top-Hat (isolates dark letters on light plate)
        try:
            kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (13, 5))
            top_hat = cv2.morphologyEx(gray, cv2.MORPH_TOPHAT, kernel)
            black_hat = cv2.morphologyEx(gray, cv2.MORPH_BLACKHAT, kernel)
            # Add top hat and subtract black hat
            c2 = cv2.add(gray, top_hat)
            c2 = cv2.subtract(c2, black_hat)
            candidates.append(c2)
        except Exception:
            pass

        # Candidate 3: Unsharp Mask Sharpening
        try:
            gaussian = cv2.GaussianBlur(gray, (0, 0), 2.0)
            c3 = cv2.addWeighted(gray, 1.6, gaussian, -0.6, 0)
            candidates.append(c3)
        except Exception:
            pass

        # Candidate 4: Adaptive Gaussian Binarization
        try:
            c4 = cv2.adaptiveThreshold(
                gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
                cv2.THRESH_BINARY, 15, 6
            )
            candidates.append(c4)
        except Exception:
            pass

        # Candidate 5: Deskewed & Normalized (corrects acute pole-mounting CCTV angles)
        try:
            c5 = cls.deskew_roi(gray)
            if c5 is not None:
                candidates.append(c5)
        except Exception:
            pass

        return candidates

    @classmethod
    def deskew_roi(cls, gray: np.ndarray) -> Optional[np.ndarray]:
        """
        Detects and rectifies acute perspective tilt from pole-mounted CCTV angles:
        Calculates dominant character stroke orientation and aligns horizontally.
        """
        if gray is None or gray.size == 0:
            return None

        try:
            _, thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
            coords = np.column_stack(np.where(thresh > 0))
            if len(coords) < 15:
                return None

            angle = cv2.minAreaRect(coords)[-1]
            if angle < -45:
                angle = -(90 + angle)
            elif angle > 45:
                angle = 90 - angle
            else:
                angle = -angle

            if 1.5 < abs(angle) < 42.0:
                h, w = gray.shape[:2]
                center = (w // 2, h // 2)
                M = cv2.getRotationMatrix2D(center, angle, 1.0)
                deskewed = cv2.warpAffine(gray, M, (w, h), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)
                return deskewed
        except Exception:
            pass
        return None

    @classmethod
    def suppress_headlight_glare(cls, bgr_image: np.ndarray) -> np.ndarray:
        """
        Tames high-beam headlight flare washing out retro-reflective license plates.
        Decomposes high-intensity specular highlights using illumination-reflection model.
        """
        if bgr_image is None or bgr_image.size == 0:
            return bgr_image

        try:
            # Convert to YCrCb space
            ycrcb = cv2.cvtColor(bgr_image, cv2.COLOR_BGR2YCrCb)
            y, cr, cb = cv2.split(ycrcb)

            # Detect blinding specular highlight mask (Y > 230)
            glare_mask = cv2.inRange(y, 230, 255)
            if cv2.countNonZero(glare_mask) > (y.size * 0.05):
                # Apply local tone compression to highlights
                y_float = y.astype(np.float32) / 255.0
                # Logarithmic compression on bright spots
                y_compressed = np.where(y > 210, np.log1p(y_float * 1.5) / np.log1p(2.5) * 255.0, y)
                y_final = np.clip(y_compressed, 0, 255).astype(np.uint8)
                ycrcb_fixed = cv2.merge((y_final, cr, cb))
                return cv2.cvtColor(ycrcb_fixed, cv2.COLOR_YCrCb2BGR)
        except Exception:
            pass
        return bgr_image

cctv_enhancer = CCTVEnhancer()
