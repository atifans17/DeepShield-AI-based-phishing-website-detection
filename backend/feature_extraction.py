import pandas as pd
from urllib.parse import urlparse
import re
import whois
from datetime import datetime

def get_domain_age_days(host):
    try:
        w = whois.whois(host, timeout=5)
        creation = w.creation_date
        if isinstance(creation, list):
            creation = creation[0]
        if creation is None:
            return -1
        age_days = (datetime.now() - creation).days
        return age_days if age_days >= 0 else -1
    except Exception:
        return -1
def extract_features(url):
    try:
        parsed = urlparse(url if url.startswith("http") else "http://" + url)
    except Exception:
        return None

    host = parsed.netloc

    features = {
        "url_length": len(url),
        "has_ip": 1 if re.match(r"^\d{1,3}(\.\d{1,3}){3}$", host) else 0,
        "has_at_symbol": 1 if "@" in url else 0,
        "dash_count": host.count("-"),
        "dot_count": url.count("."),
        "subdomain_count": max(host.split(".").__len__() - 2, 0),
        # "uses_https": 1 if parsed.scheme == "https" else 0,
        "suspicious_words": 1 if re.search(r"login|verify|secure|update|account|confirm", parsed.path, re.I) else 0,
        "url_shortener": 1 if re.search(r"bit\.ly|tinyurl|t\.co|goo\.gl", host, re.I) else 0,
        "path_length": len(parsed.path),
        "domain_age_days": get_domain_age_days(host),
    }
    return features


if __name__ == "__main__":
    # Load your raw dataset - CHANGE these column names to match your CSV
    df = pd.read_csv("data/urls_raw.csv")

    # Print the columns so you can confirm the right names
    print("Columns found:", df.columns.tolist())

    URL_COLUMN = "url"
    LABEL_COLUMN = "type"

    print(df[LABEL_COLUMN].unique())

    df = df[df[LABEL_COLUMN].isin(["benign", "phishing"])]
    df[LABEL_COLUMN] = df[LABEL_COLUMN].map({"benign": 0, "phishing": 1})
    rows = []
    for _, row in df.iterrows():
        feats = extract_features(str(row[URL_COLUMN]))
        if feats is None:
            continue
        feats["label"] = row[LABEL_COLUMN]
        rows.append(feats)

    result_df = pd.DataFrame(rows)
    result_df.to_csv("data/features.csv", index=False)
    print(f"Done. Extracted features for {len(result_df)} URLs.")
    print(result_df.head())