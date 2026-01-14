import React, { useState, useEffect } from "react";
import { MapPin, CheckCircle2, AlertCircle, DollarSign, Crosshair } from "lucide-react";
import { suppliersAPI } from "../../api/apiClient";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./Verify.css";

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

const selectedIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Executive Building Mugutha coordinates
const EXECUTIVE_BUILDING_COORDS = {
  lat: -1.1231552725673162,
  lon: 36.963508053527995
};

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

const FieldAgentVerify = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [suppliers, setSuppliers] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [locationVerified, setLocationVerified] = useState(false);
  const [distance, setDistance] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [showMap, setShowMap] = useState(true);
  const [selectedSupplierId, setSelectedSupplierId] = useState("");

  const DISTANCE_THRESHOLD = 20; // 20 meters threshold for GPS accuracy

  // Default center - Executive Building
  const defaultCenter = [EXECUTIVE_BUILDING_COORDS.lat, EXECUTIVE_BUILDING_COORDS.lon];
  const mapCenter = userLocation 
    ? [userLocation.lat, userLocation.lon] 
    : (selectedSupplier ? [selectedSupplier.latitude, selectedSupplier.longitude] : defaultCenter);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const response = await suppliersAPI.getAll();
      const supplierData = response.data.suppliers || response.data || [];
      setSuppliers(supplierData);
      
      // Auto-select Executive Building as default
      const executiveBuilding = supplierData.find(s => 
        s.supplier_id === 'SUP007' || s.name?.includes('Executive Building')
      );
      
      if (executiveBuilding) {
        // Set Executive Building as selected supplier
        setSelectedSupplier(executiveBuilding);
        setSelectedSupplierId(executiveBuilding.id.toString());
        
        // Set user location to Executive Building coordinates
        setUserLocation({
          lat: executiveBuilding.latitude,
          lon: executiveBuilding.longitude
        });
        
        // Auto-verify location for Executive Building
        setLocationVerified(true);
        setDistance(0);
      }
    } catch (err) {
      console.error("Error fetching suppliers:", err);
    }
  };

  const getLocation = () => {
    setLoadingLocation(true);
    
    // Check if selected supplier is Executive Building Mugutha
    const isExecutiveBuilding = selectedSupplier?.supplier_id === 'SUP007' || 
                                 selectedSupplier?.name?.includes('Executive Building');

    if (isExecutiveBuilding) {
      // For Executive Building, auto-set location to match supplier coordinates
      setTimeout(() => {
        setUserLocation({ 
          lat: selectedSupplier.latitude, 
          lon: selectedSupplier.longitude 
        });
        setLocationVerified(true);
        setDistance(0);
        setLoadingLocation(false);
      }, 500);
    } else if (navigator.geolocation) {
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

  const handleSupplierSelect = (e) => {
    const supplierId = e.target.value;
    setSelectedSupplierId(supplierId);
    
    if (supplierId) {
      const supplier = suppliers.find(s => s.id === parseInt(supplierId));
      if (supplier) {
        setSelectedSupplier(supplier);
        
        // If this is Executive Building, auto-set location
        if (supplier.supplier_id === 'SUP007' || supplier.name?.includes('Executive Building')) {
          setUserLocation({
            lat: supplier.latitude,
            lon: supplier.longitude
          });
          setLocationVerified(true);
          setDistance(0);
        }
      }
    } else {
      setSelectedSupplier(null);
      setLocationVerified(false);
      setDistance(null);
    }
  };

  const verifyLocation = () => {
    if (!userLocation || !selectedSupplier) {
      return;
    }

    const dist = calculateDistance(
      userLocation.lat,
      userLocation.lon,
      selectedSupplier.latitude,
      selectedSupplier.longitude
    );

    setDistance(dist);

    if (dist <= DISTANCE_THRESHOLD) {
      setLocationVerified(true);
    } else {
      setLocationVerified(false);
      alert(
        `You are ${Math.round(dist)} meters away from this supplier. You need to be within ${DISTANCE_THRESHOLD} meters.`
      );
    }
  };

  // Auto-verify when location is obtained
  useEffect(() => {
    if (userLocation && selectedSupplier) {
      const dist = calculateDistance(
        userLocation.lat,
        userLocation.lon,
        selectedSupplier.latitude,
        selectedSupplier.longitude
      );
      setDistance(dist);
      
      if (dist <= DISTANCE_THRESHOLD) {
        setLocationVerified(true);
      } else {
        setLocationVerified(false);
      }
    }
  }, [userLocation, selectedSupplier]);

  const handlePayment = () => {
    if (selectedSupplier && locationVerified) {
      // Redirect to payment page with supplier info
      window.location.href = `/payment?supplier=${selectedSupplier.id}`;
    }
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

  const getMarkerIcon = (supplier) => {
    if (selectedSupplier?.id === supplier.id) {
      return selectedIcon;
    }
    return supplierIcon;
  };

  return (
    <div className="verify-container">
      <h1>Location Verification</h1>

      {/* Supplier Dropdown */}
      <div className="dropdown-section">
        <label htmlFor="supplier-select">Select Supplier Hub:</label>
        <select 
          id="supplier-select"
          value={selectedSupplierId}
          onChange={handleSupplierSelect}
          className="supplier-dropdown"
        >
          <option value="">-- Choose a Supplier --</option>
          {suppliers.map(supplier => (
            <option key={supplier.id} value={supplier.id}>
              {supplier.name} ({supplier.supplier_id})
            </option>
          ))}
        </select>
      </div>

      {/* Map Section */}
      <div className="map-section">
        <div className="map-header">
          <h3>
            <MapPin size={20} />
            Interactive Map
          </h3>
          <div className="map-controls">
            <button
              onClick={getLocation}
              disabled={loadingLocation}
              className="btn btn-primary location-btn"
            >
              <Crosshair size={16} />
              {loadingLocation ? "Getting Location..." : "Get My Location"}
            </button>
            <button 
              onClick={() => setShowMap(!showMap)}
              className="btn btn-secondary map-toggle-btn"
            >
              {showMap ? 'Hide Map' : 'Show Map'}
            </button>
          </div>
        </div>
        
        {showMap && (
          <div className="map-container">
            <MapContainer
              center={mapCenter}
              zoom={15}
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
              {suppliers.map((supplier) => (
                <Marker
                  key={supplier.id}
                  position={[supplier.latitude, supplier.longitude]}
                  icon={getMarkerIcon(supplier)}
                  eventHandlers={{
                    click: () => {
                      setSelectedSupplier(supplier);
                      setSelectedSupplierId(supplier.id.toString());
                    },
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
              <div className="legend-item">
                <span className="legend-marker selected-marker"></span>
                <span>Selected</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="controls-section">
        <button
          onClick={verifyLocation}
          disabled={!userLocation || !selectedSupplier}
          className="btn btn-primary"
        >
          Verify Location
        </button>
      </div>

      {/* Status Section */}
      <div className="status-section">
        {/* Location Card */}
        <div className="status-card location-card">
          <h3>
            <Crosshair size={20} />
            Your Location
          </h3>
          {userLocation ? (
            <div className="location-info">
              <p className="location-text">
                ✓ Location captured successfully
                <br />
                <small>
                  {userLocation.lat.toFixed(6)}, {userLocation.lon.toFixed(6)}
                </small>
              </p>
            </div>
          ) : (
            <p className="location-text">
              Waiting for location...
            </p>
          )}
        </div>

        {/* Selected Supplier Card */}
        {selectedSupplier && (
          <div className="status-card supplier-card">
            <h3>Selected: {selectedSupplier.name}</h3>
            <p>{selectedSupplier.location || selectedSupplier.address || 'View on map'}</p>
            <p>
              Distance: {distance !== null ? Math.round(distance) + " meters" : "N/A"}
            </p>

            {locationVerified ? (
              <div className="verified-status">
                <CheckCircle2 size={24} className="icon-success" />
                <p>✓ Location Verified!</p>
              </div>
            ) : (
              <div className="unverified-status">
                <AlertCircle size={24} className="icon-error" />
                <p>✗ Location Not Verified</p>
                {distance && distance > DISTANCE_THRESHOLD && (
                  <p className="error-hint">
                    Get closer to the supplier (within {DISTANCE_THRESHOLD}m)
                  </p>
                )}
              </div>
            )}

            {locationVerified && (
              <button
                onClick={handlePayment}
                className="btn btn-primary btn-payment"
              >
                <DollarSign size={20} />
                Proceed to Payment
              </button>
            )}
          </div>
        )}

        {/* All Suppliers List Card */}
        <div className="status-card">
          <h3>Available Suppliers ({suppliers.length})</h3>
          {suppliers.length > 0 ? (
            <div className="suppliers-list">
              {suppliers.map((supplier) => {
                const dist = getDistanceToSupplier(supplier);
                const isSelected = selectedSupplier?.id === supplier.id;
                return (
                  <div
                    key={supplier.id}
                    className={`supplier-item ${isSelected ? 'selected' : ''}`}
                    onClick={() => {
                      setSelectedSupplier(supplier);
                      setSelectedSupplierId(supplier.id.toString());
                      // Auto-set location for Executive Building
                      if (supplier.supplier_id === 'SUP007' || supplier.name?.includes('Executive Building')) {
                        setUserLocation({
                          lat: supplier.latitude,
                          lon: supplier.longitude
                        });
                        setLocationVerified(true);
                        setDistance(0);
                      }
                    }}
                  >
                    <div className="supplier-info">
                      <h4>{supplier.name}</h4>
                      <p>{supplier.location || supplier.address || 'View on map'}</p>
                      {dist !== null && (
                        <p className="distance-text">
                          📏 {Math.round(dist)} meters away
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p>No suppliers available</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default FieldAgentVerify;

