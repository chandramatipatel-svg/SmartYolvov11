import os
import uuid
import tempfile
import cv2
import requests
import uvicorn
from fastapi import FastAPI, File, UploadFile, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime, timezone
from dotenv import load_dotenv
from ultralytics import YOLO

# Load env variables
load_dotenv(override=True)

app = FastAPI(title="SmartGuard ML Service")

# Enable CORS for Next.js client integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration from environment variables
NEXTJS_API_URL = os.getenv("NEXTJS_API_URL", "http://localhost:3000/api/incidents")
NEXTJS_INTERNAL_API_KEY = os.getenv("NEXTJS_INTERNAL_API_KEY", "")
YOLO_MODEL_PATH = os.getenv("YOLO_MODEL_PATH", "yolo11n.pt")
FRAME_SKIP = int(os.getenv("FRAME_SKIP", "10"))
CONFIDENCE_THRESHOLD = float(os.getenv("CONFIDENCE_THRESHOLD", "0.5"))

# Accident detection: Look for vehicles and people (COCO classes that indicate traffic incidents)
# Default: car, truck, motorcycle, bus, person
DETECTION_CLASSES = os.getenv("DETECTION_CLASSES", "car,truck,motorcycle,bus,person")

# Parse classes to filter by
target_classes = [c.strip().lower() for c in DETECTION_CLASSES.split(",")]

# Load YOLO model
try:
    print(f"Initializing YOLO model from path: {YOLO_MODEL_PATH}...")
    model = YOLO(YOLO_MODEL_PATH)
    print("YOLO model loaded successfully.")
except Exception as e:
    print(f"Warning: YOLO model could not be loaded on startup. Reason: {e}")
    model = None

class RTSPPayload(BaseModel):
    rtsp_url: str

@app.get("/health")
def health():
    return {
        "status": "ok",
        "model_loaded": model is not None
    }

