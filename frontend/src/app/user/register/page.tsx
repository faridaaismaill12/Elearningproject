'use client';

import React, { useState } from 'react';
import styles from './register.module.css';

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
    });
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    // Handle input changes
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    // Submit registration
    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch('/api/users/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formData.email,
                    passwordHash: formData.password,
                    name: formData.name,
                }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Registration failed');

            setMessage('Registration successful! Please login.');
        } catch (error: any) {
            setMessage(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    // Submit login
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch('/api/users/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formData.email,
                    passwordHash: formData.password,
                }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Login failed');

            setMessage('Login successful! Token: ' + data.accessToken);
        } catch (error: any) {
            setMessage(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Register or Login</h1>

            {/* Registration Form */}
            <form className={styles.form} onSubmit={handleRegister}>
                <h2>Register</h2>
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
                <button type="submit" className={styles.button} disabled={loading}>
                    {loading ? 'Registering...' : 'Register'}
                </button>
            </form>

            {/* Login Form */}
            <form className={styles.form} onSubmit={handleLogin}>
                <h2>Login</h2>
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
                <button type="submit" className={styles.button} disabled={loading}>
                    {loading ? 'Logging in...' : 'Login'}
                </button>
            </form>

            {/* Forgot Password */}
            <div className={styles.forgotPasswordContainer}>
                <button className={styles.forgotPassword} onClick={() => alert('Redirecting to Forgot Password')}>
                    Forgot Password?
                </button>
            </div>

            {/* Message */}
            {message && <p className={styles.message}>{message}</p>}
        </div>
    );
}
