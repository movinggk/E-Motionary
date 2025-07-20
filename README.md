# Integrated Diary

A unified application that combines music recognition and photo journaling on a shared calendar interface.

## Features

### 🎵 Music Recognition
- Record audio to automatically identify songs using Audd.io API
- Manual song entry with title and artist
- View listening history with timestamps
- AI-powered questions about your music history
- **NEW**: Automatic sync to Google Calendar

### 📸 Photo Journaling
- Take photos with device camera
- Add optional labels to photos
- View photo gallery with timestamps
- Export photos in various formats
- **NEW**: Automatic sync to Google Calendar

### 📸 Photo Journaling
- Take photos with device camera
- Add optional labels to photos
- View photo gallery with timestamps
- Export photos in various formats

### 📅 Unified Calendar
- View both music and photos on the same calendar
- Visual indicators for music (🎵) and photos (📷)
- Click on any day to see detailed entries
- Navigate between months seamlessly
- **NEW**: Google Calendar integration for automatic syncing

### 📊 Data Export
- Export all data as ZIP file
- Export songs only as JSON
- Export photos only as ZIP
- Includes metadata and timestamps

## Project Structure

```
integrated-app/
├── backend/
│   ├── app.py              # Flask API server
│   └── requirements.txt    # Python dependencies
└── frontend/
    ├── src/
    │   ├── components/     # React components
    │   ├── App.jsx         # Main app component
    │   └── main.jsx        # Entry point
    ├── package.json        # Node.js dependencies
    └── vite.config.js      # Vite configuration
```

## Setup Instructions

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn

### Required API Keys

The app requires the following API keys for full functionality:

1. **OpenAI API Key** (for AI assistant feature):
   - Go to [OpenAI Platform](https://platform.openai.com/api-keys)
   - Sign up or log in to your OpenAI account
   - Click "Create new secret key"
   - Copy the key and replace `your_openai_api_key_here` in `backend/app.py`

2. **Audd.io API Token** (for music recognition):
   - The app includes a test token, but for production use:
   - Go to [Audd.io](https://audd.io/) and get your own token
   - Replace the token in `backend/app.py`

3. **Google Calendar** (optional, for calendar integration):
   - Follow the setup guide in `GOOGLE_CALENDAR_SETUP.md`

For detailed setup instructions, see `API_KEYS_SETUP.md`.

### Quickstart

1. ```./setup.sh```

2. ```./start.sh```

The backend will run on `http://localhost:5001` and the frontend will run on `http://localhost:3000`.

### Manual Setup

#### Backend Setup

1. Navigate to the backend directory:
```bash
cd integrated-app/backend
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install Python dependencies:
```bash
pip install -r requirements.txt
```

4. Update API keys in `app.py`:
```python
AUDD_API_TOKEN = "your_audd_token_here"
OPENAI_API_KEY = "your_openai_key_here"  # Get from https://platform.openai.com/api-keys
```

5. Start the Flask server:
```bash
python app.py
```

The backend will run on `http://localhost:5001`

#### Google Calendar Integration (Optional)

To enable Google Calendar integration:

1. Follow the detailed setup guide in `GOOGLE_CALENDAR_SETUP.md`
2. Download your OAuth credentials and place them in the `backend/` directory
3. Install the new dependencies: `pip install -r requirements.txt`
4. Connect to Google Calendar through the app settings

#### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd integrated-app/frontend
```

2. Install Node.js dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

## Usage

### Music Features
1. Go to the "Music" tab
2. Click "Start Recording" to capture audio
3. Click "Stop Recording" when the song ends
4. The app will automatically identify the song and save it
5. Or manually add songs using the form

### Photo Features
1. Go to the "Photos" tab
2. Allow camera access when prompted
3. Click "Take Photo" to capture an image
4. Add an optional label
5. Click "Save Photo" to store it

### Calendar View
1. Go to the "Calendar" tab to see the unified view
2. Blue indicators show music entries
3. Green indicators show photo entries
4. Click on any day to see detailed entries
5. Use arrow buttons to navigate between months

### Data Export
1. Go to the "Download" tab
2. Choose your export format:
   - All Data: Complete ZIP with songs, photos, and metadata
   - Songs Only: JSON file with music history
   - Photos Only: ZIP file with all images

### AI Assistant
1. Click the settings gear icon
2. Use the "Ask AI" section to ask questions about your data
3. Examples: "What songs did I listen to most?", "Show me photos from last week"

## API Endpoints

### Songs
- `GET /api/songs` - Get all songs
- `POST /api/add-song` - Add song manually
- `POST /api/recognize-song` - Recognize song from audio

### Photos
- `GET /api/photos` - Get all photos
- `POST /api/add-photo` - Add photo

### Calendar
- `GET /api/calendar-data` - Get unified calendar data

### AI
- `POST /api/ask` - Ask AI about data
- `POST /api/clear-history` - Clear all data

### Google Calendar
- `GET /api/google-calendar/status` - Check authentication status
- `GET /api/google-calendar/auth` - Authenticate with Google Calendar

## Database Schema

### Songs Table
```sql
CREATE TABLE songs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    artist TEXT,
    listened_at TEXT NOT NULL,
    created_at TEXT NOT NULL
);
```

### Photos Table
```sql
CREATE TABLE photos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    data_url TEXT NOT NULL,
    label TEXT,
    taken_at TEXT NOT NULL,
    created_at TEXT NOT NULL
);
```

## Technologies Used

### Backend
- Flask (Python web framework)
- SQLite (Database)
- Audd.io API (Music recognition)
- OpenAI API (AI assistant)
- Google Calendar API (Calendar integration)

### Frontend
- React 19 (UI framework)
- Vite (Build tool)
- Tailwind CSS (Styling)
- date-fns (Date utilities)
- Lucide React (Icons)

## Troubleshooting

### Camera Access
- Ensure HTTPS or localhost for camera access
- Check browser permissions for camera

### Microphone Access
- Allow microphone access when prompted
- Check browser permissions for microphone

### API Errors
- Verify API keys are correct
- Check network connectivity
- Ensure backend server is running

### Database Issues
- The database file is created automatically
- Delete `integrated_diary.db` to reset data

### Microphone Access Troubleshooting

If you're experiencing "Could not access microphone" errors, try these solutions:

#### 1. Browser Permissions
- **Chrome/Edge**: Click the lock icon in the address bar → Site Settings → Microphone → Allow
- **Firefox**: Click the shield icon → Permissions → Microphone → Allow
- **Safari**: Safari → Preferences → Websites → Microphone → Allow for localhost

#### 2. HTTPS Requirement
- Microphone access requires HTTPS or localhost
- Make sure you're accessing the app via:
  - `http://localhost:3000` (development)
  - `https://yourdomain.com` (production)

