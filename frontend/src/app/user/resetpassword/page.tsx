import { useState } from 'react';
import styles from './resetpassword.module.css';

const ResetPasswordPage = () => {
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 12) {
      setError('Password must be at least 12 characters long.');
      return;
    }

    try {
      // Simulate API call
      const response = await fetch('/api/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newPassword }),
      });

      if (response.ok) {
        alert('Password reset successfully!');
      } else {
        setError('Failed to reset password.');
      }
    } catch (err) {
      setError('An error occurred while resetting the password.');
    }
  };

  return (
    <div className={styles.container}>
      <h1>Reset Password</h1>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.inputContainer}>
          <label htmlFor="newPassword">New Password</label>
          <input
            type="password"
            id="newPassword"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className={styles.input}
          />
        </div>
        {error && <p className={styles.error}>{error}</p>}
        <button type="submit" className={styles.button}>Reset Password</button>
      </form>
    </div>
  );
};

export default ResetPasswordPage;
