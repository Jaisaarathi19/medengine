import requests
import json

print("🧪 Testing Flask Backend...")

try:
    # Test root endpoint
    response = requests.get('http://localhost:5001', timeout=5)
    print(f"✅ Backend Status: {response.status_code}")
    print(f"📝 Response: {response.text}")
    
    # Test prediction endpoint with minimal data
    test_data = {
        "patients": [
            {
                "race": "Caucasian",
                "gender": "Female",
                "age": "[50-60)",
                "time_in_hospital": 3,
                "num_medications": 5,
                "diabetes_med": "No"
            }
        ]
    }
    
    print("\n🤖 Testing ML Prediction...")
    pred_response = requests.post(
        'http://localhost:5001/predict',
        json=test_data,
        headers={'Content-Type': 'application/json'},
        timeout=10
    )
    
    print(f"✅ Prediction Status: {pred_response.status_code}")
    result = pred_response.json()
    print(f"📊 ML Result: {json.dumps(result, indent=2)}")
    
except Exception as e:
    print(f"❌ Error: {e}")
