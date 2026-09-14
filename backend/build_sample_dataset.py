import pandas as pd
from feature_extraction import extract_features
import time

df = pd.read_csv("data/urls_raw.csv")

URL_COLUMN = "url"
LABEL_COLUMN = "type"

df = df[df[LABEL_COLUMN].isin(["benign", "phishing"])]
df[LABEL_COLUMN] = df[LABEL_COLUMN].map({"benign": 0, "phishing": 1})

# Balanced sample: 1500 of each class, adjust if you have time for more
sample_benign = df[df[LABEL_COLUMN] == 0].sample(n=1000, random_state=42)
sample_phishing = df[df[LABEL_COLUMN] == 1].sample(n=1000, random_state=42)
sample_df = pd.concat([sample_benign, sample_phishing]).sample(frac=1, random_state=42)

rows = []
for i, (_, row) in enumerate(sample_df.iterrows()):
    feats = extract_features(str(row[URL_COLUMN]))
    if feats is None:
        continue
    feats["label"] = row[LABEL_COLUMN]
    rows.append(feats)
    if i % 50 == 0:
        print(f"Processed {i}/{len(sample_df)}")
    time.sleep(0.1)  # small delay to avoid hammering WHOIS servers

result_df = pd.DataFrame(rows)
result_df.to_csv("data/features_with_age.csv", index=False)
print(f"Done. {len(result_df)} rows saved to features_with_age.csv")