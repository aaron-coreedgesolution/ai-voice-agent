from database import supabase

class SupabaseService:
    # ----- Agent Configs -----
    @staticmethod
    def insert_agent_config(name, description, prompt, settings):
        return supabase.table("agent_configs").insert({
            "name": name,
            "description": description,
            "prompt": prompt,
            "settings": settings
        }).execute()

    @staticmethod
    def get_agent_configs():
        return supabase.table("agent_configs").select("*").execute()

    @staticmethod
    def update_agent_config(agent_id, updated_fields):
        return supabase.table("agent_configs").update(updated_fields).eq("id", agent_id).execute()

    @staticmethod
    def delete_agent_config(agent_id):
        return supabase.table("agent_configs").delete().eq("id", agent_id).execute()

    # ----- Call Records -----
    @staticmethod
    def insert_call_record(driver_name, phone_number, load_number, call_outcome, structured_data, transcript):
        return supabase.table("call_records").insert({
            "driver_name": driver_name,
            "phone_number": phone_number,
            "load_number": load_number,
            "call_outcome": call_outcome,
            "structured_data": structured_data,
            "transcript": transcript
        }).execute()

    @staticmethod
    def get_call_records():
        return supabase.table("call_records").select("*").execute()

    @staticmethod
    def get_call_by_id(call_id):
        return supabase.table("call_records").select("*").eq("id", call_id).execute()

    @staticmethod
    def update_call_record(call_id, updated_fields):
        return supabase.table("call_records").update(updated_fields).eq("id", call_id).execute()