"use client"
import Image from "next/image";
import Layout from "./routes/layout";
import Home from "./routes/home/HomePage";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

export default function App() {
  const shouldShowSidebar = !location.pathname.startsWith('/messages');
  return (
    <Router>
    <Layout>
      <Routes>
        <Route path="/home" element={<Home />} />
      </Routes>
    </Layout>
  </Router>
  );
}

