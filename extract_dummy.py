import re
import os

with open("index.html", "r", encoding="utf-8") as f:
    html = f.read()

tenders_match = re.search(r"const TENDERS_RAW = (\[.*?\]);", html, flags=re.DOTALL)
rup_match = re.search(r"const RUP_RAW = (\[.*?\]);", html, flags=re.DOTALL)
experts_match = re.search(r"const EXPERTS_RAW = (\[.*?\]);", html, flags=re.DOTALL)

def to_python(js_str):
    # Add quotes around keys
    s = re.sub(r"([{,]\s*)([a-zA-Z0-9_]+)\s*:", r'\1"\2":', js_str)
    # Replace true/false
    s = s.replace(" true", " True").replace(" false", " False")
    s = s.replace(":true", ":True").replace(":false", ":False")
    return s

with open(r"lsi-tender-intel\backend\app\services\dummy_data.py", "w", encoding="utf-8") as f:
    f.write("TENDERS_RAW = " + to_python(tenders_match.group(1)) + "\n\n")
    f.write("RUP_RAW = " + to_python(rup_match.group(1)) + "\n\n")
    f.write("EXPERTS_RAW = " + to_python(experts_match.group(1)) + "\n")

print("Done")
