import { Link, useLocation } from "react-router-dom";
import "./sidebar.css";

export default function SidebarLayout({ children }) {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar */}
      <aside className="sidebar">
        {/* Header */}
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="sidebar-logo-icon">🧳</div>
            <span className="sidebar-logo-text">Baggage AI</span>
            <span className="sidebar-logo-badge">BETA</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <div className="sidebar-section-title">Analytics</div>
          <Link to="/dashboard" className={`sidebar-link ${isActive('/dashboard') ? 'active' : ''}`}>
            <span className="sidebar-link-icon">📊</span>
            <span>Live Dashboard</span>
            <span className="sidebar-link-badge new">NEW</span>
          </Link>
          <Link to="/live" className={`sidebar-link ${isActive('/live') ? 'active' : ''}`}>
            <span className="sidebar-link-icon">📹</span>
            <span>Single Stream</span>
          </Link>

          <div className="sidebar-section-title">Management</div>
          <Link to="/clients" className={`sidebar-link ${isActive('/clients') ? 'active' : ''}`}>
            <span className="sidebar-link-icon">👥</span>
            <span>Clients</span>
          </Link>
          <Link to="/projects" className={`sidebar-link ${isActive('/projects') ? 'active' : ''}`}>
            <span className="sidebar-link-icon">📁</span>
            <span>Projects</span>
          </Link>
          <Link to="/cameras" className={`sidebar-link ${isActive('/cameras') ? 'active' : ''}`}>
            <span className="sidebar-link-icon">🎥</span>
            <span>Cameras</span>
          </Link>
          <div className="sidebar-section-title">Tools</div>
          <Link to="/auto-annotation" className={`sidebar-link ${isActive('/auto-annotation') ? 'active' : ''}`}>
            <span className="sidebar-link-icon">🤖</span>
            <span>Auto Annotate</span>
          </Link>
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <div className="sidebar-footer-content">
            <div className="sidebar-footer-title">YOLO v11 Powered</div>
            <div className="sidebar-footer-text">Real-time object detection</div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, background: "var(--color-bg-primary)", overflow: "auto" }}>
        {children}
      </main>
    </div>
  );
}
