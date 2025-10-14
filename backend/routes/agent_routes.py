# backend/routes/agent_routes.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.supabase_service import SupabaseService
import requests
import os
import sys
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
from agents.scenario_agents import get_scenario_agent, get_all_scenario_types

router = APIRouter(prefix="/agents", tags=["Agent Configs"])

RETELL_API_KEY = os.getenv("RETELL_API_KEY")
RETELL_BASE_URL = "https://api.retellai.com/v1"
WEBHOOK_URL = os.getenv("WEBHOOK_URL")  # e.g. your ngrok public URL + /webhook/retell


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

class ScenarioAgentCreate(BaseModel):
    scenario_type: str
    driver_name: str = ""
    load_number: str = ""


# --- Create Agent ---
@router.post("/")
def create_agent(agent: AgentCreate):
    """Create a new agent on Retell and save config in Supabase."""
    if not RETELL_API_KEY:
        raise HTTPException(status_code=500, detail="RETELL_API_KEY not set in environment")

    # Step 1: Create agent on Retell API
    headers = {
        "Authorization": f"Bearer {RETELL_API_KEY}",
        "Content-Type": "application/json",
    }

    payload = {
        "name": agent.name,
        "voice": "11labs-Adrian",  # default voice, you can change or make configurable
        "language": "en",
        "agent_prompt": agent.prompt,
        "webhook_url": WEBHOOK_URL,  # where Retell will send events
    }

    try:
        response = requests.post(f"{RETELL_BASE_URL}/agents", json=payload, headers=headers)
        response.raise_for_status()
    except requests.RequestException as e:
        print("Retell API error:", e)
        raise HTTPException(status_code=500, detail="Failed to create agent on Retell")

    retell_data = response.json()
    retell_agent_id = retell_data.get("id")

    if not retell_agent_id:
        raise HTTPException(status_code=500, detail="Retell API did not return agent ID")

    # Step 2: Save to Supabase
    supabase_response = SupabaseService.insert_agent_config(
        name=agent.name,
        description=agent.description,
        prompt=agent.prompt,
        settings={"retell_agent_id": retell_agent_id},
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


# --- Update Agent ---
@router.put("/{agent_id}")
def update_agent(agent_id: str, agent: AgentUpdate):
    """Update agent in both Retell AI and Supabase."""
    if not RETELL_API_KEY:
        raise HTTPException(status_code=500, detail="RETELL_API_KEY not set in environment")

    try:
        # Get current agent config from Supabase
        agents_response = SupabaseService.get_agent_configs()
        current_agent = None
        for agent_data in agents_response.data:
            if agent_data["id"] == agent_id:
                current_agent = agent_data
                break
        
        if not current_agent:
            raise HTTPException(status_code=404, detail="Agent not found")

        retell_agent_id = current_agent.get("settings", {}).get("retell_agent_id")
        if not retell_agent_id:
            raise HTTPException(status_code=400, detail="Agent does not have Retell ID")

        # Prepare update data for Retell AI
        retell_update_data = {}
        if agent.prompt:
            retell_update_data["agent_prompt"] = agent.prompt
        
        # Only update voice settings for custom agents, not scenario agents
        is_scenario_agent = current_agent.get("settings", {}).get("scenario_type")
        if agent.settings and not is_scenario_agent:
            # Map common settings to Retell API fields
            if "voice_id" in agent.settings:
                retell_update_data["voice"] = agent.settings["voice_id"]
            if "language" in agent.settings:
                retell_update_data["language"] = agent.settings["language"]
            if "backchanneling" in agent.settings:
                retell_update_data["backchanneling"] = agent.settings["backchanneling"]
            if "filler_words" in agent.settings:
                retell_update_data["filler_words"] = agent.settings["filler_words"]
            if "interruption_sensitivity" in agent.settings:
                retell_update_data["interruption_sensitivity"] = agent.settings["interruption_sensitivity"]
            if "response_delay" in agent.settings:
                retell_update_data["response_delay"] = agent.settings["response_delay"]

        # Update agent in Retell AI if there are changes
        if retell_update_data:
            headers = {
                "Authorization": f"Bearer {RETELL_API_KEY}",
                "Content-Type": "application/json",
            }
            
            try:
                response = requests.put(
                    f"{RETELL_BASE_URL}/agents/{retell_agent_id}", 
                    json=retell_update_data, 
                    headers=headers
                )
                response.raise_for_status()
            except requests.RequestException as e:
                print(f"Retell API update error: {e}")
                raise HTTPException(status_code=500, detail="Failed to update agent in Retell AI")

        # Prepare update data for Supabase
        supabase_update_data = agent.dict(exclude_unset=True)
        
        # For scenario agents, only allow updating basic fields, not voice settings
        if is_scenario_agent and "settings" in supabase_update_data:
            # Remove voice settings from update data for scenario agents
            if "advanced_settings" in supabase_update_data["settings"]:
                del supabase_update_data["settings"]["advanced_settings"]
            # Only keep the basic settings that are allowed
            allowed_settings = {"scenario_type", "retell_agent_id"}
            if "settings" in supabase_update_data:
                filtered_settings = {k: v for k, v in supabase_update_data["settings"].items() if k in allowed_settings}
                supabase_update_data["settings"] = filtered_settings

        # Update agent in Supabase
        if supabase_update_data:
            response = SupabaseService.update_agent_config(agent_id, supabase_update_data)
            if not response.data:
                raise HTTPException(status_code=404, detail="Agent not found in database")

        return {
            "message": "Agent updated successfully in both Retell AI and Supabase",
            "agent_id": agent_id,
            "retell_agent_id": retell_agent_id,
            "updated_fields": list(supabase_update_data.keys()),
            "data": response.data
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"Update agent error: {e}")
        raise HTTPException(status_code=500, detail="Failed to update agent")


# --- Delete Agent ---
@router.delete("/{agent_id}")
def delete_agent(agent_id: str):
    response = SupabaseService.delete_agent_config(agent_id)
    if not response.data:
        raise HTTPException(status_code=404, detail="Agent not found")
    return {"message": "Agent deleted successfully"}

# --- Create Scenario Agent ---
@router.post("/scenario")
def create_scenario_agent(scenario_request: ScenarioAgentCreate):
    """Create a pre-configured agent for a specific logistics scenario"""
    try:
        # Get the scenario agent configuration
        agent_config = get_scenario_agent(
            scenario_request.scenario_type,
            scenario_request.driver_name,
            scenario_request.load_number
        )
        
        # Create agent on Retell AI with advanced settings
        headers = {
            "Authorization": f"Bearer {RETELL_API_KEY}",
            "Content-Type": "application/json",
        }

        payload = {
            "name": agent_config["name"],
            "voice": agent_config["settings"]["voice_id"],
            "language": agent_config["settings"]["language"],
            "agent_prompt": agent_config["prompt"],
            "webhook_url": WEBHOOK_URL,
            # Advanced voice settings
            "backchanneling": agent_config["settings"].get("backchanneling", True),
            "filler_words": agent_config["settings"].get("filler_words", True),
            "interruption_sensitivity": agent_config["settings"].get("interruption_sensitivity", 0.7),
            "response_delay": agent_config["settings"].get("response_delay", 0.8),
        }

        try:
            response = requests.post(f"{RETELL_BASE_URL}/agents", json=payload, headers=headers)
            response.raise_for_status()
        except requests.RequestException as e:
            print("Retell API error:", e)
            raise HTTPException(status_code=500, detail="Failed to create scenario agent on Retell")

        retell_data = response.json()
        retell_agent_id = retell_data.get("id")

        if not retell_agent_id:
            raise HTTPException(status_code=500, detail="Retell API did not return agent ID")

        # Save to Supabase with scenario metadata
        supabase_response = SupabaseService.insert_agent_config(
            name=agent_config["name"],
            description=agent_config["description"],
            prompt=agent_config["prompt"],
            settings={
                "retell_agent_id": retell_agent_id,
                "scenario_type": scenario_request.scenario_type,
                "advanced_settings": agent_config["settings"]
            },
        )

        return {
            "message": f"Scenario agent '{agent_config['name']}' created successfully",
            "scenario_type": scenario_request.scenario_type,
            "retell_agent_id": retell_agent_id,
            "data": supabase_response.data,
        }

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create scenario agent: {str(e)}")

# --- Get Available Scenarios ---
@router.get("/scenarios")
def get_available_scenarios():
    """Get list of available scenario types"""
    return {
        "scenarios": get_all_scenario_types(),
        "descriptions": {
            "dispatch_checkin": "End-to-end driver check-in with dynamic status determination",
            "emergency_protocol": "Emergency situation handling with immediate escalation"
        }
    }
