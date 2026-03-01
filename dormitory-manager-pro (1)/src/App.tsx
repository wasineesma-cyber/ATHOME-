import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Dashboard } from "./pages/Dashboard";
import { Rooms } from "./pages/Rooms";
import { Tenants } from "./pages/Tenants";
import { Invoices } from "./pages/Invoices";
import { Parcels } from "./pages/Parcels";
import { LiffApp } from "./pages/LiffApp";
import { Settings } from "./pages/Settings";
import { Login } from "./pages/Login";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <Router>
      <Routes>
        {/* LIFF App Routes (Mobile View for Tenants) */}
        <Route path="/liff" element={<LiffApp />} />

        {/* Login Route */}
        <Route 
          path="/login" 
          element={
            isAuthenticated ? <Navigate to="/" replace /> : <Login onLogin={() => setIsAuthenticated(true)} />
          } 
        />

        {/* Admin Dashboard Routes */}
        <Route
          path="/*"
          element={
            isAuthenticated ? (
              <Layout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/rooms" element={<Rooms />} />
                  <Route path="/tenants" element={<Tenants />} />
                  <Route path="/invoices" element={<Invoices />} />
                  <Route path="/parcels" element={<Parcels />} />
                  <Route path="/settings" element={<Settings />} />
                </Routes>
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </Router>
  );
}
