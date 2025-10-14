#!/usr/bin/env python3
"""
Test script for Retell AI web call integration
Run this to test if the Retell API is working correctly
"""

import os
import sys
import logging
from dotenv import load_dotenv

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from services.retell_service import RetellService

# Load environment variables
load_dotenv()

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def test_retell_connection():
    """Test basic Retell API connection"""
    logger.info("🧪 Testing Retell AI connection...")
    
    # Check environment variables
    api_key = os.getenv("RETELL_API_KEY")
    agent_id = os.getenv("RETELL_AGENT_ID")
    
    if not api_key:
        logger.error("❌ RETELL_API_KEY not found in environment")
        logger.info("💡 Make sure you have a .env file in the backend directory with:")
        logger.info("   RETELL_API_KEY=your_api_key_here")
        return False
        
    if not agent_id:
        logger.warning("⚠️  RETELL_AGENT_ID not found, will use default")
    
    logger.info(f"✅ API Key: {'*' * (len(api_key) - 4) + api_key[-4:] if api_key else 'None'}")
    logger.info(f"✅ Agent ID: {agent_id or 'default_agent_id'}")
    
    return True

def test_web_call_creation():
    """Test creating a web call"""
    logger.info("🧪 Testing web call creation...")
    
    try:
        # Test with sample data
        result = RetellService.create_web_call(
            driver_name="Test Driver",
            load_number="TEST-123",
            phone_number="WEB_CALL"
        )
        
        if "error" in result:
            logger.error(f"❌ Web call creation failed: {result['error']}")
            return False
        else:
            logger.info(f"✅ Web call created successfully!")
            logger.info(f"   Web Call Link: {result.get('web_call_link', 'N/A')}")
            logger.info(f"   Access Token: {result.get('access_token', 'N/A')}")
            logger.info(f"   Call ID: {result.get('call_id', 'N/A')}")
            
            # Show the constructed URL
            if result.get('web_call_link'):
                logger.info(f"🌐 Open this URL in your browser to start the call:")
                logger.info(f"   {result.get('web_call_link')}")
            
            return True
            
    except Exception as e:
        logger.error(f"❌ Exception during web call creation: {e}")
        return False

if __name__ == "__main__":
    logger.info("🚀 Starting Retell AI integration tests...")
    
    # Test 1: Connection
    if not test_retell_connection():
        logger.error("❌ Connection test failed. Please check your environment variables.")
        sys.exit(1)
    
    # Test 2: Web call creation
    if not test_web_call_creation():
        logger.error("❌ Web call creation test failed.")
        sys.exit(1)
    
    logger.info("🎉 All tests passed! Retell AI integration is working correctly.")
