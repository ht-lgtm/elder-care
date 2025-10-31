import React, { useState, useEffect } from 'react';

const Notes = () => {
    const [notes, setNotes] = useState([]);
    const [newNote, setNewNote] = useState('');

    const fetchNotes = async () => {
        try {
            const response = await fetch('/api/notes');
            const data = await response.json();
            setNotes(data);
        } catch (error) {
            console.error("Failed to fetch notes:", error);
        }
    };

    useEffect(() => {
        fetchNotes();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/notes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ note: newNote }),
            });
            if (response.ok) {
                fetchNotes();
                setNewNote('');
            }
        } catch (error) {
            console.error("Failed to add note:", error);
        }
    };

    return (
        <div>
            <form onSubmit={handleSubmit} className="mb-3">
                <div className="mb-2">
                    <textarea 
                        value={newNote} 
                        onChange={(e) => setNewNote(e.target.value)} 
                        className="form-control" 
                        placeholder="Add a new note..."
                        required
                    />
                </div>
                <button type="submit" className="btn btn-primary btn-sm">Save Note</button>
            </form>
            <ul className="list-group">
                {notes.map(note => (
                    <li key={note.id} className="list-group-item">
                        <div className="fw-bold">{note.timestamp}</div>
                        {note.note}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Notes;
