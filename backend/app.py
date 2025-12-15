from flask import Flask
from dotenv import load_dotenv
import os

# Import the app factory and db from __init__.py
from . import create_app, db  # relative import since __init__.py is in the same package

load_dotenv()

app = create_app()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)


