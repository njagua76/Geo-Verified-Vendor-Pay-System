"""
Location Verification Routes - Verify field agent is within 20m of supplier.
"""

from flask import Blueprint, request, jsonify
from backend.models import db, Supplier
from backend.decorators import role_required
from backend.utils.geoutils import haversine_distance, is_within_radius

location_bp = Blueprint('location', __name__)

@location_bp.route('/verify-location', methods=['POST'])
@role_required('Field Agent')
def verify_location():
    """
    Verify if field agent is within 20 meters of a supplier.
    
    Request JSON:
    {
        "user_lat": -1.286389,     # Field agent's latitude
        "user_lon": 36.817223,     # Field agent's longitude
        "supplier_id": 1           # Supplier database ID
    }
    
    Returns:
        200: {"verified": true, "distance": 15.2, "message": "Location verified"}
        400: Validation errors
        403: Not a Field Agent
        404: Supplier not found
        422: Distance > 20m
    """
    try:
        # 1. Get and validate request data
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No JSON data provided'}), 400
        
        # Required fields
        required_fields = ['user_lat', 'user_lon', 'supplier_id']
        missing_fields = [field for field in required_fields if field not in data]
        
        if missing_fields:
            return jsonify({
                'error': 'Missing required fields',
                'missing': missing_fields
            }), 400
        
        # Extract and validate coordinates
        user_lat = data['user_lat']
        user_lon = data['user_lon']
        supplier_id = data['supplier_id']
        
        # Validate coordinate ranges
        if not (-90 <= user_lat <= 90):
            return jsonify({'error': 'Latitude must be between -90 and 90'}), 400
        
        if not (-180 <= user_lon <= 180):
            return jsonify({'error': 'Longitude must be between -180 and 180'}), 400
        
        # 2. Fetch supplier from database
        supplier = Supplier.query.get(supplier_id)
        
        if not supplier:
            return jsonify({'error': 'Supplier not found'}), 404
        
        # 3. Calculate distance using Haversine formula
        distance = haversine_distance(
            user_lat, user_lon,
            supplier.latitude, supplier.longitude
        )
        
        # 4. Check if within 20 meters
        is_within_20m = distance <= 20
        
        # 5. Prepare response
        response = {
            'verified': is_within_20m,
            'distance': round(distance, 2),  # Round to 2 decimal places
            'supplier': {
                'id': supplier.id,
                'name': supplier.name,
                'supplier_id': supplier.supplier_id,
                'latitude': supplier.latitude,
                'longitude': supplier.longitude
            },
            'user_location': {
                'latitude': user_lat,
                'longitude': user_lon
            }
        }
        
        if is_within_20m:
            response['message'] = 'Location verified within 20 meters'
            return jsonify(response), 200
        else:
            response['message'] = f'Distance {round(distance, 2)}m exceeds 20m limit'
            return jsonify(response), 422  # 422 Unprocessable Entity
            
    except ValueError as e:
        return jsonify({'error': 'Invalid coordinate values'}), 400
    except Exception as e:
        # Log the error for debugging
        print(f"Location verification error: {e}")
        return jsonify({'error': 'Internal server error'}), 500