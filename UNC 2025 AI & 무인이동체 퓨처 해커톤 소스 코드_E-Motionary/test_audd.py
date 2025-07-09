import requests
import os

# Test Audd.io API
AUDD_API_TOKEN = "743e00d420dcbb966e64cdd026c34d63"

def test_audd_api():
    """Test the Audd.io API with a simple request"""
    
    # Test with a small audio file (1 second of silence)
    # This is a minimal WAV file with 1 second of silence
    audio_data = b'RIFF$\x00\x00\x00WAVEfmt \x10\x00\x00\x00\x01\x00\x01\x00D\xac\x00\x00\x88X\x01\x00\x02\x00\x10\x00data\x00\x00\x00\x00'
    
    files = {'file': ('test.wav', audio_data, 'audio/wav')}
    data = {'api_token': AUDD_API_TOKEN}
    
    try:
        print("Testing Audd.io API...")
        resp = requests.post('https://api.audd.io/', data=data, files=files)
        print(f"Response status: {resp.status_code}")
        print(f"Response: {resp.json()}")
        
        if resp.status_code == 200:
            result = resp.json()
            if result.get('result'):
                print("✅ API is working correctly")
            else:
                print("⚠️ API responded but no result (expected for silence)")
        else:
            print("❌ API request failed")
            
    except Exception as e:
        print(f"❌ Error testing API: {e}")

if __name__ == "__main__":
    test_audd_api() 