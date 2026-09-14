import joblib
import shap
import pandas as pd

model = joblib.load("model.pkl")
feature_names = joblib.load("feature_names.pkl")

df = pd.read_csv("data/features.csv").dropna()
X = df.drop(columns=["label"])

explainer = shap.TreeExplainer(model)
shap_values = explainer.shap_values(X.iloc[:5])

print("SHAP values computed for 5 sample rows.")
print(shap_values)