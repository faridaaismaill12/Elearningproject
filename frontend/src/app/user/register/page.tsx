'use client';

import React, { useState } from 'react';
import styles from './register.module.css';
import  { registerUser } from './api';

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'student', // default role
        profilePictureUrl: '',
        birthday: '',
        bio: '',
        studentLevel: 'beginner', // default level
        preferences: '{}', // JSON string
    });

    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    // Handle input changes
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    // Handle form submission
    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await registerUser({
                ...formData,
                preferences: JSON.parse(formData.preferences),
                birthday: formData.birthday ? new Date(formData.birthday).toISOString() : undefined,
            });

            if (response.success) {
                setMessage('Registration successful! Please login.');
            } else {
                throw new Error(response.message);
            }
        } catch (error: any) {
            setMessage(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Register</h1>
            <form className={styles.form} onSubmit={handleRegister}>
                <input
                    type="text"
                    name="name"
                    placeholder="Name"
                    onChange={handleChange}
                    className={styles.input}
                    required
                />
                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    onChange={handleChange}
                    className={styles.input}
                    required
                />
                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    onChange={handleChange}
                    className={styles.input}
                    required
                />
                <select name="role" onChange={handleChange} className={styles.input} required>
                    <option value="student">Student</option>
                    <option value="admin">Admin</option>
                    <option value="instructor">Instructor</option>
                </select>
                <input
                    type="url"
                    name="profilePictureUrl"
                    placeholder="Profile Picture URL"
                    onChange={handleChange}
                    className={styles.input}
                />
                <input
                    type="date"
                    name="birthday"
                    placeholder="Birthday"
                    onChange={handleChange}
                    className={styles.input}
                />
                <textarea
                    name="bio"
                    placeholder="Bio"
                    onChange={handleChange}
                    className={styles.input}
                />
                <select name="studentLevel" onChange={handleChange} className={styles.input} required>
                    <option value="beginner">Beginner</option>
                    <option value="average">Average</option>
                    <option value="advanced">Advanced</option>
                </select>
                <textarea
                    name="preferences"
                    placeholder="Preferences (JSON format)"
                    onChange={handleChange}
                    className={styles.input}
                />
                <button type="submit" className={styles.button} disabled={loading}>
                    {loading ? 'Registering...' : 'Register'}
                </button>
            </form>
            {message && <p className={styles.message}>{message}</p>}
        </div>
    );
}