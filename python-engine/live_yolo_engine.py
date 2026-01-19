import cv2
import base64
import json
import argparse
import os
import websocket
from ultralytics import YOLO

# CONFIG
WS_URL = "ws://localhost:8081"
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(SCRIPT_DIR, "best.pt")

# Load YOLO model globally or in main? Better in start_yolo_stream or main
model = None

import time

def start_yolo_stream(source, stream_id):
    global model
    if model is None:
        print(f"Loading YOLO model from {MODEL_PATH}...")
        model = YOLO(MODEL_PATH)
    
    print(f"Starting persistent engine for {stream_id} with source: {source}")
    
    # Expand source to int if it's a digit (for webcam index)
    if source.isdigit():
        source = int(source)

    while True:  # Outer loop for overall process persistence
        ws = None
        try:
            # 1. Connect to WebSocket
            print(f"Connecting to WebSocket at {WS_URL}...")
            ws = websocket.WebSocket()
            ws.connect(WS_URL)
            print("Connected to WebSocket")

            # 2. Open Video Source
            cap = cv2.VideoCapture(source)
            if not cap.isOpened():
                print(f"Failed to open source: {source}. Retrying in 5 seconds...")
                time.sleep(5)
                continue

            print(f"Source {source} opened successfully")

            frame_count = 0
            while True:  # Inner loop for frame processing
                ret, frame = cap.read()
                if not ret:
                    print("Cannot read frame. Source might be disconnected. Retrying...")
                    # Try to release and re-open the capture
                    cap.release()
                    time.sleep(2)
                    cap = cv2.VideoCapture(source)
                    if not cap.isOpened():
                        break # Break inner loop to restart everything if source is truly gone
                    continue

                frame_count += 1
                # OPTIMIZATION: Process every 3rd frame (skip 2)
                if frame_count % 3 != 0:
                    continue

                # OPTIMIZATION: Resize to 640 width (maintain aspect ratio)
                h, w = frame.shape[:2]
                if w > 640:
                    scale = 640 / w
                    new_h = int(h * scale)
                    frame = cv2.resize(frame, (640, new_h))

                # Run YOLO detection
                results = model(frame, verbose=False)[0]
                for box in results.boxes:
                    x1, y1, x2, y2 = map(int, box.xyxy[0])
                    conf = float(box.conf[0])
                    cls_id = int(box.cls[0])
                    class_name = model.names.get(cls_id, f"Class {cls_id}")
                    
                    # Color based on confidence
                    if conf > 0.7:
                        color = (0, 255, 0)
                    elif conf > 0.5:
                        color = (0, 255, 255)
                    else:
                        color = (0, 165, 255)
                    
                    cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
                    label = f"{class_name} {conf:.0%}"
                    (label_w, label_h), baseline = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.5, 1)
                    cv2.rectangle(frame, (x1, y1 - label_h - 10), (x1 + label_w + 10, y1), color, -1)
                    cv2.putText(frame, label, (x1 + 5, y1 - 5), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 0), 1)

                # Encode to JPEG with lower quality for speed
                success, buffer = cv2.imencode(".jpg", frame, [int(cv2.IMWRITE_JPEG_QUALITY), 70])
                if not success:
                    continue

                jpg_base64 = base64.b64encode(buffer).decode("utf-8")

                # Create JSON payload
                payload = {
                    "streamId": stream_id,
                    "image": jpg_base64,
                    "count": len(results.boxes),
                    "timestamp": time.time()
                }

                # Send frame to Node WebSocket
                try:
                    ws.send(json.dumps(payload))
                except Exception as e:
                    print(f"WebSocket send error: {e}. Attempting to reconnect...")
                    break # Break inner loop to reconnect WebSocket
            
            cap.release()
        except Exception as e:
            print(f"Process Error: {e}. Restarting in 5 seconds...")
            time.sleep(5)
        finally:
            if ws:
                try:
                    ws.close()
                except:
                    pass

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--source", type=str, required=True, help="RTSP URL or Video File Path")
    parser.add_argument("--streamId", type=str, required=True, help="Unique ID for this stream session")
    args = parser.parse_args()

    start_yolo_stream(args.source, args.streamId)
