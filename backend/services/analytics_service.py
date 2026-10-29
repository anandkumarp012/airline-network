try:
    from services.graph_service import NetworkGraphService
except ImportError:  # pragma: no cover
    from backend.services.graph_service import NetworkGraphService


def get_service() -> NetworkGraphService:
    return NetworkGraphService()
