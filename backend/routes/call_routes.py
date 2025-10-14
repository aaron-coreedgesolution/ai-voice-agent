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
def start_web_call(request: CallTriggerRequest):
    """
    Start a web-based call using Retell AI and store it in Supabase.
    """
    try:
        driver_name = request.driver_name
        load_number = request.load_number
        phone_number = request.phone_number or "WEB_CALL"

        logging.info(f"Starting Retell web call for {driver_name} / {load_number}")

        # 🔹 Step 1: Get agent configuration if agent_id is provided
        agent_config = None
        if request.agent_id:
            try:
                agents_response = SupabaseService.get_agent_configs()
                for agent in agents_response.data:
                    if agent["id"] == request.agent_id:
                        agent_config = agent
                        break
            except Exception as e:
                logging.warning(f"Could not fetch agent config: {e}")

        # 🔹 Step 2: Create Retell web call
        retell_response = RetellService.create_web_call(driver_name, load_number, phone_number)

        if "error" in retell_response:
            logging.error(f"Retell service error: {retell_response}")
            raise HTTPException(status_code=500, detail=retell_response["error"])

        call_id = str(uuid.uuid4())
        web_call_link = retell_response.get("web_call_link")
        access_token = retell_response.get("access_token")

        # 🔹 Step 3: Save initial call record in Supabase
        SupabaseService.insert_call_record(
            driver_name=driver_name,
            phone_number=phone_number,
            load_number=load_number,
            call_outcome="Pending",
            structured_data={},
            transcript="",
        )

        return {
            "status": "success",
            "call_id": call_id,
            "web_call_link": web_call_link,
            "access_token": access_token,
            "session_url": web_call_link,  # For compatibility with frontend
            "call": {
                "session_url": web_call_link,
                "status": "initiated"
            }
        }

    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error starting web call: {e}")
        raise HTTPException(status_code=500, detail=f"Error starting web call: {str(e)}")