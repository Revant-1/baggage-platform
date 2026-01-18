import React, { useEffect, useState, useRef } from "react";
import "./StreamViewer.css";

const StreamViewer = ({ streamId, source, onStop }) => {
    const [imageSrc, setImageSrc] = useState(null);
    const [status, setStatus] = useState("connecting");
    const [fps, setFps] = useState(0);
    const [frameCount, setFrameCount] = useState(0);
    const ws = useRef(null);
    const frameTimestamps = useRef([]);

    useEffect(() => {
        ws.current = new WebSocket("ws://localhost:8081");

        ws.current.onopen = () => {
            setStatus("live");
        };

        ws.current.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.streamId === streamId) {
                    setImageSrc(`data:image/jpeg;base64,${data.image}`);
                    setFrameCount(prev => prev + 1);

                    // Calculate FPS
                    const now = Date.now();
                    frameTimestamps.current.push(now);
                    frameTimestamps.current = frameTimestamps.current.filter(t => now - t < 1000);
                    setFps(frameTimestamps.current.length);
                }
            } catch (err) {
                console.error("WS Parse Error", err);
            }
        };

        ws.current.onerror = () => {
            setStatus("error");
        };

        ws.current.onclose = () => {
            setStatus("disconnected");
        };

        return () => {
            if (ws.current) {
                ws.current.close();
            }
        };
    }, [streamId]);

    const getStatusBadge = () => {
        const statusConfig = {
            live: { class: "badge-live", icon: "🟢", text: "LIVE" },
            connecting: { class: "badge-connecting", icon: "🟡", text: "CONNECTING" },
            disconnected: { class: "badge-offline", icon: "🔴", text: "OFFLINE" },
            error: { class: "badge-offline", icon: "⚠️", text: "ERROR" }
        };
        const config = statusConfig[status] || statusConfig.connecting;
        return (
            <span className={`badge ${config.class}`}>
                {config.icon} {config.text}
            </span>
        );
    };

    return (
        <div className="stream-card card animate-scaleIn">
            {/* Header */}
            <div className="stream-header">
                <div className="stream-info">
                    <span className="stream-id">Stream #{streamId.slice(0, 8)}</span>
                    {getStatusBadge()}
                </div>
                <button className="btn-stop" onClick={() => onStop(streamId)} title="Stop Stream">
                    ✕
                </button>
            </div>

            {/* Video Feed */}
            <div className="stream-video">
                {imageSrc ? (
                    <img src={imageSrc} alt="Live Detection Feed" />
                ) : (
                    <div className="stream-placeholder">
                        <div className="spinner"></div>
                        <span>Initializing YOLO model...</span>
                    </div>
                )}

                {/* Overlay Stats */}
                {imageSrc && (
                    <div className="stream-overlay">
                        <div className="stat-chip">
                            <span className="stat-value">{fps}</span>
                            <span className="stat-label">FPS</span>
                        </div>
                        <div className="stat-chip">
                            <span className="stat-value">{frameCount}</span>
                            <span className="stat-label">Frames</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="stream-footer">
                <div className="stream-source" title={source}>
                    <span className="source-icon">📂</span>
                    <span className="source-text">{source}</span>
                </div>
            </div>
        </div>
    );
};

export default StreamViewer;
