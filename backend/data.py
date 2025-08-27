# Just run this part to create scaler.pkl
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
import pandas as pd
import joblib

# Load your dataset (change path as needed)
df = pd.read_csv('/Users/keerthevasan/Downloads/synthetic_dataset_corrected.csv')
selected_features = ['age_encoded', 'age_scaled', 'time_in_hospital_log',
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
       'diabetes_med']

X = df[selected_features]
y = df['readmitted']

# Same split as your training
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=0)

# Create and fit scaler exactly as in training
scaler = StandardScaler()
scaler.fit(X_train)

# Save it
joblib.dump(scaler, 'scaler.pkl')
print("✅ Scaler saved as scaler.pkl")