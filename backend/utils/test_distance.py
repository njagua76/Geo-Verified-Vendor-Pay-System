# test_distance.py....used this to confirm my haversine function works as expected
from utils.distance import haversine_distance

# Example coordinates
lat1, lon1 = -1.2921, 36.8219  # Nairobi
lat2, lon2 = -1.2922, 36.8220  # Nearby point

distance = haversine_distance(lat1, lon1, lat2, lon2)
print(f"Distance between points: {distance:.2f} meters")

# Check if distance is <= 20 meters
if distance <= 20:
    print("Distance is within payment threshold ✅")
else:
    print("Distance exceeds payment threshold ❌")


#how to run test= python3 -m utils.test_distance
