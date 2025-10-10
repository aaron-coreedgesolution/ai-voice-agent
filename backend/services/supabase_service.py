from database import supabase

class SupabaseService:
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
