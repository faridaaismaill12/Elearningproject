"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import UpdateProfilePage from "../update/page";

export default function ViewProfilePage() {
  const [profileData, setProfileData] = useState<any>(null);
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false); // Modal state
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      const token = Cookies.get("authToken");

      if (!token) {
        setError("You must log in first.");
        setTimeout(() => {
          router.push("/users/login");
        }, 3000);
        return;
      }

      try {
        const response = await axios.get(
          `http://localhost:5010/users/view-profile`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setProfileData(response.data);
      } catch (err) {
        console.error("Error fetching profile: ", err);
        setError("Could not load profile. Please try again later.");
      }
    };

    fetchProfile();
  }, [router]);

  const handleDeleteProfile = async () => {
    const token = Cookies.get("authToken");

    if (!token) {
      setError("You must log in first.");
      setTimeout(() => {
        router.push("/users/login");
      }, 3000);
      return;
    }

    try {
      const response = await axios.delete(
        `http://localhost:5010/users/delete-profile`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(response.data);
      Cookies.remove("authToken");
      router.push("/users/login");
    } catch (err) {
      console.error("Error deleting profile: ", err);
      setError("Could not delete profile. Please try again later.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
      {profileData ? (
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-4xl w-full">
          <h2 className="text-2xl font-semibold mb-4">User Profile</h2>
          <div>
            <p>
              <strong>Name: </strong> {profileData.name || "N/A"}
            </p>
            <p>
              <strong>Email: </strong> {profileData.email || "N/A"}
            </p>
            <p>
              <strong>Role: </strong> {profileData.role || "N/A"}
            </p>
            <p>
              <strong>Birthday: </strong> {profileData.birthday || "N/A"}
            </p>
            <p>
              <strong>Student Level: </strong> {profileData.studentLevel || "N/A"}
            </p>
            <p>
              <strong>Bio: </strong> {profileData.bio || "N/A"}
            </p>
            <p>
              <strong>Preferences: </strong> {profileData.preferences || "N/A"}
            </p>

            <p className="mt-4">
              <strong>Enrolled Courses:</strong>
            </p>
            {profileData.enrolledCourses && profileData.enrolledCourses.length > 0 ? (
              <ul className="ml-4 space-y-2">
                {profileData.enrolledCourses.map((course: any) => (
                  <li key={course._id} className="p-2 bg-gray-50 border rounded-md">
                    <div className="font-semibold">{course.title}</div>
                    <div className="text-sm text-gray-600">
                      <strong>Description:</strong> {course.description || "N/A"}
                    </div>
                    <div className="text-sm text-gray-600">
                      <strong>Difficulty Level:</strong> {course.difficultyLevel || "N/A"}
                    </div>
                    <div className="text-sm text-gray-600">
                      <strong>Course ID:</strong> {course._id}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No enrolled courses</p>
            )}
          </div>

          {/* Update Profile Button */}
          <div className="mt-6">
            <button
              onClick={() => setIsUpdateModalOpen(true)}
              className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600 transition mb-4"
            >
              Update Profile
            </button>
          </div>

          {/* Reset Password Button */}
          <div className="mt-6">
          <button
            onClick={() => router.push(`/users/profile/reset-password`)}
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition mb-4"
          >
            Reset Password
          </button>
          </div>

          {/* Delete Profile Button */}
          <div className="mt-6">
            <button
              onClick={() => setConfirmDelete(true)}
              className="w-full bg-red-500 text-white p-2 rounded hover:bg-red-600 transition"
            >
              Delete Profile
            </button>

            {/* Confirmation Modal */}
            {confirmDelete && (
              <div className="fixed inset-0 bg-gray-700 bg-opacity-50 flex items-center justify-center">
                <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
                  <h3 className="text-lg font-semibold">Are you sure?</h3>
                  <p className="mb-4">Once you delete your profile, it cannot be undone.</p>
                  <div className="flex justify-between">
                    <button
                      onClick={handleDeleteProfile}
                      className="bg-red-500 text-white p-2 rounded hover:bg-red-600 transition"
                    >
                      Yes, Delete
                    </button>
                    <button
                      onClick={() => setConfirmDelete(false)}
                      className="bg-gray-500 text-white p-2 rounded hover:bg-gray-600 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Update Modal */}
          {isUpdateModalOpen && (
            <div className="fixed inset-0 bg-gray-700 bg-opacity-50 flex items-center justify-center">
              <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
                <button
                  onClick={() => setIsUpdateModalOpen(false)}
                  className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
                >
                  ✕
                </button>
                <UpdateProfilePage />
              </div>
            </div>
          )}
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}