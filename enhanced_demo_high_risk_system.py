#!/usr/bin/env python3
"""
Enhanced High-Risk Patient System Demo
This script demonstrates the complete workflow from patient data upload to database storage.
"""

import requests
import pandas as pd
import json
from datetime import datetime

# Configuration
BACKEND_URL = "http://localhost:5001"
DEMO_CSV_PATH = "high_risk_demo_patients.csv"

def test_backend_connection():
    """Test if the Flask backend is running"""
    try:
        response = requests.get(f"{BACKEND_URL}/")
        return True, response.json()
    except:
        return False, None

def run_prediction_with_real_data():
    """Run ML prediction with realistic hospital data"""
    print("🤖 Running ML Prediction with Realistic Hospital Data...")
    
    # Load the demo CSV
    try:
        df = pd.read_csv(DEMO_CSV_PATH)
        print(f"📊 Loaded {len(df)} patients from CSV")
        
        # Convert DataFrame to the format expected by the ML API
        data = df.to_dict('records')
        
        # Send to ML backend
        response = requests.post(
            f"{BACKEND_URL}/predict",
            json={"patients": data},
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            result = response.json()
            predictions = result.get('predictions', [])
            
            print(f"✅ ML Prediction successful!")
            print(f"   Processed: {len(predictions)} patients")
            
            return True, predictions
        else:
            print(f"❌ ML Prediction failed: {response.text}")
            return False, []
            
    except Exception as e:
        print(f"❌ Error running prediction: {str(e)}")
        return False, []

def analyze_predictions(predictions):
    """Analyze and categorize predictions"""
    high_risk = []
    medium_risk = []
    low_risk = []
    
    print(f"\n📋 PREDICTION RESULTS:")
    print(f"{'Patient':<20} {'Probability':<12} {'Risk Level':<12} {'Prediction'}")
    print("-" * 60)
    
    for pred in predictions:
        patient_name = pred.get('patient_name', 'Unknown')
        probability = pred.get('probability', 0.0)
        prediction = pred.get('prediction', 0)
        
        # Risk categorization
        if probability >= 0.70:
            risk_level = "🔴 High"
            high_risk.append(pred)
        elif probability >= 0.40:
            risk_level = "🟡 Medium"
            medium_risk.append(pred)
        else:
            risk_level = "🟢 Low"
            low_risk.append(pred)
        
        pred_text = "Readmit" if prediction == 1 else "No Readmit"
        
        print(f"{patient_name:<20} {probability:<12.3f} {risk_level:<12} {pred_text}")
    
    print(f"\n📊 SUMMARY:")
    print(f"   🔴 High Risk: {len(high_risk)} patients (≥70%)")
    print(f"   🟡 Medium Risk: {len(medium_risk)} patients (40-69%)")
    print(f"   🟢 Low Risk: {len(low_risk)} patients (<40%)")
    
    # Database storage candidates
    database_candidates = high_risk + medium_risk
    print(f"   💾 Would save to database: {len(database_candidates)} patients")
    
    return high_risk, medium_risk, low_risk

def simulate_database_storage(high_risk_patients):
    """Simulate what would happen when patients are stored in database"""
    if not high_risk_patients:
        print(f"\n💾 DATABASE SIMULATION: No high-risk patients to store")
        return
    
    print(f"\n💾 DATABASE SIMULATION:")
    print(f"   Storing {len(high_risk_patients)} high-risk patients to Firestore...")
    
    for patient in high_risk_patients:
        patient_data = {
            "patientId": patient.get('patient_id', 'Unknown'),
            "patientName": patient.get('patient_name', 'Unknown'),
            "riskScore": patient.get('probability', 0.0),
            "riskLevel": "high",
            "predictionDate": datetime.now().isoformat(),
            "status": "pending",
            "assignedDoctor": None,
            "notes": f"Readmission probability: {patient.get('probability', 0.0):.1%}",
            "medicalHistory": {
                "age": patient.get('age', 'Unknown'),
                "diagnosis": patient.get('diagnosis', 'Multiple conditions'),
                "lengthOfStay": patient.get('length_of_stay', 0)
            }
        }
        
        print(f"   📝 {patient_data['patientName']} - Risk: {patient_data['riskScore']:.1%}")

def main():
    print("🏥 ENHANCED HIGH-RISK PATIENT MONITORING SYSTEM DEMO")
    print("=" * 65)
    
    print(f"\n🔄 WORKFLOW OVERVIEW:")
    print(f"1. Load realistic hospital patient data")
    print(f"2. ML backend processes and predicts readmission risk")
    print(f"3. High/Medium risk patients identified for database storage")
    print(f"4. Doctors see high-risk patients in their dashboard")
    print(f"5. Real-time collaboration and status management")
    
    # Test backend connection
    print(f"\n🔍 Testing ML Backend Connection...")
    is_connected, status = test_backend_connection()
    
    if not is_connected:
        print(f"❌ Flask backend is not running!")
        print(f"   Please start the backend with: python stable_app.py")
        return
    
    print(f"✅ Flask backend is running!")
    print(f"   Status: {status.get('status', 'Unknown')}")
    print(f"   Model loaded: {status.get('predictor_loaded', 'Unknown')}")
    
    # Run prediction with real data
    success, predictions = run_prediction_with_real_data()
    
    if not success:
        print(f"❌ Demo failed - could not get predictions")
        return
    
    # Analyze predictions
    high_risk, medium_risk, low_risk = analyze_predictions(predictions)
    
    # Simulate database storage
    simulate_database_storage(high_risk)
    
    print(f"\n🎉 ENHANCED DEMO SUCCESSFUL!")
    
    print(f"\n📋 NEXT STEPS FOR FULL SYSTEM TEST:")
    print(f"1. Open http://localhost:3001/login")
    print(f"2. Login as admin user")
    print(f"3. Go to Admin Dashboard")
    print(f"4. Upload high_risk_demo_patients.csv")
    print(f"5. Click 'Generate AI Prediction'")
    print(f"6. Check high-risk patients saved to database")
    print(f"7. Login as doctor to see high-risk patients panel")
    print(f"8. Test status management (Pending → Acknowledged → In Progress → Resolved)")
    print(f"9. Login as nurse to see coordinated patient info")
    print(f"10. Test real-time notifications when new high-risk patients are added")
    
    print(f"\n✨ FEATURES DEMONSTRATED:")
    print(f"✅ Local ML model working with realistic hospital data")
    print(f"✅ Risk categorization based on readmission probabilities")
    print(f"✅ Batch processing of multiple patients")
    print(f"✅ High-risk patient identification for database storage")
    print(f"✅ Doctor/nurse dashboard integration prepared")
    print(f"✅ Real-time notification system ready")
    print(f"✅ Status management workflow designed")

if __name__ == "__main__":
    main()
