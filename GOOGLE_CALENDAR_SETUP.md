# Google Calendar Integration Setup

This guide will help you set up Google Calendar integration for the E-Motionary app.

## Prerequisites

1. A Google account
2. Access to Google Cloud Console
3. Python 3.8+ with pip

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Calendar API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Calendar API"
   - Click on it and press "Enable"

## Step 2: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. If prompted, configure the OAuth consent screen:
   - Choose "External" user type
   - Fill in the required information (app name, user support email, developer contact)
   - Add scopes: `https://www.googleapis.com/auth/calendar`
   - Add test users (your email address)
4. For application type, choose "Desktop application"
5. Give it a name (e.g., "E-Motionary Desktop Client")
6. Click "Create"

## Step 3: Download Credentials

1. After creating the OAuth client, click "Download JSON"
2. Rename the downloaded file to `credentials.json`
3. Place it in the `backend/` directory of your E-Motionary project

## Step 4: Install Dependencies

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Activate your virtual environment:
   ```bash
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install the new dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## Step 5: Authenticate with Google Calendar

1. Start the backend server:
   ```bash
   python app.py
   ```

2. Open your browser and go to the frontend (usually `http://localhost:3000`)

3. Click the settings gear icon (⚙️) in the top right

4. In the "Google Calendar Integration" section, click "Connect Google Calendar"

5. A browser window will open asking you to sign in to your Google account

6. Grant the necessary permissions to access your Google Calendar

7. You should see a success message indicating the connection is established

## How It Works

Once connected, the app will:

- **Songs**: Create calendar events with 🎵 emoji and song details
- **Photos**: Create calendar events with 📷 emoji and photo labels
- **Sync**: Automatically save all new entries to both local database and Google Calendar
- **Display**: Show events from both local database and Google Calendar in the calendar view

## Event Format

### Song Events
- **Title**: 🎵 [Song Title]
- **Description**: Artist: [Artist Name]\nListened via E-Motionary
- **Color**: Blue
- **Duration**: 1 minute

### Photo Events
- **Title**: 📷 Photo
- **Description**: Photo taken via E-Motionary\nLabel: [Photo Label]
- **Color**: Green
- **Duration**: 1 minute

## Troubleshooting

### "credentials.json not found" Error
- Make sure you downloaded the OAuth credentials file
- Rename it to `credentials.json`
- Place it in the `backend/` directory

### Authentication Failed
- Check that you enabled the Google Calendar API
- Verify your OAuth consent screen is configured
- Make sure you added your email as a test user
- Try deleting `token.json` and re-authenticating

### Permission Denied
- Check that you granted calendar access permissions
- Verify the OAuth consent screen includes the calendar scope
- Try re-authenticating through the settings panel

### Events Not Appearing
- Check that events contain "E-Motionary" in the description
- Verify the calendar ID is set to 'primary'
- Check the Google Calendar API quotas and limits

## Security Notes

- Keep your `credentials.json` file secure and don't share it
- The `token.json` file contains your access tokens - keep it private
- Consider using environment variables for production deployments
- Regularly review and revoke unused OAuth tokens

## API Limits

Google Calendar API has the following limits:
- 1,000,000 queries per day per user
- 10,000 queries per 100 seconds per user
- 1,000 queries per 100 seconds per user per project

For most personal use cases, these limits should be sufficient.

## Support

If you encounter issues:
1. Check the browser console for error messages
2. Check the backend server logs
3. Verify your Google Cloud Console settings
4. Ensure all dependencies are installed correctly 