# backend/routes/webhook_routes.py
from fastapi import APIRouter, Request, HTTPException
from services.enhanced_webhook_processor import enhanced_processor
import logging

router = APIRouter(prefix="/webhook", tags=["Webhook"])

@router.post("/retell")
async def retell_webhook(request: Request):
    """
    Enhanced webhook endpoint that uses OpenAI to structure Retell AI responses
    before saving to the database.
    """
    try:
        payload = await request.json()
        logging.info(f"Received Retell webhook: {payload}")

        # Use enhanced processor to handle the webhook data
        result = await enhanced_processor.process_webhook_data(payload)
        
        logging.info(f"Webhook processing completed: {result}")
        return result

    except Exception as e:
        logging.error(f"Webhook error: {e}")
        raise HTTPException(status_code=400, detail=str(e))
