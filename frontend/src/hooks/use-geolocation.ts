import { useState } from 'react'; // Import React's useState hook for state management

// Define the Location interface for latitude and longitude
interface Location {
  lat: number; // Latitude coordinate
  lon: number; // Longitude coordinate
}

// Custom hook for handling geolocation
export const useGeolocation = () => {
  // State to store the current location
  const [location, setLocation] = useState<Location | null>(null);
  // State to track loading status during location fetch
  const [loading, setLoading] = useState(false);
  // State to store any error messages
  const [error, setError] = useState<string | null>(null);

  // Function to get the current location
  const getLocation = () => {
    // Check if geolocation is supported by the browser
    if (!navigator.geolocation) {
      // Set error if not supported
      setError('Geolocation is not supported by your browser');
      return;
    }

    // Set loading to true and clear previous error
    setLoading(true);
    setError(null);

    // Request current position with options
    navigator.geolocation.getCurrentPosition(
      (position) => {
        // On success, set location and stop loading
        setLocation({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
        setLoading(false);
      },
      (err) => {
        // On error, set error message and stop loading
        setError(err.message || 'Location permission denied');
        setLoading(false);
      },
      {
        enableHighAccuracy: true, // Request high accuracy
        timeout: 10000, // Timeout after 10 seconds
        maximumAge: 0, // Don't use cached position
      }
    );
  };

  // Return the state and function
  return { location, loading, error, getLocation };
};