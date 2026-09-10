from typing import Generic, TypeVar, Optional, Any
from pydantic import BaseModel

T = TypeVar('T')

class APIResponse(BaseModel, Generic[T]):
    success: bool = True
    message: str = "Operation completed successfully"
    data: Optional[T] = None

def api_response(data: Any = None, message: str = "Operation completed successfully", success: bool = True) -> dict:
    return {
        "success": success,
        "message": message,
        "data": data
    }
