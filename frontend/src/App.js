import React from 'react';
import './App.css';
import WebcamFeed from './components/WebcamFeed';
import Profile from './components/Profile';
import Medications from './components/Medications';
import Contacts from './components/Contacts';
import Notes from './components/Notes';

function App() {

  const handleShutdown = async () => {
    try {
      await fetch('/api/shutdown', { method: 'POST' });
    } catch (error) {
      console.error("Shutdown signal failed:", error);
    } finally {
      // Close the window after a short delay to ensure the request is sent
      setTimeout(() => window.close(), 500);
    }
  };
  return (
    <div className="App bg-light">
      <header className="bg-dark text-white p-3 d-flex justify-content-between align-items-center">
        <h1 className="mb-0">Elder Care Dashboard</h1>
        <button className="btn btn-danger" onClick={handleShutdown}>Quit Application</button>
      </header>
      <main className="container-fluid p-3">
        <div className="row">
          {/* Left Column */}
          <div className="col-lg-8">
            <div className="card mb-3">
              <div className="card-header"><h4>Live Camera Feed</h4></div>
              <div className="card-body">
                <WebcamFeed />
              </div>
            </div>
            <div className="card mb-3">
              <div className="card-header"><h4>Daily Notes</h4></div>
              <div className="card-body">
                <Notes />
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="col-lg-4">
            <div className="card mb-3">
              <div className="card-header"><h4>Senior's Profile</h4></div>
              <div className="card-body">
                <Profile />
              </div>
            </div>
            <div className="card mb-3">
              <div className="card-header"><h4>Medication Schedule</h4></div>
              <div className="card-body">
                <Medications />
              </div>
            </div>
            <div className="card mb-3">
              <div className="card-header"><h4>Emergency Contacts</h4></div>
              <div className="card-body">
                <Contacts />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;