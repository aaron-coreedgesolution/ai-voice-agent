# backend/services/dynamic_response_handler.py
"""
Dynamic response handling for edge cases in voice agent conversations
"""

import logging
from typing import Dict, List, Any
import re

class DynamicResponseHandler:
    """Handles dynamic responses for various edge cases in voice conversations"""
    
    def __init__(self):
        self.probing_attempts = {}
        self.repetition_attempts = {}
        self.gps_discrepancies = {}
    
    def analyze_response_quality(self, transcript: str, driver_name: str = "") -> Dict[str, Any]:
        """
        Analyze the quality of driver responses and determine appropriate actions
        """
        analysis = {
            "response_quality": "good",
            "action_needed": None,
            "probing_questions": [],
            "escalation_recommended": False,
            "confidence_score": 1.0
        }
        
        # Check for uncooperative driver patterns
        uncooperative_score = self._detect_uncooperative_patterns(transcript)
        if uncooperative_score > 0.7:
            analysis["response_quality"] = "uncooperative"
            analysis["action_needed"] = "probe_for_details"
            analysis["probing_questions"] = self._generate_probing_questions(transcript, driver_name)
            analysis["confidence_score"] = 0.3
        
        # Check for noisy environment patterns
        noise_score = self._detect_noise_patterns(transcript)
        if noise_score > 0.6:
            analysis["response_quality"] = "unclear"
            analysis["action_needed"] = "request_repetition"
            analysis["confidence_score"] = 0.4
        
        # Check for conflicting information
        conflict_score = self._detect_conflicting_info(transcript)
        if conflict_score > 0.5:
            analysis["response_quality"] = "conflicting"
            analysis["action_needed"] = "clarify_discrepancy"
            analysis["confidence_score"] = 0.5
        
        return analysis
    
    def _detect_uncooperative_patterns(self, transcript: str) -> float:
        """Detect patterns indicating uncooperative driver responses"""
        uncooperative_indicators = [
            r'\b(yes|no|ok|fine|whatever)\b',  # One-word responses
            r'\b(i don\'t know|idk|not sure)\b',  # Evasive responses
            r'\b(whatever|doesn\'t matter)\b',  # Dismissive responses
            r'\b(just get it done|hurry up)\b',  # Impatient responses
        ]
        
        transcript_lower = transcript.lower()
        matches = 0
        
        for pattern in uncooperative_indicators:
            if re.search(pattern, transcript_lower):
                matches += 1
        
        return matches / len(uncooperative_indicators)
    
    def _detect_noise_patterns(self, transcript: str) -> float:
        """Detect patterns indicating noisy environment or garbled speech"""
        noise_indicators = [
            r'\[inaudible\]',
            r'\[unclear\]',
            r'\[garbled\]',
            r'\?{2,}',  # Multiple question marks
            r'\.{3,}',  # Multiple periods (indicating hesitation)
            r'\b(what|huh|sorry|could you repeat)\b',
        ]
        
        matches = 0
        for pattern in noise_indicators:
            if re.search(pattern, transcript.lower()):
                matches += 1
        
        return matches / len(noise_indicators)
    
    def _detect_conflicting_info(self, transcript: str) -> float:
        """Detect conflicting information in driver responses"""
        # This would typically compare with GPS data or previous reports
        # For now, we'll detect internal contradictions
        conflicting_patterns = [
            r'\b(but|however|actually|wait)\b',  # Contradiction indicators
            r'\b(i think|maybe|probably)\b',  # Uncertainty indicators
            r'\b(earlier|before|last time)\b',  # Time-based contradictions
        ]
        
        matches = 0
        for pattern in conflicting_patterns:
            if re.search(pattern, transcript.lower()):
                matches += 1
        
        return matches / len(conflicting_patterns)
    
    def _generate_probing_questions(self, transcript: str, driver_name: str) -> List[str]:
        """Generate probing questions based on what information is missing"""
        questions = []
        transcript_lower = transcript.lower()
        
        # Check for missing location information
        if not any(word in transcript_lower for word in ['location', 'near', 'mile marker', 'highway', 'route']):
            questions.append(f"Can you tell me your current location, {driver_name}?")
        
        # Check for missing ETA information
        if not any(word in transcript_lower for word in ['eta', 'arrive', 'tomorrow', 'hours', 'minutes']):
            questions.append("What's your estimated time of arrival?")
        
        # Check for missing status information
        if not any(word in transcript_lower for word in ['driving', 'stopped', 'delayed', 'unloading', 'loading']):
            questions.append("Can you give me more details about your current status?")
        
        # Generic probing question if still unclear
        if len(questions) == 0:
            questions.append(f"I need a bit more information, {driver_name}. Can you provide more details?")
        
        return questions
    
    def generate_dynamic_prompt_addition(self, analysis: Dict[str, Any], driver_name: str = "") -> str:
        """
        Generate additional prompt instructions based on response analysis
        """
        if analysis["action_needed"] == "probe_for_details":
            return f"""
IMPORTANT: The driver seems uncooperative or giving brief answers. Use these probing questions:
{chr(10).join(f"- {q}" for q in analysis['probing_questions'])}

Be patient but persistent. If they continue to give one-word answers after 3 attempts, politely end the call and note the uncooperative behavior.
"""
        
        elif analysis["action_needed"] == "request_repetition":
            return f"""
IMPORTANT: The driver's responses seem unclear or garbled. 
- Ask them to repeat their last response clearly
- Speak slowly and clearly yourself
- If still unclear after 2 attempts, ask them to call back when in a quieter location
"""
        
        elif analysis["action_needed"] == "clarify_discrepancy":
            return f"""
IMPORTANT: There seems to be conflicting information in the driver's responses.
- Politely ask for clarification without being confrontational
- Say something like "I want to make sure I have the correct information"
- If the discrepancy involves location, ask them to check their GPS or mile marker
"""
        
        return ""
    
    def should_escalate_call(self, analysis: Dict[str, Any], call_attempts: int = 1) -> bool:
        """
        Determine if the call should be escalated based on response quality and attempts
        """
        # Escalate if uncooperative after multiple attempts
        if analysis["response_quality"] == "uncooperative" and call_attempts >= 3:
            return True
        
        # Escalate if consistently unclear after multiple attempts
        if analysis["response_quality"] == "unclear" and call_attempts >= 2:
            return True
        
        # Escalate if emergency detected
        if analysis.get("emergency_detected", False):
            return True
        
        return False
    
    def get_escalation_instructions(self, reason: str) -> str:
        """
        Get escalation instructions based on the reason for escalation
        """
        escalation_instructions = {
            "uncooperative": "End the call politely and note: 'Driver was uncooperative, unable to gather required information'",
            "unclear": "End the call and note: 'Poor connection quality, driver should call back when in better location'",
            "emergency": "IMMEDIATE ESCALATION: Connect to human dispatcher immediately for emergency assistance",
            "conflicting": "End the call and note: 'Conflicting information provided, manual follow-up required'"
        }
        
        return escalation_instructions.get(reason, "Escalate to human dispatcher for manual assistance")

# Global instance
dynamic_handler = DynamicResponseHandler()
