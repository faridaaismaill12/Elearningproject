"use client";

import React, { useState } from "react";
import styles from "./forgotpassword.module.css";
import { forgotPassword } from "./api";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        try {
            const response = await forgotPassword({ email });

            if (response.success) {
                setMessage("Password reset link sent to your email.");
            } else {
                setMessage(response.message || "Failed to send reset link.");
            }
        } catch (error) {
            setMessage("An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Forgot Password</h1>
            <form onSubmit={handleSubmit} className={styles.form}>
                <label htmlFor="email" className={styles.label}>
                    Enter your email address
                </label>
                <input
                    id="email"
                    type="email"
                    placeholder="example@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={styles.input}
                    required
                />
                <button type="submit" className={styles.button} disabled={loading}>
                    {loading ? "Processing..." : "Submit"}
                </button>
            </form>
            {message && <p className={styles.message}>{message}</p>}
        </div>
    );
}
