import { useState } from 'react';
import GalleryView from './components/GalleryView';
import CalendarView from './components/CalendarView';
import MusicView from './components/MusicView';
import DownloadView from './components/DownloadView';
import SettingsPanel from './components/SettingsPanel';
import { Settings2, Music, Camera, Calendar, Download } from 'lucide-react';

export default function App() {
  const [tab, setTab] = useState('calendar'); // calendar | gallery | music | download
  const [showSettings, setShowSettings] = useState(false);

  const tabs = [
    { key: 'calendar', label: 'Calendar', icon: Calendar },
    { key: 'gallery', label: 'Photos', icon: Camera },
    { key: 'music', label: 'Music', icon: Music },
    { key: 'download', label: 'Download', icon: Download },
  ];

  return (
    <div className="relative mx-auto max-w-xl p-4 bg-white min-h-screen">
      {/* title bar */}
      <h1 className="mb-4 text-2xl font-bold text-gray-900">
        Diary
      </h1>

      {/* gear icon */}
      <button
        onClick={() => setShowSettings(true)}
        className="absolute right-4 top-4 rounded-full p-2 hover:bg-gray-100 text-gray-700"
      >
        <Settings2 size={18} />
      </button>

      {/* tab buttons */}
      <div className="mb-4 flex gap-2">
        {tabs.map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
                          className={`flex items-center gap-1 rounded px-3 py-1 text-sm ${
              tab === t.key
                ? 'bg-primary text-white'
                : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
            >
              <Icon size={14} />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* routed view */}
      {tab === 'calendar' && <CalendarView />}
      {tab === 'gallery' && <GalleryView />}
      {tab === 'music' && <MusicView />}
      {tab === 'download' && <DownloadView />}

      {/* settings modal */}
      {showSettings && (
        <SettingsPanel onClose={() => setShowSettings(false)} />
      )}
    </div>
  );
} 