@app.post("/detect-video")
async def detect_video(file: UploadFile = File(...)):
    global model
    if model is None:
        # Try to lazy-load if it failed during startup
        try:
            model = YOLO(YOLO_MODEL_PATH)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"YOLO model is not loaded: {str(e)}")

    # Verify that the file is indeed a video (by MIME type or filename extension)
    if not file.content_type.startswith("video/"):
        ext = os.path.splitext(file.filename)[1].lower()
        if ext not in [".mp4", ".avi", ".mov", ".mkv", ".webm"]:
            raise HTTPException(status_code=400, detail="Uploaded file must be a valid video.")

    # Save uploaded file temporarily to process frames
    temp_dir = tempfile.gettempdir()
    temp_file_path = os.path.join(temp_dir, f"sg_{uuid.uuid4().hex}_{file.filename}")

    try:
        with open(temp_file_path, "wb") as buffer:
            while chunk := await file.read(1024 * 1024):  # 1MB chunks
                buffer.write(chunk)
    except Exception as e:
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)
        raise HTTPException(status_code=500, detail=f"Failed to save temporary video file: {str(e)}")

    # Run OpenCV video processing & YOLO inference
    cap = None
    try:
        cap = cv2.VideoCapture(temp_file_path)
        if not cap.isOpened():
            raise ValueError("Failed to open video file using OpenCV.")

        # Get video metadata
        fps = cap.get(cv2.CAP_PROP_FPS)
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        print(f"Processing video: {file.filename} ({total_frames} frames, {fps:.2f} FPS)")

        frame_count = 0
        processed_frames = 0
        incidents_detected = 0
        incidents = []

        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break

            frame_count += 1

            # Process only every Nth frame
            if frame_count % FRAME_SKIP != 0:
                continue

            processed_frames += 1

            # Run YOLO inference
            results = model(frame, verbose=False)
            if not results:
                continue

            result = results[0]
            orig_h, orig_w = frame.shape[:2]
            detections_in_frame = len(result.boxes)
            
            if detections_in_frame > 0:
                print(f"Frame {frame_count}: {detections_in_frame} detections found")

            for box in result.boxes:
                conf = float(box.conf[0])
                if conf < CONFIDENCE_THRESHOLD:
                    continue

                class_id = int(box.cls[0])
                label = model.names[class_id].lower()

                # Match class label
                if label in target_classes:
                    # Get xyxy coordinates (absolute pixel values)
                    xyxy = box.xyxy[0].tolist()
                    x1, y1, x2, y2 = xyxy

                    # Use actual frame dimensions instead of fixed 640x480
                    x_center = (x1 + x2) / 2
                    y_center = (y1 + y2) / 2
                    width = x2 - x1
                    height = y2 - y1

                    category_val = "Accident" if conf >= 0.85 else "Non-Accident"

                    incident_payload = {
                        "incidentId": str(uuid.uuid4()),
                        "timestamp": datetime.now(timezone.utc).isoformat(),
                        "videoSource": file.filename,
                        "frameNumber": frame_count,
                        "confidence": round(conf, 2),
                        "category": category_val,
                        "boundingBox": {
                            "x": round(x_center, 2),
                            "y": round(y_center, 2),
                            "width": round(width, 2),
                            "height": round(height, 2)
                        },
                        "status": "Detected"
                    }
                    
                    print(f"Detected {label} (confidence: {conf:.2f}) at frame {frame_count}")

                    # Post to Next.js API in real-time
                    try:
                        headers = {}
                        if NEXTJS_INTERNAL_API_KEY:
                            headers["X-Internal-API-Key"] = NEXTJS_INTERNAL_API_KEY
                        
                        response = requests.post(NEXTJS_API_URL, json=incident_payload, headers=headers, timeout=5)
                        if response.status_code == 201:
                            saved_incident = response.json()
                            incidents.append(saved_incident)
                            incidents_detected += 1
                        else:
                            print(f"Error posting incident (status {response.status_code}): {response.text}")
                            # Append payload fallback
                            incidents.append(incident_payload)
                            incidents_detected += 1
                    except Exception as post_err:
                        print(f"Connection error to Next.js backend: {post_err}")
                        incidents.append(incident_payload)
                        incidents_detected += 1

        return {
            "processed_frames": processed_frames,
            "incidents_detected": incidents_detected,
            "incidents": incidents,
            "video_info": {
                "filename": file.filename,
                "total_frames": total_frames,
                "fps": fps
            },
            "config": {
                "confidence_threshold": CONFIDENCE_THRESHOLD,
                "frame_skip": FRAME_SKIP,
                "detection_classes": target_classes
            }
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")

    finally:
        # Cleanup video stream resources
        if cap is not None:
            cap.release()
        # Always remove the temporary video file
        if os.path.exists(temp_file_path):
            try:
                os.remove(temp_file_path)
            except Exception as cleanup_err:
                print(f"Failed to remove temporary video file {temp_file_path}: {cleanup_err}")


def process_rtsp_stream(rtsp_url: str):
    global model
    if model is None:
        try:
            model = YOLO(YOLO_MODEL_PATH)
        except Exception as e:
            print(f"RTSP stream skipped. Failed to load model: {e}")
            return

    cap = cv2.VideoCapture(rtsp_url)
    if not cap.isOpened():
        print(f"Failed to connect to RTSP stream: {rtsp_url}")
        return

    frame_count = 0
    max_frames = int(os.getenv("MAX_RTSP_FRAMES", "1000"))
    print(f"Processing RTSP stream: {rtsp_url} (limit: {max_frames} frames)")

    while cap.isOpened() and frame_count < max_frames:
        ret, frame = cap.read()
        if not ret:
            print(f"Disconnected from RTSP stream: {rtsp_url}")
            break

        frame_count += 1

        if frame_count % FRAME_SKIP != 0:
            continue

        results = model(frame, verbose=False)
        if not results:
            continue

        result = results[0]
        orig_h, orig_w = frame.shape[:2]

        for box in result.boxes:
            conf = float(box.conf[0])
            if conf < CONFIDENCE_THRESHOLD:
                continue

            class_id = int(box.cls[0])
            label = model.names[class_id].lower()

            if label in target_classes:
                xyxy = box.xyxy[0].tolist()
                x1, y1, x2, y2 = xyxy

                x_scaled = (x1 / orig_w) * 640
                y_scaled = (y1 / orig_h) * 480
                w_scaled = ((x2 - x1) / orig_w) * 640
                h_scaled = ((y2 - y1) / orig_h) * 480

                category_val = "Accident" if conf >= 0.85 else "Non-Accident"

                incident_payload = {
                    "incidentId": str(uuid.uuid4()),
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                    "videoSource": rtsp_url,
                    "frameNumber": frame_count,
                    "confidence": round(conf, 2),
                    "category": category_val,
                    "boundingBox": {
                        "x": round(x_scaled, 2),
                        "y": round(y_scaled, 2),
                        "width": round(w_scaled, 2),
                        "height": round(h_scaled, 2)
                    },
                    "status": "Detected"
                }

                try:
                    headers = {}
                    if NEXTJS_INTERNAL_API_KEY:
                        headers["X-Internal-API-Key"] = NEXTJS_INTERNAL_API_KEY
                    
                    response = requests.post(NEXTJS_API_URL, json=incident_payload, headers=headers, timeout=5)
                    print(f"RTSP detection POST result (status {response.status_code})")
                except Exception as e:
                    print(f"Failed to POST RTSP incident to Next.js: {e}")

    cap.release()
    print(f"Closed RTSP stream: {rtsp_url}")


@app.post("/detect-rtsp")
async def detect_rtsp(payload: RTSPPayload, background_tasks: BackgroundTasks):
    global model
    if model is None:
        try:
            model = YOLO(YOLO_MODEL_PATH)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"YOLO model not loaded: {str(e)}")

    background_tasks.add_task(process_rtsp_stream, payload.rtsp_url)
    return {"status": "started", "message": f"Processing RTSP stream: {payload.rtsp_url}"}


if __name__ == "__main__":
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
