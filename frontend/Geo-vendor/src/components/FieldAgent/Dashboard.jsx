// src/components/FieldAgent/Dashboard.jsx
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import Navbar from "./Navbar";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./Dashboard.css";

// Fix for default Leaflet marker icons in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Custom marker icons
const userIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const supplierIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Component to update map center when location changes
function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);
  return null;
}

const FieldAgentDashboard = () => {
  const [agentData, setAgentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [suppliers, setSuppliers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const token = localStorage.getItem("token");

  // Default center (Nairobi, Kenya)
  const defaultCenter = [-1.2921, 36.8219];
  const mapCenter = userLocation 
    ? [userLocation.lat, userLocation.lon] 
    : defaultCenter;

  useEffect(() => {
    const fetchAgentData = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL || "http://localhost:5000"}/agent/verify`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setAgentData(res.data);
      } catch (err) {
        console.error("Error fetching Field Agent data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAgentData();
    fetchSuppliers();
  }, [token]);

  const fetchSuppliers = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/suppliers`
      );
      const supplierData = response.data.suppliers || response.data || [];
      setSuppliers(supplierData);
      console.log("=== Suppliers Loaded ===");
      supplierData.forEach(s => {
        console.log(`${s.id}: ${s.name} - lat: ${s.latitude}, lon: ${s.longitude}`);
      });
      console.log("========================");
    } catch (err) {
      console.error("Error fetching suppliers:", err);
    }
  };

  const getLocation = () => {
    setLoadingLocation(true);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lon: longitude });
          setLoadingLocation(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          alert("Unable to get your location. Please enable location services.");
          setLoadingLocation(false);
        }
      );
    } else {
      alert("Geolocation is not supported by your browser");
      setLoadingLocation(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name?.toLowerCase().includes(searchTerm) ||
    supplier.address?.toLowerCase().includes(searchTerm) ||
    supplier.supplier_id?.toLowerCase().includes(searchTerm)
  );

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371000; // Earth's radius in meters
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const getDistanceToSupplier = (supplier) => {
    if (!userLocation) return null;
    return calculateDistance(
      userLocation.lat,
      userLocation.lon,
      supplier.latitude,
      supplier.longitude
    );
  };

  if (loading) return <div className="content">Loading Field Agent Dashboard...</div>;

  return (
    <div className="dashboard-container">
      <Navbar userEmail={agentData?.user?.email} />

      <div className="main-content">
        <div className="top-navbar">
          <h2>Field Agent Dashboard</h2>
        </div>

        <div className="content">
          <h1>Verification Area 🧽 SpongeBob</h1>
          <p>Pending verifications: {agentData?.pending_verifications}</p>

          {/* Search Bar */}
          <div className="search-section">
            <div className="search-input-wrapper">
              <svg 
                className="search-icon" 
                xmlns="http://www.w3.org/2000/svg" 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input
                type="text"
                placeholder="Search for a supplier hub..."
                value={searchTerm}
                onChange={handleSearch}
                className="search-input"
              />
            </div>
          </div>

          {/* Map Section */}
          <div className="map-section">
            <div className="map-header">
              <h3>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="20" 
                  height="20" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                Interactive Map
              </h3>
              <button
                onClick={getLocation}
                disabled={loadingLocation}
                className="btn btn-primary location-btn"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="16" 
                  height="16" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="22" y1="12" x2="18" y2="12"></line>
                  <line x1="6" y1="12" x2="2" y2="12"></line>
                  <line x1="12" y1="6" x2="12" y2="2"></line>
                  <line x1="12" y1="22" x2="12" y2="18"></line>
                </svg>
                {loadingLocation ? "Getting Location..." : "Get My Location"}
              </button>
            </div>
            
            <div className="map-container">
              <MapContainer
                center={mapCenter}
                zoom={13}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapUpdater center={userLocation ? [userLocation.lat, userLocation.lon] : null} />
                
                {/* User Location Marker with Pin */}
                {userLocation && (
                  <Marker 
                    position={[userLocation.lat, userLocation.lon]}
                    icon={userIcon}
                  >
                    <Popup>
                      <div className="popup-content">
                        <h4>📍 Your Location</h4>
                        <p>Lat: {userLocation.lat.toFixed(6)}</p>
                        <p>Lon: {userLocation.lon.toFixed(6)}</p>
                      </div>
                    </Popup>
                  </Marker>
                )}
                
                {/* Supplier Markers */}
                {filteredSuppliers.map((supplier) => (
                  <Marker
                    key={supplier.id}
                    position={[supplier.latitude, supplier.longitude]}
                    icon={supplierIcon}
                    eventHandlers={{
                      click: () => setSelectedSupplier(supplier),
                    }}
                  >
                    <Popup>
                      <div className="popup-content">
                        <h4>🏪 {supplier.name}</h4>
                        <p>ID: {supplier.supplier_id}</p>
                        <p>{supplier.address || supplier.location || 'No address'}</p>
                        {userLocation && (
                          <p className="distance-info">
                            📏 Distance: {Math.round(getDistanceToSupplier(supplier))}m
                          </p>
                        )}
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
              
              {/* Map Legend */}
              <div className="map-legend">
                <div className="legend-item">
                  <span className="legend-marker user-marker"></span>
                  <span>Your Location</span>
                </div>
                <div className="legend-item">
                  <span className="legend-marker supplier-marker"></span>
                  <span>Supplier Hub</span>
                </div>
              </div>
            </div>
          </div>

          {/* Suppliers List */}
          <div className="suppliers-section">
            <h3>Nearby Suppliers ({filteredSuppliers.length})</h3>
            {filteredSuppliers.length > 0 ? (
              <div className="suppliers-list">
                {filteredSuppliers.map((supplier) => {
                  const distance = getDistanceToSupplier(supplier);
                  return (
                    <div
                      key={supplier.id}
                      className={`supplier-card ${selectedSupplier?.id === supplier.id ? 'selected' : ''}`}
                      onClick={() => setSelectedSupplier(supplier)}
                    >
                      <div className="supplier-header">
                        <h4>{supplier.name}</h4>
                        <span className="supplier-id">{supplier.supplier_id}</span>
                      </div>
                      <div className="supplier-details">
                        <p>{supplier.address || supplier.location || 'No address'}</p>
                        {distance !== null && (
                          <p className="distance-badge">
                            📏 {Math.round(distance)} meters away
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="no-suppliers">No suppliers found matching your search</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FieldAgentDashboard;

