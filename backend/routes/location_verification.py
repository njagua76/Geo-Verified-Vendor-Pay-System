from flask import Blueprint, request, jsonify
from models import db, Supplier
from decorators import role_required

location_bp = Blueprint('location', __name__, url_prefix='/api')

@location_bp.route('/verify-location', methods=['POST'])
@role_required('Field Agent')
def verify_location():
    # 1. Get user location and supplier_id from request
    # 2. Fetch supplier from database
    # 3. Calculate distance (basic for now - Haversine separate task)
    # 4. Return verification result
    pass