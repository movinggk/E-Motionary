import { useState, useEffect } from 'react';
import { X, Trash2, HelpCircle, Calendar, CheckCircle, AlertCircle } from 'lucide-react';

// Try to detect the correct API base URL
const getApiBase = () => {
  // Check if we're in development mode
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:5001/api';
  }
  // For production, use relative URL
  return '/api';
};

const API_BASE = getApiBase();

export default function SettingsPanel({ onClose }) {
  const [asking, setAsking] = useState(false);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [googleCalendarStatus, setGoogleCalendarStatus] = useState(null);
  const [connecting, setConnecting] = useState(false);

  // Check Google Calendar status on component mount
  useEffect(() => {
    checkGoogleCalendarStatus();
  }, []);

  const checkGoogleCalendarStatus = async () => {
    try {
      const response = await fetch(`${API_BASE}/google-calendar/status`);
      const result = await response.json();
      setGoogleCalendarStatus(result);
    } catch (error) {
      console.error('Error checking Google Calendar status:', error);
      setGoogleCalendarStatus({ authenticated: false, message: 'Error checking status' });
    }
  };

  const connectGoogleCalendar = async () => {
    setConnecting(true);
    try {
      const response = await fetch(`${API_BASE}/google-calendar/auth`);
      const result = await response.json();
      
      if (result.success) {
        alert('Successfully connected to Google Calendar!');
        checkGoogleCalendarStatus();
      } else {
        alert(`Failed to connect: ${result.message}`);
      }
    } catch (error) {
      console.error('Error connecting to Google Calendar:', error);
      alert('Error connecting to Google Calendar');
    } finally {
      setConnecting(false);
    }
  };

  const askQuestion = async () => {
    if (!question.trim()) return;
    
    setAsking(true);
    try {
      const response = await fetch(`${API_BASE}/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setAnswer(result.answer);
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error('Error asking question:', error);
      alert('Error asking question');
    } finally {
      setAsking(false);
    }
  };

  const clearAllData = async () => {
    if (!confirm('Are you sure you want to clear ALL data? This cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/clear-history`, {
        method: 'POST',
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert('All data cleared successfully');
        onClose();
      }
    } catch (error) {
      console.error('Error clearing data:', error);
      alert('Error clearing data');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="mx-4 w-full max-w-md overflow-y-auto rounded-lg bg-white p-6 shadow-xl">
        {/* header */}
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Settings</h3>
          <button
            onClick={onClose}
            className="rounded-full p-1 hover:bg-gray-100 text-gray-700"
          >
            <X size={18} />
          </button>
        </div>

        {/* content */}
        <div className="space-y-4">
          {/* Google Calendar Integration */}
          <div className="rounded-lg border border-gray-200 p-4 bg-white">
            <div className="mb-3 flex items-center gap-2">
              <Calendar size={16} className="text-green-600" />
              <h4 className="font-medium">Google Calendar Integration</h4>
            </div>
            
            {googleCalendarStatus ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  {googleCalendarStatus.authenticated ? (
                    <CheckCircle size={16} className="text-green-600" />
                  ) : (
                    <AlertCircle size={16} className="text-yellow-600" />
                  )}
                  <span className="text-sm text-gray-700">
                    {googleCalendarStatus.message}
                  </span>
                </div>
                
                {!googleCalendarStatus.authenticated && (
                  <button
                    onClick={connectGoogleCalendar}
                    disabled={connecting}
                    className="w-full rounded bg-green-500 px-4 py-2 text-sm font-medium text-white disabled:bg-gray-300"
                  >
                    {connecting ? 'Connecting...' : 'Connect Google Calendar'}
                  </button>
                )}
                
                <div className="text-xs text-gray-600">
                  {googleCalendarStatus.authenticated 
                    ? 'Your music and photos will be automatically saved to Google Calendar'
                    : 'Connect to automatically save your music and photos to Google Calendar'
                  }
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-500">Checking status...</div>
            )}
          </div>

          {/* Ask AI */}
          <div className="rounded-lg border border-gray-200 p-4 bg-white">
            <div className="mb-3 flex items-center gap-2">
              <HelpCircle size={16} className="text-blue-600" />
              <h4 className="font-medium">Ask AI About Your Data</h4>
            </div>
            
            <div className="space-y-2">
              <textarea
                placeholder="Ask about your music and photo history..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                rows={3}
              />
              <button
                onClick={askQuestion}
                disabled={asking || !question.trim()}
                className="w-full rounded bg-blue-500 px-4 py-2 text-sm font-medium text-white disabled:bg-gray-300"
              >
                {asking ? 'Asking...' : 'Ask AI'}
              </button>
            </div>
            
            {answer && (
              <div className="mt-3 rounded bg-blue-50 p-3">
                <div className="text-sm text-blue-900">{answer}</div>
              </div>
            )}
          </div>

          {/* Danger zone */}
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <h4 className="mb-3 font-medium text-red-800">Danger Zone</h4>
            <button
              onClick={clearAllData}
              className="flex items-center gap-2 rounded bg-red-500 px-4 py-2 text-sm font-medium text-white"
            >
              <Trash2 size={16} />
              Clear All Data
            </button>
            <p className="mt-2 text-xs text-red-600">
              This will permanently delete all songs and photos
            </p>
          </div>

          {/* App info */}
          <div className="rounded-lg border border-gray-200 p-4 bg-white">
            <h4 className="mb-3 font-medium">About</h4>
            <div className="space-y-1 text-sm text-gray-600">
              <div>Integrated Diary v1.0</div>
              <div>Combines music recognition and photo journaling</div>
              <div>Built with React + Flask</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 