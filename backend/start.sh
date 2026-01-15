#!/bin/bash

# Quick Start Script for M-Pesa Integration Testing
# This script helps you start the server and run tests quickly

set -e  # Exit on error

echo "🚀 Geo-Verified Vendor Pay System - Quick Start"
echo "================================================"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if virtual environment exists
if [ ! -d ".venv" ] && [ ! -d "venv" ]; then
    echo -e "${RED}❌ Virtual environment not found!${NC}"
    echo "Creating virtual environment..."
    python3 -m venv .venv
    echo -e "${GREEN}✅ Virtual environment created${NC}"
fi

# Activate virtual environment
if [ -d ".venv" ]; then
    source .venv/bin/activate
elif [ -d "venv" ]; then
    source venv/bin/activate
fi

echo -e "${GREEN}✅ Virtual environment activated${NC}"

# Check if dependencies are installed
if ! python -c "import flask" 2>/dev/null; then
    echo -e "${YELLOW}📦 Installing dependencies...${NC}"
    pip install -r requirements.txt
    echo -e "${GREEN}✅ Dependencies installed${NC}"
else
    echo -e "${GREEN}✅ Dependencies already installed${NC}"
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo -e "${RED}❌ .env file not found!${NC}"
    echo "Please create .env file with M-Pesa credentials"
    exit 1
fi

echo -e "${GREEN}✅ Configuration file found${NC}"

# Check database
echo ""
echo "📊 Checking database..."
python -c "
from app import create_app
from models import db
app = create_app()
with app.app_context():
    try:
        db.engine.connect()
        print('${GREEN}✅ Database connection successful${NC}')
    except Exception as e:
        print('${RED}❌ Database connection failed:${NC}', e)
        exit(1)
" || exit 1

echo ""
echo "=========================================="
echo "Choose an option:"
echo "=========================================="
echo "1) Start Flask server"
echo "2) Run integration tests"
echo "3) Check database tables"
echo "4) View recent transactions"
echo "5) Exit"
echo "=========================================="
read -p "Enter choice [1-5]: " choice

case $choice in
    1)
        echo ""
        echo -e "${GREEN}🚀 Starting Flask server...${NC}"
        echo "Server will be available at: http://localhost:5000"
        echo "Press Ctrl+C to stop"
        echo ""
        python app.py
        ;;
    2)
        echo ""
        echo -e "${GREEN}🧪 Running integration tests...${NC}"
        echo ""
        python test_mpesa_integration.py
        ;;
    3)
        echo ""
        echo -e "${GREEN}📊 Checking database tables...${NC}"
        python -c "
from app import create_app
from models import db, User, Role, Supplier, TransactionLog
app = create_app()
with app.app_context():
    print(f'\n✅ Users: {User.query.count()}')
    print(f'✅ Roles: {Role.query.count()}')
    print(f'✅ Suppliers: {Supplier.query.count()}')
    print(f'✅ Transactions: {TransactionLog.query.count()}\n')
"
        ;;
    4)
        echo ""
        echo -e "${GREEN}📋 Recent transactions:${NC}"
        python -c "
from app import create_app
from models import db, TransactionLog
app = create_app()
with app.app_context():
    transactions = TransactionLog.query.order_by(TransactionLog.created_at.desc()).limit(5).all()
    if transactions:
        print('\nLast 5 transactions:')
        print('-' * 80)
        for tx in transactions:
            print(f'ID: {tx.id} | Status: {tx.status} | Distance: {tx.distance_meters}m | Amount: KES {tx.amount} | {tx.created_at}')
        print('-' * 80)
    else:
        print('\n⚠️  No transactions found')
    print()
"
        ;;
    5)
        echo "Goodbye!"
        exit 0
        ;;
    *)
        echo -e "${RED}Invalid option${NC}"
        exit 1
        ;;
esac
