"use client";

import React, { useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

export default function EnableMFA() {
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const enableMfa = async () => {
    setError("");
    setLoading(true);

    try {
      const token = Cookies.get("authToken");

      if (!token) {
        setError("Authentication token is missing. Please log in again.");
        setLoading(false);
        return;
      }

      console.log("Token:", token);

      const response = await axios.post(
        "http://localhost:4000/users/enable",
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("API Response:", response.data);

      setQrCodeUrl(response.data); // Save the base64 QR code
    } catch (err) {
      console.error("Error enabling MFA:", err);

      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Failed to enable MFA. Please try again.");
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const proceedToLogin = () => {
    router.push("/authentication/mfa/verify");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-sm w-full">
        <h2 className="text-2xl font-semibold mb-4">Enable MFA</h2>
        {qrCodeUrl ? (
          <div>
            <p className="mb-4">
              Scan the QR code below with your authenticator app:
            </p>
            <img
              src={qrCodeUrl} // Use the base64 QR code string as the `src`
              alt="QR Code"
              className="mb-4"
            />
            <button
              onClick={proceedToLogin}
              className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600 transition"
            >
              Proceed to MFA Verification
            </button>
          </div>
        ) : (
          <button
            onClick={enableMfa}
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition"
            disabled={loading}
          >
            {loading ? "Enabling MFA..." : "Enable MFA"}
          </button>
        )}
        {error && <p className="text-red-500 mt-4">{error}</p>}
      </div>
    </div>
  );
}