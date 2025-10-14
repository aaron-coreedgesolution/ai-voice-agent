# backend/services/transcript_parser.py
import json
from openai import OpenAI
from dotenv import load_dotenv
import os
import re
from .dynamic_response_handler import dynamic_handler

load_dotenv()

def get_openai_client():
    """Return OpenAI client with API key from environment."""
    return OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

def parse_transcript(transcript: str, scenario_type: str = None) -> dict:
    """
    Use GPT model to analyze a call transcript and return structured data.
    """
    if not transcript or transcript.strip() == "":
        return {"error": "Empty transcript"}

    # Determine scenario-specific parsing based on content or explicit scenario type
    if scenario_type == "emergency_protocol" or _detect_emergency_keywords(transcript):
        return _parse_emergency_transcript(transcript)
    elif scenario_type == "dispatch_checkin" or _detect_dispatch_keywords(transcript):
        return _parse_dispatch_transcript(transcript)
    else:
        return _parse_generic_transcript(transcript)

def _detect_emergency_keywords(transcript: str) -> bool:
    """Detect if transcript contains emergency keywords"""
    emergency_keywords = [
        "emergency", "accident", "crash", "breakdown", "blowout", 
        "medical", "injury", "urgent", "help", "tire", "engine failure"
    ]
    transcript_lower = transcript.lower()
    return any(keyword in transcript_lower for keyword in emergency_keywords)

def _detect_dispatch_keywords(transcript: str) -> bool:
    """Detect if transcript contains dispatch check-in keywords"""
    dispatch_keywords = [
        "dispatch", "check call", "status", "load", "eta", 
        "location", "driving", "arrived", "unloading"
    ]
    transcript_lower = transcript.lower()
    return any(keyword in transcript_lower for keyword in dispatch_keywords)

def _parse_emergency_transcript(transcript: str) -> dict:
    """Parse emergency protocol transcript"""
    prompt = f"""
    You are analyzing an EMERGENCY logistics call transcript. Extract emergency-specific data.

    --- EMERGENCY TRANSCRIPT ---
    {transcript}
    --- END ---

    Output JSON only with these fields:
    {{
      "call_outcome": "Emergency Escalation",
      "emergency_type": "Accident" | "Breakdown" | "Medical" | "Other" | null,
      "safety_status": string (e.g., "Driver confirmed everyone is safe"),
      "injury_status": string (e.g., "No injuries reported"),
      "emergency_location": string (e.g., "I-15 North, Mile Marker 123"),
      "load_secure": true | false | null,
      "escalation_status": "Connected to Human Dispatcher" | "Escalation Initiated" | null,
      "emergency_details": string (summary of what happened),
      "response_time": string (how quickly emergency was handled)
    }}
    """
    return _call_openai_api(prompt)

def _parse_dispatch_transcript(transcript: str) -> dict:
    """Parse dispatch check-in transcript"""
    prompt = f"""
    You are analyzing a ROUTINE DISPATCH check-in call transcript. Extract logistics data.

    --- DISPATCH TRANSCRIPT ---
    {transcript}
    --- END ---

    Output JSON only with these fields:
    {{
      "call_outcome": "In-Transit Update" | "Arrival Confirmation",
      "driver_status": "Driving" | "Delayed" | "Arrived" | "Unloading" | "N/A",
      "current_location": string (e.g., "I-10 near Indio, CA"),
      "eta": string (e.g., "Tomorrow, 8:00 AM"),
      "delay_reason": string (e.g., "Heavy Traffic", "Weather", "None"),
      "unloading_status": string (e.g., "In Door 42", "Waiting for Lumper", "Detention", "N/A"),
      "pod_reminder_acknowledged": true | false | null,
      "load_progress": string (percentage or description),
      "next_check_time": string (when next check-in should happen)
    }}
    """
    return _call_openai_api(prompt)

def _parse_generic_transcript(transcript: str) -> dict:
    """Parse generic transcript with all possible fields"""
    prompt = f"""
    You are a logistics call analyzer. Extract structured fields from the call transcript below.

    --- TRANSCRIPT ---
    {transcript}
    --- END ---

    Output JSON only with these possible fields (fill missing with null or 'N/A'):
    {{
      "call_outcome": "In-Transit Update" | "Arrival Confirmation" | "Emergency Escalation" | "General Update",
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
    return _call_openai_api(prompt)

def _call_openai_api(prompt: str) -> dict:
    """Call OpenAI API with the given prompt"""
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
