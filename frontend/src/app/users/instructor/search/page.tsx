"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

export default function SearchInstructorsPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    bio: "",
  });
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

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
        if (role !== "instructor") {
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const token = Cookies.get("authToken");

    if (!token) {
      setError("You must log in first.");
      setLoading(false);
      return;
    }

    const filteredFormData = Object.fromEntries(
      Object.entries(formData).filter(([_, value]) => value.trim() !== "")
    );

    try {
      const response = await axios.get("http://localhost:5010/users/search-instructors", {
        params: filteredFormData,
        headers: { Authorization: `Bearer ${token}` },
      });
      setResults(response.data);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data.message || "Failed to search instructors.");
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-6 lg:px-20">
      <div className="bg-white p-10 rounded-lg shadow-lg max-w-4xl w-full">
        <h2 className="text-3xl font-semibold mb-6 text-center">Search Instructors</h2>
        {error && (
          <p className="text-red-500 text-sm mb-4 text-center" aria-live="assertive">
            {error}
          </p>
        )}
        {!error && (
          <>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {["name", "email", "bio"].map((field) => (
                  <div key={field}>
                    <label
                      htmlFor={field}
                      className="block font-medium mb-1 capitalize text-gray-700"
                    >
                      {field}
                    </label>
                    <input
                      type="text"
                      name={field}
                      id={field}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      value={(formData as any)[field]}
                      onChange={handleChange}
                    />
                  </div>
                ))}
              </div>
              <div className="flex justify-between space-x-4">
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full p-3 rounded-lg text-white transition ${
                    loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
                  }`}
                >
                  {loading ? "Searching..." : "Search"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFormData({
                      name: "",
                      email: "",
                      bio: "",
                    });
                    setResults([]);
                  }}
                  className="w-full p-3 rounded-lg bg-gray-300 hover:bg-gray-400 text-black"
                >
                  Reset
                </button>
              </div>
            </form>
            <div className="mt-10" aria-live="polite">
              <h3 className="text-xl font-semibold mb-4">Results:</h3>
              {results.length > 0 ? (
                <table className="w-full border-collapse border border-gray-300 text-left">
                  <thead>
                    <tr>
                      <th className="border border-gray-300 p-3">Name</th>
                      <th className="border border-gray-300 p-3">Email</th>
                      <th className="border border-gray-300 p-3">Bio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((result: any, index: number) => (
                      <tr key={index}>
                        <td className="border border-gray-300 p-3">{result.name}</td>
                        <td className="border border-gray-300 p-3">{result.email}</td>
                        <td className="border border-gray-300 p-3">{result.bio}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-gray-700">No results found.</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}