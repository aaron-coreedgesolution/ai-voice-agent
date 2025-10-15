# backend/routes/agent_routes.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.supabase_service import SupabaseService
import requests
import os
import sys
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
from dotenv import load_dotenv

load_dotenv()

router = APIRouter(prefix="/agents", tags=["Agent Configs"])

RETELL_API_KEY = os.getenv("RETELL_API_KEY")
RETELL_BASE_URL = "https://api.retellai.com"
WEBHOOK_URL = os.getenv("WEBHOOK_URL")  # e.g. your ngrok public URL + /webhook/retell
RETELL_LLM_ID = os.getenv("RETELL_LLM_ID")
RETELL_VOICE_ID = os.getenv("RETELL_VOICE_ID", "11labs-Adrian")


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



# --- Create Agent ---
@router.post("/")
def create_agent(agent: AgentCreate):
    """Create a new agent on Retell and save config in Supabase."""
    if not RETELL_API_KEY:
        raise HTTPException(status_code=500, detail="RETELL_API_KEY not set in environment")
    if not RETELL_LLM_ID:
        raise HTTPException(status_code=500, detail="RETELL_LLM_ID not set in environment")

    # Step 1: Create agent on Retell API
    headers = {
        "Authorization": f"Bearer {RETELL_API_KEY}",
        "Content-Type": "application/json",
    }

    # Retell create-agent endpoint requires response_engine and voice_id
    payload = {
        "response_engine": (agent.settings or {}).get("response_engine") or {
            "type": "retell-llm",
            "llm_id": RETELL_LLM_ID,
        },
        "voice_id": (agent.settings or {}).get("voice_id", RETELL_VOICE_ID),
        "agent_name": agent.name or None,
        # Ensure webhooks reach our backend for call updates
        "webhook_url": WEBHOOK_URL,
    }

    try:
        response = requests.post(f"{RETELL_BASE_URL}/create-agent", json=payload, headers=headers)
        # Log full response for debugging
        print("[Retell] Create Agent status:", response.status_code)
        try:
            print("[Retell] Response JSON:", response.json())
        except Exception:
            print("[Retell] Non-JSON response:", response.text)
        response.raise_for_status()
    except requests.RequestException as e:
        # Log error body if available
        if 'response' in locals() and response is not None:
            try:
                print("[Retell] Error body:", response.json())
            except Exception:
                print("[Retell] Error text:", getattr(response, 'text', ''))
        print("Retell API error:", e)
        raise HTTPException(status_code=500, detail="Failed to create agent on Retell")

    retell_data = response.json()
    # SDK example indicates `agent_id` is returned
    retell_agent_id = retell_data.get("agent_id") or retell_data.get("id")

    if not retell_agent_id:
        raise HTTPException(status_code=500, detail="Retell API did not return agent ID")

    # Step 2: Save to Supabase
    supabase_response = SupabaseService.insert_agent_config(
        name=agent.name,
        description=agent.description,
        prompt=agent.prompt,
        settings={
            "retell_agent_id": retell_agent_id,
            **({"advanced_settings": agent.settings.get("advanced_settings")} if agent.settings and agent.settings.get("advanced_settings") else {}),
            **({"response_engine": agent.settings.get("response_engine")} if agent.settings and agent.settings.get("response_engine") else {}),
        },
    )

    return {
        "message": "Agent created successfully on Retell and stored in Supabase",
        "retell_agent_id": retell_agent_id,
        "data": supabase_response.data,
    }


# --- Get Agents ---
@router.get("/")
def get_agents():
    response = SupabaseService.get_agent_configs()
    return {"data": response.data}


# (Update Agent endpoint removed as per request)


# --- Delete Agent ---
@router.delete("/{agent_id}")
def delete_agent(agent_id: str):
    response = SupabaseService.delete_agent_config(agent_id)
    if not response.data:
        raise HTTPException(status_code=404, detail="Agent not found")
    return {"message": "Agent deleted successfully"}

