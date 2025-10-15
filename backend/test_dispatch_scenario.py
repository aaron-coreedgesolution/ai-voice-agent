# backend/test_dispatch_scenario.py
"""
Test script specifically for the Logistics Dispatch Check-in scenario
as described in the requirements document.
"""

import asyncio
import json
from services.enhanced_webhook_processor import enhanced_processor


async def test_dispatch_checkin_scenario():
    """
    Test the enhanced webhook processor with the exact dispatch scenario
    from the requirements document.
    """
    
    print("🚛 Testing Logistics Dispatch Check-in Scenario")
    print("=" * 60)
    
    # Scenario 1: Driver is mid-transit (In-Transit Update)
    mid_transit_payload = {
        "call_id": "retell_dispatch_001",
        "agent_id": "retell_agent_dispatch",
        "status": "completed",
        "recording_url": "https://retell.ai/recordings/dispatch_001.mp3",
        "transcript": """
        Agent: Hi Mike, this is Dispatch with a check call on load 7891-B. Can you give me an update on your status?
        
        Driver: Hey there! I'm currently driving on I-10 near Indio, California. Should be arriving at the Phoenix warehouse tomorrow morning around 8 AM.
        
        Agent: Great! Any delays or issues we should know about?
        
        Driver: Traffic is a bit heavy but nothing major. The truck is running fine, no mechanical issues.
        
        Agent: Perfect. Don't forget to get your POD when you arrive. Have a safe trip!
        
        Driver: Will do, thanks for checking in!
        """,
        "metadata": {
            "driver_name": "Mike",
            "phone_number": "555-123-4567",
            "load_number": "7891-B",
            "scenario_type": "dispatch_checkin"
        }
    }
    
    print("📞 Scenario 1: Mid-Transit Driver (In-Transit Update)")
    print("-" * 50)
    
    try:
        result = await enhanced_processor.process_webhook_data(mid_transit_payload)
        
        print("✅ Dispatch check-in processing completed!")
        
        # Extract and display the required structured data
        structured_data = result.get('structured_data', {})
        
        print("\n📊 Required Structured Data (Success Case):")
        print("=" * 45)
        
        # Check each required field from the requirements document
        required_fields = {
            "call_outcome": "In-Transit Update OR Arrival Confirmation",
            "driver_status": "Driving OR Delayed OR Arrived OR Unloading", 
            "current_location": "Specific location (e.g., I-10 near Indio, CA)",
            "eta": "Estimated arrival time (e.g., Tomorrow, 8:00 AM)",
            "delay_reason": "Reason for delay (e.g., Heavy Traffic, Weather, None)",
            "unloading_status": "Unloading details (e.g., In Door 42, Waiting for Lumper, Detention, N/A)",
            "pod_reminder_acknowledged": "true OR false"
        }
        
        for field, description in required_fields.items():
            value = structured_data.get(field, "❌ MISSING")
            status = "✅" if value != "❌ MISSING" else "❌"
            print(f"  {status} {field}: {value}")
            if field == "call_outcome":
                print(f"      Expected: In-Transit Update | Got: {value}")
            elif field == "driver_status":
                print(f"      Expected: Driving | Got: {value}")
            elif field == "current_location":
                print(f"      Expected: I-10 near Indio, CA | Got: {value}")
        
        print(f"\n🎯 Additional Business Intelligence:")
        print(f"  Driver Sentiment: {structured_data.get('driver_sentiment', 'N/A')}")
        print(f"  Call Quality: {structured_data.get('call_quality', 'N/A')}")
        print(f"  Business Impact: {structured_data.get('business_impact', 'N/A')}")
        print(f"  AI Confidence: {structured_data.get('confidence_score', 'N/A')}")
        
        # Verify the data matches requirements
        success_criteria = {
            "call_outcome_correct": structured_data.get("call_outcome") in ["In-Transit Update", "Arrival Confirmation"],
            "driver_status_correct": structured_data.get("driver_status") in ["Driving", "Delayed", "Arrived", "Unloading"],
            "location_provided": structured_data.get("current_location") and structured_data["current_location"] != "N/A",
            "eta_provided": structured_data.get("eta") and structured_data["eta"] != "N/A",
            "pod_reminder_handled": structured_data.get("pod_reminder_acknowledged") is not None
        }
        
        print(f"\n📋 Requirements Compliance Check:")
        print("=" * 35)
        for criterion, passed in success_criteria.items():
            status = "✅ PASS" if passed else "❌ FAIL"
            print(f"  {status} {criterion.replace('_', ' ').title()}")
        
        all_passed = all(success_criteria.values())
        print(f"\n🎉 Overall Compliance: {'✅ ALL REQUIREMENTS MET' if all_passed else '❌ SOME REQUIREMENTS MISSING'}")
        
    except Exception as e:
        print(f"❌ Error during dispatch processing: {e}")
        import traceback
        traceback.print_exc()


