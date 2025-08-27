#!/usr/bin/env python3
"""
Simple Flask server test to verify connectivity
"""

from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/')
def home():
    return jsonify({
        "status": "running",
        "message": "Flask backend is working!",
        "port": 5001
    })

@app.route('/test', methods=['POST', 'GET'])
def test():
    if request.method == 'POST':
        return jsonify({
            "method": "POST",
            "data": request.get_json(),
            "status": "success"
        })
    else:
        return jsonify({
            "method": "GET", 
            "status": "success"
        })

if __name__ == '__main__':
    print("🧪 Starting Simple Test Server on port 5001...")
    app.run(debug=True, port=5001, host='127.0.0.1')
