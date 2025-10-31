import React, { useState, useEffect } from 'react';

const Contacts = () => {
    const [contacts, setContacts] = useState([]);
    const [newContact, setNewContact] = useState({ name: '', phone: '', relationship: '' });

    const fetchContacts = async () => {
        try {
            const response = await fetch('/api/contacts');
            const data = await response.json();
            setContacts(data);
        } catch (error) {
            console.error("Failed to fetch contacts:", error);
        }
    };

    useEffect(() => {
        fetchContacts();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewContact(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/contacts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newContact),
            });
            if (response.ok) {
                fetchContacts();
                setNewContact({ name: '', phone: '', relationship: '' });
            }
        } catch (error) {
            console.error("Failed to add contact:", error);
        }
    };

    const handleDelete = async (id) => {
        try {
            await fetch(`/api/contacts/${id}`, { method: 'DELETE' });
            fetchContacts();
        } catch (error) {
            console.error("Failed to delete contact:", error);
        }
    };

    return (
        <div>
            <ul className="list-group mb-3">
                {contacts.map(contact => (
                    <li key={contact.id} className="list-group-item d-flex justify-content-between align-items-center">
                        <div>
                            <strong>{contact.name}</strong> ({contact.relationship}) - <em>{contact.phone}</em>
                        </div>
                        <button onClick={() => handleDelete(contact.id)} className="btn btn-danger btn-sm">X</button>
                    </li>
                ))}
            </ul>
            <form onSubmit={handleSubmit}>
                <div className="input-group input-group-sm mb-1">
                    <input type="text" name="name" placeholder="Name" value={newContact.name} onChange={handleInputChange} className="form-control" required />
                </div>
                <div className="input-group input-group-sm mb-1">
                    <input type="text" name="phone" placeholder="Phone" value={newContact.phone} onChange={handleInputChange} className="form-control" required />
                </div>
                <div className="input-group input-group-sm mb-2">
                    <input type="text" name="relationship" placeholder="Relationship" value={newContact.relationship} onChange={handleInputChange} className="form-control" required />
                </div>
                <button type="submit" className="btn btn-primary btn-sm">Add Contact</button>
            </form>
        </div>
    );
};

export default Contacts;
