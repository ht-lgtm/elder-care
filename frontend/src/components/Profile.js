import React, { useState, useEffect } from 'react';

const Profile = () => {
    const [profile, setProfile] = useState({ full_name: '', age: '', medical_conditions: '' });
    const [isEditing, setIsEditing] = useState(false);

    const fetchProfile = async () => {
        try {
            const response = await fetch('/api/profile');
            const data = await response.json();
            setProfile(data);
        } catch (error) {
            console.error("Failed to fetch profile:", error);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProfile(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(profile),
            });
            const data = await response.json();
            setProfile(data);
            setIsEditing(false);
        } catch (error) {
            console.error("Failed to update profile:", error);
        }
    };

    return (
        <div>
            {isEditing ? (
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label">Full Name</label>
                        <input type="text" name="full_name" value={profile.full_name} onChange={handleInputChange} className="form-control" />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Age</label>
                        <input type="number" name="age" value={profile.age} onChange={handleInputChange} className="form-control" />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Medical Conditions</label>
                        <textarea name="medical_conditions" value={profile.medical_conditions} onChange={handleInputChange} className="form-control"></textarea>
                    </div>
                    <button type="submit" className="btn btn-primary btn-sm me-2">Save</button>
                    <button type="button" onClick={() => setIsEditing(false)} className="btn btn-secondary btn-sm">Cancel</button>
                </form>
            ) : (
                <div>
                    <p><strong>Name:</strong> {profile.full_name}</p>
                    <p><strong>Age:</strong> {profile.age}</p>
                    <p><strong>Conditions:</strong> {profile.medical_conditions}</p>
                    <button onClick={() => setIsEditing(true)} className="btn btn-primary btn-sm">Edit Profile</button>
                </div>
            )}
        </div>
    );
};

export default Profile;
