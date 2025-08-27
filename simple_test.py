import requests
import json

print("🔥 Testing Flask Backend Connection...")

try:
    # Simple GET request to test connectivity
    response = requests.get('http://localhost:5001', timeout=5)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    print("✅ Backend is responding!")
except Exception as e:
    print(f"❌ Connection failed: {e}")
