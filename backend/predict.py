import pandas as pd
import numpy as np
import joblib
import os
import warnings
warnings.filterwarnings('ignore')

class HospitalReadmissionPredictor:
    """
    Perfect Hospital Readmission Predictor
    Loads trained Bagging SVM model and scaler for predictions
    """
    
    def __init__(self, model_path=None, scaler_path=None):
        """Initialize predictor with model and scaler"""
        
        # Use relative paths if not specified
        if model_path is None:
            model_path = os.path.join(os.path.dirname(__file__), 'bagging_svm_model_final.pkl')
        if scaler_path is None:
            scaler_path = os.path.join(os.path.dirname(__file__), 'scaler.pkl')
        
        # Define exact feature names from your training
        self.feature_names = [
            'age_encoded', 'age_scaled', 'time_in_hospital_log',
            'time_in_hospital_scaled', 'n_lab_procedures_capped',
            'n_lab_procedures_scaled', 'n_procedures_log',
            'n_procedures_log_scaled', 'n_medications_log', 'n_medications_scaled',
            'n_outpatient_binned', 'n_inpatient_bin', 'n_emergency_bin',
            'n_emergency_scaled', 'medspec_Cardiology', 'medspec_Emergency/Trauma',
            'medspec_Family/GeneralPractice', 'medspec_InternalMedicine',
            'medspec_Missing', 'medspec_Other', 'medspec_Surgery',
            'diag1_Circulatory', 'diag1_Diabetes', 'diag1_Digestive', 'diag1_Other',
            'diag1_Rare', 'diag1_Respiratory', 'diag2_Circulatory',
            'diag2_Diabetes', 'diag2_Other', 'diag2_Rare', 'diag2_Respiratory',
            'diag3_Circulatory', 'diag3_Diabetes', 'diag3_Other', 'diag3_Rare',
            'diag3_Respiratory', 'glucose_test', 'A1Ctest', 'change',
            'diabetes_med', 'n_procedures_binned_Low', 'n_medications_binned_Low',
            'n_medications_binned_Medium'
        ]
        
        print("🏥 Loading Hospital Readmission Predictor...")
        
        # Load model and scaler
        try:
            self.model = joblib.load(model_path)
            self.scaler = joblib.load(scaler_path)
            print("✅ Model and Scaler loaded successfully!")
            print(f"📊 Ready to predict with {len(self.feature_names)} features")
        except Exception as e:
            print(f"❌ Error loading files: {e}")
            raise
    
    def predict(self, patient_data, threshold=0.4, show_details=True):
        """
        Make prediction for a patient
        
        Args:
            patient_data (dict): Dictionary with patient features
            threshold (float): Custom threshold (default: 0.4 as in your training)
            show_details (bool): Whether to print detailed results
            
        Returns:
            dict: Complete prediction results
        """
        try:
            # Validate input
            if not isinstance(patient_data, dict):
                raise ValueError("patient_data must be a dictionary")
            
            # Check for missing features
            missing = set(self.feature_names) - set(patient_data.keys())
            if missing:
                raise ValueError(f"Missing required features: {list(missing)}")
            
            # Create DataFrame with correct feature order
            df = pd.DataFrame([patient_data])[self.feature_names]
            
            # Scale features using the saved scaler
            X_scaled = self.scaler.transform(df)
            
            # Get predictions
            probabilities = self.model.predict_proba(X_scaled)[0]
            prob_not_readmitted = probabilities[0]
            prob_readmitted = probabilities[1]
            
            # Default prediction (0.5 threshold)
            default_pred = self.model.predict(X_scaled)[0]
            
            # Custom threshold prediction
            custom_pred = int(prob_readmitted >= threshold)
            
            # Create result dictionary
            result = {
                'probabilities': {
                    'not_readmitted': round(prob_not_readmitted, 4),
                    'readmitted': round(prob_readmitted, 4)
                },
                'predictions': {
                    'default_threshold_0.5': {
                        'prediction': int(default_pred),
                        'result': 'READMITTED' if default_pred == 1 else 'NOT READMITTED'
                    },
                    f'custom_threshold_{threshold}': {
                        'prediction': custom_pred,
                        'result': 'READMITTED' if custom_pred == 1 else 'NOT READMITTED'
                    }
                },
                'risk_assessment': {
                    'readmission_probability': f"{prob_readmitted*100:.1f}%",
                    'risk_level': self._get_risk_level(prob_readmitted),
                    'confidence': 'High' if max(probabilities) > 0.7 else 'Medium' if max(probabilities) > 0.55 else 'Low'
                },
                'threshold_used': threshold
            }
            
            # Display results if requested
            if show_details:
                self._display_results(result)
            
            return result
            
        except Exception as e:
            error_msg = f"Prediction error: {str(e)}"
            print(f"❌ {error_msg}")
            return {'error': error_msg}
    
    def predict_batch(self, patients_list, threshold=0.4):
        """
        Predict for multiple patients
        
        Args:
            patients_list (list): List of patient dictionaries
            threshold (float): Custom threshold for all predictions
            
        Returns:
            list: List of prediction results
        """
        print(f"🔄 Processing {len(patients_list)} patients...")
        
        results = []
        for i, patient in enumerate(patients_list, 1):
            print(f"\n👤 Patient {i}:")
            result = self.predict(patient, threshold, show_details=False)
            result['patient_id'] = i
            results.append(result)
            
            if 'error' not in result:
                prob = result['probabilities']['readmitted']
                pred = result['predictions'][f'custom_threshold_{threshold}']['result']
                print(f"   Risk: {prob*100:.1f}% | Prediction: {pred}")
            else:
                print(f"   ❌ {result['error']}")
        
        return results
    
    def quick_predict(self, patient_data, threshold=0.4):
        """
        Quick prediction with minimal output
        
        Returns:
            tuple: (prediction_text, probability, risk_level)
        """
        result = self.predict(patient_data, threshold, show_details=False)
        
        if 'error' in result:
            return "ERROR", 0.0, "Unknown"
        
        pred_text = result['predictions'][f'custom_threshold_{threshold}']['result']
        probability = result['probabilities']['readmitted']
        risk_level = result['risk_assessment']['risk_level']
        
        return pred_text, probability, risk_level
    
    def _get_risk_level(self, probability):
        """Determine risk level based on probability"""
        if probability >= 0.7:
            return "HIGH RISK"
        elif probability >= 0.5:
            return "MEDIUM RISK"
        elif probability >= 0.3:
            return "LOW-MEDIUM RISK"
        else:
            return "LOW RISK"
    
    def _display_results(self, result):
        """Display formatted prediction results"""
        print("\n" + "="*60)
        print("🏥 HOSPITAL READMISSION PREDICTION RESULTS")
        print("="*60)
        
        # Probabilities
        prob_read = result['probabilities']['readmitted']
        prob_not = result['probabilities']['not_readmitted']
        print(f"📊 PROBABILITIES:")
        print(f"   • Readmission: {prob_read:.4f} ({prob_read*100:.1f}%)")
        print(f"   • No Readmission: {prob_not:.4f} ({prob_not*100:.1f}%)")
        
        # Predictions
        print(f"\n🎯 PREDICTIONS:")
        for threshold_name, pred_data in result['predictions'].items():
            threshold_display = threshold_name.replace('_', ' ').title()
            print(f"   • {threshold_display}: {pred_data['result']}")
        
        # Risk Assessment
        risk = result['risk_assessment']
        print(f"\n⚠️  RISK ASSESSMENT:")
        print(f"   • Risk Level: {risk['risk_level']}")
        print(f"   • Readmission Probability: {risk['readmission_probability']}")
        print(f"   • Prediction Confidence: {risk['confidence']}")
        
        print("="*60)
    
    def get_feature_template(self):
        """
        Get a template dictionary with all required features
        Useful for creating patient data dictionaries
        """
        template = {feature: 0.0 for feature in self.feature_names}
        
        print("📋 FEATURE TEMPLATE:")
        print("Copy this template and fill in the patient values:")
        print("\npatient_data = {")
        for i, feature in enumerate(self.feature_names):
            print(f"    '{feature}': 0.0,")
        print("}")
        
        return template


