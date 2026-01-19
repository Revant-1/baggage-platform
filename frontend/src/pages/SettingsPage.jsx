import React, { useState } from "react";
import {
    Brain, Settings, Users, Shield, Check,
    Mail, Webhook, MessageSquare
} from "lucide-react";
import "./SettingsPage.css";

const SettingsPage = () => {
    const [activeTab, setActiveTab] = useState("ai-config");
    const [modelArchitecture, setModelArchitecture] = useState("yolo-v11-small");
    const [inferenceEngine, setInferenceEngine] = useState("tensorrt");
    const [confidenceThreshold, setConfidenceThreshold] = useState(0.45);
    const [nmsThreshold, setNmsThreshold] = useState(0.25);
    const [edgeDetection, setEdgeDetection] = useState(true);
    const [autoRetraining, setAutoRetraining] = useState(false);
    const [historyRetention, setHistoryRetention] = useState(30);
    const [exportFormat, setExportFormat] = useState("csv");

    const tabs = [
        { id: "ai-config", label: "AI Model Config", icon: Brain },
        { id: "general", label: "General Settings", icon: Settings },
    ];

    return (
        <div className="settings-page page-container">
            {/* Page Header */}
            <header className="settings-header animate-fadeIn">
                <div>
                    <h1 className="page-title">System Settings & AI Configuration</h1>
                    <p className="page-subtitle">Manage your AI models, detection sensitivity, and global system parameters.</p>
                </div>
                <div className="header-actions">
                    <button className="btn btn-secondary">Discard Changes</button>
                    <button className="btn btn-primary">Save Configuration</button>
                </div>
            </header>

            <div className="settings-layout">
                {/* Sidebar Navigation */}
                <aside className="settings-sidebar">
                    <nav className="sidebar-nav">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                <tab.icon size={18} />
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </nav>

                    {/* System Status */}
                    <div className="system-status">
                        <div className="status-header">
                            <span className="status-dot"></span>
                            <span>System Status</span>
                        </div>
                        <div className="status-item">
                            <span className="status-label">Backend</span>
                            <span className="status-value">localhost:5000</span>
                        </div>
                        <div className="status-item">
                            <span className="status-label">WebSocket</span>
                            <span className="status-value">localhost:8081</span>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="settings-content">
                    {/* AI Model Configuration */}
                    {activeTab === "ai-config" && (
                        <section className="settings-section card animate-fadeIn">
                            <div className="section-header">
                                <h2>AI Model Configuration</h2>
                                <p>Select and tune the baggage detection model parameters.</p>
                            </div>

                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Model Architecture</label>
                                    <select
                                        value={modelArchitecture}
                                        onChange={(e) => setModelArchitecture(e.target.value)}
                                        className="form-select"
                                    >
                                        <option value="yolo-v11-nano">YOLO v11-Nano (Fast)</option>
                                        <option value="yolo-v11-small">YOLO v11-Small (Balanced)</option>
                                        <option value="yolo-v11-medium">YOLO v11-Medium (Accurate)</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Inference Engine</label>
                                    <select
                                        value={inferenceEngine}
                                        onChange={(e) => setInferenceEngine(e.target.value)}
                                        className="form-select"
                                    >
                                        <option value="tensorrt">TensorRT (Recommended)</option>
                                        <option value="onnx">ONNX Runtime</option>
                                        <option value="pytorch">PyTorch Native</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>
                                        Confidence Threshold
                                        <span className="value-badge">{confidenceThreshold.toFixed(2)}</span>
                                    </label>
                                    <input
                                        type="range"
                                        min="0.1"
                                        max="0.9"
                                        step="0.05"
                                        value={confidenceThreshold}
                                        onChange={(e) => setConfidenceThreshold(parseFloat(e.target.value))}
                                        className="form-range"
                                    />
                                    <p className="form-hint">Minimum confidence score required for an object to be detected as baggage.</p>
                                </div>

                                <div className="form-group">
                                    <label>
                                        NMS Threshold (Overlap)
                                        <span className="value-badge">{nmsThreshold.toFixed(2)}</span>
                                    </label>
                                    <input
                                        type="range"
                                        min="0.1"
                                        max="0.9"
                                        step="0.05"
                                        value={nmsThreshold}
                                        onChange={(e) => setNmsThreshold(parseFloat(e.target.value))}
                                        className="form-range"
                                    />
                                    <p className="form-hint">Threshold for Non-Maximum Suppression to handle overlapping detection boxes.</p>
                                </div>
                            </div>

                            <div className="toggle-grid">
                                <div className="toggle-item">
                                    <div className="toggle-info">
                                        <span className="toggle-label">Enable Edge Detection</span>
                                        <span className="toggle-desc">Run model on edge gateway devices</span>
                                    </div>
                                    <button
                                        className={`toggle-switch ${edgeDetection ? 'active' : ''}`}
                                        onClick={() => setEdgeDetection(!edgeDetection)}
                                    >
                                        <span className="toggle-knob"></span>
                                    </button>
                                </div>

                                <div className="toggle-item">
                                    <div className="toggle-info">
                                        <span className="toggle-label">Automatic Retraining</span>
                                        <span className="toggle-desc">Use flagged false-positives for training</span>
                                    </div>
                                    <button
                                        className={`toggle-switch ${autoRetraining ? 'active' : ''}`}
                                        onClick={() => setAutoRetraining(!autoRetraining)}
                                    >
                                        <span className="toggle-knob"></span>
                                    </button>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* General Settings */}
                    {activeTab === "general" && (
                        <section className="settings-section card animate-fadeIn">
                            <div className="section-header">
                                <h2>General Settings</h2>
                                <p>Configure global application behavior and notifications.</p>
                            </div>

                            <h4 className="subsection-title">REPORTING & DATA</h4>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>History Retention</label>
                                    <div className="input-with-suffix">
                                        <input
                                            type="number"
                                            value={historyRetention}
                                            onChange={(e) => setHistoryRetention(e.target.value)}
                                            className="form-input"
                                        />
                                        <span className="input-suffix">Days</span>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Default Export Format</label>
                                    <select
                                        value={exportFormat}
                                        onChange={(e) => setExportFormat(e.target.value)}
                                        className="form-select"
                                    >
                                        <option value="csv">CSV Data Table</option>
                                        <option value="json">JSON Export</option>
                                        <option value="pdf">PDF Report</option>
                                    </select>
                                </div>
                            </div>

                            <h4 className="subsection-title">SYSTEM NOTIFICATION HOOKS</h4>
                            <div className="notification-hooks">
                                <div className="hook-item">
                                    <Mail size={16} />
                                    <span>Email Alerts</span>
                                </div>
                                <div className="hook-item">
                                    <Webhook size={16} />
                                    <span>Webhook URL</span>
                                </div>
                                <div className="hook-item">
                                    <MessageSquare size={16} />
                                    <span>SMS Notifications</span>
                                </div>
                            </div>
                        </section>
                    )}
                </main>
            </div>
        </div>
    );
};

export default SettingsPage;
