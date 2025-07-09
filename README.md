# Integrated Diary

A unified application that combines music recognition and photo journaling on a shared calendar interface.

## Features

### 🎵 Music Recognition
- Record audio to automatically identify songs using Audd.io API
- Manual song entry with title and artist
- View listening history with timestamps
- AI-powered questions about your music history

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

### Backend Setup

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
OPENAI_API_KEY = "your_openai_key_here"
```

5. Start the Flask server:
```bash
python app.py
```

The backend will run on `http://localhost:5001`

### Frontend Setup

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

This project is for educational purposes. Please respect the terms of service for the APIs used (Audd.io, OpenAI). # E-Motionary
# E-Motionary
