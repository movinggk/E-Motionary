import { format } from 'date-fns';
import { X, Music, Camera } from 'lucide-react';

export default function DayModal({ open, date, daySongs, dayPhotos, onClose }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="mx-4 max-h-[80vh] w-full max-w-md overflow-y-auto rounded-lg bg-white p-6 shadow-xl">
        {/* header */}
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            {format(date, 'EEEE, MMMM d, yyyy')}
          </h3>
          <button
            onClick={onClose}
            className="rounded-full p-1 hover:bg-gray-100 text-gray-700"
          >
            <X size={18} />
          </button>
        </div>

        {/* content */}
        <div className="space-y-4">
          {/* Songs section */}
          {daySongs.length > 0 && (
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-600">
                <Music size={16} className="text-blue-600" />
                Songs ({daySongs.length})
              </div>
              <div className="space-y-2">
                {daySongs.map((song, index) => (
                  <div
                    key={index}
                    className="rounded-lg bg-blue-50 p-3"
                  >
                    <div className="font-medium text-blue-900">
                      {song.title}
                    </div>
                    {song.artist && (
                      <div className="text-sm text-blue-700">
                        by {song.artist}
                      </div>
                    )}
                    <div className="mt-1 text-xs text-blue-600">
                      {format(new Date(song.timestamp), 'h:mm a')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Photos section */}
          {dayPhotos.length > 0 && (
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-600">
                <Camera size={16} className="text-green-600" />
                Photos ({dayPhotos.length})
              </div>
              <div className="grid grid-cols-2 gap-2">
                {dayPhotos.map((photo, index) => (
                  <div key={index} className="space-y-1">
                    <img
                      src={photo.data_url}
                      alt=""
                      className="h-24 w-full rounded object-cover"
                    />
                    {photo.label && (
                      <div className="text-xs text-gray-600">
                        {photo.label}
                      </div>
                    )}
                    <div className="text-xs text-gray-500">
                      {format(new Date(photo.timestamp), 'h:mm a')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {daySongs.length === 0 && dayPhotos.length === 0 && (
            <div className="py-8 text-center text-gray-500">
              No entries for this day
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 