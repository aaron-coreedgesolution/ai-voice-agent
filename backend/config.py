import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    def __init__(self):
        self.supabase_url = os.getenv("SUPABASE_URL")
        self.supabase_key = os.getenv("SUPABASE_KEY")
        self.retell_api_key = os.getenv("RETELL_API_KEY")
        self.retell_base_url = os.getenv("RETELL_BASE_URL", "https://api.retellai.com/v1")
        self.retell_webhook_url = os.getenv("RETELL_WEBHOOK_URL")
        self.openai_api_key = os.getenv("OPENAI_API_KEY")

settings = Settings()

# Optional backward compatibility
SUPABASE_URL = settings.supabase_url
SUPABASE_KEY = settings.supabase_key
