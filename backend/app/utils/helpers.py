"""Small shared helpers."""
from typing import Any, Dict


def success(data: Any = None, message: str = "Success") -> Dict[str, Any]:
    """Consistent success envelope for simple action endpoints."""
    return {"success": True, "message": message, "data": data}
