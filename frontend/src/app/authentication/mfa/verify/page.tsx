"use client";

import React, { useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

export default function VerifyMFA() {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const verifyOtp = async () => {
    setError("");
    setLoading(true);

    try {
      const token = Cookies.get("authToken");
      await axios.post(
        "http://localhost:4000/users/verify",
        { otp },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      router.push("/users/profile/view"); // Redirect to dashboard after successful verification
    } catch (err) {
      setError("Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-sm w-full">
        <h2 className="text-2xl font-semibold mb-4">Verify MFA</h2>
        <div className="mb-4">
          <label htmlFor="otp" className="block font-medium mb-1">
            Enter OTP
          </label>
          <input
            type="text"
            id="otp"
            className="w-full p-2 border rounded"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
        </div>
        <button
          onClick={verifyOtp}
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition"
          disabled={loading}
        >
          {loading ? "Verifying..." : "Verify"}
        </button>
        {error && <p className="text-red-500 mt-4">{error}</p>}
      </div>
    </div>
  );
}