import React, { useState, useEffect } from 'react';

const Medications = () => {
    const [meds, setMeds] = useState([]);
    const [newMed, setNewMed] = useState({ name: '', dosage: '', time: '' });

    const fetchMeds = async () => {
        try {
            const response = await fetch('/api/medications');
            const data = await response.json();
            setMeds(data);
        } catch (error) {
            console.error("Failed to fetch medications:", error);
        }
    };

    useEffect(() => {
        fetchMeds();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewMed(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/medications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newMed),
            });
            if (response.ok) {
                fetchMeds(); // Re-fetch to update the list
                setNewMed({ name: '', dosage: '', time: '' }); // Reset form
            }
        } catch (error) {
            console.error("Failed to add medication:", error);
        }
    };

    const handleDelete = async (id) => {
        try {
            await fetch(`/api/medications/${id}`, { method: 'DELETE' });
            fetchMeds(); // Re-fetch to update the list
        } catch (error) {
            console.error("Failed to delete medication:", error);
        }
    };

    return (
        <div>
            <ul className="list-group mb-3">
                {meds.map(med => (
                    <li key={med.id} className="list-group-item d-flex justify-content-between align-items-center">
                        <div>
                            <strong>{med.name}</strong> ({med.dosage}) - <em>{med.time}</em>
                        </div>
                        <button onClick={() => handleDelete(med.id)} className="btn btn-danger btn-sm">X</button>
                    </li>
                ))}
            </ul>
            <form onSubmit={handleSubmit}>
                <div className="input-group input-group-sm mb-1">
                    <input type="text" name="name" placeholder="Medication Name" value={newMed.name} onChange={handleInputChange} className="form-control" required />
                </div>
                <div className="input-group input-group-sm mb-1">
                    <input type="text" name="dosage" placeholder="Dosage (e.g., 1 pill)" value={newMed.dosage} onChange={handleInputChange} className="form-control" required />
                </div>
                <div className="input-group input-group-sm mb-2">
                    <input type="text" name="time" placeholder="Time (e.g., 8:00 AM)" value={newMed.time} onChange={handleInputChange} className="form-control" required />
                </div>
                <button type="submit" className="btn btn-primary btn-sm">Add Medication</button>
            </form>
        </div>
    );
};

export default Medications;
