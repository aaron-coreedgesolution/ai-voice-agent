# backend/routes/pipecat_routes.py
from fastapi import APIRouter, HTTPException
from services.supabase_service import SupabaseService
from pydantic import BaseModel
from typing import Optional, Dict, Any

router = APIRouter(tags=["Pipecat Events"])

# Schema for Pipecat incoming data
class PipecatEvent(BaseModel):
    call_id: str
    transcript: str
    structured_data: Optional[Dict[str, Any]] = None


@router.post("/pipecat")
async def receive_pipecat_event(event: PipecatEvent):
    """
    Endpoint to receive Pipecat transcript and metadata,
    and save it into Supabase.
    """
    try:
        print(f"📥 Received Pipecat event for call_id={event.call_id}")

        structured = event.structured_data or {}

        result = SupabaseService.insert_call_record(
            driver_name=structured.get("driver_name", "Unknown"),
            phone_number=structured.get("phone_number", "Unknown"),
            load_number=structured.get("load_number", "Unknown"),
            call_outcome="Completed",
            structured_data=structured,
            transcript=event.transcript,
        )

        print("✅ Call saved in Supabase:", result)
        return {"status": "success", "call_id": event.call_id}

    except Exception as e:
        print("❌ Error saving call:", e)
        raise HTTPException(status_code=500, detail=str(e))
