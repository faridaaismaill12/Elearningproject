"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import "./edit-note.css";

const NoteDetailPage = () => {
  const [note, setNote] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatedContent, setUpdatedContent] = useState("");
  const [autosaveMessage, setAutosaveMessage] = useState(false);
  const params = useParams();

  useEffect(() => {
    const fetchNote = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const response = await axios.get(
          `http://localhost:4000/notes/${params.noteId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setNote(response.data);
        setUpdatedContent(response.data.content);
      } catch (err: any) {
        console.error("Error fetching note:", err.message || err);
        setError("Failed to fetch note");
      } finally {
        setLoading(false);
      }
    };

    fetchNote();
  }, [params.noteId]);

  const handleAutosave = useCallback(async () => {
    try {
      const token = localStorage.getItem("authToken");
      await axios.patch(
        `http://localhost:4000/notes/${params.noteId}`,
        { content: updatedContent },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setAutosaveMessage(true);
      setTimeout(() => setAutosaveMessage(false), 2000);
    } catch (err: any) {
      console.error("Error autosaving note:", err.message || err);
      setError("Failed to autosave note");
    }
  }, [params.noteId, updatedContent]);

  // Use debounce effect for autosave
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (note) handleAutosave();
    }, 2000);

    return () => clearTimeout(delayDebounceFn);
  }, [updatedContent, handleAutosave]);

  if (loading) {
    return <div className="note-container">Loading note...</div>;
  }

  if (error) {
    return <div className="note-container">{error}</div>;
  }

  return (
    <div className="note-container">
      <h1 className="title">Edit Note</h1>
      <div className="note-content">
        <textarea
          value={updatedContent}
          onChange={(e) => setUpdatedContent(e.target.value)}
        />
        <div
          className={`autosave-message ${autosaveMessage ? "visible" : ""}`}
        >
          Saved!
        </div>
      </div>
    </div>
  );
};

export default NoteDetailPage;
