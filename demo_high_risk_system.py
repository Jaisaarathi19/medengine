#!/usr/bin/env python3
"""
HIGH-RISK PATIENT SYSTEM DEMO
Demonstrates the complete workflow from CSV upload to doctor dashboard
"""

import requests
import json
import time
import random

def generate_demo_patient_data():
    """Generate sample hospital patient data for demo"""
    patients = []
    
    names = [
        "Sarah Johnson", "Michael Chen", "Emily Davis", "Robert Wilson",
        "Lisa Rodriguez", "David Kim", "Jennifer Brown", "James Miller",
        "Maria Garcia", "Christopher Lee", "Ashley Taylor", "Daniel Moore"
    ]
    
    specialties = [
        "Cardiology", "InternalMedicine", "Surgery", "Emergency/Trauma",
        "Family/GeneralPractice"
    ]
    
    diagnoses = [
        "Diabetes", "Circulatory", "Respiratory", "Digestive", 
        "Musculoskeletal", "Other", "Injury"
    ]
    
    for i, name in enumerate(names):
        # Create varying risk profiles
        if i < 3:  # High risk patients
            time_in_hospital = random.randint(7, 14)
            medications = random.randint(15, 25)
            lab_procedures = random.randint(40, 60)
        elif i < 7:  # Medium risk patients  
            time_in_hospital = random.randint(3, 7)
            medications = random.randint(8, 15)
            lab_procedures = random.randint(20, 40)
        else:  # Low risk patients
            time_in_hospital = random.randint(1, 3)
            medications = random.randint(1, 8)
            lab_procedures = random.randint(5, 20)
        
        patient = {
            "name": name,
            "age": random.randint(45, 85),
            "time_in_hospital": time_in_hospital,
            "num_lab_procedures": lab_procedures,
            "num_medications": medications,
            "num_procedures": random.randint(0, 5),
            "number_outpatient": random.randint(0, 3),
            "number_inpatient": random.randint(0, 2),
            "number_emergency": random.randint(0, 2),
            "medical_specialty": random.choice(specialties),
            "diag_1": random.choice(diagnoses),
            "diag_2": random.choice(diagnoses),
            "diag_3": random.choice(diagnoses),
            "change": random.choice(["Yes", "No"]),
            "diabetes_med": random.choice(["Yes", "No"]),
            "A1Ctest": random.choice(["Yes", "No"]),
            "glucose_test": random.choice(["Yes", "No"]),
        }
        patients.append(patient)
    
    return patients

def test_ml_backend():
    """Test if the ML backend is running and working"""
    print("🔍 Testing ML Backend Connection...")
    
    try:
        # Test health endpoint
        response = requests.get('http://localhost:5001', timeout=5)
        if response.status_code == 200:
            print("✅ Flask backend is running!")
            health_data = response.json()
            print(f"   Status: {health_data.get('status')}")
            print(f"   Predictor loaded: {health_data.get('predictor_loaded')}")
            return True
        else:
            print(f"❌ Backend returned status {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to Flask backend on port 5001")
        print("   Please run: python backend/stable_app.py")
        return False
    except Exception as e:
        print(f"❌ Backend test failed: {e}")
        return False

def demo_ml_prediction():
    """Demonstrate ML prediction with sample data"""
    print("\n🤖 Running ML Prediction Demo...")
    
    # Generate demo data
    demo_patients = generate_demo_patient_data()
    print(f"📊 Generated {len(demo_patients)} demo patients")
    
    # Send to ML backend
    try:
        response = requests.post(
            'http://localhost:5001/predict',
            json={"patients": demo_patients},
            headers={'Content-Type': 'application/json'},
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            predictions = result.get('predictions', [])
            
            print(f"✅ ML Prediction successful!")
            print(f"   Processed: {len(predictions)} patients")
            
            # Analyze results
            high_risk_count = 0
            medium_risk_count = 0
            low_risk_count = 0
            
            print(f"\n📋 PREDICTION RESULTS:")
            print(f"{'Patient':<20} {'Probability':<12} {'Risk Level':<12} {'Prediction'}")
            print("-" * 60)
            
            for i, pred in enumerate(predictions):
                if 'error' in pred:
                    continue
                    
                prob = pred.get('probabilities', {}).get('readmitted', 0)
                
                # Categorize by probability (matching frontend logic)
                if prob >= 0.70:
                    risk_level = "HIGH"
                    high_risk_count += 1
                elif prob >= 0.40:
                    risk_level = "MEDIUM"
                    medium_risk_count += 1
                else:
                    risk_level = "LOW"
                    low_risk_count += 1
                
                patient_name = demo_patients[i]['name']
                prediction = pred.get('predictions', {}).get('custom_threshold_0_4', {}).get('result', 'Unknown')
                
                print(f"{patient_name:<20} {prob:<12.3f} {risk_level:<12} {prediction}")
            
            print(f"\n📊 SUMMARY:")
            print(f"   🔴 High Risk: {high_risk_count} patients (≥70%)")
            print(f"   🟡 Medium Risk: {medium_risk_count} patients (40-69%)")
            print(f"   🟢 Low Risk: {low_risk_count} patients (<40%)")
            print(f"   💾 Would save to database: {high_risk_count + medium_risk_count} patients")
            
            return True
            
        else:
            print(f"❌ ML Prediction failed with status {response.status_code}")
            error_text = response.text
            print(f"   Error: {error_text}")
            return False
            
    except Exception as e:
        print(f"❌ ML Prediction demo failed: {e}")
        return False

def main():
    """Run the complete high-risk patient system demo"""
    print("🏥 HIGH-RISK PATIENT MONITORING SYSTEM DEMO")
    print("=" * 55)
    
    print("\n🔄 WORKFLOW OVERVIEW:")
    print("1. Admin uploads patient CSV data")
    print("2. ML backend processes and predicts readmission risk") 
    print("3. High/Medium risk patients saved to database")
    print("4. Doctors see high-risk patients in their dashboard")
    print("5. Real-time collaboration and status management")
    
    # Test backend connectivity
    if not test_ml_backend():
        print("\n❌ Demo cannot proceed without ML backend")
        print("🔧 SOLUTION: Run 'python backend/stable_app.py' in another terminal")
        return
    
    # Demonstrate ML prediction
    if demo_ml_prediction():
        print(f"\n🎉 DEMO SUCCESSFUL!")
        print(f"\n📋 NEXT STEPS FOR FULL SYSTEM TEST:")
        print("1. Open http://localhost:3001/login")
        print("2. Login as admin user")
        print("3. Go to Admin Dashboard")
        print("4. Upload the demo CSV data")
        print("5. Click 'Generate AI Prediction'")
        print("6. Check high-risk patients saved to database")
        print("7. Login as doctor to see high-risk patients panel")
        print("8. Test status management (Acknowledge → In Progress → Resolved)")
        print("9. Login as nurse to see coordinated patient info")
        
        print(f"\n✨ FEATURES DEMONSTRATED:")
        print("✅ Local ML model working with hospital data")
        print("✅ Risk categorization based on probabilities")
        print("✅ Batch processing of multiple patients") 
        print("✅ Ready for database integration")
        print("✅ Doctor/nurse dashboard integration prepared")
        
    else:
        print(f"\n⚠️  Demo had issues, but system components are ready")
        print("🔧 Check Flask backend logs for troubleshooting")

if __name__ == "__main__":
    main()
