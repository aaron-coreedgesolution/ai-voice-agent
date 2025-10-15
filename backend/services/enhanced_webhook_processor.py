# backend/services/enhanced_webhook_processor.py
"""
Enhanced webhook processor that uses OpenAI to structure Retell AI responses
before saving to the database.
"""

import logging
from typing import Dict, Any, Optional
from services.transcript_parser import parse_transcript
from services.dynamic_response_handler import dynamic_handler
from services.supabase_service import SupabaseService


class EnhancedWebhookProcessor:
    """
    Processes Retell AI webhook data using OpenAI to extract structured information
    before saving to the database.
    """
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
    
    async def process_webhook_data(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Process incoming webhook data from Retell AI.
        
        Args:
            payload: Raw webhook payload from Retell AI
            
        Returns:
            Dict containing processing results and structured data
        """
        try:
            # Extract basic fields from Retell payload
            call_id = payload.get("call_id")
            agent_id = payload.get("agent_id")
            status = payload.get("status", "unknown")
            recording_url = payload.get("recording_url")
            transcript = payload.get("transcript", "")
            
            # Extract metadata
            metadata = payload.get("metadata", {})
            driver_name = metadata.get("driver_name", "Unknown Driver")
            phone_number = metadata.get("phone_number", "Unknown")
            load_number = metadata.get("load_number", "Unknown")
            
            self.logger.info(f"Processing webhook for call {call_id}, driver {driver_name}")
            
            # Step 1: Use OpenAI to extract comprehensive structured data
            structured_data = await self._extract_structured_data(transcript, agent_id)
            
            # Step 2: Analyze response quality and dynamic handling
            response_analysis = dynamic_handler.analyze_response_quality(transcript, driver_name)
            
            # Step 3: Determine call outcome
            call_outcome = self._determine_call_outcome(status, structured_data, response_analysis)
            
            # Step 4: Create comprehensive database record
            database_record = {
                "call_outcome": call_outcome,
                "structured_data": {
                    **structured_data,
                    "retell_call_id": call_id,
                    "retell_agent_id": agent_id,
                    "recording_url": recording_url,
                    "status": status,
                    "response_analysis": response_analysis,
                    "dynamic_handling": {
                        "response_quality": response_analysis["response_quality"],
                        "action_needed": response_analysis["action_needed"],
                        "confidence_score": response_analysis["confidence_score"],
                        "escalation_recommended": response_analysis["escalation_recommended"]
                    },
                    "processing_metadata": {
                        "processed_at": self._get_current_timestamp(),
                        "ai_confidence": structured_data.get("confidence_score", 0.0),
                        "business_impact": structured_data.get("business_impact", "Low"),
                        "call_quality": structured_data.get("call_quality", "Unknown")
                    }
                },
                "transcript": transcript,
            }
            
            # Step 5: Update or create database record
            result = await self._upsert_call_record(
                call_id, driver_name, phone_number, load_number, database_record
            )
            
            return {
                "status": "success",
                "call_id": call_id,
                "structured_data": structured_data,
                "response_analysis": response_analysis,
                "database_result": result
            }
            
        except Exception as e:
            self.logger.error(f"Error processing webhook: {e}")
            raise
    
    async def _extract_structured_data(self, transcript: str, agent_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Use OpenAI to extract structured data from transcript.
        """
        if not transcript or transcript.strip() == "":
            return {"error": "Empty transcript", "confidence_score": 0.0}
        
        try:
            # Get agent configuration to determine scenario type
            scenario_type = None
            if agent_id:
                scenario_type = await self._get_agent_scenario_type(agent_id)
            
            # Parse transcript using OpenAI
            structured_data = parse_transcript(transcript, scenario_type)
            
            # Add additional AI analysis for business intelligence
            enhanced_data = await self._enhance_with_business_intelligence(transcript, structured_data)
            
            return {**structured_data, **enhanced_data}
            
        except Exception as e:
            self.logger.error(f"Error extracting structured data: {e}")
            return {"error": str(e), "confidence_score": 0.0}
    
    async def _get_agent_scenario_type(self, agent_id: str) -> Optional[str]:
        """
        Get scenario type from agent configuration.
        """
        try:
            agents_response = SupabaseService.get_agent_configs()
            for agent in agents_response.data:
                if agent.get("settings", {}).get("retell_agent_id") == agent_id:
                    return agent.get("settings", {}).get("scenario_type")
        except Exception as e:
            self.logger.warning(f"Could not fetch agent config: {e}")
        return None
    
    async def _enhance_with_business_intelligence(self, transcript: str, structured_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Add business intelligence insights to the structured data.
        """
        # This could be enhanced with additional AI analysis
        # For now, we'll add some basic business metrics
        
        business_insights = {
            "call_duration_estimate": self._estimate_call_duration(transcript),
            "complexity_score": self._calculate_complexity_score(transcript),
            "escalation_risk": self._assess_escalation_risk(structured_data),
            "follow_up_required": self._determine_follow_up_required(structured_data)
        }
        
        return business_insights
    
    def _estimate_call_duration(self, transcript: str) -> str:
        """Estimate call duration based on transcript length and content."""
        word_count = len(transcript.split())
        if word_count < 50:
            return "Short (< 2 minutes)"
        elif word_count < 150:
            return "Medium (2-5 minutes)"
        else:
            return "Long (> 5 minutes)"
    
    def _calculate_complexity_score(self, transcript: str) -> float:
        """Calculate complexity score based on transcript content."""
        complexity_indicators = [
            "emergency", "delay", "problem", "issue", "concern", "urgent",
            "escalate", "manager", "supervisor", "dispatch"
        ]
        
        transcript_lower = transcript.lower()
        matches = sum(1 for indicator in complexity_indicators if indicator in transcript_lower)
        return min(matches / len(complexity_indicators), 1.0)
    
    def _assess_escalation_risk(self, structured_data: Dict[str, Any]) -> str:
        """Assess risk of escalation based on structured data."""
        if structured_data.get("emergency_type"):
            return "High"
        elif structured_data.get("business_impact") == "Critical":
            return "High"
        elif structured_data.get("driver_sentiment") in ["Frustrated", "Negative"]:
            return "Medium"
        else:
            return "Low"
    
    def _determine_follow_up_required(self, structured_data: Dict[str, Any]) -> bool:
        """Determine if follow-up is required based on structured data."""
        return (
            structured_data.get("action_items") and len(structured_data["action_items"]) > 0
        ) or (
            structured_data.get("business_impact") in ["High", "Critical"]
        ) or (
            structured_data.get("escalation_status") is not None
        )
    
    def _determine_call_outcome(self, status: str, structured_data: Dict[str, Any], response_analysis: Dict[str, Any]) -> str:
        """
        Determine the final call outcome based on status, structured data, and response analysis.
        """
        if status == "completed":
            # Use AI-determined outcome if available
            if structured_data.get("call_outcome"):
                return structured_data["call_outcome"]
            
            # Fallback to response analysis
            if response_analysis.get("escalation_recommended"):
                return "Escalated"
            elif response_analysis.get("response_quality") == "good":
                return "Completed Successfully"
            else:
                return "Completed with Issues"
        else:
            return "Pending"
    
    async def _upsert_call_record(
        self, 
        call_id: str, 
        driver_name: str, 
        phone_number: str, 
        load_number: str, 
        database_record: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Create new call record - only webhook creates records.
        """
        # Since only webhook should save data, always create new record
        result = SupabaseService.insert_call_record(
            driver_name=driver_name,
            phone_number=phone_number,
            load_number=load_number,
            call_outcome=database_record["call_outcome"],
            structured_data=database_record["structured_data"],
            transcript=database_record["transcript"],
        )
        return {"action": "created", "result": result}
    
    def _get_current_timestamp(self) -> str:
        """Get current timestamp in ISO format."""
        from datetime import datetime
        return datetime.utcnow().isoformat()


# Global instance
enhanced_processor = EnhancedWebhookProcessor()