#### 3. Browser Compatibility
- Use modern browsers: Chrome 60+, Firefox 55+, Safari 11+
- Avoid Internet Explorer (not supported)

#### 4. System Microphone Settings
- **macOS**: System Preferences → Security & Privacy → Microphone → Enable for your browser
- **Windows**: Settings → Privacy → Microphone → Allow apps to access microphone
- **Linux**: Check your audio settings and ensure microphone is not muted

#### 5. Hardware Issues
- Ensure microphone is connected and working
- Test microphone in other applications
- Check if microphone is being used by another application

#### 6. Development Environment
- If using localhost, make sure both servers are running:
  ```bash
  # Backend should be on port 5001
  curl http://localhost:5001/api/songs
  
  # Frontend should be on port 3000
  curl http://localhost:3000
  ```

#### 7. Advanced Debugging
- Open browser developer tools (F12)
- Check Console tab for error messages
- Look for specific error names like:
  - `NotAllowedError`: Permission denied
  - `NotFoundError`: No microphone found
  - `NotSupportedError`: Browser doesn't support getUserMedia
  - `SecurityError`: HTTPS requirement not met

#### 8. Alternative Solutions
- Try a different browser
- Restart your browser
- Clear browser cache and cookies
- Disable browser extensions that might interfere
- Try incognito/private browsing mode

## Development

### Adding New Features
1. Backend: Add new routes in `app.py`
2. Frontend: Create new components in `src/components/`
3. Update the main App.jsx to include new tabs/features

### Styling
- Uses Tailwind CSS for styling
- Custom CSS variables for theming
- Responsive design for mobile/desktop

### Testing
- Backend: Use tools like Postman or curl
- Frontend: Use browser dev tools for debugging

## License

Please respect the terms of service for the APIs used (Audd.io, OpenAI).
