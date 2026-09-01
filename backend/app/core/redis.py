import logging
from app.core.config import settings

logger = logging.getLogger("sentinelgrid.redis")

_redis_client = None

def get_redis():
    global _redis_client
    if _redis_client is None:
        try:
            import redis
            _redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)
        except Exception as e:
            logger.warning(f"Could not connect to Redis ({e}). Running without Redis caching.")
            return None
    return _redis_client
