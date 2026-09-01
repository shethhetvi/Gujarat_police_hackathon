from typing import Dict
from app.services.ingestion.adapter import BaseStreamAdapter, RTSPStreamAdapter

class StreamManager:
    """Manages multi-camera video feed ingestion lifecycles."""
    def __init__(self):
        self.active_streams: Dict[int, BaseStreamAdapter] = {}

    def start_camera_stream(self, camera_id: int, stream_url: str) -> BaseStreamAdapter:
        adapter = RTSPStreamAdapter(stream_url)
        self.active_streams[camera_id] = adapter
        return adapter

    def stop_camera_stream(self, camera_id: int):
        if camera_id in self.active_streams:
            del self.active_streams[camera_id]

stream_manager = StreamManager()
