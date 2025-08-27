import requests
import json

# Test sample data
test_data = {
    "patients": [
        {
            "race": "Caucasian",
            "gender": "Female", 
            "age": "[70-80)",
            "admission_type_id": 6,
            "discharge_disposition_id": 25,
            "admission_source_id": 1,
            "time_in_hospital": 1,
            "payer_code": "MC",
            "medical_specialty": "Cardiology",
            "num_lab_procedures": 41,
            "num_procedures": 0,
            "num_medications": 1,
            "number_outpatient": 0,
            "number_emergency": 0,
            "number_inpatient": 0,
            "diag_1": "414",
            "diag_2": "414",
            "diag_3": "414",
            "number_diagnoses": 1,
            "max_glu_serum": "None",
            "A1Cresult": "None",
            "metformin": "No",
            "repaglinide": "No",
            "nateglinide": "No",
            "chlorpropamide": "No",
            "glimepiride": "No",
            "acetohexamide": "No",
            "glipizide": "No",
            "glyburide": "No",
            "tolbutamide": "No",
            "pioglitazone": "No",
            "rosiglitazone": "No",
            "acarbose": "No",
            "miglitol": "No",
            "troglitazone": "No",
            "tolazamide": "No",
            "examide": "No",
            "citoglipton": "No",
            "insulin": "No",
            "glyburide-metformin": "No",
            "glipizide-metformin": "No",
            "glimepiride-pioglitazone": "No",
            "metformin-rosiglitazone": "No",
            "metformin-pioglitazone": "No",
            "change": "No",
            "diabetes_med": "No",
            "readmitted": "<30"
        }
    ]
}

try:
    print("🧪 Testing Flask backend...")
    response = requests.post('http://localhost:5001/predict', 
                           json=test_data, 
                           headers={'Content-Type': 'application/json'}, 
                           timeout=10)
    print(f'✅ Status Code: {response.status_code}')
    print(f'📊 Response: {json.dumps(response.json(), indent=2)}')
except Exception as e:
    print(f'❌ Error: {e}')
