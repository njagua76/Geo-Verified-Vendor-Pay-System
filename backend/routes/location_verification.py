"""
Location Verification Routes - Verify field agent is within 20m of supplier and trigger payment.
"""

from flask import Blueprint, request, jsonify, current_app
from models import db, Supplier, TransactionLog, LocationTransaction
from decorators import role_required
from utils.geoutils import haversine_distance, is_within_radius
from services.mpesa_service import initiate_vendor_payment

location_bp = Blueprint('location', __name__)

@location_bp.route('/verify-location', methods=['POST'])
@role_required('Field Agent')
def verify_location(current_user):
    """
    Verify if field agent is within 20 meters of a supplier and trigger B2C payment.
    
    Request JSON:
    {
        "user_lat": -1.286389,     # Field agent's latitude
        "user_lon": 36.817223,     # Field agent's longitude
        "supplier_id": 1,          # Supplier database ID
        "amount": 100              # Optional: payment amount (defaults to config value)
    }
    
    Flow:
        1. Validate request data
        2. Calculate distance to supplier
        3. If distance <= 20m:
           - Create transaction log with VERIFICATION_OK status
           - Initiate M-Pesa B2C payment to supplier
           - Update transaction with payment details
        4. If distance > 20m:
           - Create transaction log with VERIFICATION_FAIL status
           - Return error
    
    Returns:
        200: Payment sent successfully
        400: Validation errors
        403: Not a Field Agent
        404: Supplier not found
        422: Distance > 20m (verification failed)
        500: Payment processing error
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
        
        # Optional: payment amount (defaults to config value)
        payment_amount = data.get('amount', current_app.config.get('PAYMENT_AMOUNT', 100))
        
        # Validate coordinate ranges
        if not (-90 <= user_lat <= 90):
            return jsonify({'error': 'Latitude must be between -90 and 90'}), 400
        
        if not (-180 <= user_lon <= 180):
            return jsonify({'error': 'Longitude must be between -180 and 180'}), 400
        
        # 2. Fetch supplier from database
        supplier = Supplier.query.get(supplier_id)
        
        if not supplier:
            return jsonify({'error': 'Supplier not found'}), 404
        
        if not supplier.mpesa_phone_number:
            return jsonify({'error': 'Supplier does not have M-Pesa phone number configured'}), 400
        
        # 3. Calculate distance using Haversine formula
        distance = haversine_distance(
            user_lat, user_lon,
            supplier.latitude, supplier.longitude
        )
        
        current_app.logger.info(f"📍 Distance calculated: {distance:.2f}m (Threshold: 20m)")
        
        # 4. Check if within 20 meters
        is_within_20m = distance <= 20
        
        if not is_within_20m:
            # VERIFICATION FAILED - Log location attempt
            location_transaction = LocationTransaction(
                supplier_id=supplier_id,
                agent_id=current_user.get('user_id'),
                agent_latitude=user_lat,
                agent_longitude=user_lon,
                supplier_latitude=supplier.latitude,
                supplier_longitude=supplier.longitude,
                distance_meters=distance,
                status='OUT_OF_RANGE',
                threshold_meters=20.0
            )
            db.session.add(location_transaction)
            db.session.commit()
            
            current_app.logger.warning(f"❌ Verification failed: Distance {distance:.2f}m exceeds 20m")
            
            return jsonify({
                'verified': False,
                'distance': round(distance, 2),
                'message': f'Distance {round(distance, 2)}m exceeds 20m limit',
                'status': 'VERIFICATION_FAIL',
                'supplier': {
                    'id': supplier.id,
                    'name': supplier.name,
                    'supplier_id': supplier.supplier_id
                }
            }), 422  # 422 Unprocessable Entity
        
        # 5. VERIFICATION SUCCESSFUL - Create location verification record
        location_transaction = LocationTransaction(
            supplier_id=supplier_id,
            agent_id=current_user.get('user_id'),
            agent_latitude=user_lat,
            agent_longitude=user_lon,
            supplier_latitude=supplier.latitude,
            supplier_longitude=supplier.longitude,
            distance_meters=distance,
            status='VERIFIED',
            threshold_meters=20.0
        )
        db.session.add(location_transaction)
        db.session.commit()
        
        current_app.logger.info(f"✅ Verification successful! Distance: {distance:.2f}m")
        current_app.logger.info(f"💳 Initiating B2C payment of KES {payment_amount} to {supplier.mpesa_phone_number}")
        
        # 6. Initiate M-Pesa B2C payment
        payment_result = initiate_vendor_payment(
            phone_number=supplier.mpesa_phone_number,
            amount=payment_amount,
            supplier_id=supplier_id,
            agent_id=current_user.get('user_id'),
            remarks=f'Payment to {supplier.name} - Verified at {distance:.2f}m'
        )
        
        # 7. Link location transaction to payment and update status
        if payment_result.get('success'):
            # Payment created successfully in mpesa_service, link it to location verification
            transaction_id = payment_result.get('transaction_id')
            if transaction_id:
                location_transaction.mpesa_transaction_id = transaction_id
                db.session.commit()
            
            current_app.logger.info(f"✅ Payment sent successfully! Conversation ID: {payment_result.get('conversation_id')}")
            
            return jsonify({
                'verified': True,
                'distance': round(distance, 2),
                'status': 'PAYMENT_SENT',
                'message': 'Location verified and payment sent successfully!',
                'payment': {
                    'amount': payment_amount,
                    'currency': 'KES',
                    'recipient': supplier.mpesa_phone_number,
                    'conversation_id': payment_result.get('conversation_id'),
                    'transaction_id': payment_result.get('transaction_id')
                },
                'supplier': {
                    'id': supplier.id,
                    'name': supplier.name,
                    'supplier_id': supplier.supplier_id
                },
                'user_location': {
                    'latitude': user_lat,
                    'longitude': user_lon
                }
            }), 200
        else:
            # Payment failed - update location transaction status
            location_transaction.status = 'FAILED'
            db.session.commit()
            
            current_app.logger.error(f"❌ Payment failed: {payment_result.get('error')}")
            
            return jsonify({
                'verified': True,
                'distance': round(distance, 2),
                'status': 'PAYMENT_FAILED',
                'message': 'Location verified but payment failed',
                'error': payment_result.get('error'),
                'supplier': {
                    'id': supplier.id,
                    'name': supplier.name,
                    'supplier_id': supplier.supplier_id
                }
            }), 500
            
    except ValueError as e:
        current_app.logger.error(f"❌ Validation error: {str(e)}")
        return jsonify({'error': 'Invalid coordinate values'}), 400
    except Exception as e:
        # Log the error for debugging
        current_app.logger.error(f"❌ Location verification error: {str(e)}")
        return jsonify({'error': 'Internal server error', 'details': str(e)}), 500
        return jsonify({'error': 'Internal server error'}), 500