async def test_arrival_confirmation_scenario():
    """
    Test the arrival confirmation scenario.
    """
    
    print("\n\n🏢 Scenario 2: Driver Has Arrived (Arrival Confirmation)")
    print("=" * 60)
    
    arrival_payload = {
        "call_id": "retell_dispatch_002", 
        "agent_id": "retell_agent_dispatch",
        "status": "completed",
        "recording_url": "https://retell.ai/recordings/dispatch_002.mp3",
        "transcript": """
        Agent: Hi Mike, this is Dispatch with a check call on load 7891-B. Can you give me an update on your status?
        
        Driver: Hey! I just arrived at the Phoenix warehouse about 30 minutes ago. I'm currently in Door 42 waiting for the lumper to start unloading.
        
        Agent: Excellent! How long do you think the unloading will take?
        
        Driver: Should be done in about 2 hours. I'll make sure to get the POD before I leave.
        
        Agent: Perfect, thanks for the update!
        """,
        "metadata": {
            "driver_name": "Mike",
            "phone_number": "555-123-4567", 
            "load_number": "7891-B",
            "scenario_type": "dispatch_checkin"
        }
    }
    
    try:
        result = await enhanced_processor.process_webhook_data(arrival_payload)
        
        print("✅ Arrival confirmation processing completed!")
        
        structured_data = result.get('structured_data', {})
        
        print(f"\n📊 Structured Data for Arrival Scenario:")
        print("=" * 40)
        print(f"  Call Outcome: {structured_data.get('call_outcome', 'N/A')}")
        print(f"  Driver Status: {structured_data.get('driver_status', 'N/A')}")
        print(f"  Current Location: {structured_data.get('current_location', 'N/A')}")
        print(f"  Unloading Status: {structured_data.get('unloading_status', 'N/A')}")
        print(f"  POD Reminder: {structured_data.get('pod_reminder_acknowledged', 'N/A')}")
        
        # Check if this matches the "Arrival Confirmation" scenario
        is_arrival_confirmation = (
            structured_data.get("call_outcome") == "Arrival Confirmation" and
            structured_data.get("driver_status") == "Unloading" and
            "Door" in str(structured_data.get("unloading_status", ""))
        )
        
        print(f"\n🎯 Arrival Confirmation Match: {'✅ YES' if is_arrival_confirmation else '❌ NO'}")
        
    except Exception as e:
        print(f"❌ Error in arrival scenario: {e}")


async def test_delayed_scenario():
    """
    Test the delayed driver scenario.
    """
    
    print("\n\n⏰ Scenario 3: Driver is Delayed")
    print("=" * 40)
    
    delayed_payload = {
        "call_id": "retell_dispatch_003",
        "agent_id": "retell_agent_dispatch", 
        "status": "completed",
        "recording_url": "https://retell.ai/recordings/dispatch_003.mp3",
        "transcript": """
        Agent: Hi Mike, this is Dispatch with a check call on load 7891-B. Can you give me an update on your status?
        
        Driver: Hey, I'm running behind schedule. I'm stuck in heavy traffic on I-10 near Palm Springs. There was an accident ahead and we're barely moving.
        
        Agent: I understand. What's your new ETA looking like?
        
        Driver: Probably won't make it until tomorrow afternoon, maybe 2 PM instead of 8 AM. This traffic is brutal.
        
        Agent: Thanks for the update. Drive safely and let us know if anything changes.
        """,
        "metadata": {
            "driver_name": "Mike",
            "phone_number": "555-123-4567",
            "load_number": "7891-B", 
            "scenario_type": "dispatch_checkin"
        }
    }
    
    try:
        result = await enhanced_processor.process_webhook_data(delayed_payload)
        
        print("✅ Delayed driver processing completed!")
        
        structured_data = result.get('structured_data', {})
        
        print(f"\n📊 Structured Data for Delayed Scenario:")
        print("=" * 40)
        print(f"  Call Outcome: {structured_data.get('call_outcome', 'N/A')}")
        print(f"  Driver Status: {structured_data.get('driver_status', 'N/A')}")
        print(f"  Current Location: {structured_data.get('current_location', 'N/A')}")
        print(f"  ETA: {structured_data.get('eta', 'N/A')}")
        print(f"  Delay Reason: {structured_data.get('delay_reason', 'N/A')}")
        print(f"  Business Impact: {structured_data.get('business_impact', 'N/A')}")
        
        # Check if this correctly identifies the delay
        is_delayed_scenario = (
            structured_data.get("driver_status") == "Delayed" and
            "traffic" in str(structured_data.get("delay_reason", "")).lower() and
            structured_data.get("business_impact") in ["Medium", "High"]
        )
        
        print(f"\n🎯 Delay Detection: {'✅ ACCURATE' if is_delayed_scenario else '❌ INACCURATE'}")
        
    except Exception as e:
        print(f"❌ Error in delayed scenario: {e}")


if __name__ == "__main__":
    print("🚛 Logistics Dispatch Check-in Test Suite")
    print("=" * 50)
    print("Testing the exact scenario from requirements document:")
    print("Scenario 1: Logistics - End-to-End Driver Check-in")
    print("=" * 50)
    
    # Run all test scenarios
    asyncio.run(test_dispatch_checkin_scenario())
    asyncio.run(test_arrival_confirmation_scenario()) 
    asyncio.run(test_delayed_scenario())
    
    print("\n🎉 All dispatch scenarios tested!")
    print("=" * 30)
