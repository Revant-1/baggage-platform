import TopNavbar from "../components/TopNavbar";
import "./navbar-layout.css";

export default function SidebarLayout({ children }) {
  return (
    <div className="app-layout">
      <TopNavbar />
      <main className="main-content">
        {children}
      </main>
      <footer className="app-footer">
        <div className="footer-left">
          <span>© 2024 Baggage Analytics System. All systems nominal.</span>
        </div>
        <div className="footer-right">
          <span className="footer-status">
            <span className="status-dot"></span>
            YOLOv11 Engine Active
          </span>
          <a href="#docs" className="footer-link">Documentation</a>
          <a href="#support" className="footer-link">Support</a>
        </div>
      </footer>
    </div>
  );
}
