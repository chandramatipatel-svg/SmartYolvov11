import requests
import os

def test_pipeline():
    url = "http://localhost:8000/detect-video"
    video_path = "test_video.mp4"

    if not os.path.exists(video_path):
        print(f"Error: {video_path} not found.")
        return

    print(f"Sending {video_path} to {url}...")
    try:
        with open(video_path, "rb") as f:
            files = {"file": (video_path, f, "video/mp4")}
            response = requests.post(url, files=files, timeout=60)
            
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            print("Response JSON:")
            print(response.json())
        else:
            print("Response Text:")
            print(response.text)
    except Exception as e:
        print(f"Request failed: {e}")

if __name__ == "__main__":
    test_pipeline()
