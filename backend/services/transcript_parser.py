# backend/services/transcript_parser.py
import json
from openai import OpenAI
from dotenv import load_dotenv
import os
import re

load_dotenv()

def get_openai_client():
    """Return OpenAI client with API key from environment."""
    return OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

def parse_transcript(transcript: str) -> dict:
    """
    Use GPT model to analyze a call transcript and return structured data.
    """
    if not transcript or transcript.strip() == "":
        return {"error": "Empty transcript"}

    prompt = f"""
    You are a logistics call analyzer. Extract structured fields from the call transcript below.
    The conversation is between a dispatch agent and a driver.

    --- TRANSCRIPT ---
    {transcript}
    --- END ---

    Output JSON only with these possible fields (fill missing with null or 'N/A'):
    {{
      "call_outcome": "In-Transit Update" | "Arrival Confirmation" | "Emergency Escalation",
      "driver_status": "Driving" | "Delayed" | "Arrived" | "Unloading" | "N/A",
      "current_location": string,
      "eta": string,
      "delay_reason": string,
      "unloading_status": string,
      "pod_reminder_acknowledged": true | false | null,
      "emergency_type": "Accident" | "Breakdown" | "Medical" | "Other" | null,
      "safety_status": string | null,
      "injury_status": string | null,
      "emergency_location": string | null,
      "load_secure": true | false | null,
      "escalation_status": string | null
    }}
    """

    client = get_openai_client()

    try:
        completion = client.responses.create(
            model="gpt-4o-mini",
            input=prompt,
            temperature=0.3,
            max_output_tokens=400,
        )

        raw_text = completion.output_text

        # Remove triple backticks and surrounding whitespace
        cleaned_text = re.sub(r"^```(?:json)?|```$", "", raw_text.strip(), flags=re.MULTILINE)

        try:
            structured_data = json.loads(cleaned_text)
        except json.JSONDecodeError:
            structured_data = {"error": "Failed to parse AI response", "raw_text": raw_text}

        return structured_data

    except Exception as e:
        return {"error": str(e)}
