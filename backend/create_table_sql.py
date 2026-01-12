from backend.app import create_app
from backend.models import db

app = create_app()
with app.app_context():
    # Create the table directly using raw SQL
    create_table_sql = """
    CREATE TABLE IF NOT EXISTS transactions_log (
        id SERIAL PRIMARY KEY,
        supplier_id INTEGER NOT NULL,
        agent_id INTEGER NOT NULL,
        status VARCHAR(50) NOT NULL,
        distance_meters FLOAT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        mpesa_checkout_id VARCHAR(100),
        mpesa_receipt_number VARCHAR(100),
        phone_number VARCHAR(20),
        amount FLOAT,
        transaction_type VARCHAR(50),
        description TEXT,
        result_description TEXT,
        transaction_date TIMESTAMP
    )
    """
    db.session.execute(db.text(create_table_sql))
    db.session.commit()
    print('transactions_log table created!')
    
    # Verify
    result = db.session.execute(db.text("SELECT COUNT(*) FROM transactions_log"))
    print(f'Table has {result.scalar()} records')

