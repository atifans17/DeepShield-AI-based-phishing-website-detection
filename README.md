# DeepShield — Phishing URL Risk Detector

A machine learning system that scores URLs for phishing risk in real time, with human-readable explanations for each prediction.

## Overview

DeepShield extracts lexical and structural features from a URL, classifies it using a trained ensemble model, and surfaces the top factors driving each prediction using SHAP (SHapley Additive exPlanations). The goal is a tool that doesn't just flag a link as risky, but shows *why* — reducing the "black box" trust gap common in ML-based security tools.

## Tech Stack

- **Backend / ML**: Python, scikit-learn, SHAP, Flask
- **Frontend**: React, Tailwind CSS
- **Data**: PhishTank / UNB benign-legitimate URL corpus

## How It Works

1. **Feature extraction** — Each URL is parsed into a set of lexical and structural features: URL length, path length, dot count, hyphen count, subdomain depth, presence of an IP address, presence of an `@` symbol, use of known URL shorteners, and suspicious keywords in the path (e.g. "login," "verify," "secure").
2. **Classification** — The feature set is passed to a trained Random Forest / Extra Trees ensemble, which outputs a phishing probability.
3. **Explainability** — SHAP computes each feature's contribution to that specific prediction, ranked and surfaced to the user as a signal breakdown.
4. **Interface** — A React frontend lets a user paste a URL and see a risk verdict, confidence score, ranked signals, and the raw extracted features.

## Model Performance

Trained and evaluated on a labeled corpus of ~500K benign and phishing URLs, with an 80/20 train/test split.

- **Accuracy**: 91.9%
- **Precision (phishing class)**: 0.81
- **Recall (phishing class)**: 0.72

Recall is reported explicitly alongside accuracy because the dataset is imbalanced and missing an actual phishing URL is the more costly error for this use case.

## Known Limitations

- The model relies on lexical and structural URL features only; it does not inspect live page content, SSL certificate metadata, or domain registration history. This limits detection of phishing sites that mimic legitimate URL structure closely.
- Short, unusual-but-legitimate URLs can occasionally be misclassified, since several features (URL length, path length) are useful but imperfect proxies for risk.

## Next Steps

- Incorporate domain registration age and WHOIS-based signals
- Add HTML/DOM-based features from live page content
- Package as a browser extension for pre-load risk scoring
- Add a persistence layer to log and review scan history over time


## Model Setup

Due to GitHub's file size constraints for Git trees (>100 MB), the pre-trained model weights (`model.pkl`, ~535 MB) are hosted externally.

1. Download the pre-trained model:
   - [Download via GitHub Release](https://github.com/atifans17/DeepShield-AI-based-phishing-website-detection/releases/download/v1.0.0/model.pkl)
   

2. Move the downloaded file into the backend directory:
   ```bash
   mv model.pkl backend/