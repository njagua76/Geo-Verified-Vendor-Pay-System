import React, { useState, useEffect } from "react";
import { MapPin, CheckCircle2, AlertCircle, DollarSign, Crosshair, Navigation, Store, Loader } from "lucide-react";
import { suppliersAPI } from "../../api/apiClient";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

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
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
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
        // Reset verification when changing supplier
        setLocationVerified(false);
      }
    } else {
      setSelectedSupplier(null);
      setLocationVerified(false);
      setDistance(null);
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Location Verification</h1>
          <p className="text-gray-600">Verify your location at a supplier hub to proceed with payment</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Controls */}
          <div className="lg:col-span-1 space-y-6">
            {/* Supplier Selection Card */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Store className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Select Supplier</h2>
              </div>
              
              <select 
                id="supplier-select"
                value={selectedSupplierId}
                onChange={handleSupplierSelect}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
              >
                <option value="">-- Choose a Supplier --</option>
                {suppliers.map(supplier => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name} ({supplier.supplier_id})
                  </option>
                ))}
              </select>
            </div>

            {/* Location Control Card */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <Navigation className="w-5 h-5 text-green-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Your Location</h2>
              </div>
              
              {userLocation ? (
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-green-50 border border-green-200">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-green-900">Location Captured</p>
                      <p className="text-xs text-green-700 mt-1">
                        {userLocation.lat.toFixed(6)}, {userLocation.lon.toFixed(6)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={getLocation}
                    disabled={loadingLocation}
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-50 text-gray-700 font-medium hover:bg-gray-100 transition-colors text-sm flex items-center justify-center gap-2"
                  >
                    <Crosshair className="w-4 h-4" />
                    Refresh Location
                  </button>
                </div>
              ) : (
                <button
                  onClick={getLocation}
                  disabled={loadingLocation}
                  className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold hover:from-blue-700 hover:to-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  {loadingLocation ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Getting Location...
                    </>
                  ) : (
                    <>
                      <Navigation className="w-5 h-5" />
                      Get My Location
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Verification Status Card */}
            {selectedSupplier && userLocation && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-purple-600" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">Verification</h2>
                </div>

                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                    <h3 className="font-semibold text-gray-900 mb-1">{selectedSupplier.name}</h3>
                    <p className="text-sm text-gray-600">{selectedSupplier.location || selectedSupplier.address || 'View on map'}</p>
                  </div>

                  {distance !== null && (
                    <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
                      <p className="text-sm text-gray-700 mb-1">Distance to Supplier</p>
                      <p className="text-2xl font-bold text-blue-600">{Math.round(distance)}m</p>
                    </div>
                  )}

                  {locationVerified ? (
                    <div className="p-4 rounded-xl bg-green-50 border-2 border-green-500">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-6 h-6 text-green-600" />
                        <div>
                          <p className="font-semibold text-green-900">Location Verified!</p>
                          <p className="text-sm text-green-700">You are within range</p>
                        </div>
                      </div>
                      <button
                        onClick={handlePayment}
                        className="w-full mt-4 px-4 py-3 rounded-xl bg-gradient-to-r from-green-600 to-green-500 text-white font-semibold hover:from-green-700 hover:to-green-600 transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0"
                      >
                        <DollarSign className="w-5 h-5" />
                        Proceed to Payment
                      </button>
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-red-50 border-2 border-red-500">
                      <div className="flex items-center gap-3">
                        <AlertCircle className="w-6 h-6 text-red-600" />
                        <div>
                          <p className="font-semibold text-red-900">Location Not Verified</p>
                          {distance && distance > DISTANCE_THRESHOLD && (
                            <p className="text-sm text-red-700">Get within {DISTANCE_THRESHOLD}m of supplier</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Panel - Map and Suppliers */}
          <div className="lg:col-span-2 space-y-6">
            {/* Map Section */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-gray-900">Interactive Map</h3>
                </div>
                <button 
                  onClick={() => setShowMap(!showMap)}
                  className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium transition-colors"
                >
                  {showMap ? 'Hide Map' : 'Show Map'}
                </button>
              </div>
              
              {showMap && (
                <div className="h-96">
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
                          <div className="p-2">
                            <h4 className="font-semibold text-sm mb-1">📍 Your Location</h4>
                            <p className="text-xs text-gray-600">Lat: {userLocation.lat.toFixed(6)}</p>
                            <p className="text-xs text-gray-600">Lon: {userLocation.lon.toFixed(6)}</p>
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
                          <div className="p-2">
                            <h4 className="font-semibold text-sm mb-1">🏪 {supplier.name}</h4>
                            <p className="text-xs text-gray-600">ID: {supplier.supplier_id}</p>
                            <p className="text-xs text-gray-600">{supplier.address || supplier.location || 'No address'}</p>
                            {userLocation && (
                              <p className="text-xs text-blue-600 font-medium mt-2 pt-2 border-t">
                                📏 Distance: {Math.round(getDistanceToSupplier(supplier))}m
                              </p>
                            )}
                          </div>
                        </Popup>
                      </Marker>
                    ))}
                  </MapContainer>
                  
                  {/* Map Legend */}
                  <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-3 rounded-xl shadow-lg border border-gray-200 flex gap-4 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <span className="text-gray-700">Your Location</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span className="text-gray-700">Supplier</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <span className="text-gray-700">Selected</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Suppliers List */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Available Suppliers ({suppliers.length})</h3>
              {suppliers.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {suppliers.map((supplier) => {
                    const dist = getDistanceToSupplier(supplier);
                    const isSelected = selectedSupplier?.id === supplier.id;
                    return (
                      <div
                        key={supplier.id}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          isSelected 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-blue-50'
                        }`}
                        onClick={() => {
                          setSelectedSupplier(supplier);
                          setSelectedSupplierId(supplier.id.toString());
                          // Reset verification when changing supplier
                          setLocationVerified(false);
                        }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 mb-1">{supplier.name}</h4>
                            <p className="text-sm text-gray-600 mb-2">{supplier.location || supplier.address || 'View on map'}</p>
                            {dist !== null && (
                              <div className="flex items-center gap-2 text-sm">
                                <MapPin className="w-4 h-4 text-blue-600" />
                                <span className="text-blue-600 font-medium">{Math.round(dist)}m away</span>
                              </div>
                            )}
                          </div>
                          {isSelected && (
                            <CheckCircle2 className="w-6 h-6 text-blue-600 flex-shrink-0" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No suppliers available</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .leaflet-container {
          border-radius: 0;
        }
      `}</style>
    </div>
  );
};

export default FieldAgentVerify;

