from pydantic import BaseModel
from typing import Optional, Dict, Any

class AgentCreate(BaseModel):
    name: str
    description: Optional[str] = None
    prompt: str
    settings: Optional[Dict[str, Any]] = None

class AgentUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    prompt: Optional[str] = None
    settings: Optional[Dict[str, Any]] = None
