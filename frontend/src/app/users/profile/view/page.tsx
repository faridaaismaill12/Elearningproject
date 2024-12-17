"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

export default function ViewProfilePage() {
  const [profileData, setProfileData] = useState<any>(null);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      const token = Cookies.get("authToken");

      if (!token) {
        setError("You must log in first.");
        router.push("/login");
        return;
      }

      try {
        // Fetch the user profile from the API endpoint
        const response = await axios.get(
          `http://localhost:5010/users/view-profile`,
          {
            headers: {
              Authorization: `Bearer ${token}`, // Send the token from cookies
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

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
      {profileData ? (
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-sm w-full">
          <h2 className="text-2xl font-semibold mb-4">User Profile</h2>
          <div>
            <p>
              <strong>Name: </strong> {profileData.name || "N/A"}
            </p>
            <p>
              <strong>Email: </strong> {profileData.email || "N/A"}
            </p>
            <p>
              <strong>Enrolled Courses:</strong>
            </p>
            <ul className="ml-4">
              {profileData.enrolledCourses?.map((course: any) => (
                <li key={course._id}>
                  {course.title} - {course.description} ({course.difficultyLevel})
                </li>
              )) || "No enrolled courses"}
            </ul>
          </div>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}