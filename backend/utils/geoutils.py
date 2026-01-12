"""
Geographic Utilities - Haversine formula for distance calculation.
"""

import math

def haversine_distance(lat1, lon1, lat2, lon2):
    """
    Calculate the great-circle distance between two points
    on the Earth's surface using the Haversine formula.
    
    Args:
        lat1, lon1: Latitude and longitude of point 1 (in decimal degrees)
        lat2, lon2: Latitude and longitude of point 2 (in decimal degrees)
        
    Returns:
        float: Distance in meters
    
    Formula:
        a = sin²(Δφ/2) + cos φ1 ⋅ cos φ2 ⋅ sin²(Δλ/2)
        c = 2 ⋅ atan2(√a, √(1−a))
        d = R ⋅ c
        
    Where:
        φ = latitude in radians
        λ = longitude in radians
        R = Earth's radius (6371000 meters)
    """
    # Earth radius in meters
    R = 6371000
    
    # Convert degrees to radians
    lat1_rad = math.radians(lat1)
    lon1_rad = math.radians(lon1)
    lat2_rad = math.radians(lat2)
    lon2_rad = math.radians(lon2)
    
    # Differences
    dlat = lat2_rad - lat1_rad
    dlon = lon2_rad - lon1_rad
    
    # Haversine formula
    a = math.sin(dlat/2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    
    # Distance in meters
    distance = R * c
    
    return distance

def is_within_radius(lat1, lon1, lat2, lon2, radius_meters=20):
    """
    Check if two points are within a specified radius.
    
    Args:
        lat1, lon1: Point 1 coordinates
        lat2, lon2: Point 2 coordinates
        radius_meters: Maximum allowed distance in meters (default: 20)
        
    Returns:
        tuple: (is_within_radius, distance_meters)
    """
    distance = haversine_distance(lat1, lon1, lat2, lon2)
    return distance <= radius_meters, distance