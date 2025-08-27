#!/usr/bin/env python3
"""
Stable Flask Backend for MedEngine
Hospital Readmission Prediction API
"""

import os
import sys
import traceback
from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import tempfile

# Add the backend directory to the Python path
backend_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, backend_dir)

try:
    from predict import HospitalReadmissionPredictor
    print("✅ Successfully imported HospitalReadmissionPredictor")
except ImportError as e:
    print(f"❌ Failed to import predictor: {e}")
    sys.exit(1)

# ------------------- FLASK APP -------------------
app = Flask(__name__)
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:3000", "http://localhost:3001"],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})

# Global predictor instance
predictor = None

def initialize_predictor():
    """Initialize the ML predictor with proper error handling"""
    global predictor
    try:
        print("🏥 Initializing Hospital Readmission Predictor...")
        predictor = HospitalReadmissionPredictor()
        print("✅ Predictor initialized successfully!")
        return True
    except Exception as e:
        print(f"❌ Failed to initialize predictor: {e}")
        traceback.print_exc()
        return False

# ------------------- ROUTES -------------------

@app.route('/')
def index():
    """Health check endpoint"""
    return jsonify({
        "message": "Hospital Readmission Predictor API is running!",
        "status": "healthy",
        "predictor_loaded": predictor is not None,
        "port": 5001
    })

@app.route('/health')
def health():
    """Detailed health check"""
    return jsonify({
        "status": "healthy",
        "predictor_loaded": predictor is not None,
        "features_count": 44 if predictor else 0,
        "endpoints": ["/", "/health", "/predict"]
    })

@app.route('/predict', methods=['POST', 'OPTIONS'])
def predict_patients():
    """Predict readmission for patients"""
    
    # Handle preflight OPTIONS request
    if request.method == 'OPTIONS':
        return '', 204
    
    if predictor is None:
        return jsonify({
            "success": False,
            "error": "ML predictor not initialized",
            "message": "Please restart the server"
        }), 500
    
    try:
        # Get JSON data
        data = request.get_json()
        if not data or 'patients' not in data:
            return jsonify({
                "success": False,
                "error": "Invalid request format",
                "message": "Expected JSON with 'patients' array"
            }), 400
        
        patients = data['patients']
        if not isinstance(patients, list) or len(patients) == 0:
            return jsonify({
                "success": False,
                "error": "Invalid patients data",
                "message": "Expected non-empty array of patients"
            }), 400
        
        print(f"📊 Processing {len(patients)} patients...")
        
        # Predict using the patients list directly
        predictions = predictor.predict_batch(patients)
        print(f"✅ Generated {len(predictions)} predictions")
        
        return jsonify({
            "success": True,
            "predictions": predictions,
            "message": f"Successfully processed {len(predictions)} patients"
        })
        
    except Exception as e:
        print(f"❌ Prediction error: {e}")
        traceback.print_exc()
        return jsonify({
            "success": False,
            "error": str(e),
            "message": "Internal server error during prediction"
        }), 500

@app.errorhandler(404)
def not_found(error):
    return jsonify({
        "success": False,
        "error": "Endpoint not found",
        "available_endpoints": ["/", "/health", "/predict"]
    }), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({
        "success": False,
        "error": "Internal server error",
        "message": "Please check server logs"
    }), 500

# ------------------- MAIN -------------------
if __name__ == '__main__':
    print("🚀 Starting MedEngine Flask Backend...")
    
    # Initialize predictor
    if not initialize_predictor():
        print("❌ Failed to initialize predictor. Exiting...")
        sys.exit(1)
    
    # Start Flask app
    try:
        print("🌐 Starting Flask server on http://127.0.0.1:5001")
        app.run(
            debug=True, 
            port=5001, 
            host='127.0.0.1',
            use_reloader=False  # Prevent double initialization in debug mode
        )
    except Exception as e:
        print(f"❌ Failed to start Flask app: {e}")
        traceback.print_exc()
        sys.exit(1)
