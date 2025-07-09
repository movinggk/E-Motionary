import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Camera, Trash2 } from 'lucide-react';
import CaptureCamera from './CaptureCamera';

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

export default function GalleryView() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch photos on mount
  useEffect(() => {
    fetchPhotos();
  }, []);

  const fetchPhotos = async () => {
    try {
      const response = await fetch(`${API_BASE}/photos`);
      const data = await response.json();
      setPhotos(data);
    } catch (error) {
      console.error('Error fetching photos:', error);
    } finally {
      setLoading(false);
    }
  };

  const addPhoto = async (dataUrl, label = '') => {
    try {
      console.log('Saving photo with label:', label);
      console.log('Data URL length:', dataUrl ? dataUrl.length : 0);
      console.log('API Base URL:', API_BASE);
      
      // Check if backend is reachable
      try {
        const healthCheck = await fetch(`${API_BASE}/photos`);
        console.log('Backend health check status:', healthCheck.status);
      } catch (healthError) {
        console.error('Backend not reachable:', healthError);
        alert('Backend server is not running. Please start the backend server first.');
        return;
      }
      
      const response = await fetch(`${API_BASE}/add-photo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data_url: dataUrl,
          label: label,
        }),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server error:', errorText);
        throw new Error(`Server error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('Server response:', result);
      
      if (result.success) {
        fetchPhotos(); // Refresh the list
        console.log('Photo saved successfully');
      } else {
        console.error('Server returned error:', result.message);
        alert(`Error: ${result.message}`);
      }
    } catch (error) {
      console.error('Error adding photo:', error);
      if (error.message.includes('Load failed')) {
        alert('Network error: Unable to connect to the server. Please check if the backend is running on http://localhost:5000');
      } else {
        alert(`Error adding photo: ${error.message}`);
      }
    }
  };

  const deletePhoto = async (photoId) => {
    if (!confirm('Are you sure you want to delete this photo?')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/photos/${photoId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        fetchPhotos(); // Refresh the list
      } else {
        alert('Error deleting photo');
      }
    } catch (error) {
      console.error('Error deleting photo:', error);
      alert('Error deleting photo');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-gray-500">Loading photos...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Camera section */}
      <div className="rounded-lg border border-gray-200 p-4 bg-white">
        <h3 className="mb-3 text-lg font-semibold">Take Photo</h3>
        <CaptureCamera onPhotoTaken={addPhoto} />
      </div>

      {/* Photos grid */}
      <div className="rounded-lg border border-gray-200 p-4 bg-white">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Recent Photos</h3>
          <div className="text-sm text-gray-500">
            {photos.length} photo{photos.length !== 1 ? 's' : ''}
          </div>
        </div>
        
        {photos.length === 0 ? (
          <div className="py-8 text-center text-gray-500">
            No photos taken yet
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {photos.map((photo) => (
              <div key={photo.id} className="group relative">
                <img
                  src={photo.data_url}
                  alt=""
                  className="h-32 w-full rounded object-cover"
                />
                {photo.label && (
                  <div className="mt-1 text-xs text-gray-600">
                    {photo.label}
                  </div>
                )}
                <div className="text-xs text-gray-500">
                  {format(new Date(photo.taken_at), 'MMM d, h:mm a')}
                </div>
                
                {/* Delete button */}
                <button
                  onClick={() => deletePhoto(photo.id)}
                  className="absolute right-1 top-1 rounded-full bg-red-500 p-1 opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <Trash2 size={12} className="text-white" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 