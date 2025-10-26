'use client';

import { useState, useEffect } from 'react';

interface DateTimePickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  minDate?: string;
}

export default function DateTimePicker({
  label,
  value,
  onChange,
  required = false,
  minDate,
}: DateTimePickerProps) {
  // Helper function to round up to nearest 15 minutes (0, 15, 30, 45)
  const getNextQuarterHour = () => {
    const now = new Date();
    const minutes = now.getMinutes();
    // Round up to the next 15-minute interval
    const roundedUp = Math.ceil(minutes / 15) * 15;
    const nextDate = new Date(now);
    
    if (roundedUp >= 60) {
      nextDate.setHours(now.getHours() + 1);
      nextDate.setMinutes(0);
    } else {
      nextDate.setMinutes(roundedUp);
    }
    
    return nextDate.toTimeString().slice(0, 5); // Returns HH:mm (will be 00, 15, 30, or 45)
  };

  const defaultTime = getNextQuarterHour();
  
  const [date, setDate] = useState(value.split('T')[0] || '');
  const [time, setTime] = useState(value.split('T')[1] || defaultTime);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setDate(newDate);
    onChange(`${newDate}T${time}`);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newTime = e.target.value;
    
    // Round to nearest 15-minute interval
    if (newTime) {
      const [hours, minutes] = newTime.split(':').map(Number);
      const roundedMinutes = Math.round(minutes / 15) * 15;
      newTime = `${String(hours).padStart(2, '0')}:${String(roundedMinutes).padStart(2, '0')}`;
    }
    
    setTime(newTime);
    onChange(`${date}T${newTime}`);
  };

  const handleTimeInputChange = (field: 'hour' | 'minute', value: string) => {
    const [currentHour, currentMinute] = time.split(':');
    let newTime: string;
    
    if (field === 'hour') {
      newTime = `${value}:${currentMinute}`;
    } else {
      // minute value should already be 0, 15, 30, or 45
      newTime = `${currentHour}:${value}`;
    }
    
    setTime(newTime);
    onChange(`${date}T${newTime}`);
  };

  const setQuickDate = (days: number) => {
    const today = new Date();
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + days);
    
    const formattedDate = targetDate.toISOString().split('T')[0];
    setDate(formattedDate);
    onChange(`${formattedDate}T${time}`);
  };

  // Round time to nearest 15 minutes when component initializes if value exists
  useEffect(() => {
    if (value && value.includes('T')) {
      const [, timePart] = value.split('T');
      if (timePart) {
        const [hours, minutes] = timePart.split(':').map(Number);
        const roundedMinutes = Math.round(minutes / 15) * 15;
        const roundedTime = `${String(hours).padStart(2, '0')}:${String(roundedMinutes).padStart(2, '0')}`;
        if (roundedTime !== time) {
          setTime(roundedTime);
        }
      }
    }
  }, [value, time]);

  const getTomorrow = () => new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const getIn3Days = () => new Date(Date.now() + 259200000).toISOString().split('T')[0];
  const getNextWeek = () => new Date(Date.now() + 604800000).toISOString().split('T')[0];
  const getMinDate = () => {
    return minDate ? minDate.split('T')[0] : new Date().toISOString().split('T')[0];
  };

  const getDisplayDate = () => {
    if (!date) return '';
    const d = new Date(date);
    const options: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
    return d.toLocaleDateString('en-US', options);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      {/* Quick Date Buttons */}
      <div className="flex flex-wrap gap-2 mb-3">
        <button
          type="button"
          onClick={() => setQuickDate(0)}
          className="px-3 py-1.5 text-sm bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-md border border-purple-200 transition-colors"
        >
          Today
        </button>
        <button
          type="button"
          onClick={() => setQuickDate(1)}
          className="px-3 py-1.5 text-sm bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-md border border-purple-200 transition-colors"
        >
          Tomorrow
        </button>
        <button
          type="button"
          onClick={() => setQuickDate(3)}
          className="px-3 py-1.5 text-sm bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-md border border-purple-200 transition-colors"
        >
          In 3 Days
        </button>
        <button
          type="button"
          onClick={() => setQuickDate(7)}
          className="px-3 py-1.5 text-sm bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-md border border-purple-200 transition-colors"
        >
          Next Week
        </button>
      </div>

      {/* Date and Time Inputs */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Date</label>
          <input
            type="date"
            value={date}
            onChange={handleDateChange}
            required={required}
            min={getMinDate()}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Time</label>
          <div className="flex gap-2">
            <select
              value={time ? time.split(':')[0] : '00'}
              onChange={(e) => handleTimeInputChange('hour', e.target.value)}
              required={required}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-center"
            >
              {Array.from({ length: 24 }, (_, i) => (
                <option key={i} value={String(i).padStart(2, '0')}>
                  {String(i).padStart(2, '0')}
                </option>
              ))}
            </select>
            <span className="self-center text-gray-500">:</span>
            <select
              value={time ? time.split(':')[1] : '00'}
              onChange={(e) => handleTimeInputChange('minute', e.target.value)}
              required={required}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-center"
            >
              <option value="00">00</option>
              <option value="15">15</option>
              <option value="30">30</option>
              <option value="45">45</option>
            </select>
          </div>
          <p className="text-xs text-gray-400 mt-1">15-minute intervals (0, 15, 30, 45)</p>
        </div>
      </div>

      {/* Display Selected Date */}
      {date && (
        <div className="mt-2 text-sm text-purple-600 font-medium">
          📅 {getDisplayDate()}
        </div>
      )}
    </div>
  );
}

