"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import UpdateProfilePage from "../update/page";
import "./ViewUserProfile.css";

export default function ViewProfilePage() {
  const [profileData, setProfileData] = useState<any>(null);
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
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
        const response = await axios.get(`http://localhost:6165/users/view-profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

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
      await axios.delete(`http://localhost:6165/users/delete-profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      Cookies.remove("authToken");
      router.push("/users/login");
    } catch (err) {
      console.error("Error deleting profile: ", err);
      setError("Could not delete profile. Please try again later.");
    }
  };

  return (
    <div className="kaggle-container">
      {error && <p className="kaggle-error">{error}</p>}
      {profileData ? (
        <div className="kaggle-profile">
          {/* Cover Section */}
          <div className="kaggle-cover">
            <img
              src={ "/carbon-fiber-texture-slides-background.jpg"}
              alt="Cover"
              className="kaggle-cover-image"
            />
            <div className="kaggle-profile-pic-wrapper">
              <img
                src={profileData.profilePicture || "/avatar-placeholder.png"}
                alt="Profile"
                className="kaggle-profile-pic"
              />
            </div>

            {/* Profile Info Over the Cover Image */}
            <div className="kaggle-profile-details">
              <h1 className="kaggle-name">{profileData.name || "User Name"}</h1>
              <p className="kaggle-detail">
                <strong>Email:</strong> {profileData.email || "N/A"}
              </p>
              <p className="kaggle-detail">
                <strong>Role:</strong> {profileData.role || "N/A"}
              </p>
              <p className="kaggle-detail">
                <strong>Student level:</strong> {profileData.studentLevel || "N/A"}
              </p>
              <p className="kaggle-detail">
                <strong>Bio:</strong> {profileData.bio|| "N/A"}
              </p>
            </div>
          </div>
          <div className="kaggle-information">
            <h2>Details</h2>
           
              <ul className="information-item">
              
                  <li className="kaggle-information-item">
                    <div className="kaggle-informtion-title">{profileData.title}</div>
               
                      <strong>Preferences:</strong> {profileData.preferences || "N/A"}
                  
                  </li>
             
              </ul>
          </div>

          {/* Enrolled Courses */}
          <div className="kaggle-courses">
            <h2>Enrolled Courses</h2>
            {profileData.enrolledCourses && profileData.enrolledCourses.length > 0 ? (
              <ul className="kaggle-course-list">
                {profileData.enrolledCourses.map((course: any) => (
                  <li key={course._id} className="kaggle-course-item">
                    <div className="kaggle-course-title">{course.title}</div>
                    <div className="kaggle-course-info">
                      <strong>Description:</strong> {course.description || "N/A"}
                      
                    </div>
                    <div className="kaggle-course-info">
                      <strong>Description:</strong> {course.difficultyLevel || "N/A"}
                      
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No enrolled courses</p>
            )}
          </div>
          

          {/* Action Buttons */}
          <div className="kaggle-actions">
            <button className="kaggle-btn kaggle-btn-update" onClick={() => setIsUpdateModalOpen(true)}>
              Update Profile
            </button>
            <button className="kaggle-btn kaggle-btn-reset" onClick={() => router.push(`/users/profile/reset-password`)}>
              Reset Password
            </button>
            <button className="kaggle-btn kaggle-btn-delete" onClick={() => setConfirmDelete(true)}>
              Delete Profile
            </button>
          </div>

          {/* Delete Confirmation */}
          {confirmDelete && (
            <div className="kaggle-modal">
              <div className="kaggle-modal-content">
                <h3>Are you sure?</h3>
                <p>Once you delete your profile, it cannot be undone.</p>
                <button className="kaggle-btn kaggle-btn-delete" onClick={handleDeleteProfile}>
                  Yes, Delete
                </button>
                <button className="kaggle-btn" onClick={() => setConfirmDelete(false)}>
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Update Profile Modal */}
          {isUpdateModalOpen && (
            <div className="kaggle-modal">
              <div className="kaggle-modal-content">
                <button className="kaggle-modal-close" onClick={() => setIsUpdateModalOpen(false)}>
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
