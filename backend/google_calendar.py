import os
import json
import pickle
from datetime import datetime, timedelta
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

# If modifying these scopes, delete the file token.json.
SCOPES = ['https://www.googleapis.com/auth/calendar']

class GoogleCalendarManager:
    def __init__(self):
        self.creds = None
        self.service = None
        self.calendar_id = 'primary'  # Use primary calendar by default
        
    def authenticate(self):
        """Authenticate with Google Calendar API"""
        # The file token.json stores the user's access and refresh tokens.
        if os.path.exists('token.json'):
            self.creds = Credentials.from_authorized_user_file('token.json', SCOPES)
        
        # If there are no (valid) credentials available, let the user log in.
        if not self.creds or not self.creds.valid:
            if self.creds and self.creds.expired and self.creds.refresh_token:
                self.creds.refresh(Request())
            else:
                if not os.path.exists('credentials.json'):
                    raise FileNotFoundError(
                        "credentials.json not found. Please download it from Google Cloud Console "
                        "and place it in the backend directory."
                    )
                flow = InstalledAppFlow.from_client_secrets_file('credentials.json', SCOPES)
                self.creds = flow.run_local_server(port=0)
            
            # Save the credentials for the next run
            with open('token.json', 'w') as token:
                token.write(self.creds.to_json())
        
        self.service = build('calendar', 'v3', credentials=self.creds)
        return True
    
    def is_authenticated(self):
        """Check if user is authenticated"""
        return self.service is not None
    
    def add_song_event(self, title, artist, timestamp):
        """Add a song event to Google Calendar"""
        if not self.service:
            raise Exception("Not authenticated with Google Calendar")
        
        # Parse timestamp
        if isinstance(timestamp, str):
            event_time = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
        else:
            event_time = timestamp
        
        # Create event details
        event = {
            'summary': f'🎵 {title}',
            'description': f'Artist: {artist}\nListened via E-Motionary',
            'start': {
                'dateTime': event_time.isoformat(),
                'timeZone': 'UTC',
            },
            'end': {
                'dateTime': (event_time + timedelta(minutes=1)).isoformat(),
                'timeZone': 'UTC',
            },
            'colorId': '1',  # Blue color
            'reminders': {
                'useDefault': False,
                'overrides': [],
            },
        }
        
        try:
            event = self.service.events().insert(
                calendarId=self.calendar_id,
                body=event
            ).execute()
            return event['id']
        except HttpError as error:
            print(f'An error occurred: {error}')
            raise
    
    def add_photo_event(self, label, timestamp, photo_url=None):
        """Add a photo event to Google Calendar"""
        if not self.service:
            raise Exception("Not authenticated with Google Calendar")
        
        # Parse timestamp
        if isinstance(timestamp, str):
            event_time = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
        else:
            event_time = timestamp
        
        # Create event details
        description = f'Photo taken via E-Motionary'
        if label:
            description += f'\nLabel: {label}'
        if photo_url:
            description += f'\nPhoto: {photo_url}'
        
        event = {
            'summary': f'📷 Photo',
            'description': description,
            'start': {
                'dateTime': event_time.isoformat(),
                'timeZone': 'UTC',
            },
            'end': {
                'dateTime': (event_time + timedelta(minutes=1)).isoformat(),
                'timeZone': 'UTC',
            },
            'colorId': '2',  # Green color
            'reminders': {
                'useDefault': False,
                'overrides': [],
            },
        }
        
        try:
            event = self.service.events().insert(
                calendarId=self.calendar_id,
                body=event
            ).execute()
            return event['id']
        except HttpError as error:
            print(f'An error occurred: {error}')
            raise
    
    def get_events(self, start_date=None, end_date=None):
        """Get events from Google Calendar"""
        if not self.service:
            raise Exception("Not authenticated with Google Calendar")
        
        if not start_date:
            start_date = datetime.now() - timedelta(days=30)
        if not end_date:
            end_date = datetime.now() + timedelta(days=30)
        
        try:
            events_result = self.service.events().list(
                calendarId=self.calendar_id,
                timeMin=start_date.isoformat() + 'Z',
                timeMax=end_date.isoformat() + 'Z',
                singleEvents=True,
                orderBy='startTime'
            ).execute()
            
            events = events_result.get('items', [])
            
            # Filter for E-Motionary events
            emotionary_events = []
            for event in events:
                if 'E-Motionary' in event.get('description', ''):
                    emotionary_events.append(event)
            
            return emotionary_events
        except HttpError as error:
            print(f'An error occurred: {error}')
            raise
    
    def delete_event(self, event_id):
        """Delete an event from Google Calendar"""
        if not self.service:
            raise Exception("Not authenticated with Google Calendar")
        
        try:
            self.service.events().delete(
                calendarId=self.calendar_id,
                eventId=event_id
            ).execute()
            return True
        except HttpError as error:
            print(f'An error occurred: {error}')
            raise

# Global instance
calendar_manager = GoogleCalendarManager() 