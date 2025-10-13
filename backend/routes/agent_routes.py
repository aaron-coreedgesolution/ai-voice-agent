# backend/routes/agent_routes.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.supabase_service import SupabaseService

router = APIRouter(prefix="/agents", tags=["Agent Configs"])


# --- Pydantic Models ---
class AgentCreate(BaseModel):
    name: str
    description: str | None = None
    prompt: str
    settings: dict | None = None


class AgentUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    prompt: str | None = None
    settings: dict | None = None


# --- Routes ---

@router.post("/")
def create_agent(agent: AgentCreate):
    response = SupabaseService.insert_agent_config(
        agent.name, agent.description, agent.prompt, agent.settings
    )
    return {"message": "Agent created successfully", "data": response.data}


@router.get("/")
def get_agents():
    response = SupabaseService.get_agent_configs()
    return {"agents": response.data}


@router.put("/{agent_id}")
def update_agent(agent_id: str, agent: AgentUpdate):
    response = SupabaseService.update_agent_config(agent_id, agent.dict(exclude_unset=True))
    if not response.data:
        raise HTTPException(status_code=404, detail="Agent not found")
    return {"message": "Agent updated successfully", "data": response.data}


@router.delete("/{agent_id}")
def delete_agent(agent_id: str):
    response = SupabaseService.delete_agent_config(agent_id)
    if not response.data:
        raise HTTPException(status_code=404, detail="Agent not found")
    return {"message": "Agent deleted successfully"}
