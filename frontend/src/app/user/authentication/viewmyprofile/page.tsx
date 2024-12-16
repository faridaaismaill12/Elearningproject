'use client';
import React, { useEffect, useState } from 'react';
import styles from './viewmyprofile.module.css';

interface EnrolledCourse {
  title: string;
  description: string;
  difficultyLevel: string;
}

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  bio?: string;
  role: string;
  profilePictureUrl?: string;
  enrolledCourses?: EnrolledCourse[];
}

export default function ViewMyProfilePage() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Simulating getting user ID (can be replaced with auth logic)
  const userId = 'YOUR_USER_ID'; // Replace this with dynamic user ID retrieval

  useEffect(() => {
    async function fetchProfile() {
      try {
        const response = await fetch(`/api/users/${userId}/profile`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }
        const data: UserProfile = await response.json();
        setUserProfile(data);
      } catch (err: any) {
        setError(err.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [userId]);

  if (loading) return <div className={styles.loader}>Loading...</div>;
  if (error) return <div className={styles.error}>Error: {error}</div>;

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>My Profile</h1>
      {userProfile ? (
        <div className={styles.profile}>
          <img
            src={userProfile.profilePictureUrl || '/default-profile.png'}
            alt="Profile"
            className={styles.profileImage}
          />
          <div className={styles.details}>
            <p>
              <strong>Name:</strong> {userProfile.name}
            </p>
            <p>
              <strong>Email:</strong> {userProfile.email}
            </p>
            {userProfile.bio && (
              <p>
                <strong>Bio:</strong> {userProfile.bio}
              </p>
            )}
            <p>
              <strong>Role:</strong> {userProfile.role}
            </p>
            {userProfile.enrolledCourses && userProfile.enrolledCourses.length > 0 && (
              <div className={styles.courses}>
                <h2>Enrolled Courses:</h2>
                <ul>
                  {userProfile.enrolledCourses.map((course, index) => (
                    <li key={index} className={styles.courseItem}>
                      <strong>{course.title}</strong> - {course.description} ({course.difficultyLevel})
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div>No user data found.</div>
      )}
    </div>
  );
}
