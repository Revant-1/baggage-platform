import React, { useState } from "react";
import { Link } from "react-router-dom";
import StreamViewer from "../components/StreamViewer";
import "./DashboardHostPage.css";

const DashboardHostPage = () => {
    const [sourceInput, setSourceInput] = useState("");
    const [streams, setStreams] = useState([]);
    const [loading, setLoading] = useState(false);

    const startStream = async (sourceOverride = null) => {
        const source = sourceOverride || sourceInput.trim();

        if (!source) {
            return alert("Please enter a RTSP URL, File Path, or '0' for webcam");
        }

        setLoading(true);
        try {
            const res = await fetch("http://localhost:5000/streams/start", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ source }),
            });
            const data = await res.json();

            if (data.success) {
                setStreams([...streams, { id: data.streamId, source: source, startedAt: new Date() }]);
                if (!sourceOverride) setSourceInput("");
            } else {
                alert("Failed to start stream: " + (data.error || "Unknown error"));
            }
        } catch (err) {
            alert("Error connecting to backend. Make sure the server is running on port 5000.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const stopStream = async (streamId) => {
        try {
            await fetch("http://localhost:5000/streams/stop", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ streamId }),
            });
            setStreams(streams.filter(s => s.id !== streamId));
        } catch (err) {
            console.error("Failed to stop stream", err);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !loading) {
            startStream();
        }
    };

    return (
        <div className="page-container dashboard-page">
            {/* Header */}
            <header className="dashboard-header animate-fadeIn">
                <div className="header-content">
                    <h1 className="page-title">
                        <span className="gradient-text">Live Analytics</span> Dashboard
                    </h1>
                    <p className="page-subtitle">
                        Real-time baggage detection powered by YOLO v11. Add video feeds to start analysis.
                    </p>
                </div>
                <div className="header-stats">
                    <div className="header-stat">
                        <span className="stat-number">{streams.length}</span>
                        <span className="stat-text">Active Feeds</span>
                    </div>
                </div>
            </header>

            {/* Control Panel */}
            <div className="control-panel glass animate-fadeIn" style={{ animationDelay: "0.1s" }}>
                <div className="control-panel-inner">
                    <div className="input-group">
                        <span className="input-icon">🔗</span>
                        <input
                            type="text"
                            className="input"
                            placeholder="Enter RTSP URL, Video Path, or '0' for webcam..."
                            value={sourceInput}
                            onChange={(e) => setSourceInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            disabled={loading}
                        />
                    </div>
                    <button
                        className="btn btn-primary"
                        onClick={() => startStream()}
                        disabled={loading || !sourceInput.trim()}
                    >
                        {loading ? (
                            <>
                                <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }}></span>
                                Starting...
                            </>
                        ) : (
                            <>
                                <span>▶</span>
                                Start Feed
                            </>
                        )}
                    </button>
                    <button
                        className="btn btn-secondary demo-btn"
                        onClick={() => startStream("demo")}
                        disabled={loading}
                    >
                        🎬 Demo Mode
                    </button>
                </div>
                <div className="quick-actions">
                    <span className="quick-label">Quick start:</span>
                    <button className="btn btn-ghost" onClick={() => setSourceInput("0")}>
                        📷 Webcam
                    </button>
                    <button className="btn btn-ghost" onClick={() => setSourceInput("D:\\Final-Year-Project\\baggage-platform\\video\\test_video.mp4")}>
                        🎬 Test Video
                    </button>
                </div>
            </div>

            {/* Stream Grid */}
            {streams.length > 0 ? (
                <div className="stream-grid stagger-children">
                    {streams.map((stream) => (
                        <Link to={`/dashboard/${stream.id}`} key={stream.id} className="stream-link">
                            <StreamViewer
                                streamId={stream.id}
                                source={stream.source}
                                onStop={stopStream}
                            />
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="empty-state animate-fadeIn" style={{ animationDelay: "0.2s" }}>
                    <div className="empty-state-icon">🎥</div>
                    <h3 className="empty-state-title">No Active Streams</h3>
                    <p className="empty-state-text">
                        Add a video feed above to start real-time baggage detection analysis.
                    </p>
                </div>
            )}
        </div>
    );
};

export default DashboardHostPage;
