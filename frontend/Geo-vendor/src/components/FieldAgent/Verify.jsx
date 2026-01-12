import React, { useState, useEffect } from "react";
import { MapPin, CheckCircle2, AlertCircle, DollarSign } from "lucide-react";
import { suppliersAPI } from "../../api/apiClient";
import "./Verify.css";

const Verify = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [suppliers, setSuppliers] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [locationVerified, setLocationVerified] = useState(false);
  const [distance, setDistance] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(false);

  const DISTANCE_THRESHOLD = 20; // 20 meters threshold for GPS accuracy

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const response = await suppliersAPI.getAll();
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

  const verifyLocation = (supplier) => {
    if (!userLocation) {
      alert("Please get your location first");
      return;
    }

    const dist = calculateDistance(
      userLocation.lat,
      userLocation.lon,
      supplier.latitude,
      supplier.longitude
    );

    setDistance(dist);
    setSelectedSupplier(supplier);

    // Debug logging
    console.log("=== Location Debug ===");
    console.log("Your location:", { lat: userLocation.lat, lon: userLocation.lon });
    console.log("Supplier location:", { lat: supplier.latitude, lon: supplier.longitude });
    console.log("Calculated distance:", dist.toFixed(2), "meters");
    console.log("Threshold:", DISTANCE_THRESHOLD, "meters");
    console.log("========================");

    if (dist <= DISTANCE_THRESHOLD) {
      setLocationVerified(true);
    } else {
      setLocationVerified(false);
      alert(
        `You are ${Math.round(dist)} meters away from this supplier. You need to be within ${DISTANCE_THRESHOLD} meters.`
      );
    }
  };

  const handlePayment = () => {
    if (selectedSupplier && locationVerified) {
      // Redirect to payment page with supplier info
      window.location.href = `/payment?supplier=${selectedSupplier.id}`;
    }
  };

  return (
    <div className="verify-container">
      <h1>Location Verification</h1>

      {/* Controls */}
      <div className="controls-section">
        <button
          onClick={getLocation}
          disabled={loadingLocation}
          className="btn btn-primary"
        >
          <MapPin size={20} />
          {loadingLocation ? "Getting Location..." : "Get My Location"}
        </button>
      </div>

      {/* Status Section */}
      <div className="status-section">
        {userLocation && (
          <div className="status-card">
            <h3>Your Location</h3>
            <p>
              Latitude: {userLocation.lat.toFixed(6)}, Longitude:{" "}
              {userLocation.lon.toFixed(6)}
            </p>
          </div>
        )}

        <div className="status-card">
          <h3>Available Suppliers</h3>
          {suppliers.length > 0 ? (
            <div className="suppliers-list">
              {suppliers.map((supplier) => (
                <div
                  key={supplier.id}
                  className="supplier-item"
                  onClick={() => verifyLocation(supplier)}
                >
                  <h4>{supplier.name}</h4>
                  <p>{supplier.location || supplier.address}</p>
                  <button className="verify-btn">Select & Verify</button>
                </div>
              ))}
            </div>
          ) : (
            <p>No suppliers available</p>
          )}
        </div>

        {selectedSupplier && (
          <div className="status-card">
            <h3>Selected Supplier: {selectedSupplier.name}</h3>
            <p>{selectedSupplier.location || selectedSupplier.address}</p>
            <p>
              Distance: {distance ? Math.round(distance) + " meters" : "N/A"}
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
              </div>
            )}

            {locationVerified && (
              <button
                onClick={handlePayment}
                className="btn btn-success btn-payment"
              >
                <DollarSign size={20} />
                Proceed to Payment
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Verify;
