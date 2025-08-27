import pandas as pd

# Load your large CSV
df = pd.read_csv('/Users/keerthevasan/Downloads/synthetic_dataset_corrected.csv')

# Sample 10 random rows
df_sample = df.sample(n=10, random_state=42)  # random_state ensures reproducibility

# Save to a new CSV
df_sample.to_csv('/Users/keerthevasan/Documents/Study/medengine-main/backend/synthetic_dataset_sample.csv', index=False)

print("✅ Sample CSV with 10 rows saved!")
