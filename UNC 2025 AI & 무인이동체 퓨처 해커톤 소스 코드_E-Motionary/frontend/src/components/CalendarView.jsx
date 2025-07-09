import { useState, useEffect } from 'react';
import {
  format,
  isSameMonth,
  isToday,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameDay,
  parseISO,
} from 'date-fns';
import { ChevronLeft, ChevronRight, Music, Camera } from 'lucide-react';
import DayModal from './DayModal';

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

export default function CalendarView() {
  const [cursor, setCursor] = useState(new Date());
  const [calendarData, setCalendarData] = useState({ songs: [], photos: [] });
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch calendar data
  useEffect(() => {
    fetchCalendarData();
  }, []);

  const fetchCalendarData = async () => {
    try {
      const response = await fetch(`${API_BASE}/calendar-data`);
      const data = await response.json();
      setCalendarData(data);
    } catch (error) {
      console.error('Error fetching calendar data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Generate calendar weeks
  const generateCalendarWeeks = (year, month) => {
    const firstDay = startOfMonth(new Date(year, month));
    const lastDay = endOfMonth(firstDay);
    const startDate = startOfWeek(firstDay, { weekStartsOn: 0 });
    const endDate = endOfWeek(lastDay, { weekStartsOn: 0 });

    const weeks = [];
    let day = startDate;

    while (day <= endDate) {
      const week = [];
      for (let i = 0; i < 7; i++) {
        const daySongs = calendarData.songs.filter(song => 
          isSameDay(parseISO(song.timestamp), day)
        );
        const dayPhotos = calendarData.photos.filter(photo => 
          isSameDay(parseISO(photo.timestamp), day)
        );
        
        week.push({
          date: day,
          songs: daySongs,
          photos: dayPhotos,
        });
        day = addDays(day, 1);
      }
      weeks.push(week);
    }

    return weeks;
  };

  const weeks = generateCalendarWeeks(cursor.getFullYear(), cursor.getMonth());
  const monthLabel = format(cursor, 'MMMM yyyy');

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-gray-500">Loading calendar...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* header */}
      <div className="flex items-center justify-between">
        <IconBtn onClick={() => setCursor(subMonths(cursor, 1))}>
          <ChevronLeft size={18} />
        </IconBtn>
        <h2 className="text-xl font-semibold">{monthLabel}</h2>
        <IconBtn onClick={() => setCursor(addMonths(cursor, 1))}>
          <ChevronRight size={18} />
        </IconBtn>
      </div>

      {/* weekdays */}
      <div className="grid grid-cols-7 text-center text-xs font-medium text-gray-700">
        {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(d => (
          <div key={d} className="py-1">
            {d}
          </div>
        ))}
      </div>

      {/* date grid */}
      <div className="grid grid-cols-7 gap-[1px] rounded bg-gray-200">
        {weeks.flat().map(day => {
          const inMonth = isSameMonth(day.date, cursor);
          const numberStyle = inMonth
            ? 'text-[color:var(--c-primary)]'
            : 'text-gray-400';
          const ring = isToday(day.date)
            ? 'ring-2 ring-[color:var(--c-primary)]'
            : '';

          const hasContent = day.songs.length > 0 || day.photos.length > 0;

          return (
            <button
              key={day.date}
              onClick={() => setSelected(day)}
              className={`relative flex h-32 flex-col overflow-hidden p-1 focus:outline-none ${ring} ${
                inMonth
                  ? 'calendar-cell'
                  : 'bg-gray-50'
              }`}
            >
              {/* day number */}
              <span className={`text-sm font-semibold ${numberStyle}`}>
                {format(day.date, 'd')}
              </span>

              {/* content indicators */}
              <div className="mt-2 flex flex-wrap gap-1">
                {/* Music indicator */}
                {day.songs.length > 0 && (
                  <div className="flex items-center gap-1 rounded bg-blue-100 px-1 py-0.5">
                    <Music size={10} className="text-blue-600" />
                    <span className="text-[8px] font-medium text-blue-600">
                      {day.songs.length}
                    </span>
                  </div>
                )}
                
                {/* Photo indicator */}
                {day.photos.length > 0 && (
                  <div className="flex items-center gap-1 rounded bg-green-100 px-1 py-0.5">
                    <Camera size={10} className="text-green-600" />
                    <span className="text-[8px] font-medium text-green-600">
                      {day.photos.length}
                    </span>
                  </div>
                )}
              </div>

              {/* small photo thumbs */}
              <div className="mt-auto flex flex-wrap gap-[1px]">
                {day.photos.slice(0, 2).map((photo, index) => (
                  <img
                    key={index}
                    src={photo.data_url}
                    alt=""
                    className="h-6 w-6 rounded object-cover"
                  />
                ))}
                {day.photos.length > 2 && (
                  <span className="ml-[1px] text-[8px] font-medium text-gray-600">
                    +{day.photos.length - 2}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* modal */}
      <DayModal
        open={!!selected}
        date={selected?.date}
        daySongs={selected?.songs ?? []}
        dayPhotos={selected?.photos ?? []}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}

function IconBtn({ children, ...props }) {
  return (
    <button {...props} className="rounded-full p-2 hover:bg-gray-100 focus:outline-none text-gray-700">
      {children}
    </button>
  );
} 