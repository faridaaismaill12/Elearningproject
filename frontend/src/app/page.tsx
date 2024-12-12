// app/page.tsx
"use client";

import React from "react";
import Layout from "./routes/layout";
import Home from "./routes/home/HomePage";

export default function App() {
  return (
    <Layout>
      <Home />
    </Layout>
  );
}
