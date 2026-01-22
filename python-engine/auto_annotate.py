import os
import cv2
import argparse
from ultralytics import YOLO
from pathlib import Path

# CONFIG
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DEFAULT_MODEL_PATH = os.path.join(SCRIPT_DIR, "best.pt")

def auto_annotate(input_dir, output_dir, model_path, conf_threshold):
    # Load model
    print(f"Loading model from {model_path}...")
    model = YOLO(model_path)
    
    # Create output directories
    output_path = Path(output_dir)
    labels_path = output_path / "labels"
    visualized_path = output_path / "visualized"
    
    labels_path.mkdir(parents=True, exist_ok=True)
    visualized_path.mkdir(parents=True, exist_ok=True)
    
    # Supported image extensions
    image_extensions = [".jpg", ".jpeg", ".png", ".bmp", ".webp"]
    
    input_path = Path(input_dir)
    images = [f for f in input_path.iterdir() if f.suffix.lower() in image_extensions]
    
    if not images:
        print(f"No images found in {input_dir}")
        return

    print(f"Found {len(images)} images. Starting auto-annotation...")

    for img_file in images:
        print(f"Processing {img_file.name}...")
        
        # Read image
        frame = cv2.imread(str(img_file))
        if frame is None:
            print(f"  Warning: Could not read {img_file.name}")
            continue
            
        h, w, _ = frame.shape
        
        # Run inference
        results = model(frame, conf=conf_threshold, verbose=False)[0]
        
        # Generate YOLO format txt: <class_id> <x_center> <y_center> <width> <height>
        # Normalized to 0.0 - 1.0
        label_file = labels_path / f"{img_file.stem}.txt"
        
        with open(label_file, "w") as f:
            for box in results.boxes:
                # Get coordinates in xywh (normalized)
                xywhn = box.xywhn[0].tolist() 
                cls_id = int(box.cls[0])
                
                # Write to file
                line = f"{cls_id} {' '.join(map(str, xywhn))}\n"
                f.write(line)
                
                # Draw on visualized copy
                x1, y1, x2, y2 = map(int, box.xyxy[0])
                conf = float(box.conf[0])
                class_name = model.names.get(cls_id, f"Class {cls_id}")
                
                color = (0, 255, 0) # Green
                cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
                label = f"{class_name} {conf:.2f}"
                cv2.putText(frame, label, (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)

        # Save visualized image
        cv2.imwrite(str(visualized_path / img_file.name), frame)

    print(f"Done! Annotations saved to {labels_path}")
    print(f"Visualizations saved to {visualized_path}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Auto-annotate images using a YOLO model")
    parser.add_argument("--input", type=str, required=True, help="Directory containing images to annotate")
    parser.add_argument("--output", type=str, default="auto_annotations", help="Directory to save labels and visualizations")
    parser.add_argument("--model", type=str, default=DEFAULT_MODEL_PATH, help="Path to the YOLO model (.pt)")
    parser.add_argument("--conf", type=float, default=0.25, help="Confidence threshold for detections")
    
    args = parser.parse_args()
    
    auto_annotate(args.input, args.output, args.model, args.conf)
