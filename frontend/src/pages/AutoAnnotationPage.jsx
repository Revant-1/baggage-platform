import React, { useState } from "react";
import { Upload, FileText, CheckCircle, AlertCircle, Loader } from "lucide-react";

// You can move this to a config file later
const API_URL = "http://localhost:5000";

const AutoAnnotationPage = () => {
    const [files, setFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [results, setResults] = useState(null);
    const [error, setError] = useState(null);
    const [confidence, setConfidence] = useState(0.25);

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        if (e.dataTransfer.files) {
            setFiles(Array.from(e.dataTransfer.files));
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files) {
            setFiles(Array.from(e.target.files));
        }
    };

    const handleUploadAndProcess = async () => {
        if (files.length === 0) return;

        setUploading(true);
        setError(null);
        setResults(null);

        const formData = new FormData();
        files.forEach((file) => {
            formData.append("images", file);
        });

        try {
            // 1. Upload
            const uploadRes = await fetch(`${API_URL}/api/annotation/upload`, {
                method: "POST",
                body: formData,
            });

            if (!uploadRes.ok) throw new Error("Upload failed");

            setUploading(false);
            setProcessing(true);

            // 2. Process
            const processRes = await fetch(`${API_URL}/api/annotation/process`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ confidence }),
            });

            if (!processRes.ok) throw new Error("Processing failed");

            const data = await processRes.json();
            setResults(data.results);
        } catch (err) {
            setError(err.message);
        } finally {
            setUploading(false);
            setProcessing(false);
        }
    };

    return (
        <div className="p-8 text-white min-h-screen bg-[#0f1015]">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold mb-2">Auto-Annotation Tool</h1>
                <p className="text-gray-400 mb-8">
                    Upload images to automatically generate YOLO labels using the server model.
                </p>

                {/* CONTROLS */}
                <div className="bg-[#1a1c24] p-6 rounded-xl border border-gray-800 mb-8">
                    <div className="flex flex-col md:flex-row gap-8 items-start">

                        {/* DROP ZONE */}
                        <div
                            className="flex-1 w-full border-2 border-dashed border-gray-700 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:border-[#F39C12] transition-colors cursor-pointer"
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                            onClick={() => document.getElementById("fileInput").click()}
                        >
                            <input
                                id="fileInput"
                                type="file"
                                multiple
                                accept="image/*"
                                className="hidden"
                                onChange={handleFileChange}
                            />
                            <Upload size={48} className="text-gray-500 mb-4" />
                            <p className="text-lg font-medium">Drag & Drop images here</p>
                            <p className="text-sm text-gray-500">or click to browse</p>
                            {files.length > 0 && (
                                <div className="mt-4 bg-[#F39C12]/10 text-[#F39C12] px-4 py-2 rounded-full text-sm font-medium">
                                    {files.length} images selected
                                </div>
                            )}
                        </div>

                        {/* SETTINGS & ACTION */}
                        <div className="w-full md:w-80 flex flex-col gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                    Confidence Threshold: {confidence}
                                </label>
                                <input
                                    type="range"
                                    min="0.1"
                                    max="0.9"
                                    step="0.05"
                                    value={confidence}
                                    onChange={(e) => setConfidence(parseFloat(e.target.value))}
                                    className="w-full accent-[#F39C12]"
                                />
                            </div>

                            <button
                                onClick={handleUploadAndProcess}
                                disabled={uploading || processing || files.length === 0}
                                className="w-full py-4 bg-[#F39C12] hover:bg-[#d68910] disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-bold text-black flex items-center justify-center gap-2 transition-all"
                            >
                                {uploading ? "Uploading..." : processing ? "Annotating..." : "Start Auto-Annotation"}
                                {(uploading || processing) && <Loader className="animate-spin" size={20} />}
                            </button>

                            {error && (
                                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3 text-red-500">
                                    <AlertCircle size={20} />
                                    <span className="text-sm">{error}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* RESULTS */}
                {results && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold flex items-center gap-2">
                                <CheckCircle className="text-green-500" />
                                Results ({results.length})
                            </h2>
                            {/* Placeholder for Download All */}
                            <button className="text-sm text-[#F39C12] hover:underline">
                                Download All Labels (Coming Soon)
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {results.map((item, idx) => (
                                <div key={idx} className="bg-[#1a1c24] rounded-lg overflow-hidden border border-gray-800">
                                    {/* Display visualized image from backend static path */}
                                    <img
                                        src={`${API_URL}/results/visualized/${item.image}?t=${Date.now()}`}
                                        alt="Result"
                                        className="w-full h-64 object-cover"
                                    />
                                    <div className="p-4 flex items-center justify-between">
                                        <span className="text-sm text-gray-400 truncate">{item.image}</span>
                                        <a
                                            href={`${API_URL}/results/labels/${item.label}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="flex items-center gap-1 text-xs bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded text-white transition-colors"
                                        >
                                            <FileText size={14} />
                                            View Label
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AutoAnnotationPage;
