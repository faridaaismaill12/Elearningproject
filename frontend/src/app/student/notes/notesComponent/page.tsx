"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";

const NotesComponent = ({ contextId, contextType }) => {
  const [notes, setNotes] = useState([]);
  const [newNoteContent, setNewNoteContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const response = await axios.get(
          `http://localhost:4000/notes/${contextType}/${contextId}`
        );
        setNotes(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, [contextId, contextType]);

  const handleAddNote = async () => {
    try {
      const response = await axios.post("http://localhost:4000/notes", {
        contextId,
        contextType,
        content: newNoteContent,
      });
      setNotes([...notes, response.data]);
      setNewNoteContent("");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h2>Notes</h2>
      <ul>
        {notes.map((note) => (
          <li key={note.id}>{note.content}</li>
        ))}
      </ul>
      <textarea
        value={newNoteContent}
        onChange={(e) => setNewNoteContent(e.target.value)}
      />
      <button onClick={handleAddNote}>Add Note</button>
    </div>
  );
};

export default NotesComponent;
