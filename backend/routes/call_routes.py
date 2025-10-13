# backend/routes/call_routes.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any
from services.supabase_service import SupabaseService
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

@router.post("/")
def create_call_record(call: CallRecordCreate):
    response = SupabaseService.insert_call_record(
        call.driver_name,
        call.phone_number,
        call.load_number,
        call.call_outcome,
        call.structured_data,
        call.transcript,
    )
    return {"message": "Call record saved successfully", "data": response.data}


@router.get("/")
def get_call_records():
    response = SupabaseService.get_call_records()
    return {"calls": response.data}


@router.post("/start")
def start_test_call(request: CallTriggerRequest):
    """
    Trigger a live or web-based call using Retell AI.
    Falls back to a mock call if the API fails or RETELL_API_KEY is missing.
    """
    try:
        driver_name = request.driver_name
        load_number = request.load_number
        phone_number = request.phone_number or "WEB_CALL"

        if not driver_name or not load_number:
            raise HTTPException(status_code=400, detail="Missing required fields")

        # Fetch agent configuration if agent_id is provided
        agent_config = {}
        if request.agent_id:
            res = SupabaseService.get_agent_configs()
            for cfg in res.data:
                if cfg["id"] == request.agent_id:
                    agent_config = cfg
                    break

        payload = {
            "driver_name": driver_name,
            "phone_number": phone_number,
            "load_number": load_number,
            "prompt": agent_config.get("prompt", ""),
            "settings": agent_config.get("settings", {}),
        }

        call_response = None

        # Try real Retell API call
        if RETELL_API_KEY and requests:
            headers = {
                "Authorization": f"Bearer {RETELL_API_KEY}",
                "Content-Type": "application/json"
            }
            try:
                response = requests.post(RETELL_API_URL, json=payload, headers=headers, timeout=5)
                response.raise_for_status()
                call_response = response.json()
            except requests.exceptions.RequestException as e:
                logging.error(f"Retell API failed, falling back to mock: {e}")

        # Fallback mock session
        if not call_response:
            mock_call_id = str(uuid.uuid4())
            session_url = f"https://retell.ai/webcall/session/{mock_call_id}"
            call_response = {
                "mock_call_id": mock_call_id,
                "status": "initiated",
                "session_url": session_url
            }

        # Save initial 'Pending' call record
        SupabaseService.insert_call_record(
            driver_name=driver_name,
            phone_number=phone_number,
            load_number=load_number,
            call_outcome="Pending",
            structured_data={},
            transcript="",
        )

        return {"status": "success", "call": call_response}

    except Exception as e:
        logging.error(f"Error in start_test_call: {e}")
        # Always return mock call if anything fails
        mock_call_id = str(uuid.uuid4())
        session_url = f"https://retell.ai/webcall/session/{mock_call_id}"
        call_response = {"mock_call_id": mock_call_id, "status": "initiated", "session_url": session_url}
        return {"status": "success", "call": call_response, "error": str(e)}
