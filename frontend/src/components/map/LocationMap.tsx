import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'; // Import Leaflet components for the map
import L from 'leaflet'; // Import Leaflet library

// Define props interface for the component
interface Props {
  userLocation?: { lat: number; lon: number }; // Optional user location
  suppliers: { // Array of supplier objects
    id: string; // Supplier ID
    name: string; // Supplier name
    lat: number; // Latitude
    lon: number; // Longitude
  }[];
}

// Component to render the location map
export default function LocationMap({ userLocation, suppliers }: Props) {
  // Determine the center of the map: user location or default Nairobi
  const center = userLocation
    ? [userLocation.lat, userLocation.lon] // Use user location if available
    : [-1.286389, 36.817223]; // Default to Nairobi coordinates

  // Return the map JSX
  return (
    <MapContainer
      center={center as [number, number]} // Set map center
      zoom={15} // Initial zoom level
      zoomControl={true} // Enable zoom controls (plus/minus buttons)
      scrollWheelZoom={true} // Allow zoom with mouse wheel
      className="h-96 w-full rounded-lg" // CSS classes for styling
    >
      <TileLayer
        attribution="&copy; Group 1 Contributors" // Attribution for tiles
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" // Tile URL
      />

      {/* Render user location marker if available */}
      {userLocation && (
        <Marker position={[userLocation.lat, userLocation.lon]}>
          <Popup>You are here</Popup> {/* Popup text for user marker */}
        </Marker>
      )}

      {/* Render markers for each supplier */}
      {suppliers.map((s) => (
        <Marker key={s.id} position={[s.lat, s.lon]}>
          <Popup>{s.name}</Popup> {/* Popup with supplier name */}
        </Marker>
      ))}
    </MapContainer>
  );
}