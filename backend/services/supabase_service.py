# backend/services/supabase_service.py
from database import supabase
from typing import Union, Dict, Any
from models.schemas import CallRequest, CallSummary, AgentConfigCreate


class SupabaseService:
    # =====================
    # AGENT CONFIGS
    # =====================
    @staticmethod
    def insert_agent_config(
        name: str = None,
        description: str = None,
        prompt: str = None,
        settings: Dict[str, Any] = None,
        config: AgentConfigCreate = None
    ):
        """Insert agent config using either raw fields or a Pydantic model."""
        if config:
            data = {
                "name": config.name,
                "description": config.scenario_type,
                "prompt": config.prompt,
                "settings": {
                    "voice_settings": config.voice_settings,
                    "emergency_phrases": config.emergency_phrases,
                    "structured_fields": config.structured_fields
                }
            }
        else:
            data = {
                "name": name,
                "description": description,
                "prompt": prompt,
                "settings": settings,
            }

        return supabase.table("agent_configs").insert(data).execute()

    @staticmethod
    def get_agent_configs():
        return supabase.table("agent_configs").select("*").execute()

    @staticmethod
    def update_agent_config(agent_id, updated_fields):
        return supabase.table("agent_configs").update(updated_fields).eq("id", agent_id).execute()

    @staticmethod
    def delete_agent_config(agent_id):
        return supabase.table("agent_configs").delete().eq("id", agent_id).execute()

    # =====================
    # CALL RECORDS
    # =====================
    @staticmethod
    def insert_call_record(
        driver_name: str = None,
        phone_number: str = None,
        load_number: str = None,
        call_outcome: str = None,
        structured_data: Dict[str, Any] = None,
        transcript: str = None,
        call_request: CallRequest = None,
        summary: CallSummary = None,
    ):
        """Insert a call record using either direct fields or full schema objects."""
        if call_request:
            data = {
                "driver_name": call_request.driver_name,
                "phone_number": call_request.phone_number,
                "load_number": call_request.load_number,
                "call_outcome": getattr(summary, "call_outcome", None)
                if summary
                else call_outcome,
                "structured_data": summary.model_dump() if summary else structured_data,
                "transcript": transcript,
            }
        else:
            data = {
                "driver_name": driver_name,
                "phone_number": phone_number,
                "load_number": load_number,
                "call_outcome": call_outcome,
                "structured_data": structured_data,
                "transcript": transcript,
            }

        return supabase.table("call_records").insert(data).execute()

    @staticmethod
    def get_call_records():
        return supabase.table("call_records").select("*").execute()

    @staticmethod
    def get_call_by_id(call_id):
        return supabase.table("call_records").select("*").eq("id", call_id).execute()

    @staticmethod
    def update_call_record(call_id, updated_fields):
        return supabase.table("call_records").update(updated_fields).eq("id", call_id).execute()
