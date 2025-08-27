# app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
from predict import HospitalReadmissionPredictor
import pandas as pd
import os
import tempfile

# ------------------- FLASK APP -------------------
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes
predictor = HospitalReadmissionPredictor()

# ------------------- ROUTES -------------------

@app.route('/')
def index():
    return jsonify({"message": "Hospital Readmission Predictor API is running!"})


@app.route('/predict', methods=['POST'])
def predict_patients():
    """
    Accepts either:
      - JSON payload: {"patients": [ {feature_dict}, ... ]}
      - File upload: CSV file with patient features
    Returns batch predictions in JSON format.
    """
    # ---- CASE 1: JSON ----
    if request.is_json:
        data = request.get_json()
        if not data or 'patients' not in data:
            return jsonify({"error": 'Missing "patients" in JSON payload'}), 400
        
        patients = data['patients']
        if not isinstance(patients, list):
            return jsonify({"error": '"patients" must be a list'}), 400

    # ---- CASE 2: FILE UPLOAD ----
    elif 'file' in request.files:
        file = request.files['file']
        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400

        try:
            df = pd.read_csv(file)

            # Convert Yes/No columns to 1/0
            yes_no_cols = ['change', 'diabetes_med','A1Ctest','glucose_test']
            for col in yes_no_cols:
                if col in df.columns:
                    df[col] = df[col].map({'Yes': 1, 'No': 0}).fillna(0)

            # Convert DataFrame to list of dicts
            patients = []
            for _, row in df.iterrows():
                patient_data = {feature: row.get(feature, 0.0) for feature in predictor.feature_names}
                patients.append(patient_data)
        except Exception as e:
            return jsonify({"error": f"Failed to read CSV: {str(e)}"}), 400

    else:
        return jsonify({"error": "No JSON payload or file uploaded"}), 400

    # ---- RUN PREDICTIONS ----
    try:
        results = predictor.predict_batch(patients)
        return jsonify({"success": True, "predictions": results})
    except Exception as e:
        return jsonify({"error": f"Prediction failed: {str(e)}"}), 500


# ------------------- RUN APP -------------------
if __name__ == '__main__':
    # Flask runs on localhost:5000 by default
    app.run(debug=True, port=5001)
