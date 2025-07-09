import { useState, useRef, useEffect } from 'react';
import { Camera, RotateCcw } from 'lucide-react';

export default function CaptureCamera({ onPhotoTaken }) {
  const [stream, setStream] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [label, setLabel] = useState('');
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Could not access camera');
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to data URL
    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
    setCapturedImage(dataUrl);
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    setLabel('');
  };

  const savePhoto = () => {
    if (capturedImage) {
      onPhotoTaken(capturedImage, label);
      setCapturedImage(null);
      setLabel('');
    }
  };

  if (capturedImage) {
    return (
      <div className="space-y-3">
        <img
          src={capturedImage}
          alt="Captured"
          className="w-full rounded"
        />
        <input
          type="text"
          placeholder="Add a label (optional)"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
        />
        <div className="flex gap-2">
          <button
            onClick={retakePhoto}
            className="flex items-center gap-2 rounded bg-gray-500 px-4 py-2 text-sm font-medium text-white"
          >
            <RotateCcw size={16} />
            Retake
          </button>
          <button
            onClick={savePhoto}
            className="flex-1 rounded bg-green-500 px-4 py-2 text-sm font-medium text-white"
          >
            Save Photo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative aspect-video overflow-hidden rounded bg-gray-100">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="h-full w-full object-cover"
        />
        {!stream && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-gray-500">Loading camera...</div>
          </div>
        )}
      </div>
      
      <button
        onClick={capturePhoto}
        disabled={!stream}
        className="flex w-full items-center justify-center gap-2 rounded bg-blue-500 px-4 py-3 text-sm font-medium text-white disabled:bg-gray-300"
      >
        <Camera size={16} />
        Take Photo
      </button>
      
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
} 