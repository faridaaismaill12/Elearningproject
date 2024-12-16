'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import styles from './logout.module.css';

const Logout = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  // Handle logout process
  const handleLogout = async () => {
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }

      // Call the backend API to handle server-side logout (optional, depends on your security needs)
      await axios.post('/api/users/logout', {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Remove token from local storage (client-side logout)
      localStorage.removeItem('token');

      // Redirect user to the login page or home page after successful logout
      router.push('/login');
    } catch (err) {
      setError('Error during logout');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2>Logout</h2>
      {error && <div className={styles.error}>{error}</div>}
      <button
        onClick={handleLogout}
        className={styles.logoutButton}
        disabled={loading}
      >
        {loading ? 'Logging out...' : 'Logout'}
      </button>
    </div>
  );
};

export default Logout;
