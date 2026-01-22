import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
    Bell, Moon, Sun,  Calendar, ChevronDown,
    LayoutDashboard, Camera,  Settings, FileText
} from "lucide-react";
import "./TopNavbar.css";

const TopNavbar = () => {
    const location = useLocation();
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [showCameraDropdown, setShowCameraDropdown] = useState(false);

    const isActive = (path) => location.pathname.startsWith(path);

    const navLinks = [
        { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { path: "/cameras", label: "Cameras", icon: Camera },
        { path: "/auto-annotation", label: "Auto-Annotate", icon: FileText },
        { path: "/settings", label: "Settings", icon: Settings },
    ];

    const today = new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });

    return (
        <header className="top-navbar">
            <div className="navbar-container">
                {/* Logo Section */}
                <div className="navbar-brand">
                    <div className="brand-icon">
                        <LayoutDashboard size={20} />
                    </div>
                    <div className="brand-text">
                        <span className="brand-name">Baggage Analytics Platform</span>
                        <span className="brand-subtitle">Real-time monitoring & AI detection</span>
                    </div>
                </div>

                {/* Navigation Links */}
                <nav className="navbar-nav">
                    {navLinks.map((link) => (
                        <Link
                            key={link.path}
                            to={link.path}
                            className={`nav-link ${isActive(link.path) ? 'active' : ''}`}
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>

                {/* Right Section */}
                <div className="navbar-actions">
                    {/* Camera Selector */}
                    <div className="camera-selector" onClick={() => setShowCameraDropdown(!showCameraDropdown)}>
                        <Camera size={16} />
                        <span>Camera 1 - Terminal A</span>
                        <ChevronDown size={14} />
                        {showCameraDropdown && (
                            <div className="dropdown-menu">
                                <div className="dropdown-item active">Camera 1 - Terminal A</div>
                                <div className="dropdown-item">Camera 2 - Terminal B</div>
                                <div className="dropdown-item">Camera 3 - Security</div>
                                <div className="dropdown-item">Camera 4 - Baggage Claim</div>
                            </div>
                        )}
                    </div>

                    {/* Date Display */}
                    <div className="date-picker">
                        <span>Today, {today}</span>
                        <Calendar size={16} />
                    </div>

                    {/* Dark Mode Toggle */}
                    <button
                        className="icon-btn"
                        onClick={() => setIsDarkMode(!isDarkMode)}
                        title="Toggle dark mode"
                    >
                        {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                    </button>

                    {/* Notifications */}
                    <button className="icon-btn notification-btn">
                        <Bell size={18} />
                        <span className="notification-badge">3</span>
                    </button>

                    {/* Export Report Button */}
                    <button className="export-btn">
                        <FileText size={16} />
                        Export Report
                    </button>

                    {/* User Profile */}
                    <div className="user-avatar">
                        <img
                            src="https://api.dicebear.com/7.x/avataaars/svg?seed=admin"
                            alt="User"
                        />
                    </div>
                </div>
            </div>
        </header>
    );
};

export default TopNavbar;
