// app/page.tsx
"use client";

import React from "react";
import Layout from "./routes/layout";
import Home from "./routes/home/HomePage";
import Login from "./authentication/login/page";
import RegisterPage from './user/authentication/register/page';
// import "./app.css";


export default function App() {
  return (
    <Layout>
     
      <RegisterPage /> 
    
    </Layout>
  );
}