# =============================================================================
# PERFECT USAGE EXAMPLES
# =============================================================================
def example_usage(csv_file='/Users/keerthevasan/Documents/Study/medengine-main/backend/synthetic_dataset_sample.csv', threshold=0.4):
    """
    Load patient data from CSV and predict readmission risk for all patients
    Args:
        csv_file (str): Path to CSV file with patient features
        threshold (float): Custom threshold for predictions
    """
    print("🚀 INITIALIZING PREDICTOR...")
    predictor = HospitalReadmissionPredictor()
    
    # Load CSV
    try:
        df_patients = pd.read_csv(csv_file)
        print(f"📊 Loaded {len(df_patients)} patients from '{csv_file}'")
    except Exception as e:
        print(f"❌ Failed to load CSV: {e}")
        return
    
    # Convert Yes/No to 1/0 for all columns that might have it
    yes_no_columns = ['change', 'diabetes_med','A1Ctest','glucose_test']  # add any other binary columns here
    for col in yes_no_columns:
        if col in df_patients.columns:
            df_patients[col] = df_patients[col].map({'Yes': 1, 'No': 0}).fillna(0)
    # Convert each row to dictionary with correct features
    patient_dicts = []
    for i, row in df_patients.iterrows():
        patient_data = {}
        for feature in predictor.feature_names:
            patient_data[feature] = row.get(feature, 0.0)  # fill missing with 0
        patient_dicts.append(patient_data)
    
    # Predict in batch
    print("\n🔥 PREDICTING BATCH OF PATIENTS...")
    batch_results = predictor.predict_batch(patient_dicts, threshold=threshold)
    
    # Optional: save results to CSV
    results_to_save = []
    for i, res in enumerate(batch_results, 1):
        row = {'patient_id': i}
        row.update(res['probabilities'])
        row.update({k: v['prediction'] for k, v in res['predictions'].items()})
        row.update(res['risk_assessment'])
        results_to_save.append(row)
    
    output_csv = 'batch_predictions.csv'
    pd.DataFrame(results_to_save).to_csv(output_csv, index=False)
    print(f"\n✅ Batch predictions saved to '{output_csv}'")


# =============================================================================
# MAIN EXECUTION
# =============================================================================

if __name__ == "__main__":
    try:
        # Run perfect examples
        example_usage()
        
        print("\n" + "="*60)
        print("✅ PREDICTOR IS READY FOR USE!")
        print("="*60)
        print("\n🎯 TO USE IN YOUR CODE:")
        print("predictor = HospitalReadmissionPredictor()")
        print("result = predictor.predict(your_patient_data)")
        print("\n📋 TO GET FEATURE TEMPLATE:")
        print("template = predictor.get_feature_template()")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        print("\n🔧 TROUBLESHOOTING:")
        print("1. Make sure 'bagging_svm_model.pkl' exists")
        print("2. Make sure 'scaler.pkl' exists")
        print("3. Check file paths are correct")