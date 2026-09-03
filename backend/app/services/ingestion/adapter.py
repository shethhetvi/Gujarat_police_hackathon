import os
import time
import logging
import cv2
from abc import ABC, abstractmethod
from typing import Generator, Tuple, Optional

# Force RTSP over TCP as mandated by Gujarat Police Sentinel Sandbox
os.environ["OPENCV_FFMPEG_CAPTURE_OPTIONS"] = "rtsp_transport;tcp"
logger = logging.getLogger("sentinelgrid.ingestion")

class BaseStreamAdapter(ABC):
    """Abstract base class for vendor-neutral video ingestion."""
    def __init__(self, source_url: str):
        self.source_url = source_url

    @abstractmethod
    def get_frame_stream(self) -> Generator:
        pass

class RTSPStreamAdapter(BaseStreamAdapter):
    """
    Robust RTSP Stream Ingestion Adapter.
    Features:
    - Forces TCP transport (avoids UDP NAT packet drops)
    - Extracts Presentation Timestamp (PTS) from stream
    - Automatic exponential backoff reconnection on supervision restart
    """
    def __init__(self, source_url: str, max_reconnect_attempts: int = 5):
        super().__init__(source_url)
        self.max_reconnect_attempts = max_reconnect_attempts

    def get_frame_stream(self) -> Generator[Tuple[any, float], None, None]:
        reconnect_delay = 2.0
        attempts = 0

        while attempts < self.max_reconnect_attempts:
            logger.info(f"Opening RTSP stream: {self.source_url} (TCP mode)")
            cap = cv2.VideoCapture(self.source_url, cv2.CAP_FFMPEG)
            
            if not cap.isOpened():
                logger.warning(f"Failed to open stream {self.source_url}. Retrying in {reconnect_delay}s...")
                time.sleep(reconnect_delay)
                reconnect_delay = min(reconnect_delay * 2, 30.0)
                attempts += 1
                continue

            attempts = 0
            reconnect_delay = 2.0

            try:
                while cap.isOpened():
                    ret, frame = cap.read()
                    if not ret:
                        logger.warning(f"Stream interrupted on {self.source_url}. Attempting auto-reconnect...")
                        break

                    # Read Presentation Timestamp (PTS) in milliseconds
                    pts_ms = cap.get(cv2.CAP_PROP_POS_MSEC)
                    yield frame, pts_ms
            finally:
                cap.release()

            time.sleep(reconnect_delay)
            attempts += 1

