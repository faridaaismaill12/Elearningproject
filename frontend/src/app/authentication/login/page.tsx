"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

import "./Login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [passwordHash, setPasswordHash] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const response = await axios.post("http://localhost:6165/users/login", {
        email,
        passwordHash,
      });

      console.log("Login successful:", response.data);

      // Save token to local storage
      localStorage.setItem("authToken", response.data.accessToken);

      // Redirect to homepage
      router.push("/");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Invalid login credentials");
      } else {
        setError("An unexpected error occurred.");
      }
    }
  };

  return (
    <div className="login_container">
      <div className="formWrapper">
        <h2 className="title">Login</h2>
        <form onSubmit={handleLogin}>
          <div className="inputGroup">
            <label htmlFor="email" className="label">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              required
            />
          </div>
          <div className="inputGroup">
            <label htmlFor="password" className="label">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={passwordHash}
              onChange={(e) => setPasswordHash(e.target.value)}
              className="input"
              required
            />
          </div>
          {error && <p className="error">{error}</p>}
          <button type="submit" className="button">
            Login
          </button>
        </form>
        <p className="signupLink">
          Don't have an account?{" "}
          <a href="/authentication/signup" className="link">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}
