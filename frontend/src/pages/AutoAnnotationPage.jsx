import React, { useState } from "react";
import {
    Upload, AlertCircle, Loader,
    Download, Trash2, Eye, Info, Zap, Cpu
} from "lucide-react";
import "./AutoAnnotationPage.css";

const API_URL = "http://localhost:5000";

const AutoAnnotationPage = () => {
    const [files, setFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [results, setResults] = useState(null);
    const [error, setError] = useState(null);
    const [confidence, setConfidence] = useState(0.45);



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
            const uploadRes = await fetch(`${API_URL}/api/annotation/upload`, {
                method: "POST",
                body: formData,
            });

            if (!uploadRes.ok) throw new Error("Upload failed");

            setUploading(false);
            setProcessing(true);

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
        <div className="auto-annotation-page page-container">
            <div className="annotation-layout">
                {/* Left Panel - Upload Area */}
                <section className="upload-section card animate-fadeIn">
                    <div className="section-content">
                        <h1 className="section-title">Auto-Annotation Tool</h1>
                        <p className="section-description">
                            Upload images to automatically generate YOLO labels using our high-precision server model.
                        </p>

                        {/* Drop Zone */}
                        <div
                            className="drop-zone"
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
                            <div className="drop-icon">
                                <Upload size={32} />
                            </div>
                            <p className="drop-title">Drag & Drop images here</p>
                            <p className="drop-subtitle">or click to browse from files</p>
                            <div className="file-types">
                                <span className="file-type">JPG</span>
                                <span className="file-type">PNG</span>
                                <span className="file-type">WEBP</span>
                            </div>
                            {files.length > 0 && (
                                <div className="files-selected">
                                    {files.length} images selected
                                </div>
                            )}
                        </div>

                        {/* Confidence Slider */}
                        <div className="confidence-control">
                            <div className="confidence-header">
                                <span className="confidence-label">Confidence Threshold</span>
                                <span className="confidence-value">{confidence.toFixed(2)}</span>
                            </div>
                            <div className="slider-container">
                                <input
                                    type="range"
                                    min="0.1"
                                    max="0.9"
                                    step="0.05"
                                    value={confidence}
                                    onChange={(e) => setConfidence(parseFloat(e.target.value))}
                                    className="confidence-slider"
                                />
                                <div className="slider-labels">
                                    <span>PRECISE</span>
                                    <span>BALANCED</span>
                                    <span>LOOSE</span>
                                </div>
                            </div>
                        </div>

                        {/* Action Button */}
                        <button
                            onClick={handleUploadAndProcess}
                            disabled={uploading || processing || files.length === 0}
                            className="btn btn-primary start-btn"
                        >
                            <Zap size={18} />
                            {uploading ? "Uploading..." : processing ? "Annotating..." : "Start Auto-Annotation"}
                            {(uploading || processing) && <Loader className="spin" size={18} />}
                        </button>

                        {/* Pro Tip */}
                        <div className="pro-tip">
                            <Info size={16} />
                            <span>Pro tip: Higher confidence reduces false positives but might miss smaller baggage items in low lighting.</span>
                        </div>

                        {error && (
                            <div className="error-message">
                                <AlertCircle size={18} />
                                <span>{error}</span>
                            </div>
                        )}
                    </div>

                    {/* Model Info Footer */}
                    <div className="model-info">
                        <div className="model-badge">
                            <Cpu size={18} />
                        </div>
                        <div className="model-details">
                            <span className="model-label">CURRENT MODEL</span>
                            <span className="model-name">YOLOv11n-Baggage v1.2.3</span>
                        </div>
                        <div className="model-latency">
                            <span className="latency-label">LATENCY</span>
                            <span className="latency-value">~14ms</span>
                        </div>
                    </div>
                </section>

                {/* Right Panel - Recent Annotations */}
                <section className="annotations-section card animate-fadeIn">
                    <div className="annotations-header">
                        <div>
                            <h2 className="annotations-title">Recent Annotations</h2>
                            <p className="annotations-subtitle">Manage and export your processed imagery</p>
                        </div>
                        <div className="annotations-actions">
                            <button className="btn btn-secondary btn-sm">
                                <Download size={14} />
                                Export
                            </button>
                            <button className="btn btn-ghost btn-sm">
                                <Trash2 size={14} />
                                Clear
                            </button>
                        </div>
                    </div>

                    {/* Annotations Table */}
                    <div className="annotations-table">
                        <div className="table-header">
                            <span className="col-filename">IMAGE</span>
                            <span className="col-date">FILENAME</span>
                            <span className="col-objects">LABEL FILE</span>
                            <span className="col-action">ACTION</span>
                        </div>
                        <div className="table-body">
                            {results ? (
                                results.map((item, index) => (
                                    <div key={index} className="table-row">
                                        <div className="col-filename">
                                            <div className="file-preview">
                                                <img
                                                    src={`${API_URL}/results/visualized/${item.image}`}
                                                    alt="Processed"
                                                    className="thumb-img"
                                                    style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
                                                />
                                            </div>
                                        </div>
                                        <span className="col-date" style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {item.image}
                                        </span>
                                        <span className="col-objects">
                                            {item.label}
                                        </span>
                                        <div className="col-action">
                                            <a
                                                href={`${API_URL}/results/visualized/${item.image}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="action-btn"
                                            >
                                                <Eye size={16} />
                                            </a>
                                            <a
                                                href={`${API_URL}/results/labels/${item.label}`}
                                                download
                                                className="action-btn"
                                            >
                                                <Download size={16} />
                                            </a>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="empty-state" style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>
                                    <p>No processed results yet. Upload images to start.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Pagination */}
                    <div className="annotations-pagination">
                        <span className="page-info">Page 1 of 1</span>
                        <div className="page-controls">
                            <button className="page-arrow" disabled>&lt;</button>
                            <button className="page-arrow" disabled>&gt;</button>
                        </div>
                    </div>
                </section>
            </div>

            {/* Footer Stats */}
            <div className="annotation-footer animate-fadeIn">
                <div className="footer-stat">
                    <span className="stat-label">GPU UTILIZATION</span>
                    <div className="stat-value-row">
                        <span className="stat-number">76%</span>
                        <div className="mini-progress">
                            <div className="mini-fill" style={{ width: '76%' }}></div>
                        </div>
                    </div>
                </div>
                <div className="footer-stat">
                    <span className="stat-label">SYSTEM UPTIME</span>
                    <span className="stat-number success">99.8%</span>
                </div>
            </div>
        </div>
    );
};

export default AutoAnnotationPage;
