"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

export default function EnrollCoursePage() {
  const [formData, setFormData] = useState({
    email: "",
    courseId: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Check if the user is logged in and has a valid student role
  useEffect(() => {
    const checkAccess = async () => {
      const token = Cookies.get("authToken");

      if (!token) {
        setError("You must log in first.");
        setTimeout(() => {
          router.push("/users/login");
        }, 3000);
        return;
      }

      try {
        const response = await axios.get("http://localhost:5010/users/get-role", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const role = response.data;
        if (role !== "student") {
          setError("You do not have permission to access this page.");
          setTimeout(() => {
            router.push("/users/login");
          }, 3000);
        }
      } catch (err) {
        setError("Failed to verify access. Please log in again.");
        setTimeout(() => {
          router.push("/users/login");
        }, 3000);
      }
    };

    checkAccess();
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const token = Cookies.get("authToken");

    if (!token) {
      setError("You must log in first.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5010/users/enroll-user",
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSuccess(response.data.message || "Successfully enrolled in the course!");
      setFormData({
        email: "",
        courseId: "",
      });
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data.message || "Failed to enroll in course.");
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-sm w-full">
        <h2 className="text-2xl font-semibold mb-4">Enroll in a Course</h2>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        {success && <p className="text-green-500 text-sm mb-4">{success}</p>}
        {!error && (
          <form onSubmit={handleSubmit}>
            {/* Email Field */}
            <div className="mb-4">
              <label htmlFor="email" className="block font-medium mb-1">
                Student Email
              </label>
              <input
                type="email"
                name="email"
                id="email"
                className="w-full p-2 border rounded"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            {/* Course ID Field */}
            <div className="mb-4">
              <label htmlFor="courseId" className="block font-medium mb-1">
                Course ID
              </label>
              <input
                type="text"
                name="courseId"
                id="courseId"
                className="w-full p-2 border rounded"
                value={formData.courseId}
                onChange={handleChange}
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full p-2 rounded text-white transition ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"}`}
            >
              {loading ? "Enrolling..." : "Enroll in Course"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}