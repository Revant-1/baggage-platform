import React, { useState, useEffect } from "react";
import { API } from "../api/backend";
import {
  Camera, MapPin, Filter, Plus, Settings, Wifi, WifiOff
} from "lucide-react";
import "./CamerasPage.css";

export default function CamerasPage() {
  const [projects, setProjects] = useState([]);
  const [cameras, setCameras] = useState([]);
  const [projectId, setProjectId] = useState("");

  useEffect(() => {
    API.get("/projects").then((res) => setProjects(res.data)).catch(() => { });
  }, []);

  const fetchCameras = async (projId) => {
    try {
      const res = await API.get(`/cameras/project/${projId}`);
      setCameras(res.data);
    } catch (err) {
      console.error("Failed to fetch cameras", err);
    }
  };

  return (
    <div className="cameras-page page-container">
      {/* Page Header */}
      <header className="page-header animate-fadeIn">
        <div className="header-left">
          <h1 className="page-title">Camera Management</h1>
          <p className="page-subtitle">Manage cameras across your projects</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary">
            <Filter size={16} />
            Filters
          </button>
          <button className="btn btn-primary">
            <Plus size={16} />
            Add New Camera
          </button>
        </div>
      </header>

      <div className="cameras-layout">
        {/* Left Sidebar */}
        <aside className="cameras-sidebar">
          {/* Project Selector */}
          <div className="sidebar-card">
            <div className="card-header">
              <div className="card-title">
                <MapPin size={16} />
                Select Project
              </div>
            </div>
            <div className="project-list">
              {projects.length > 0 ? (
                projects.map((project) => (
                  <button
                    key={project.id}
                    className={`project-item ${projectId === project.id ? 'active' : ''}`}
                    onClick={() => {
                      setProjectId(project.id);
                      fetchCameras(project.id);
                    }}
                  >
                    {project.name}
                  </button>
                ))
              ) : (
                <p className="empty-text">No projects found. Create a project first.</p>
              )}
            </div>
          </div>

          {/* Camera Stats */}
          <div className="sidebar-card">
            <h3 className="section-header">CAMERA STATISTICS</h3>
            <div className="zone-stats">
              <div className="zone-stat">
                <span className="zone-label">Total Cameras</span>
                <div className="zone-value">
                  <span className="count">{cameras.length}</span>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Camera Grid */}
        <main className="cameras-grid-container">
          {cameras.length > 0 ? (
            <div className="cameras-grid">
              {cameras.map((camera) => (
                <div key={camera.id} className="camera-card animate-fadeIn">
                  <div className="camera-preview">
                    <div className="camera-offline-state">
                      <Camera size={32} />
                      <span>CAMERA FEED</span>
                    </div>
                    <span className="status-badge online">
                      <span className="dot"></span>
                      AVAILABLE
                    </span>
                  </div>

                  <div className="camera-info">
                    <div className="camera-details">
                      <h4 className="camera-name">{camera.cameraName}</h4>
                      <p className="camera-location">
                        <Wifi size={12} />
                        {camera.rtspUrl}
                      </p>
                    </div>
                  </div>

                  <div className="camera-footer">
                    <div className="camera-tags">
                      <span className="tag normal">Ready</span>
                    </div>
                    <button className="settings-btn">
                      <Settings size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">📹</div>
              <h3 className="empty-state-title">No Cameras</h3>
              <p className="empty-state-text">
                {projectId ? "No cameras found for this project." : "Select a project to view cameras."}
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
