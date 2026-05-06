import urllib.request
import urllib.parse
import json

BASE_URL = "http://localhost:8000"

def test_register():
    url = f"{BASE_URL}/api/users/auth/register/"
    data = {
        "email": "testuser_unique@example.com",
        "username": "testuser_unique",
        "full_name": "Test User",
        "password": "Password123!"
    }
    json_data = json.dumps(data).encode('utf-8')
    req = urllib.request.Request(url, data=json_data, headers={'Content-Type': 'application/json'}, method='POST')
    
    try:
        with urllib.request.urlopen(req) as response:
            status = response.getcode()
            body = response.read().decode('utf-8')
            print(f"Status Code: {status}")
            print(f"Response Body: {body}")
    except urllib.error.HTTPError as e:
        print(f"HTTP Error: {e.code}")
        print(f"Response Body: {e.read().decode('utf-8')}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_register()
