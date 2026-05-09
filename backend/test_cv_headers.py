#!/usr/bin/env python3
"""Test CV generation and inspect response headers"""
import requests

url = "http://localhost:8000/api/v1/cv/1/cv"

print("Testing CV generation endpoint...")
print(f"URL: {url}\n")

try:
    response = requests.get(url, stream=True)
    
    print(f"Status Code: {response.status_code}")
    print(f"\n=== Response Headers ===")
    for key, value in response.headers.items():
        print(f"{key}: {value}")
    
    # Check for duplicate Content-Disposition
    content_disp = response.headers.get('Content-Disposition', '')
    print(f"\n=== Content-Disposition ===")
    print(f"Value: {content_disp}")
    print(f"Count: {list(response.headers.items()).count(('Content-Disposition', content_disp))}")
    
    # Check content type
    content_type = response.headers.get('Content-Type', '')
    print(f"\n=== Content-Type ===")
    print(f"Value: {content_type}")
    
    # Save file
    if response.status_code == 200:
        with open('CV_Test_Headers.docx', 'wb') as f:
            f.write(response.content)
        print(f"\n✅ File saved: CV_Test_Headers.docx")
    else:
        print(f"\n❌ Error: {response.status_code}")
        print(response.text)
        
except Exception as e:
    print(f"❌ Error: {e}")
