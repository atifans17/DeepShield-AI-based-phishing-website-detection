import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier, ExtraTreesClassifier
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
import joblib

df = pd.read_csv("data/features.csv")
df = df.dropna()

X = df.drop(columns=["label"])
y = df["label"]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

# Model 1: Random Forest
rf = RandomForestClassifier(n_estimators=200, random_state=42)
rf.fit(X_train, y_train)
rf_preds = rf.predict(X_test)
print("=== Random Forest ===")
print("Accuracy:", accuracy_score(y_test, rf_preds))
print(classification_report(y_test, rf_preds))

# Model 2: Extra Trees
et = ExtraTreesClassifier(n_estimators=200, random_state=42)
et.fit(X_train, y_train)
et_preds = et.predict(X_test)
print("=== Extra Trees ===")
print("Accuracy:", accuracy_score(y_test, et_preds))
print(classification_report(y_test, et_preds))

best_model = rf if accuracy_score(y_test, rf_preds) >= accuracy_score(y_test, et_preds) else et
joblib.dump(best_model, "model.pkl")
joblib.dump(list(X.columns), "feature_names.pkl")
print("\nSaved best model to model.pkl")