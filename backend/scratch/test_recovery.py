import urllib.request
import urllib.parse
import json

BASE_URL = "http://localhost:8000"

def test_recovery():
    # 1. First signup
    email = "recover_test@example.com"
    data = {
        "email": email,
        "username": "recover_user",
        "full_name": "Recover User",
        "password": "Password123!"
    }
    json_data = json.dumps(data).encode('utf-8')
    req = urllib.request.Request(f"{BASE_URL}/api/users/auth/register/", data=json_data, headers={'Content-Type': 'application/json'}, method='POST')
    
    try:
        print("First signup attempt...")
        with urllib.request.urlopen(req) as response:
            print(f"First Status: {response.getcode()}")
    except Exception as e:
        print(f"First Error: {e}")

    # 2. Second signup (should resend OTP)
    try:
        print("\nSecond signup attempt (recovery)...")
        req2 = urllib.request.Request(f"{BASE_URL}/api/users/auth/register/", data=json_data, headers={'Content-Type': 'application/json'}, method='POST')
        with urllib.request.urlopen(req2) as response:
            status = response.getcode()
            body = response.read().decode('utf-8')
            print(f"Second Status Code: {status}")
            print(f"Second Response Body: {body}")
    except urllib.error.HTTPError as e:
        print(f"Second HTTP Error: {e.code}")
        print(f"Second Response Body: {e.read().decode('utf-8')}")
    except Exception as e:
        print(f"Second Error: {e}")

if __name__ == "__main__":
    test_recovery()
