// app/page.tsx
"use client";

import React from "react";
import Layout from "./routes/layout";
import Home from "./routes/home/HomePage";
import Login from "./authentication/login/page";
import RegisterPage from "./user/register/page";
import LoginPage from "./user/login/page";
import ForgotPasswordPage from "./user/forgotpassword/page";
import DeleteMyProfile from "./user/deletemyprofile/page";
import Logout from "./user/logout/page";
import UpdateProfile from "./user/updatemyprofile/page";
import ViewMyProfile from "./user/viewmyprofile/page";
// import "./app.css";


export default function App() {
  return (
    <Layout>
     
      <UpdateProfile /> 
    
    </Layout>
  );
}
