import { spawn } from "child_process";
import path from "path";

// Keep track of active processes
const activeStreams = new Map();

export const startStream = (streamId, source) => {
  if (activeStreams.has(streamId)) {
    console.log(`Stream ${streamId} already running.`);
    return;
  }

  console.log(`Starting Python Engine for ${streamId} with source: ${source}`);

  // Path to python script (Adjust relative path as needed)
  // Assuming backend is at D:\...\backend and python-engine is D:\...\python-engine
  const pythonScript = path.resolve(process.cwd(), "../python-engine/live_yolo_engine.py");

  const pythonProcess = spawn("python", [
    pythonScript,
    "--source", source,
    "--streamId", streamId
  ]);

  pythonProcess.stdout.on("data", (data) => {
    console.log(`[Python ${streamId}]: ${data}`);
  });

  pythonProcess.stderr.on("data", (data) => {
    console.error(`[Python Err ${streamId}]: ${data}`);
  });

  pythonProcess.on("close", (code) => {
    console.log(`[Python ${streamId}] exited with code ${code}`);
    activeStreams.delete(streamId);
  });

  activeStreams.set(streamId, pythonProcess);
};

export const stopStream = (streamId) => {
  const process = activeStreams.get(streamId);
  if (process) {
    process.kill();
    activeStreams.delete(streamId);
    console.log(`Stopped stream ${streamId}`);
    return true;
  }
  return false;
};

export const getActiveStreams = () => {
  return Array.from(activeStreams.keys());
};

export const isStreamActive = (streamId) => {
  return activeStreams.has(streamId);
};
