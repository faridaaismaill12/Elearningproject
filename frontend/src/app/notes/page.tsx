'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';

const NotesPage = ({ creator }: { creator: string }) => {
  const [notes, setNotes] = useState<any[]>([]);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [currentNote, setCurrentNote] = useState<string | null>(null);

  // Fetch notes from the backend
useEffect(() => {
    const fetchNotes = async () => {
    try {
        const response = await axios.get(`http://localhost:5000/notes?creator=${creator}`);
        setNotes(response.data);
    } catch (error) {
        console.error('Error fetching notes', error);
    }
    };
    fetchNotes();
}, [creator]);

  // Autosave note (triggered after a delay)
useEffect(() => {
    if (!currentNote) return;

    const autosaveTimeout = setTimeout(async () => {
    await saveNote();
    }, 2000); // Autosave delay (2 seconds)

    return () => clearTimeout(autosaveTimeout); // Clear timeout on change
}, [newNoteContent, currentNote]);

const saveNote = async () => {
    if (!newNoteContent) return;

    const noteData = {
    creator,
    content: newNoteContent,
      course: 'courseId', // Replace with actual course ID
      module: 'moduleId', // Replace with actual module ID
    };

    try {
    if (currentNote) {
        // Update existing note
        await axios.patch(`http://localhost:5010/notes/${currentNote}`, noteData);
    } else {
        // Create new note
        await axios.post('http://localhost:5010/notes', noteData);
    }
      // Refresh notes after saving
    const response = await axios.get(`http://localhost:5010/notes?creator=${creator}`);
    setNotes(response.data);
    } catch (error) {
    console.error('Error saving note', error);
    }
};

const handleNoteClick = (noteId: string, content: string) => {
    setCurrentNote(noteId);
    setNewNoteContent(content);
};

const handleDelete = async (noteId: string) => {
    try {
    await axios.delete(`http://localhost:5010/notes/${noteId}`);
      setNotes(notes.filter((note) => note._id !== noteId)); // Remove deleted note from state
    } catch (error) {
    console.error('Error deleting note', error);
    }
};

return (
    <div>
    <h1>Your Notes</h1>
    <div>
        {notes.map((note) => (
        <div key={note._id}>
            <h3>{note.title}</h3>
            <p>{note.content}</p>
            <button onClick={() => handleNoteClick(note._id, note.content)}>Edit</button>
            <button onClick={() => handleDelete(note._id)}>Delete</button>
        </div>
        ))}
    </div>
    <textarea
        value={newNoteContent}
        onChange={(e) => setNewNoteContent(e.target.value)}
        placeholder="Type your note here..."
    />
    </div>
);
};

export default NotesPage;
