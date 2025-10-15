# backend/test_enhanced_webhook.py
"""
Test script to demonstrate the enhanced webhook processing with OpenAI structuring.
"""

import asyncio
import json
from services.enhanced_webhook_processor import enhanced_processor


async def test_webhook_processing():
    """
    Test the enhanced webhook processor with sample data.
    """
    
    # Sample webhook payload from Retell AI
    sample_payload = {
        "call_id": "retell_call_12345",
        "agent_id": "retell_agent_67890",
        "status": "completed",
        "recording_url": "https://retell.ai/recordings/call_12345.mp3",
        "transcript": """
        Agent: Hello, this is your dispatch calling. How are you doing today?
        
        Driver: Hey, I'm doing okay. Just wanted to check in about my load.
        
        Agent: Great! Can you tell me your current location and status?
        
        Driver: I'm on I-10 near Indio, California. Should be arriving at the warehouse tomorrow morning around 8 AM.
        
        Agent: Perfect. Any delays or issues we should know about?
        
        Driver: Traffic is a bit heavy but nothing major. The truck is running fine.
        
        Agent: Excellent. Don't forget to get your POD when you arrive. Have a safe trip!
        
        Driver: Will do, thanks!
        """,
        "metadata": {
            "driver_name": "John Smith",
            "phone_number": "555-123-4567",
            "load_number": "LOAD-2024-001",
            "scenario_type": "dispatch_checkin"
        }
    }
    
    print("🧪 Testing Enhanced Webhook Processing")
    print("=" * 50)
    
    try:
        # Process the webhook data
        result = await enhanced_processor.process_webhook_data(sample_payload)
        
        print("✅ Webhook processing completed successfully!")
        print(f"📞 Call ID: {result['call_id']}")
        print(f"📊 Status: {result['status']}")
        
        print("\n🤖 AI-Extracted Structured Data:")
        print("-" * 30)
        structured_data = result.get('structured_data', {})
        for key, value in structured_data.items():
            if key not in ['retell_call_id', 'retell_agent_id', 'recording_url', 'status']:
                print(f"  {key}: {value}")
        
        print("\n📈 Response Analysis:")
        print("-" * 20)
        response_analysis = result.get('response_analysis', {})
        for key, value in response_analysis.items():
            print(f"  {key}: {value}")
        
        print("\n💾 Database Result:")
        print("-" * 15)
        db_result = result.get('database_result', {})
        print(f"  Action: {db_result.get('action', 'Unknown')}")
        if 'record_id' in db_result:
            print(f"  Record ID: {db_result['record_id']}")
        
        print("\n🎯 Key Business Insights:")
        print("-" * 25)
        if structured_data.get('business_impact'):
            print(f"  Business Impact: {structured_data['business_impact']}")
        if structured_data.get('driver_sentiment'):
            print(f"  Driver Sentiment: {structured_data['driver_sentiment']}")
        if structured_data.get('call_quality'):
            print(f"  Call Quality: {structured_data['call_quality']}")
        if structured_data.get('confidence_score'):
            print(f"  AI Confidence: {structured_data['confidence_score']}")
        
        if structured_data.get('key_issues'):
            print(f"  Key Issues: {', '.join(structured_data['key_issues'])}")
        
        if structured_data.get('action_items'):
            print(f"  Action Items: {', '.join(structured_data['action_items'])}")
        
        print("\n" + "=" * 50)
        print("✅ Test completed successfully!")
        
    except Exception as e:
        print(f"❌ Error during webhook processing: {e}")
        import traceback
        traceback.print_exc()


async def test_emergency_scenario():
    """
    Test with an emergency scenario to show different structured data extraction.
    """
    
    emergency_payload = {
        "call_id": "retell_call_emergency_001",
        "agent_id": "retell_agent_emergency",
        "status": "completed",
        "recording_url": "https://retell.ai/recordings/emergency_001.mp3",
        "transcript": """
        Agent: This is your dispatch. How are you doing?
        
        Driver: I need help! I just had a blowout on I-15 near Barstow. The trailer is okay but I'm stuck on the shoulder.
        
        Agent: Are you safe? Is anyone injured?
        
        Driver: Yes, I'm safe. No injuries. But I need a tire change and I'm blocking traffic.
        
        Agent: I'm connecting you with emergency dispatch right now. Stay safe and I'll get help to you immediately.
        
        Driver: Thank you, please hurry!
        """,
        "metadata": {
            "driver_name": "Mike Johnson",
            "phone_number": "555-987-6543",
            "load_number": "LOAD-2024-EMERGENCY",
            "scenario_type": "emergency_protocol"
        }
    }
    
    print("\n🚨 Testing Emergency Scenario")
    print("=" * 40)
    
    try:
        result = await enhanced_processor.process_webhook_data(emergency_payload)
        
        print("✅ Emergency webhook processing completed!")
        
        structured_data = result.get('structured_data', {})
        print(f"\n🚨 Emergency Analysis:")
        print(f"  Emergency Type: {structured_data.get('emergency_type', 'N/A')}")
        print(f"  Safety Status: {structured_data.get('safety_status', 'N/A')}")
        print(f"  Business Impact: {structured_data.get('business_impact', 'N/A')}")
        print(f"  Escalation Status: {structured_data.get('escalation_status', 'N/A')}")
        
    except Exception as e:
        print(f"❌ Error in emergency scenario: {e}")


if __name__ == "__main__":
    print("🚀 Starting Enhanced Webhook Processing Tests")
    print("=" * 50)
    
    # Run the tests
    asyncio.run(test_webhook_processing())
    asyncio.run(test_emergency_scenario())
    
    print("\n🎉 All tests completed!")
