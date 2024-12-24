"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

export default function UpdateProfilePage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    profilePicture: "",
    birthday: "",
    bio: "",
    preferences: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      const token = Cookies.get("authToken");

      if (!token) {
        setError("You must log in first.");
        router.push("/users/login");
        return;
      }

      try {
        const response = await axios.get(`http://localhost:4000/users/view-profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Populate form with the fetched data
        const { name, email, profilePictureUrl, birthday, bio, preferences } =
          response.data;

        setFormData({
          name: name || "",
          email: email || "",
          profilePicture: profilePictureUrl || "",
          birthday: birthday ? new Date(birthday).toISOString().split("T")[0] : "",
          bio: bio || "",
          preferences: preferences || {},
        });
      } catch (err) {
        console.error("Error fetching profile: ", err);
        setError("Could not load profile. Please try again later.");
      }
    };

    fetchProfile();
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const token = Cookies.get("authToken");
    if (!token) {
      setError("You must log in first.");
      setTimeout(() =>{
        router.push("/users/login");
      } , 3000)
      return;
    }

    try {
      const response = await axios.patch(
        `http://localhost:4000/users/update-profile`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccess("Profile updated successfully!");
    } catch (err) {
      console.error("Error updating profile: ", err);
      setError("Could not update profile. Please try again later.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-semibold mb-4">Update Profile</h2>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        {success && <p className="text-green-500 text-sm mb-4">{success}</p>}

        <form onSubmit={handleSubmit}>
          {/* Name Field */}
          <div className="mb-4">
          <div className="kaggle-profile-pic-wrapper-modal">
              <img
                src={formData.profilePicture || "/avatar-placeholder.png"}
                alt="Profile"
                className="kaggle-profile-pic"
              />
            </div>
            <label htmlFor="name" className="block font-medium mb-1">
              Name
            </label>
            <input
              type="text"
              name="name"
              id="name"
              className="w-full p-2 border rounded"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your name"
            />
          </div>

          {/* Email Field */}
          <div className="mb-4">
            <label htmlFor="email" className="block font-medium mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              id="email"
              className="w-full p-2 border rounded"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
            />
          </div>
          {/* Birthday Field */}
          <div className="mb-4">
            <label htmlFor="birthday" className="block font-medium mb-1">
              Birthday
            </label>
            <input
              type="date"
              name="birthday"
              id="birthday"
              className="w-full p-2 border rounded"
              value={formData.birthday}
              onChange={handleChange}
            />
          </div>

          {/* Bio Field */}
          <div className="mb-4">
            <label htmlFor="bio" className="block font-medium mb-1">
              Bio
            </label>
            <textarea
              name="bio"
              id="bio"
              className="w-full p-2 border rounded"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Write something about yourself..."
            />
          </div>

          {/* Preferences Field */}
          <div className="mb-4">
            <label htmlFor="preferences" className="block font-medium mb-1">
            Preferences
            </label>
            <textarea
              name="preferences"
              id="preferences"
              className="w-full p-2 border rounded"
              value={formData.preferences}
              onChange={handleChange}
              placeholder="Update your preferences..."
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition"
          >
            Update Profile
          </button>
        </form>
      </div>
    </div>
  );
}