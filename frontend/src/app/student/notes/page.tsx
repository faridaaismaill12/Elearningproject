"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import "./notes.css";
import Cookies from "js-cookie";

const NotesPage = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        // const token = Cookies.get("authToken");
        const token=localStorage.getItem("authToken");
        if (!token) {
          console.error("Authentication token not found in localStorage.");
          throw new Error("Authentication token not found");
        }

        const decodedToken = JSON.parse(atob(token.split(".")[1]));
        const creator = decodedToken.id;

        const response = await axios.get(
          `http://localhost:4000/notes/getAllNotes?creator=${creator}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("Fetched notes:", response.data);
        setNotes(response.data);
      } catch (err: any) {
        console.error("Error fetching notes:", err.message || err);
        setError("Failed to fetch notes");
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, []);
  const handleAddNote = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("Authentication token not found");
      }
  
      const decodedToken = JSON.parse(atob(token.split(".")[1]));
      const creator = decodedToken.id;
  
      // Construct new note payload
      const newNote = {
        creator,
        content: newNoteContent.trim(),
        course: "64b8f8d7a35f0c001c123457", // Replace with valid course ID if required
        module: "64b8f8d7a35f0c001c123458", // Optional: Replace if applicable
        lesson: "64b8f8d7a35f0c001c123459", // Optional: Replace if applicable
      };
  
      console.log("Adding note:", newNote);
      // Call the correct API endpoint
      const response = await axios.post(
        "http://localhost:4000/notes/createNote", // Updated endpoint
        (newNote),
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
  
      
      setNotes([...notes, response.data]); // Add the new note to the list
      setIsAddingNote(false); // Close the add note mode
      setNewNoteContent(""); // Clear the new note content
    } catch (err: any) {
      console.error("Error adding note:", err.message || err);
      setError("Failed to add note");
    }
  };

  if (loading) {
    return <div className="loading">Loading notes...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="notes-container">
      <h1 className="title">My Notes</h1>

      <div className="notes-grid">
        {notes.map((note: any) => (
          <div
            key={note._id}
            className="note-card"
            onClick={() => router.push(`/student/notes/${note._id}`)} // Navigate on click
          >
            {note.content}
          </div>
          
        ))}
        {isAddingNote && (
          <div className="note-card new-note">
            <textarea
              autoFocus
              placeholder="Write your note here..."
              value={newNoteContent}
              onChange={(e) => setNewNoteContent(e.target.value)}
            />
            <button className="save-note-button" onClick={handleAddNote}>
              Save Note
            </button>
          </div>
        )}
      </div>

      {/* Add Note Button */}
      <div className="add-note-button-container">
        <button
          className="add-note-button"
          onClick={() => setIsAddingNote(!isAddingNote)}
        >
          + Add Note
        </button>
      </div>
    </div>
  );
};

export default NotesPage;
