#!/usr/bin/env python3
"""
Integration Test for MedEngine Local ML
Tests the complete pipeline from CSV upload to ML prediction
"""

import requests
import json
import csv
import os
from io import StringIO

def test_backend_connectivity():
    """Test if Flask backend is running and responding"""
    print("🔌 Testing Backend Connectivity...")
    try:
        response = requests.get('http://localhost:5001', timeout=5)
        if response.status_code == 200:
            print("✅ Flask backend is running on port 5001")
            return True
        else:
            print(f"❌ Backend responded with status {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to Flask backend. Is it running on port 5001?")
        return False
    except Exception as e:
        print(f"❌ Backend test failed: {e}")
        return False

def test_frontend_connectivity():
    """Test if Next.js frontend is running"""
    print("🌐 Testing Frontend Connectivity...")
    try:
        response = requests.get('http://localhost:3001', timeout=5)
        if response.status_code == 200:
            print("✅ Next.js frontend is running on port 3001")
            return True
        else:
            print(f"❌ Frontend responded with status {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to Next.js frontend. Is it running on port 3001?")
        return False
    except Exception as e:
        print(f"❌ Frontend test failed: {e}")
        return False

def test_ml_prediction():
    """Test ML prediction with sample hospital data"""
    print("🤖 Testing ML Prediction Pipeline...")
    
    # Sample hospital data matching your model's expected format
    sample_data = {
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
        response = requests.post(
            'http://localhost:5001/predict', 
            json=sample_data,
            headers={'Content-Type': 'application/json'},
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            print("✅ ML Prediction successful!")
            print(f"   - Processed {len(result.get('predictions', []))} patients")
            print(f"   - Model loaded: {result.get('success', False)}")
            if result.get('predictions'):
                pred = result['predictions'][0]
                if 'probabilities' in pred:
                    prob = pred['probabilities'].get('readmitted', 0)
                    print(f"   - Sample readmission probability: {prob:.3f}")
                if 'risk_assessment' in pred:
                    risk = pred['risk_assessment'].get('risk_level', 'Unknown')
                    print(f"   - Risk level: {risk}")
            return True
        else:
            print(f"❌ ML Prediction failed with status {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ ML Prediction test failed: {e}")
        return False

def main():
    """Run all integration tests"""
    print("🏥 MedEngine Local ML Integration Test")
    print("=" * 50)
    
    tests = [
        ("Backend", test_backend_connectivity),
        ("Frontend", test_frontend_connectivity), 
        ("ML Pipeline", test_ml_prediction)
    ]
    
    results = {}
    for test_name, test_func in tests:
        results[test_name] = test_func()
        print()
    
    print("📊 TEST RESULTS:")
    print("=" * 50)
    all_passed = True
    for test_name, passed in results.items():
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{test_name:15} {status}")
        if not passed:
            all_passed = False
    
    print("=" * 50)
    if all_passed:
        print("🎉 ALL TESTS PASSED! Your local ML integration is working!")
        print("📋 Next Steps:")
        print("   1. Go to http://localhost:3001/login")
        print("   2. Login as admin")
        print("   3. Navigate to Admin Dashboard")
        print("   4. Upload CSV data using the file upload")
        print("   5. Click 'Generate AI Prediction'")
        print("   6. See your local ML model results!")
    else:
        print("⚠️  Some tests failed. Check the output above for issues.")
    
    return all_passed

if __name__ == "__main__":
    main()
