import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const LocationContext = createContext();

// Haversine formula to compute great-circle distance between two GPS coordinates in kilometers
export function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return null;
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Format distance human-readably (e.g. "450 m" or "2.3 km")
export function formatDistance(distanceKm) {
  if (distanceKm == null || isNaN(distanceKm)) return 'Location pending';
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m away`;
  }
  return `${distanceKm.toFixed(1)} km away`;
}

export const LocationProvider = ({ children }) => {
  const [coordinates, setCoordinates] = useState(null); // { lat, lng, accuracy, timestamp }
  const [address, setAddress] = useState(null); // { city, district, state, country, displayName }
  const [permissionStatus, setPermissionStatus] = useState('prompt'); // 'prompt' | 'granted' | 'denied' | 'unsupported'
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [watchId, setWatchId] = useState(null);

  // Reverse geocoding helper via OpenStreetMap Nominatim with graceful fallback
  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14&addressdetails=1`,
        {
          headers: {
            'Accept-Language': 'en'
          }
        }
      );
      if (response.ok) {
        const data = await response.json();
        const addr = data.address || {};
        const city = addr.city || addr.town || addr.village || addr.suburb || addr.municipality || 'Local City';
        const district = addr.state_district || addr.county || city;
        const state = addr.state || 'Maharashtra';
        const country = addr.country || 'India';
        const resolved = {
          city,
          district: district.replace(/ district/i, ''),
          state,
          country,
          displayName: data.display_name || `${district}, ${state}, ${country}`
        };
        setAddress(resolved);
        return resolved;
      }
    } catch (err) {
      console.warn('[LocationContext] Reverse geocoding network error, using fallback:', err.message);
    }
    // Fallback if network or rate limit
    const fallback = {
      city: 'Pune',
      district: 'Pune',
      state: 'Maharashtra',
      country: 'India',
      displayName: `Coordinates: ${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E`
    };
    setAddress(fallback);
    return fallback;
  };

  // Main function to acquire user GPS location
  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setPermissionStatus('unsupported');
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setLocationError('');

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const coords = {
          lat: Number(pos.coords.latitude),
          lng: Number(pos.coords.longitude),
          accuracy: Math.round(pos.coords.accuracy || 10),
          altitude: pos.coords.altitude,
          timestamp: new Date().toISOString()
        };

        setCoordinates(coords);
        setPermissionStatus('granted');
        setIsLocating(false);

        // Reverse-geocode to get city/state
        await reverseGeocode(coords.lat, coords.lng);
      },
      (err) => {
        setIsLocating(false);
        if (err.code === 1) {
          setPermissionStatus('denied');
          setLocationError('Location permission was denied. Please allow location access in your browser settings to report civic problems.');
        } else if (err.code === 2) {
          setLocationError('Position unavailable. Please ensure device GPS is turned on.');
        } else if (err.code === 3) {
          setLocationError('Location request timed out.');
        } else {
          setLocationError(err.message || 'Failed to detect location.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 0
      }
    );
  }, []);

  // Check browser permissions query if supported, and prompt for location on initial app mount
  useEffect(() => {
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        setPermissionStatus(result.state);
        if (result.state === 'granted') {
          requestLocation();
        }
        result.onchange = () => {
          setPermissionStatus(result.state);
          if (result.state === 'granted') {
            requestLocation();
          }
        };
      }).catch(() => {
        // Fallback: prompt directly
        requestLocation();
      });
    } else {
      requestLocation();
    }
  }, [requestLocation]);

  return (
    <LocationContext.Provider
      value={{
        coordinates,
        address,
        permissionStatus,
        isLocating,
        locationError,
        requestLocation,
        calculateDistance: (targetLat, targetLng) => {
          if (!coordinates) return null;
          return calculateDistanceKm(coordinates.lat, coordinates.lng, targetLat, targetLng);
        },
        hasLiveGps: Boolean(coordinates && permissionStatus === 'granted')
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};
