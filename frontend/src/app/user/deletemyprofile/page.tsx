'use client';

import React, { useState } from 'react';
import styles from './deletemyprofile.module.css';
import { useRouter } from 'next/navigation';

const DeleteMyProfile = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const handleDeleteProfile = async () => {
    const confirmDelete = confirm('Are you sure you want to delete your profile? This action is irreversible.');
    if (!confirmDelete) return;

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const response = await fetch('/api/users/delete-profile', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`, // Fetch the JWT token from storage
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete profile');
      }

      setSuccess('Your profile has been successfully deleted.');
      localStorage.removeItem('token'); // Clear token on successful deletion
      router.push('/'); // Redirect to the homepage or login page
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1>Delete My Profile</h1>
      <p className={styles.warning}>
        Warning: Deleting your profile will remove all your account information. This action cannot be undone.
      </p>

      {error && <p className={styles.error}>{error}</p>}
      {success && <p className={styles.success}>{success}</p>}

      <button className={styles.deleteButton} onClick={handleDeleteProfile} disabled={loading}>
        {loading ? 'Deleting...' : 'Delete My Profile'}
      </button>
    </div>
  );
};

export default DeleteMyProfile;
