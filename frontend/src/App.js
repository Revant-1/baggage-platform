import { BrowserRouter, Routes, Route } from "react-router-dom";

import SidebarLayout from "./layout/SidebarLayout";
import ClientsPage from "./pages/ClientsPage";
import ProjectsPage from "./pages/ProjectsPage";
import CamerasPage from "./pages/CamerasPage";
import LiveCameraPage from "./pages/LiveCameraPage";
import DashboardHostPage from "./pages/DashboardHostPage";
import SingleFeedDashboard from "./pages/SingleFeedDashboard";
import AutoAnnotationPage from "./pages/AutoAnnotationPage";


function App() {
  return (
    <BrowserRouter>
      <SidebarLayout>
        <Routes>
          <Route path="/clients" element={<ClientsPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/cameras" element={<CamerasPage />} />
          <Route path="/live" element={<LiveCameraPage />} />
          <Route path="/dashboard" element={<DashboardHostPage />} />
          <Route path="/dashboard/:streamId" element={<SingleFeedDashboard />} />
          <Route path="/auto-annotation" element={<AutoAnnotationPage />} />
        </Routes>
      </SidebarLayout>
    </BrowserRouter>
  );
}

export default App;
