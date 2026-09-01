import cv2
from abc import ABC, abstractmethod
from typing import Generator

class BaseStreamAdapter(ABC):
    """Abstract base class for vendor-neutral video ingestion."""
    def __init__(self, source_url: str):
        self.source_url = source_url

    @abstractmethod
    def get_frame_stream(self) -> Generator:
        pass

class RTSPStreamAdapter(BaseStreamAdapter):
    """Generic RTSP / Video file ingestion adapter."""
    def get_frame_stream(self) -> Generator:
        cap = cv2.VideoCapture(self.source_url)
        try:
            while cap.isOpened():
                ret, frame = cap.read()
                if not ret:
                    break
                yield frame
        finally:
            cap.release()
