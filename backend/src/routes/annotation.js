import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { spawn } from "child_process";
import { fileURLToPath } from "url";

const router = express.Router();

// Get current directory dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define paths
// Backend root is two levels up from src/routes (backend/src/routes -> backend)
const BACKEND_ROOT = path.join(__dirname, "../../");
const UPLOADS_DIR = path.join(BACKEND_ROOT, "uploads");
const ANNOTATION_OUTPUT_DIR = path.join(BACKEND_ROOT, "current_annotation_output");

// Ensure upload directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Ensure output directory exists (cleanup logic might be needed per request in real app)
if (!fs.existsSync(ANNOTATION_OUTPUT_DIR)) {
    fs.mkdirSync(ANNOTATION_OUTPUT_DIR, { recursive: true });
}

// Multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, UPLOADS_DIR);
    },
    filename: function (req, file, cb) {
        // Keep original name but sanitize or timestamp to avoid collisions if needed
        // For now simple keep original for clarity in results
        cb(null, Date.now() + "-" + file.originalname);
    },
});

const upload = multer({ storage: storage });

// POST /api/annotation/upload - Upload images
router.post("/upload", upload.array("images", 50), (req, res) => {
    try {
        const files = req.files;
        if (!files || files.length === 0) {
            return res.status(400).json({ error: "No files uploaded" });
        }

        res.json({
            message: `Uploaded ${files.length} images successfully`,
            files: files.map(f => f.filename)
        });
    } catch (err) {
        console.error("Upload error:", err);
        res.status(500).json({ error: "Upload failed" });
    }
});

// POST /api/annotation/process - Trigger python script
router.post("/process", async (req, res) => {
    const { confidence = 0.25 } = req.body;

    // Python script path
    // Assumes python-engine is sibling to backend
    const PYTHON_ENGINE_DIR = path.join(BACKEND_ROOT, "../python-engine");
    const SCRIPT_PATH = path.join(PYTHON_ENGINE_DIR, "auto_annotate.py");

    console.log(`Starting annotation process...`);
    console.log(`Input: ${UPLOADS_DIR}`);
    console.log(`Output: ${ANNOTATION_OUTPUT_DIR}`);

    // Clean output directory before running (optional, but good for demo to show only fresh results)
    // For a multi-user app, we'd use session-based folders. staying simple for now.
    try {
        if (fs.existsSync(ANNOTATION_OUTPUT_DIR)) {
            fs.rmSync(ANNOTATION_OUTPUT_DIR, { recursive: true, force: true });
            fs.mkdirSync(ANNOTATION_OUTPUT_DIR);
        }
    } catch (e) {
        console.error("Error cleaning output dir", e);
    }

    // Spawn python process
    const pythonProcess = spawn("python", [
        SCRIPT_PATH,
        "--input", UPLOADS_DIR,
        "--output", ANNOTATION_OUTPUT_DIR,
        "--conf", str(confidence)
    ]);

    let scriptOutput = "";
    let scriptError = "";

    pythonProcess.stdout.on("data", (data) => {
        console.log(`[Python]: ${data}`);
        scriptOutput += data.toString();
    });

    pythonProcess.stderr.on("data", (data) => {
        console.error(`[Python Err]: ${data}`);
        scriptError += data.toString();
    });

    pythonProcess.on("close", (code) => {
        console.log(`Python script exited with code ${code}`);

        if (code !== 0) {
            return res.status(500).json({ error: "Annotation script failed", details: scriptError });
        }

        // Read result files to send back to frontend
        const visualizedDir = path.join(ANNOTATION_OUTPUT_DIR, "visualized");
        const labelDir = path.join(ANNOTATION_OUTPUT_DIR, "labels");

        let results = [];
        if (fs.existsSync(visualizedDir)) {
            const files = fs.readdirSync(visualizedDir);
            results = files.map(f => ({
                image: f,
                label: f.replace(path.extname(f), ".txt")
            }));
        }

        res.json({
            message: "Annotation complete",
            results: results
        });
    });
});

// GET /api/annotation/results - List results (optional, if we want to poll)
router.get("/results", (req, res) => {
    // implementation if needed
    res.json({ message: "Not implemented yet, use process response" });
});

// Helper to convert explicit str cast (was typo in python args above)
function str(val) {
    return String(val);
}

export default router;
