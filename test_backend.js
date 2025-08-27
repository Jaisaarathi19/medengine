// Test if backend is working from JavaScript (like your frontend would)
async function testBackend() {
    console.log('🧪 Testing Flask Backend from JavaScript...');
    
    try {
        // Test basic connectivity
        const healthCheck = await fetch('http://localhost:5001');
        const healthData = await healthCheck.json();
        console.log('✅ Backend Health:', healthData);
        
        // Test prediction with minimal data
        const testData = {
            patients: [
                {
                    race: "Caucasian",
                    gender: "Female",
                    age: "[50-60)",
                    time_in_hospital: 3,
                    num_medications: 5,
                    diabetes_med: "No",
                    admission_type_id: 1,
                    discharge_disposition_id: 1,
                    admission_source_id: 1,
                    payer_code: "MC",
                    medical_specialty: "Cardiology",
                    num_lab_procedures: 10,
                    num_procedures: 0,
                    number_outpatient: 0,
                    number_emergency: 0,
                    number_inpatient: 0,
                    diag_1: "414",
                    diag_2: "414",
                    diag_3: "414",
                    number_diagnoses: 1,
                    max_glu_serum: "None",
                    A1Cresult: "None",
                    metformin: "No",
                    repaglinide: "No",
                    nateglinide: "No",
                    chlorpropamide: "No",
                    glimepiride: "No",
                    acetohexamide: "No",
                    glipizide: "No",
                    glyburide: "No",
                    tolbutamide: "No",
                    pioglitazone: "No",
                    rosiglitazone: "No",
                    acarbose: "No",
                    miglitol: "No",
                    troglitazone: "No",
                    tolazamide: "No",
                    examide: "No",
                    citoglipton: "No",
                    insulin: "No",
                    "glyburide-metformin": "No",
                    "glipizide-metformin": "No",
                    "glimepiride-pioglitazone": "No",
                    "metformin-rosiglitazone": "No",
                    "metformin-pioglitazone": "No",
                    change: "No",
                    readmitted: "<30"
                }
            ]
        };
        
        console.log('🤖 Testing ML Prediction...');
        const predictionResponse = await fetch('http://localhost:5001/predict', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(testData)
        });
        
        const predictionResult = await predictionResponse.json();
        console.log('📊 ML Prediction Result:', predictionResult);
        
        if (predictionResult.success) {
            console.log('🎉 SUCCESS! Backend is working perfectly!');
        } else {
            console.log('⚠️ Backend responded but prediction failed');
        }
        
    } catch (error) {
        console.log('❌ Error testing backend:', error);
    }
}

// Run the test
testBackend();
