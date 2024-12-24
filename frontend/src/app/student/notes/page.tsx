"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Notes.css"; // Import the custom CSS for styling
import { useParams } from "next/navigation";

const NotesPage = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Extract creator from route parameters
const { creator } = useParams();

useEffect(() => {
    const fetchNotes = async () => {
    try {
        const token = localStorage.getItem("authToken");
        if (!token) {
        throw new Error("Authentication token not found");
        }

        if (!creator) {
        throw new Error("Creator ID is missing");
        }

        console.log("Fetching notes for creator:", creator);

        const response = await axios.get(
        `http://localhost:3000/notes/getAllNotes?creator=${creator}`,
        {
            headers: {
            Authorization: `Bearer ${token}`,
            },
        }
        );

        setNotes(response.data);
    } catch (err) {
        console.error("Error fetching notes:", err);
        setError("Failed to fetch notes");
    } finally {
        setLoading(false);
    }
    };

    fetchNotes();
}, [creator]);

if (loading) {
    return <div className="loading">Loading notes...</div>;
}

if (error) {
    return <div className="error">{error}</div>;
}

return (
    <div className="notes-container">
    <h1 className="title">My Notes</h1>
    {notes.length === 0 ? (
        <p className="no-notes">You have no notes yet.</p>
    ) : (
        <div className="notes-grid">
        {notes.map((note: any) => (
            <div key={note._id} className="note-card">
            <h2>Course: {note.course}</h2>
            {note.module && <p>Module: {note.module}</p>}
            {note.lesson && <p>Lesson: {note.lesson}</p>}
            <p>{note.content}</p>
            <p className="last-modified">
                Last Modified: {new Date(note.lastModified).toLocaleString()}
            </p>
            </div>
        ))}
        </div>
    )}
    </div>
);
};

export default NotesPage;