# backend/services/retell_service.py
import os
import httpx
import logging
from typing import Dict, Any
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

RETELL_API_KEY = os.getenv("RETELL_API_KEY")
RETELL_BASE_URL = os.getenv("RETELL_API_BASE", "https://api.retellai.com/v1").replace("/v1", "")

class RetellService:
    @staticmethod
    def create_web_call(driver_name: str, load_number: str, phone_number: str = "WEB_CALL") -> Dict[str, Any]:
        """
        Create a web call using Retell AI API
        """
        if not RETELL_API_KEY:
            logging.error("❌ RETELL_API_KEY not found in environment")
            return {"error": "Retell API key not configured"}

        headers = {
            "Authorization": f"Bearer {RETELL_API_KEY}",
            "Content-Type": "application/json"
        }

        # Get agent ID from environment or use default
        # In production, you should get this from the agent_configs table
        agent_id = os.getenv("RETELL_AGENT_ID")
        if not agent_id:
            logging.warning("No RETELL_AGENT_ID found, using default agent")
            agent_id = "default_agent_id"
        
        payload = {
            "agent_id": agent_id,
            "metadata": {
                "driver_name": driver_name,
                "load_number": load_number,
                "phone_number": phone_number
            }
        }

        try:
            with httpx.Client(timeout=30.0) as client:
                response = client.post(
                    f"{RETELL_BASE_URL}/v2/create-web-call",
                    json=payload,
                    headers=headers
                )

                if response.status_code in [200, 201]:
                    response_data = response.json()
                    logging.info(f"✅ Web call created successfully: {response_data}")
                    
                    # Extract access token and construct web call URL
                    access_token = response_data.get("access_token")
                    call_id = response_data.get("call_id")
                    
                    # Construct the web call URL using the access token
                    web_call_url = None
                    if access_token:
                        web_call_url = f"https://retell.ai/web-call/{access_token}"
                    
                    return {
                        "success": True,
                        "web_call_link": web_call_url,
                        "access_token": access_token,
                        "call_id": call_id,
                        "data": response_data
                    }
                else:
                    logging.error(f"❌ Retell API request failed: {response.status_code} — {response.text}")
                    return {
                        "error": f"Web Call API Error: {response.status_code}",
                        "details": response.text
                    }

        except Exception as e:
            logging.error(f"❌ Retell API connection failed: {str(e)}")
            return {"error": "Web call connection failed", "details": str(e)}

    @staticmethod
    async def create_web_call_async(driver_name: str, load_number: str, phone_number: str = "WEB_CALL") -> Dict[str, Any]:
        """
        Async version of create_web_call
        """
        if not RETELL_API_KEY:
            logging.error("❌ RETELL_API_KEY not found in environment")
            return {"error": "Retell API key not configured"}

        headers = {
            "Authorization": f"Bearer {RETELL_API_KEY}",
            "Content-Type": "application/json"
        }

        agent_id = os.getenv("RETELL_AGENT_ID")
        if not agent_id:
            logging.warning("No RETELL_AGENT_ID found, using default agent")
            agent_id = "default_agent_id"
        
        payload = {
            "agent_id": agent_id,
            "metadata": {
                "driver_name": driver_name,
                "load_number": load_number,
                "phone_number": phone_number
            }
        }

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    f"{RETELL_BASE_URL}/v2/create-web-call",
                    json=payload,
                    headers=headers
                )

                if response.status_code in [200, 201]:
                    response_data = response.json()
                    logging.info(f"✅ Web call created successfully: {response_data}")
                    
                    # Extract access token and construct web call URL
                    access_token = response_data.get("access_token")
                    call_id = response_data.get("call_id")
                    
                    # Construct the web call URL using the access token
                    web_call_url = None
                    if access_token:
                        web_call_url = f"https://retell.ai/web-call/{access_token}"
                    
                    return {
                        "success": True,
                        "web_call_link": web_call_url,
                        "access_token": access_token,
                        "call_id": call_id,
                        "data": response_data
                    }
                else:
                    logging.error(f"❌ Retell API request failed: {response.status_code} — {response.text}")
                    return {
                        "error": f"Web Call API Error: {response.status_code}",
                        "details": response.text
                    }

        except Exception as e:
            logging.error(f"❌ Retell API connection failed: {str(e)}")
            return {"error": "Web call connection failed", "details": str(e)}
