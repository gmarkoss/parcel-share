'use client';

import { useState, useEffect, useRef } from 'react';

interface Location {
  display_name: string;
  lat: string;
  lon: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    country?: string;
  };
}

interface LocationAutocompleteProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onLocationSelect: (location: string, lat: number, lng: number) => void;
  placeholder?: string;
  required?: boolean;
  lat?: number;
  lng?: number;
}

export default function LocationAutocomplete({
  label,
  value,
  onChange,
  onLocationSelect,
  placeholder = 'Search for a location...',
  required = false,
}: LocationAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<Location[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchLocation = async (query: string) => {
    if (query.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsSearching(true);
    
    try {
      // Search Benelux, France, and Germany
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?` +
        `format=json&` +
        `q=${encodeURIComponent(query)}&` +
        `viewbox=2,48,11,54&` + // Benelux, France, Germany bounding box
        `bounded=0&` + // Prefer results in viewbox but don't restrict strictly
        `addressdetails=1&` +
        `countrycodes=be,nl,lu,fr,de` + // Benelux, France, Germany only
        `limit=10&` +
        `dedupe=1&` +
        `timeout=10`
      );

      const data: Location[] = await response.json();
      setSuggestions(data);
      setShowSuggestions(data.length > 0);
    } catch (error) {
      console.error('Location search error:', error);
      setSuggestions([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    onChange(query);

    // Debounce search
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      searchLocation(query);
    }, 500);
  };

  const handleSuggestionClick = (suggestion: Location) => {
    // Use the full display_name which includes complete address
    const fullAddress = suggestion.display_name;
    
    onChange(fullAddress);
    onLocationSelect(fullAddress, parseFloat(suggestion.lat), parseFloat(suggestion.lon));
    setShowSuggestions(false);
    setSuggestions([]);
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={handleInputChange}
          required={required}
          placeholder={placeholder}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
          onFocus={() => setShowSuggestions(suggestions.length > 0)}
        />
        {isSearching && (
          <div className="absolute right-3 top-3">
            <svg className="animate-spin h-5 w-5 text-sky-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        )}
        {value && !isSearching && (
          <div className="absolute right-3 top-3 text-green-500">
            ✓
          </div>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full px-4 py-3 text-left hover:bg-sky-50 focus:bg-sky-50 focus:outline-none border-b border-gray-100 last:border-b-0"
            >
              <div className="font-medium text-gray-900 text-sm">
                {suggestion.display_name}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                📍 {suggestion.lat}, {suggestion.lon}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

