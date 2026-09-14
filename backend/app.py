from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import shap
import numpy as np
import pandas as pd
from feature_extraction import extract_features

app = Flask(__name__)
CORS(app)  # allows your React app (different port) to call this API

model = joblib.load("model.pkl")
feature_names = joblib.load("feature_names.pkl")
explainer = shap.TreeExplainer(model)

READABLE_LABELS = {
    "url_length": "URL length",
    "has_ip": "IP address used in host",
    "has_at_symbol": "'@' symbol present",
    "dash_count": "Hyphens in domain",
    "dot_count": "Dot count",
    "subdomain_count": "Subdomain depth",
    "uses_https": "Uses HTTPS",
    "suspicious_words": "Suspicious keywords in path",
    "url_shortener": "Known URL shortener",
    "path_length": "Path length",
}


@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json()
    url = data.get("url", "")

    feats = extract_features(url)
    if feats is None:
        return jsonify({"error": "Invalid URL"}), 400

    X = pd.DataFrame([feats])[feature_names]

    prediction = model.predict(X)[0]
    proba = model.predict_proba(X)[0][1]  # probability of "phishing" class

    raw_shap = explainer.shap_values(X)

    # SHAP's output shape differs across versions, so handle all three cases:
    if isinstance(raw_shap, list):
        # Older SHAP: list of arrays, one per class -> take the "phishing" class (index 1)
        contributions = raw_shap[1][0]
    elif np.array(raw_shap).ndim == 3:
        # Newer SHAP: shape (samples, features, classes) -> take the "phishing" class (index 1)
        contributions = raw_shap[0, :, 1]
    else:
        # Binary classifier returning a single array per sample
        contributions = raw_shap[0]

    # Flatten and force to plain Python floats in case any nested arrays remain
    contributions = np.array(contributions).flatten()

    signals = sorted(
        [
            {
                "key": f,
                "label": READABLE_LABELS.get(f, f),
                "value": int(X.iloc[0][f]),
                "contrib": float(c),
            }
            for f, c in zip(feature_names, contributions)
        ],
        key=lambda s: abs(s["contrib"]),
        reverse=True,
    )[:5]

    verdict = "danger" if proba >= 0.6 else "caution" if proba >= 0.3 else "safe"

    return jsonify({
        "verdict": verdict,
        "confidence": float(proba),
        "signals": signals,
        "raw": [
            {"key": f, "label": READABLE_LABELS.get(f, f), "value": int(X.iloc[0][f])}
            for f in feature_names
        ],
    })


if __name__ == "__main__":
    app.run(debug=True, port=5000)
