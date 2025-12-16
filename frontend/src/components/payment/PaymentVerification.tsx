import { useGeolocation } from '../../hooks/use-geolocation'; // Import the custom geolocation hook
import LocationMap from '../map/LocationMap'; // Import the map component

// Define supplier data array
const suppliers = [
  {
    id: 'SUP001', // Supplier ID
    name: 'Supplier Hub A', // Supplier name
    lat: -1.286389, // Latitude
    lon: 36.817223, // Longitude
  },
  // Add more suppliers as needed
];

// Main component for payment verification
export default function PaymentVerification() {
  // Use the geolocation hook to get location state and function
  const { location, loading, error, getLocation } = useGeolocation();

  // Return the JSX for the UI
  return (
    // Main container with full-screen gradient background
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-4">
      {/* Glassmorphism card container */}
      <div className="bg-white/90 backdrop-blur-lg shadow-2xl rounded-3xl p-8 max-w-4xl w-full border border-white/20">
        {/* Header */}
        <h1 className="text-4xl font-extrabold text-center bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent mb-2">Geo-Verified Supplier Pay</h1>
        <p className="text-center text-gray-700 text-lg mb-6">Capture your GPS location and verify supplier hubs in real-time.</p>

        {/* GPS Button and Status Section */}
        <div className="flex flex-col items-center space-y-4">
          {/* GPS Capture Button */}
          <button
            onClick={getLocation} // Call getLocation on click
            disabled={loading} // Disable when loading
            className="relative px-8 py-4 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-semibold text-lg shadow-lg transform transition-all hover:scale-105 hover:shadow-2xl disabled:opacity-60 animate-pulse disabled:animate-none"
          >
            {/* Conditional rendering for button text */}
            {loading ? (
              <span className="flex items-center space-x-2 animate-pulse">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                <span>Acquiring Location…</span> {/* Loading text */}
              </span>
            ) : (
              'Capture GPS Location' // Default text
            )}
          </button>

          {/* Status Feedback */}
          {/* Error Status */}
          {error && (
            <div className="flex items-center space-x-2 bg-red-100 text-red-700 p-3 rounded-lg shadow-inner">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.707-11.707a1 1 0 00-1.414 0L9 7.586 8.707 7.293a1 1 0 00-1.414 1.414L7.586 9l-.293.293a1 1 0 001.414 1.414L9 10.414l.293.293a1 1 0 001.414-1.414L10.414 9l.293-.293a1 1 0 000-1.414z" clipRule="evenodd" />
              </svg>
              <span>{error}</span> {/* Display error message */}
            </div>
          )}

          {/* Success Status */}
          {location && (
            <div className="flex flex-col items-center bg-green-100 text-green-700 p-3 rounded-lg shadow-inner space-y-1">
              <span className="font-semibold">Location Captured Successfully!</span>
              <span>Lat: {location.lat.toFixed(6)}, Lon: {location.lon.toFixed(6)}</span> {/* Display coordinates */}
            </div>
          )}
        </div>

        {/* Map Section - only show if location is captured */}
        {location && (
          <div className="mt-6 rounded-3xl overflow-hidden shadow-2xl">
            <LocationMap
              userLocation={location} // Pass user location to map
              suppliers={suppliers} // Pass suppliers to map
            />
          </div>
        )}

        {/* Supplier List */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
          {/* Render each supplier card */}
          {suppliers.map((s) => (
            <div
              key={s.id} // Unique key for React
              className="p-6 bg-white/95 backdrop-blur-md rounded-2xl shadow-lg hover:scale-105 transition-all transform cursor-pointer border border-white/30 hover:shadow-xl"
            >
              <div className="flex items-center space-x-3">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div>
                  <h3 className="font-bold text-gray-800">{s.name}</h3> {/* Supplier name */}
                  <p className="text-gray-500 text-sm">Lat: {s.lat.toFixed(3)}, Lon: {s.lon.toFixed(3)}</p> {/* Coordinates */}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}