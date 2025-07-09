import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Music, Mic, Plus, Trash2 } from 'lucide-react';

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

export default function MusicView() {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);
  const [manualTitle, setManualTitle] = useState('');
  const [manualArtist, setManualArtist] = useState('');
  const [recordingStartTime, setRecordingStartTime] = useState(null);
  const [recordingDuration, setRecordingDuration] = useState(0);

  // Fetch songs on mount
  useEffect(() => {
    fetchSongs();
  }, []);

  // Timer for recording duration
  useEffect(() => {
    let interval;
    if (recording && recordingStartTime) {
      interval = setInterval(() => {
        setRecordingDuration(Math.floor((Date.now() - recordingStartTime) / 1000));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [recording, recordingStartTime]);

  const fetchSongs = async () => {
    try {
      const response = await fetch(`${API_BASE}/songs`);
      const data = await response.json();
      setSongs(data);
    } catch (error) {
      console.error('Error fetching songs:', error);
    } finally {
      setLoading(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 44100,
          channelCount: 2,
          echoCancellation: true,
          noiseSuppression: true
        } 
      });
      
      // Try to use MP3 format if supported, otherwise fall back to WebM
      const mimeType = MediaRecorder.isTypeSupported('audio/mp3') 
        ? 'audio/mp3' 
        : 'audio/webm';
      
      const recorder = new MediaRecorder(stream, { mimeType });
      
      recorder.ondataavailable = (e) => {
        setAudioChunks(prev => [...prev, e.data]);
      };
      
      recorder.onstop = async () => {
        const blob = new Blob(audioChunks, { type: mimeType });
        console.log(`Recording completed. Size: ${blob.size} bytes, Type: ${mimeType}`);
        await recognizeSong(blob);
        setAudioChunks([]);
      };
      
      setMediaRecorder(recorder);
      recorder.start();
      setRecording(true);
      setRecordingStartTime(Date.now());
      setRecordingDuration(0);
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Could not access microphone');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && recording) {
      const recordingDuration = Date.now() - recordingStartTime;
      
      if (recordingDuration < 3000) { // Less than 3 seconds
        alert('Please record at least 3 seconds of audio for better recognition');
        setRecording(false);
        setRecordingStartTime(null);
        setAudioChunks([]);
        return;
      }
      
      mediaRecorder.stop();
      setRecording(false);
      setRecordingStartTime(null);
    }
  };

  const recognizeSong = async (audioBlob) => {
    try {
      const formData = new FormData();
      const fileName = audioBlob.type === 'audio/mp3' ? 'recording.mp3' : 'recording.webm';
      formData.append('audio_data', audioBlob, fileName);
      
      console.log(`Sending audio file: ${fileName}, size: ${audioBlob.size} bytes`);
      
      const response = await fetch(`${API_BASE}/recognize-song`, {
        method: 'POST',
        body: formData,
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert(`Recognized: ${result.song.title} by ${result.song.artist}`);
        fetchSongs(); // Refresh the list
      } else {
        console.error('Recognition failed:', result.message);
        alert(`Could not recognize song: ${result.message}`);
      }
    } catch (error) {
      console.error('Error recognizing song:', error);
      alert('Error recognizing song. Please check your internet connection and try again.');
    }
  };

  const addManualSong = async () => {
    if (!manualTitle.trim()) {
      alert('Please enter a song title');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/add-song`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: manualTitle,
          artist: manualArtist,
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        setManualTitle('');
        setManualArtist('');
        fetchSongs(); // Refresh the list
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error('Error adding song:', error);
      alert('Error adding song');
    }
  };

  const clearHistory = async () => {
    if (!confirm('Are you sure you want to clear all music history?')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/clear-history`, {
        method: 'POST',
      });
      
      const result = await response.json();
      
      if (result.success) {
        setSongs([]);
        alert('History cleared');
      }
    } catch (error) {
      console.error('Error clearing history:', error);
      alert('Error clearing history');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-gray-500">Loading songs...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Recording section */}
      <div className="rounded-lg border border-gray-200 p-4 bg-white">
        <h3 className="mb-3 text-lg font-semibold">Record Music</h3>
        
        <div className="flex gap-2">
          <button
            onClick={recording ? stopRecording : startRecording}
            className={`flex items-center gap-2 rounded px-4 py-2 text-sm font-medium ${
              recording
                ? 'bg-red-500 text-white'
                : 'bg-blue-500 text-white'
            }`}
          >
            <Mic size={16} />
            {recording ? 'Stop Recording' : 'Start Recording'}
          </button>
        </div>
        
        {recording && (
          <div className="mt-2 text-sm text-gray-600">
            Recording... {recordingDuration}s - Hold your device near the music source and record 5-10 seconds of the song
          </div>
        )}
      </div>

      {/* Manual entry section */}
      <div className="rounded-lg border border-gray-200 p-4 bg-white">
        <h3 className="mb-3 text-lg font-semibold">Add Song Manually</h3>
        
        <div className="space-y-2">
          <input
            type="text"
            placeholder="Song Title"
            value={manualTitle}
            onChange={(e) => setManualTitle(e.target.value)}
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
          />
          <input
            type="text"
            placeholder="Artist (optional)"
            value={manualArtist}
            onChange={(e) => setManualArtist(e.target.value)}
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
          />
          <button
            onClick={addManualSong}
            className="flex items-center gap-2 rounded bg-green-500 px-4 py-2 text-sm font-medium text-white"
          >
            <Plus size={16} />
            Add Song
          </button>
        </div>
      </div>

      {/* Songs list */}
      <div className="rounded-lg border border-gray-200 p-4 bg-white">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Recent Songs</h3>
          <button
            onClick={clearHistory}
            className="flex items-center gap-1 rounded bg-red-500 px-2 py-1 text-xs text-white"
          >
            <Trash2 size={12} />
            Clear All
          </button>
        </div>
        
        {songs.length === 0 ? (
          <div className="py-8 text-center text-gray-500">
            No songs recorded yet
          </div>
        ) : (
          <div className="space-y-2">
            {songs.map((song) => (
              <div
                key={song.id}
                className="flex items-center justify-between rounded-lg bg-gray-50 p-3"
              >
                <div className="flex items-center gap-2">
                  <Music size={16} className="text-blue-600" />
                  <div>
                    <div className="font-medium">{song.title}</div>
                    {song.artist && (
                      <div className="text-sm text-gray-600">
                        by {song.artist}
                      </div>
                    )}
                    <div className="text-xs text-gray-500">
                      {format(new Date(song.listened_at), 'MMM d, h:mm a')}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 