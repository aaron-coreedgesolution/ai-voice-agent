# backend/routes/call_routes.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any
from services.supabase_service import SupabaseService
from services.retell_service import RetellService

import uuid
import os
import logging

# Import requests safely
try:
    import requests
except ImportError:
    requests = None

router = APIRouter(prefix="/calls", tags=["Call Records"])

# Retell AI configuration
RETELL_API_KEY = os.getenv("RETELL_API_KEY")
RETELL_API_URL = "https://api.retell.ai/v1/calls"  # Verify if this is correct

# --- Pydantic Models ---
class CallRecordCreate(BaseModel):
    driver_name: str
    phone_number: str
    load_number: Optional[str] = None
    call_outcome: Optional[str] = None
    structured_data: Optional[Dict[str, Any]] = None
    transcript: Optional[str] = None


class CallTriggerRequest(BaseModel):
    driver_name: str
    load_number: str
    agent_id: Optional[str] = None
    phone_number: Optional[str] = None  # Optional for web testing


# --- Routes ---

# @router.post("/")
# def create_call_record(call: CallRecordCreate):
#     # REMOVED: Only webhook should create call records
#     # response = SupabaseService.insert_call_record(
#     #     call.driver_name,
#     #     call.phone_number,
#     #     call.load_number,
#     #     call.call_outcome,
#     #     call.structured_data,
#     #     call.transcript,
#     # )
#     # return {"message": "Call record saved successfully", "data": response.data}


@router.get("/")
def get_call_records():
    response = SupabaseService.get_call_records()
    return {"calls": response.data}


# @router.post("/start")
# def start_web_call(request: CallTriggerRequest):
#     """
#     Start a web-based call using Retell AI and store it in Supabase.
#     """
#     try:
#         driver_name = request.driver_name
#         load_number = request.load_number
#         phone_number = request.phone_number or "WEB_CALL"

#         logging.info(f"Starting Retell web call for {driver_name} / {load_number}")

#         # 🔹 Step 1: Require an agent selection and resolve its Retell agent id from DB
#         if not request.agent_id:
#             raise HTTPException(status_code=400, detail="Please select an agent to start a call.")

#         agent_config = None
#         try:
#             agents_response = SupabaseService.get_agent_configs()
#             for agent in agents_response.data:
#                 # Normalize types to avoid int/str mismatch between DB and request
#                 if str(agent.get("id")) == str(request.agent_id):
#                     agent_config = agent
#                     break
#         except Exception as e:
#             logging.warning(f"Could not fetch agent config: {e}")

#         if not agent_config:
#             raise HTTPException(status_code=404, detail="Selected agent not found")

#         retell_agent_id = agent_config.get("settings", {}).get("retell_agent_id")
#         if not retell_agent_id:
#             raise HTTPException(status_code=400, detail="Selected agent is missing Retell agent id. Please recreate the agent or update its settings.")

#         # 🔹 Step 2: Create Retell web call with resolved retell_agent_id
#         retell_response = RetellService.create_web_call(driver_name, load_number, phone_number, agent_id=retell_agent_id)

#         if "error" in retell_response:
#             logging.error(f"Retell service error: {retell_response}")
#             raise HTTPException(status_code=500, detail=retell_response["error"])

#         call_id = str(uuid.uuid4())
#         web_call_link = retell_response.get("web_call_link")
#         access_token = retell_response.get("access_token")
#         retell_call_id = retell_response.get("call_id")

#         # 🔹 Step 3: No database record created here - only webhook will save data
#         # The webhook will handle all call record creation and updates

#         return {
#             "status": "success",
#             "call_id": call_id,
#             "web_call_link": web_call_link,
#             "access_token": access_token,
#             "session_url": web_call_link,  # For compatibility with frontend
#             "call": {
#                 "session_url": web_call_link,
#                 "status": "initiated"
#             }
#         }

#     except HTTPException:
#         raise
#     except Exception as e:
#         logging.error(f"Error starting web call: {e}")
#         raise HTTPException(status_code=500, detail=f"Error starting web call: {str(e)}")

@router.post("/start")
async def start_web_call(request: CallTriggerRequest):
    """
    Start a web-based call using Pipecat and return a session link.
    """
    try:
        driver_name = request.driver_name
        load_number = request.load_number
        phone_number = request.phone_number or "WEB_CALL"

        logging.info(f"Starting Pipecat web call for {driver_name} / {load_number}")

        # 🔹 Step 1: Generate a unique call_id
        call_id = str(uuid.uuid4())

        # 🔹 Step 2: Start Pipecat bot session
        # Pipecat runs on http://localhost:7860/client/
        # You can pass query parameters for call_id, driver_name, etc.
        pipecat_base_url = os.getenv("PIPECAT_URL", "http://localhost:7860/client/")
        session_url = f"{pipecat_base_url}?call_id={call_id}&driver_name={driver_name}&load_number={load_number}"

        # Optionally: store a placeholder record in Supabase if needed
        SupabaseService.insert_call_record(
            driver_name=driver_name,
            phone_number=phone_number,
            load_number=load_number,
            call_outcome="initiated",
            structured_data={"call_id": call_id, "status": "initiated"},
            transcript=None,
        )

        return {
            "status": "success",
            "call_id": call_id,
            "session_url": session_url,
            "call": {
                "session_url": session_url,
                "status": "initiated"
            }
        }

    except Exception as e:
        logging.error(f"Error starting Pipecat web call: {e}")
        raise HTTPException(status_code=500, detail=str(e))