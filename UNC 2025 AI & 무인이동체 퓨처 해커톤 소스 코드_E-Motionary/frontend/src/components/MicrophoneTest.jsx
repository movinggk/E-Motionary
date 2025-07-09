import { useState, useEffect } from 'react';
import { Mic, MicOff, AlertCircle, CheckCircle } from 'lucide-react';

export default function MicrophoneTest() {
  const [testStatus, setTestStatus] = useState('idle'); // 'idle', 'testing', 'success', 'error'
  const [errorMessage, setErrorMessage] = useState('');
  const [browserInfo, setBrowserInfo] = useState({});

  useEffect(() => {
    // Get browser information
    setBrowserInfo({
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      protocol: window.location.protocol,
      hostname: window.location.hostname,
      port: window.location.port,
      getUserMediaSupported: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
      mediaDevicesSupported: !!navigator.mediaDevices,
    });
  }, []);

  const testMicrophone = async () => {
    setTestStatus('testing');
    setErrorMessage('');

    try {
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('getUserMedia is not supported in this browser');
      }

      // Try different audio configurations with fallbacks
      let stream;
      const audioConfigs = [
        // Most compatible configuration (like audd.py)
        { audio: true },
        // Even more basic - just audio without any constraints
        { audio: {} },
        // Basic audio with minimal constraints
        { 
          audio: {
            echoCancellation: true,
            noiseSuppression: true
          } 
        },
        // Standard configuration
        { 
          audio: {
            sampleRate: 44100,
            channelCount: 2,
            echoCancellation: true,
            noiseSuppression: true
          } 
        }
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

      // Check if we got audio tracks
      const audioTracks = stream.getAudioTracks();
      if (audioTracks.length === 0) {
        throw new Error('No audio tracks found');
      }

      // Stop the stream
      stream.getTracks().forEach(track => track.stop());
      
      setTestStatus('success');
    } catch (error) {
      setTestStatus('error');
      setErrorMessage(error.message || 'Unknown error occurred');
    }
  };

  const getStatusIcon = () => {
    switch (testStatus) {
      case 'success':
        return <CheckCircle size={20} className="text-green-500" />;
      case 'error':
        return <AlertCircle size={20} className="text-red-500" />;
      case 'testing':
        return <Mic size={20} className="text-blue-500 animate-pulse" />;
      default:
        return <MicOff size={20} className="text-gray-400" />;
    }
  };

  const getStatusText = () => {
    switch (testStatus) {
      case 'success':
        return 'Microphone access successful!';
      case 'error':
        return 'Microphone access failed';
      case 'testing':
        return 'Testing microphone access...';
      default:
        return 'Click "Test Microphone" to check access';
    }
  };

  return (
    <div className="rounded-lg border border-gray-200 p-4 bg-white">
      <h3 className="mb-3 text-lg font-semibold">Microphone Diagnostic Tool</h3>
      
      <div className="space-y-4">
        {/* Test Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={testMicrophone}
            disabled={testStatus === 'testing'}
            className="flex items-center gap-2 rounded bg-blue-500 px-4 py-2 text-sm font-medium text-white disabled:bg-gray-300"
          >
            {getStatusIcon()}
            Test Microphone
          </button>
          <span className="text-sm text-gray-600">{getStatusText()}</span>
        </div>

        {/* Error Message */}
        {testStatus === 'error' && errorMessage && (
          <div className="text-sm text-red-600 bg-red-50 p-3 rounded">
            <strong>Error:</strong> {errorMessage}
          </div>
        )}

        {/* Browser Information */}
        <div className="text-xs text-gray-500 space-y-1">
          <div><strong>Protocol:</strong> {browserInfo.protocol}</div>
          <div><strong>Hostname:</strong> {browserInfo.hostname}</div>
          <div><strong>Port:</strong> {browserInfo.port || 'default'}</div>
          <div><strong>getUserMedia Supported:</strong> {browserInfo.getUserMediaSupported ? 'Yes' : 'No'}</div>
          <div><strong>mediaDevices Supported:</strong> {browserInfo.mediaDevicesSupported ? 'Yes' : 'No'}</div>
        </div>

        {/* Troubleshooting Tips */}
        {testStatus === 'error' && (
          <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
            <strong>Troubleshooting Tips:</strong>
            <ul className="mt-2 space-y-1">
              <li>• Check browser microphone permissions</li>
              <li>• Ensure you're using HTTPS or localhost</li>
              <li>• Try a different browser (Chrome, Firefox, Safari)</li>
              <li>• Check if microphone is connected and working</li>
              <li>• Close other applications using the microphone</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
} 