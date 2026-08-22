# SmartGuard ML Service (YOLOv11 FastAPI)

This is the real-time AI computer vision microservice for the SmartGuard incident detection pipeline. It uses FastAPI for the API layer, OpenCV for video processing, and Ultralytics YOLOv11 for object detection.

## Prerequisites

- Python 3.8 or higher installed on your system.
- Visual C++ Redistributable installed (standard for OpenCV on Windows).

## Setup Instructions

### 1. Create a Python Virtual Environment
Navigate to the `python-service` directory and create a virtual environment:

```bash
cd python-service
python -m venv venv
```

Activate the virtual environment:
- **Windows (PowerShell):**
  ```powershell
  .\venv\Scripts\Activate.ps1
  ```
- **Windows (CMD):**
  ```cmd
  .\venv\Scripts\activate.bat
  ```
- **Linux/macOS:**
  ```bash
  source venv/bin/activate
  ```

### 2. Install Dependencies
Install all required libraries inside the virtual environment:

```bash
pip install -r requirements.txt
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env` if you haven't already:

```bash
copy .env.example .env
```

Ensure the values in `.env` match your local setup:
- `NEXTJS_API_URL`: The Next.js incidents ingestion API endpoint (e.g. `http://localhost:3000/api/incidents`).
- `NEXTJS_INTERNAL_API_KEY`: Must match the `INTERNAL_API_KEY` defined in Next.js's `.env.local` for authentication.
- `YOLO_MODEL_PATH`: Name or path to the YOLOv11 model file. If using standard pretrained model, keep it as `yolo11n.pt`.
- `FRAME_SKIP`: Process every Nth frame (default 10) to reduce compute overhead.
- `CONFIDENCE_THRESHOLD`: Only trigger alerts for detections above this confidence (e.g. `0.85`).
- `DETECTION_CLASSES`: Comma-separated list of target classes to monitor (defaults to `accident` for custom models, or set to `car,truck,motorcycle,bus` for COCO testing).

### 4. Running the Service
Start the server using `uvicorn`:

```bash
uvicorn main:app --reload --port 8000
```
FastAPI will start the server on `http://localhost:8000`. You can visit `http://localhost:8000/docs` to test endpoints via the interactive Swagger UI.

On the first run, if `yolo11n.pt` is specified and not found locally, Ultralytics YOLO will download the weights file from GitHub releases automatically.

---

## Pre-trained vs. Custom Fine-tuned Models

### 1. Default (Pre-trained COCO) Model Testing
The default `yolo11n.pt` weights are trained on the COCO dataset, which does not contain an `"accident"` class. It contains vehicle categories: `car`, `truck`, `motorcycle`, `bus`.
To test the pipeline end-to-end with normal camera feeds using the pre-trained model:
1. Open `python-service/.env`.
2. Change `DETECTION_CLASSES=accident` to `DETECTION_CLASSES=car,truck,motorcycle,bus`.
3. Select any traffic video in Next.js `/upload` sandbox and hit inference. It will flag vehicle detections as mock accidents for demonstration purposes.

### 2. Custom Fine-tuned Accident Model (Production)
For production deployment, you can fine-tune YOLOv11 on accident datasets (such as **DoTA** - Detection of Traffic Accidents, or **UCF Crime**).

#### Fine-Tuning Steps:
1. Prepare your dataset in YOLO format (images + labels) containing the class `accident`.
2. Train the model using the Ultralytics CLI:
   ```bash
   yolo detect train model=yolo11n.pt data=path/to/accident_dataset.yaml epochs=50 imgsz=640
   ```
3. Once training completes, find your fine-tuned weights at `runs/detect/train/weights/best.pt`.
4. Copy `best.pt` to the `python-service` directory.
5. In your `python-service/.env`, set:
   ```env
   YOLO_MODEL_PATH=best.pt
   DETECTION_CLASSES=accident
   ```
6. The service will now perform real inference using your custom weights and only trigger on actual accidents.

---

## API Endpoints Reference

### 1. Health Check
`GET /health`
- **Response:**
  ```json
  {
    "status": "ok",
    "model_loaded": true
  }
  ```

### 2. Video File Detection
`POST /detect-video`
- **Request:** Multi-part form-data with key `file` (contains video).
- **Process:** Saves the file temporarily, extracts frames every Nth step, runs YOLO inference, translates coordinates, reports incidents in real-time to Next.js API, and cleans up the temporary file.
- **Response:**
  ```json
  {
    "processed_frames": 45,
    "incidents_detected": 2,
    "incidents": [
      {
        "_id": "64fb5...",
        "incidentId": "d3b07384d113",
        "timestamp": "2026-06-19T11:22:16Z",
        "videoSource": "dashcam.mp4",
        "frameNumber": 30,
        "confidence": 0.91,
        "category": "Accident",
        "boundingBox": {
          "x": 320.5,
          "y": 240.2,
          "width": 100.0,
          "height": 80.5
        },
        "status": "Detected"
      }
    ]
  }
  ```

### 3. RTSP Camera Stream Ingestion
`POST /detect-rtsp`
- **Request:**
  ```json
  {
    "rtsp_url": "rtsp://username:password@ip_address:port/h264"
  }
  ```
- **Process:** Spawns a background process that establishes an OpenCV feed reader, performs YOLO inference, and posts incidents to MongoDB Atlas in real-time.
- **Response:** Returns immediate acknowledgment to prevent client timeouts:
  ```json
  {
    "status": "started",
    "message": "Processing RTSP stream..."
  }
  ```
