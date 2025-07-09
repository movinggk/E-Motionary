import { useState } from 'react';
import { Download, FileText, Image, Music } from 'lucide-react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

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

export default function DownloadView() {
  const [downloading, setDownloading] = useState(false);

  const downloadAllData = async () => {
    setDownloading(true);
    
    try {
      // Fetch all data
      const [songsResponse, photosResponse] = await Promise.all([
        fetch(`${API_BASE}/songs`),
        fetch(`${API_BASE}/photos`)
      ]);
      
      const songs = await songsResponse.json();
      const photos = await photosResponse.json();
      
      // Create ZIP file
      const zip = new JSZip();
      
      // Add songs data
      const songsData = songs.map(song => ({
        title: song.title,
        artist: song.artist,
        listened_at: song.listened_at
      }));
      zip.file('songs.json', JSON.stringify(songsData, null, 2));
      
      // Add photos data and images
      const photosData = [];
      for (let i = 0; i < photos.length; i++) {
        const photo = photos[i];
        const imageData = photo.data_url.split(',')[1]; // Remove data URL prefix
        const imageBuffer = Buffer.from(imageData, 'base64');
        
        zip.file(`photos/photo_${i + 1}.jpg`, imageBuffer);
        
        photosData.push({
          filename: `photo_${i + 1}.jpg`,
          label: photo.label,
          taken_at: photo.taken_at
        });
      }
      zip.file('photos.json', JSON.stringify(photosData, null, 2));
      
      // Add summary
      const summary = {
        export_date: new Date().toISOString(),
        total_songs: songs.length,
        total_photos: photos.length,
        date_range: {
          start: songs.length > 0 ? songs[songs.length - 1].listened_at : null,
          end: songs.length > 0 ? songs[0].listened_at : null
        }
      };
      zip.file('summary.json', JSON.stringify(summary, null, 2));
      
      // Generate and download
      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, `diary-export-${new Date().toISOString().split('T')[0]}.zip`);
      
    } catch (error) {
      console.error('Error downloading data:', error);
      alert('Error downloading data');
    } finally {
      setDownloading(false);
    }
  };

  const downloadSongsOnly = async () => {
    setDownloading(true);
    
    try {
      const response = await fetch(`${API_BASE}/songs`);
      const songs = await response.json();
      
      const data = songs.map(song => ({
        title: song.title,
        artist: song.artist,
        listened_at: song.listened_at
      }));
      
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json'
      });
      saveAs(blob, `songs-export-${new Date().toISOString().split('T')[0]}.json`);
      
    } catch (error) {
      console.error('Error downloading songs:', error);
      alert('Error downloading songs');
    } finally {
      setDownloading(false);
    }
  };

  const downloadPhotosOnly = async () => {
    setDownloading(true);
    
    try {
      const response = await fetch(`${API_BASE}/photos`);
      const photos = await response.json();
      
      const zip = new JSZip();
      
      for (let i = 0; i < photos.length; i++) {
        const photo = photos[i];
        const imageData = photo.data_url.split(',')[1];
        const imageBuffer = Buffer.from(imageData, 'base64');
        
        zip.file(`photo_${i + 1}.jpg`, imageBuffer);
      }
      
      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, `photos-export-${new Date().toISOString().split('T')[0]}.zip`);
      
    } catch (error) {
      console.error('Error downloading photos:', error);
      alert('Error downloading photos');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-slate-200 p-4">
        <h3 className="mb-3 text-lg font-semibold">Export Data</h3>
        <p className="mb-4 text-sm text-slate-600">
          Download your diary data in various formats
        </p>
        
        <div className="space-y-3">
          <button
            onClick={downloadAllData}
            disabled={downloading}
            className="flex w-full items-center gap-2 rounded bg-blue-500 px-4 py-3 text-sm font-medium text-white disabled:bg-slate-300"
          >
            <Download size={16} />
            {downloading ? 'Downloading...' : 'Download All Data (ZIP)'}
          </button>
          
          <button
            onClick={downloadSongsOnly}
            disabled={downloading}
            className="flex w-full items-center gap-2 rounded bg-green-500 px-4 py-3 text-sm font-medium text-white disabled:bg-slate-300"
          >
            <Music size={16} />
            {downloading ? 'Downloading...' : 'Download Songs Only (JSON)'}
          </button>
          
          <button
            onClick={downloadPhotosOnly}
            disabled={downloading}
            className="flex w-full items-center gap-2 rounded bg-purple-500 px-4 py-3 text-sm font-medium text-white disabled:bg-slate-300"
          >
            <Image size={16} />
            {downloading ? 'Downloading...' : 'Download Photos Only (ZIP)'}
          </button>
        </div>
      </div>
      
      <div className="rounded-lg border border-slate-200 p-4">
        <h3 className="mb-3 text-lg font-semibold">Export Formats</h3>
        <div className="space-y-2 text-sm text-slate-600">
          <div className="flex items-center gap-2">
            <FileText size={14} />
            <span>All Data: ZIP file with songs, photos, and metadata</span>
          </div>
          <div className="flex items-center gap-2">
            <Music size={14} />
            <span>Songs Only: JSON file with music listening history</span>
          </div>
          <div className="flex items-center gap-2">
            <Image size={14} />
            <span>Photos Only: ZIP file with all captured images</span>
          </div>
        </div>
      </div>
    </div>
  );
} 