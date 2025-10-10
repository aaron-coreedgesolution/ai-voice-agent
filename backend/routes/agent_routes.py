from fastapi import APIRouter
from services.supabase_service import SupabaseService

router = APIRouter(prefix="/agents", tags=["Agents"])

@router.get("/")
def list_agents():
    res = SupabaseService.get_agent_configs()
    return res.data

@router.post("/")
def create_agent(agent: dict):
    res = SupabaseService.insert_agent_config(
        name=agent["name"],
        description=agent.get("description", ""),
        prompt=agent["prompt"],
        settings=agent.get("settings", {})
    )
    return {"inserted": True, "data": res.data}
