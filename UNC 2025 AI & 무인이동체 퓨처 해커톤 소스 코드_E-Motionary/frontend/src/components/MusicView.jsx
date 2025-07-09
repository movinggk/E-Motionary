import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Music, Mic, Plus, Trash2, Settings } from 'lucide-react';
import MicrophoneTest from './MicrophoneTest';

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
  const [micPermission, setMicPermission] = useState('unknown'); // 'unknown', 'granted', 'denied', 'not-supported'
  const [showDiagnostics, setShowDiagnostics] = useState(false);

  // Check microphone permission status
  const checkMicrophonePermission = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setMicPermission('not-supported');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop()); // Stop the test stream
      setMicPermission('granted');
    } catch (error) {
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        setMicPermission('denied');
      } else {
        setMicPermission('denied');
      }
    }
  };

  // Fetch songs on mount
  useEffect(() => {
    fetchSongs();
    checkMicrophonePermission();
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
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('Microphone access is not supported in this browser. Please use a modern browser like Chrome, Firefox, or Safari.');
        return;
      }

      // Try different audio configurations with fallbacks
      let stream;
      const audioConfigs = [
        // High quality for better recognition (Audd.io recommended)
        { 
          audio: {
            sampleRate: 44100,
            channelCount: 2,
            echoCancellation: false,
            noiseSuppression: false,
            autoGainControl: false
          } 
        },
        // Standard quality
        { 
          audio: {
            sampleRate: 44100,
            channelCount: 2,
            echoCancellation: true,
            noiseSuppression: true
          } 
        },
        // Basic audio with minimal constraints
        { 
          audio: {
            echoCancellation: true,
            noiseSuppression: true
          } 
        },
        // Most compatible configuration (like audd.py)
        { audio: true }
      ];

      // Try each configuration until one works
      for (let i = 0; i < audioConfigs.length; i++) {
        try {
          console.log(`Trying audio configuration ${i + 1}:`, audioConfigs[i]);
          stream = await navigator.mediaDevices.getUserMedia(audioConfigs[i]);
          console.log(`Audio configuration ${i + 1} successful`);
          break;
        } catch (configError) {
          console.log(`Audio configuration ${i + 1} failed:`, configError.name);
          if (i === audioConfigs.length - 1) {
            // If all configurations fail, throw the last error
            throw configError;
          }
        }
      }
      
      // Use high quality WebM format for better recognition
      const recorder = new MediaRecorder(stream, { 
        type: 'audio/webm;codecs=opus',
        audioBitsPerSecond: 128000
      });
      
      // Use local variable to collect chunks to avoid state timing issues
      const chunks = [];
      
      recorder.ondataavailable = (e) => {
        chunks.push(e.data);
        setAudioChunks(prev => [...prev, e.data]);
      };
      
      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        console.log(`Recording completed. Size: ${blob.size} bytes, Type: audio/webm`);
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
      
      // Provide specific error messages based on the error type
      let errorMessage = 'Could not access microphone';
      
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        errorMessage = 'Microphone access was denied. Please allow microphone access in your browser settings and try again.';
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        errorMessage = 'No microphone found. Please connect a microphone and try again.';
      } else if (error.name === 'NotSupportedError' || error.name === 'ConstraintNotSatisfiedError') {
        errorMessage = 'Your microphone does not support the required audio settings. The app tried multiple configurations but none worked. Please try:\n\n• Using a different microphone\n• Checking if your microphone is working in other applications\n• Restarting your browser\n• Using a different browser';
      } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
        errorMessage = 'Microphone is already in use by another application. Please close other apps using the microphone and try again.';
      } else if (error.name === 'OverconstrainedError' || error.name === 'ConstraintError') {
        errorMessage = 'Microphone settings are not supported. The app tried multiple configurations but none worked. Please try:\n\n• Using a different microphone\n• Checking if your microphone is working in other applications\n• Restarting your browser\n• Using a different browser';
      } else if (error.name === 'TypeError' || error.name === 'AbortError') {
        errorMessage = 'Microphone access was interrupted. Please try again.';
      } else if (error.name === 'SecurityError') {
        errorMessage = 'Microphone access is blocked due to security settings. Please check your browser security settings.';
      }
      
      // Additional guidance for HTTPS requirement
      if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        errorMessage += '\n\nNote: Microphone access requires HTTPS or localhost. Please access this app via HTTPS or localhost.';
      }
      
      alert(errorMessage);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && recording) {
      const recordingDuration = Date.now() - recordingStartTime;
      
      if (recordingDuration < 5000) { // Less than 5 seconds
        alert('Please record at least 5 seconds of audio for better recognition. Audd.io recommends 2-12 seconds.');
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
      formData.append('audio_data', audioBlob, 'recording.webm');
      
              console.log(`Sending audio file: recording.webm, size: ${audioBlob.size} bytes`);
      
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
        
        // Provide specific guidance based on the error
        let errorMessage = result.message;
        if (errorMessage.includes('audio fingerprint')) {
          errorMessage = 'Audio quality too low for recognition. Please try:\n\n• Recording closer to the music source\n• Recording 5-10 seconds of clear audio\n• Reducing background noise\n• Using a better microphone';
        } else if (errorMessage.includes('Could not recognize song')) {
          errorMessage = 'Song not found in database. Please try:\n\n• Recording a more popular song\n• Recording clearer audio\n• Recording longer (5-10 seconds)\n• Reducing background noise';
        }
        
        alert(errorMessage);
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
        
        {/* Microphone status indicator */}
        <div className="mb-3 flex items-center gap-2 text-sm">
          <div className={`h-2 w-2 rounded-full ${
            micPermission === 'granted' ? 'bg-green-500' :
            micPermission === 'denied' ? 'bg-red-500' :
            micPermission === 'not-supported' ? 'bg-gray-500' :
            'bg-yellow-500'
          }`}></div>
          <span className={
            micPermission === 'granted' ? 'text-green-600' :
            micPermission === 'denied' ? 'text-red-600' :
            micPermission === 'not-supported' ? 'text-gray-600' :
            'text-yellow-600'
          }>
            {micPermission === 'granted' ? 'Microphone access granted' :
             micPermission === 'denied' ? 'Microphone access denied' :
             micPermission === 'not-supported' ? 'Microphone not supported' :
             'Checking microphone access...'}
          </span>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={recording ? stopRecording : startRecording}
            disabled={micPermission === 'denied' || micPermission === 'not-supported'}
            className={`flex items-center gap-2 rounded px-4 py-2 text-sm font-medium ${
              recording
                ? 'bg-red-500 text-white'
                : micPermission === 'granted'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Mic size={16} />
            {recording ? 'Stop Recording' : 'Start Recording'}
          </button>
          {micPermission === 'denied' && (
            <button
              onClick={checkMicrophonePermission}
              className="flex items-center gap-2 rounded bg-yellow-500 px-4 py-2 text-sm font-medium text-white"
            >
              Retry Permission
            </button>
          )}
          <button
            onClick={() => setShowDiagnostics(!showDiagnostics)}
            className="flex items-center gap-2 rounded bg-gray-500 px-4 py-2 text-sm font-medium text-white"
          >
            <Settings size={16} />
            Diagnostics
          </button>
        </div>
        
        {recording && (
          <div className="mt-2 text-sm text-gray-600">
            Recording... {recordingDuration}s - Hold your device near the music source and record 5-10 seconds of clear audio
          </div>
        )}
        
        {micPermission === 'denied' && (
          <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded">
            <strong>Microphone access is required for recording.</strong><br/>
            • Click "Retry Permission" to try again<br/>
            • Check your browser's microphone permissions<br/>
            • Make sure you're using HTTPS or localhost
          </div>
        )}
        
        {micPermission === 'not-supported' && (
          <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded">
            <strong>Microphone is not supported in this browser.</strong><br/>
            Please use a modern browser like Chrome, Firefox, or Safari.
          </div>
        )}
        
        {/* Recording Tips */}
        <div className="mt-2 text-sm text-blue-600 bg-blue-50 p-2 rounded">
          <strong>💡 Recording Tips for Better Recognition:</strong><br/>
          • Hold device close to music source (within 1-2 feet)<br/>
          • Record 5-10 seconds of clear audio<br/>
          • Reduce background noise<br/>
          • Avoid recording through speakers (use headphones)<br/>
          • Try popular songs for better recognition
        </div>
        
        {/* Diagnostics Tool */}
        {showDiagnostics && (
          <div className="mt-4">
            <MicrophoneTest />
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