import React, { useEffect, useState, useRef, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
} from "recharts";
import {
    Activity, ArrowLeft, BarChart3, Clock, Cpu, Database,
    ExternalLink, Layers, LayoutDashboard, Monitor, Network, ShieldCheck
} from "lucide-react";
import "./SingleFeedDashboard.css";

const SingleFeedDashboard = () => {
    const { streamId } = useParams();
    const [imageSrc, setImageSrc] = useState(null);
    const [currentCount, setCurrentCount] = useState(0);
    const [status, setStatus] = useState("connecting");
    const [fps, setFps] = useState(0);
    const [historicalData, setHistoricalData] = useState([]);
    const ws = useRef(null);
    const frameTimestamps = useRef([]);

    // Data generation for charts (mocking the "Daily Trends" logic)
    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date();
            const timeStr = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;

            setHistoricalData(prev => {
                const newData = [...prev, { time: timeStr, count: currentCount }];
                if (newData.length > 20) return newData.slice(1);
                return newData;
            });
        }, 5000);
        return () => clearInterval(interval);
    }, [currentCount]);

    useEffect(() => {
        ws.current = new WebSocket("ws://localhost:8081");

        ws.current.onopen = () => setStatus("live");

        ws.current.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.streamId === streamId) {
                    setImageSrc(`data:image/jpeg;base64,${data.image}`);
                    setCurrentCount(data.count || 0);

                    // FPS Calc
                    const now = Date.now();
                    frameTimestamps.current.push(now);
                    frameTimestamps.current = frameTimestamps.current.filter(t => now - t < 1000);
                    setFps(frameTimestamps.current.length);
                }
            } catch (err) {
                console.error("WS Parse Error", err);
            }
        };

        ws.current.onclose = () => setStatus("disconnected");

        return () => {
            if (ws.current) ws.current.close();
        };
    }, [streamId]);

    const stats = useMemo(() => [
        { label: "Current Baggage", value: currentCount, status: "Normal", icon: <Layers size={20} /> },
        { label: "Total Handled Today", value: "1,248", status: "Normal", icon: <Database size={20} /> },
        { label: "Occupancy Rate", value: "78%", status: "Warning", icon: <BarChart3 size={20} /> },
        { label: "AI Accuracy", value: "99.2%", status: "Excellent", icon: <ShieldCheck size={20} /> },
    ], [currentCount]);

    return (
        <div className="analytics-dashboard page-container">
            {/* Top Bar */}
            <header className="analytics-header animate-fadeIn">
                <div className="header-left">
                    <Link to="/dashboard" className="back-btn">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="page-title">Airport Baggage Analytics</h1>
                        <p className="page-subtitle">Real-time monitoring & AI-detection • {streamId.slice(0, 8)}</p>
                    </div>
                </div>
                <div className="header-right">
                    <div className="date-display">
                        <Clock size={16} />
                        <span>Today, {new Date().toLocaleDateString()}</span>
                    </div>
                    <button className="btn btn-primary btn-sm">Export Report</button>
                    <div className="user-profile">
                        <div className="profile-avatar">RS</div>
                    </div>
                </div>
            </header>

            <div className="dashboard-grid">
                {/* Main Content Area */}
                <div className="main-stats-col">
                    {/* Live Feed Card */}
                    <section className="card glass feed-card animate-scaleIn">
                        <div className="card-header">
                            <div className="card-title">
                                <span>Live Feed - Zone A</span>
                                <span className={`badge ${status === 'live' ? 'badge-live' : 'badge-offline'}`}>
                                    {status.toUpperCase()}
                                </span>
                            </div>
                            <div className="feed-controls">
                                <button className="control-btn">⏸</button>
                                <button className="control-btn">🔄</button>
                                <div className="live-counter">
                                    Current Count: <span className="highlight">{currentCount}</span>
                                </div>
                            </div>
                        </div>
                        <div className="video-viewport">
                            {imageSrc ? (
                                <img src={imageSrc} alt="Live Stream" />
                            ) : (
                                <div className="viewport-placeholder">
                                    <div className="spinner"></div>
                                    <span>Establishing Secure Connection...</span>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Historical Trends Chart */}
                    <section className="card trend-card animate-fadeIn" style={{ animationDelay: "0.2s" }}>
                        <div className="card-header">
                            <h3 className="card-title">Historical Trends - Hourly Statistics</h3>
                            <div className="chart-tabs">
                                <button className="tab-btn active">Timeline View</button>
                                <button className="tab-btn">Peak Hours Heatmap</button>
                            </div>
                        </div>
                        <div className="chart-container">
                            <ResponsiveContainer width="100%" height={300}>
                                <AreaChart data={historicalData}>
                                    <defs>
                                        <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="var(--color-accent-primary)" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="var(--color-accent-primary)" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                    <XAxis dataKey="time" stroke="var(--color-text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="var(--color-text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        contentStyle={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: '8px' }}
                                        labelStyle={{ color: 'var(--color-text-primary)' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="count"
                                        stroke="var(--color-accent-primary)"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorCount)"
                                        animationDuration={1500}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </section>
                </div>

                {/* Sidebar Stats Area */}
                <div className="side-stats-col">
                    {/* Status Summary */}
                    <section className="card stats-stack animate-slideIn">
                        <h3 className="section-header">Current Status</h3>
                        <div className="stats-list">
                            {stats.map((stat, i) => (
                                <div className="stat-row" key={i}>
                                    <div className="stat-info">
                                        <div className="stat-label">
                                            {stat.icon}
                                            {stat.label}
                                        </div>
                                        <div className="stat-val-group">
                                            <span className="stat-value-big">{stat.value}</span>
                                            <span className={`status-pill ${stat.status.toLowerCase()}`}>{stat.status}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* System Performance */}
                    <section className="card performance-card animate-slideIn" style={{ animationDelay: "0.1s" }}>
                        <h3 className="section-header">System Performance</h3>
                        <div className="perf-item">
                            <div className="perf-label">
                                <Activity size={16} />
                                <span>Inference FPS</span>
                                <span className="perf-tag pulse">Stable</span>
                            </div>
                            <div className="perf-value">{fps} <span className="u">fps</span></div>
                            <div className="perf-bar-bg"><div className="perf-bar-fill" style={{ width: `${(fps / 30) * 100}%` }}></div></div>
                        </div>

                        <div className="perf-item">
                            <div className="perf-label">
                                <Network size={16} />
                                <span>Latency</span>
                                <span className="perf-tag">Ideal</span>
                            </div>
                            <div className="perf-value">12 <span className="u">ms</span></div>
                            <div className="perf-bar-bg"><div className="perf-bar-fill" style={{ width: '15%' }}></div></div>
                        </div>

                        <div className="perf-item">
                            <div className="perf-label">
                                <Cpu size={16} />
                                <span>Engine Uptime</span>
                                <span className="perf-tag">Stable</span>
                            </div>
                            <div className="perf-value">99.9<span className="u">%</span></div>
                            <div className="perf-bar-bg"><div className="perf-bar-fill" style={{ width: '99%' }}></div></div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default SingleFeedDashboard;
