"""Application-level exceptions mapped to HTTP responses by handlers in main.py."""
from typing import Any, Dict, Optional


class AppException(Exception):
    status_code: int = 500
    default_message: str = "Internal server error"

    def __init__(self, message: Optional[str] = None, details: Optional[Dict[str, Any]] = None):
        self.message = message or self.default_message
        self.details = details
        super().__init__(self.message)


class BadRequestException(AppException):
    status_code = 400
    default_message = "Bad request"


class UnauthorizedException(AppException):
    status_code = 401
    default_message = "Not authenticated"


class ForbiddenException(AppException):
    status_code = 403
    default_message = "Not authorized to perform this action"


class NotFoundException(AppException):
    status_code = 404
    default_message = "Resource not found"


class ConflictException(AppException):
    status_code = 409
    default_message = "Resource conflict"
