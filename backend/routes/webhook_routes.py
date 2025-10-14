# backend/routes/webhook_routes.py
from fastapi import APIRouter, Request, HTTPException
from services.supabase_service import SupabaseService
from services.transcript_parser import parse_transcript
import logging

router = APIRouter(prefix="/webhook", tags=["Webhook"])

@router.post("/retell")
async def retell_webhook(request: Request):
    """
    Webhook endpoint to receive call completion data from Retell AI.
    Parses transcript, enriches it with metadata, and stores the record.
    """
    try:
        payload = await request.json()
        logging.info(f"Received Retell webhook: {payload}")

        # --- Extract top-level Retell fields ---
        call_id = payload.get("call_id")
        agent_id = payload.get("agent_id")
        status = payload.get("status", "unknown")
        recording_url = payload.get("recording_url", None)
        transcript = payload.get("transcript", "")

        # --- Extract metadata (if any) ---
        metadata = payload.get("metadata", {})
        driver_name = metadata.get("driver_name", "Unknown Driver")
        phone_number = metadata.get("phone_number", "Unknown")
        load_number = metadata.get("load_number", "Unknown")

        # --- Default outcome ---
        call_outcome = "Completed" if status == "completed" else "Pending"

        # --- Determine scenario type from metadata or agent config ---
        scenario_type = metadata.get("scenario_type")
        if not scenario_type and agent_id:
            # Try to get scenario type from agent config
            try:
                agents_response = SupabaseService.get_agent_configs()
                for agent in agents_response.data:
                    if agent.get("settings", {}).get("retell_agent_id") == agent_id:
                        scenario_type = agent.get("settings", {}).get("scenario_type")
                        break
            except Exception as e:
                logging.warning(f"Could not fetch agent config for scenario detection: {e}")

        # --- Parse transcript into structured data ---
        structured_data = parse_transcript(transcript, scenario_type)

        if structured_data.get("call_outcome"):
            call_outcome = structured_data["call_outcome"]

        # --- Analyze response quality and add dynamic handling data ---
        from services.dynamic_response_handler import dynamic_handler
        response_analysis = dynamic_handler.analyze_response_quality(transcript, driver_name)
        
        # --- Store full call record in Supabase ---
        SupabaseService.insert_call_record(
            driver_name=driver_name,
            phone_number=phone_number,
            load_number=load_number,
            call_outcome=call_outcome,
            structured_data={
                **structured_data,
                "retell_call_id": call_id,
                "retell_agent_id": agent_id,
                "recording_url": recording_url,
                "status": status,
                "response_analysis": response_analysis,
                "dynamic_handling": {
                    "response_quality": response_analysis["response_quality"],
                    "action_needed": response_analysis["action_needed"],
                    "confidence_score": response_analysis["confidence_score"],
                    "escalation_recommended": response_analysis["escalation_recommended"]
                }
            },
            transcript=transcript,
        )

        return {"status": "success", "call_id": call_id}

    except Exception as e:
        logging.error(f"Webhook error: {e}")
        raise HTTPException(status_code=400, detail=str(e))
