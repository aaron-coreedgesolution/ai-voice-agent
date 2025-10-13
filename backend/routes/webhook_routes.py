# backend/routes/webhook_routes.py
from fastapi import APIRouter, Request, HTTPException
from services.supabase_service import SupabaseService
from services.transcript_parser import parse_transcript

router = APIRouter(prefix="/webhook", tags=["Webhook"])

@router.post("/retell")
async def retell_webhook(request: Request):
    """
    Webhook endpoint to receive call data from Retell AI.
    Automatically parses transcript into structured data using OpenAI.
    """
    try:
        payload = await request.json()

        driver_name = payload.get("driver_name")
        phone_number = payload.get("phone_number")
        load_number = payload.get("load_number")
        transcript = payload.get("transcript", "")
        call_outcome = payload.get("call_outcome", "Pending")

        # Parse transcript into structured data
        structured_data = parse_transcript(transcript)

        # Update call_outcome if AI returned it
        if structured_data.get("call_outcome"):
            call_outcome = structured_data["call_outcome"]

        # Store record in Supabase
        response = SupabaseService.insert_call_record(
            driver_name=driver_name,
            phone_number=phone_number,
            load_number=load_number,
            call_outcome=call_outcome,
            structured_data=structured_data,
            transcript=transcript,
        )

        return {"status": "success", "data": response.data, "structured": structured_data}

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
