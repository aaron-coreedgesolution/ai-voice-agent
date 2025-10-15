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
    """Parse generic transcript with comprehensive structured data extraction"""
    prompt = f"""
    You are an advanced logistics call analyzer. Extract comprehensive structured data from the call transcript below.

    --- TRANSCRIPT ---
    {transcript}
    --- END ---

    Analyze the transcript and extract the following information. Return ONLY valid JSON with these fields:

    {{
      "call_outcome": "In-Transit Update" | "Arrival Confirmation" | "Emergency Escalation" | "General Update" | "Dispatch Check-in" | "Status Update",
      "driver_status": "Driving" | "Delayed" | "Arrived" | "Unloading" | "Loading" | "Stopped" | "N/A",
      "current_location": "string (specific location, highway, mile marker, city)",
      "eta": "string (estimated arrival time or duration)",
      "delay_reason": "string (traffic, weather, mechanical, detention, other)",
      "unloading_status": "string (door number, waiting for lumper, detention time, etc.)",
      "pod_reminder_acknowledged": true | false | null,
      "emergency_type": "Accident" | "Breakdown" | "Medical" | "Weather" | "Other" | null,
      "safety_status": "string (driver safety confirmation)",
      "injury_status": "string (any injuries reported)",
      "emergency_location": "string (specific emergency location)",
      "load_secure": true | false | null,
      "escalation_status": "string (escalation actions taken)",
      "driver_sentiment": "Positive" | "Neutral" | "Negative" | "Frustrated" | "Cooperative",
      "call_quality": "Clear" | "Unclear" | "Noisy" | "Poor Connection",
      "key_issues": ["array of strings (main issues discussed)"],
      "action_items": ["array of strings (follow-up actions needed)"],
      "next_steps": "string (recommended next actions)",
      "confidence_score": "number (0-1, how confident in the extracted data)",
      "business_impact": "Low" | "Medium" | "High" | "Critical",
      "compliance_notes": "string (any compliance or safety concerns)",
      "equipment_status": "string (truck, trailer, equipment condition)",
      "weather_conditions": "string (weather impact on delivery)",
      "traffic_conditions": "string (traffic impact on delivery)"
    }}

    IMPORTANT: 
    - Extract specific, actionable information
    - Use null for truly unknown/missing data
    - Be precise with locations, times, and statuses
    - Identify any business-critical issues
    - Assess the overall quality and sentiment of the call
    """
    return _call_openai_api(prompt)

def _call_openai_api(prompt: str) -> dict:
    """Call OpenAI API with the given prompt"""
    client = get_openai_client()

    try:
        completion = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a logistics call analyzer. Extract structured data from call transcripts and return valid JSON only."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            max_tokens=1000,
        )

        raw_text = completion.choices[0].message.content

        # Remove triple backticks and surrounding whitespace
        cleaned_text = re.sub(r"^```(?:json)?|```$", "", raw_text.strip(), flags=re.MULTILINE)

        try:
            structured_data = json.loads(cleaned_text)
        except json.JSONDecodeError:
            structured_data = {"error": "Failed to parse AI response", "raw_text": raw_text}

        return structured_data

    except Exception as e:
        return {"error": str(e)}
