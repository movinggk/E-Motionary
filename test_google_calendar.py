#!/usr/bin/env python3
"""
Test script for Google Calendar integration
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

# Change to backend directory to find credentials.json
os.chdir(os.path.join(os.path.dirname(__file__), 'backend'))

from google_calendar import calendar_manager
from datetime import datetime

def test_google_calendar():
    """Test Google Calendar integration"""
    print("Testing Google Calendar integration...")
    
    try:
        # Test authentication
        print("1. Testing authentication...")
        calendar_manager.authenticate()
        print("✅ Authentication successful")
        
        # Test adding a song event
        print("2. Testing song event creation...")
        event_id = calendar_manager.add_song_event(
            "Test Song", 
            "Test Artist", 
            datetime.now().isoformat()
        )
        print(f"✅ Song event created with ID: {event_id}")
        
        # Test adding a photo event
        print("3. Testing photo event creation...")
        event_id = calendar_manager.add_photo_event(
            "Test Photo", 
            datetime.now().isoformat()
        )
        print(f"✅ Photo event created with ID: {event_id}")
        
        # Test getting events
        print("4. Testing event retrieval...")
        events = calendar_manager.get_events()
        print(f"✅ Retrieved {len(events)} events from Google Calendar")
        
        print("\n🎉 All tests passed! Google Calendar integration is working correctly.")
        
    except FileNotFoundError as e:
        print(f"❌ Error: {e}")
        print("Please follow the setup guide in GOOGLE_CALENDAR_SETUP.md")
    except Exception as e:
        print(f"❌ Error: {e}")
        print("Check your Google Cloud Console settings and credentials")

if __name__ == "__main__":
    test_google_calendar() 