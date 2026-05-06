import sqlite3
import urllib.request
import urllib.parse
import json
import os

# Find the database path from .env or settings
# For now, assume it's db_main.sqlite3 based on file list
DB_PATH = "db_main.sqlite3" 

def get_latest_otp(email):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    # Find user id
    cursor.execute("SELECT id FROM users_user WHERE email=?", (email,))
    user_id = cursor.fetchone()
    if not user_id:
        return None
    
    # Find latest OTP
    cursor.execute("SELECT otp FROM authentication_emailotp WHERE user_id=? ORDER BY created_at DESC LIMIT 1", (user_id[0],))
    otp = cursor.fetchone()
    conn.close()
    return otp[0] if otp else None

def test_verify_otp(email, otp):
    url = "http://localhost:8000/api/auth/verify-otp/"
    data = {"email": email, "otp": otp}
    json_data = json.dumps(data).encode('utf-8')
    req = urllib.request.Request(url, data=json_data, headers={'Content-Type': 'application/json'}, method='POST')
    
    try:
        with urllib.request.urlopen(req) as response:
            status = response.getcode()
            body = response.read().decode('utf-8')
            print(f"Verify Status Code: {status}")
            print(f"Verify Response Body: {body}")
            return True
    except Exception as e:
        print(f"Verify Error: {e}")
        return False

def test_login(email, password):
    url = "http://localhost:8000/api/auth/login/"
    data = {"email": email, "password": password}
    json_data = json.dumps(data).encode('utf-8')
    req = urllib.request.Request(url, data=json_data, headers={'Content-Type': 'application/json'}, method='POST')
    
    try:
        with urllib.request.urlopen(req) as response:
            status = response.getcode()
            body = response.read().decode('utf-8')
            print(f"Login Status Code: {status}")
            print(f"Login Response Body: {body}")
    except urllib.error.HTTPError as e:
        print(f"Login HTTP Error: {e.code}")
        print(f"Login Response Body: {e.read().decode('utf-8')}")
    except Exception as e:
        print(f"Login Error: {e}")

if __name__ == "__main__":
    email = "testuser_unique@example.com"
    otp = get_latest_otp(email)
    print(f"Fetched OTP: {otp}")
    if otp:
        if test_verify_otp(email, otp):
            print("Verification successful, testing login...")
            test_login(email, "Password123!")
    else:
        print("OTP not found in database.")
