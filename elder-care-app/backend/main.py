import asyncio
import cv2
import numpy as np
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends, HTTPException
from sqlalchemy import create_engine, Column, Integer, String, Text
from sqlalchemy.orm import sessionmaker, Session
from pydantic import BaseModel
from sqlalchemy.ext.declarative import declarative_base
from typing import List, Optional
import os
import sys
import threading
import time
import webbrowser
import uvicorn
from fastapi.staticfiles import StaticFiles
from starlette.responses import FileResponse

import signal

# --- PyInstaller Path Helper ---
def resource_path(relative_path):
    try:
        base_path = sys._MEIPASS
    except Exception:
        base_path = os.path.abspath(".")
    return os.path.join(base_path, relative_path)

# --- Database Setup ---
# Use a file-based DB that will be created next to the executable
if getattr(sys, 'frozen', False):
    exe_dir = os.path.dirname(sys.executable)
    db_path = os.path.join(exe_dir, "elder_care_data.db")
else:
    db_path = "elder_care_new.db"
DATABASE_URL = f"sqlite:///{db_path}"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# --- SQLAlchemy Models ---
class SeniorProfile(Base):
    __tablename__ = "profile"
    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, default="N/A")
    age = Column(Integer, default=0)
    medical_conditions = Column(Text, default="")

class Medication(Base):
    __tablename__ = "medications"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    dosage = Column(String)
    time = Column(String)

class EmergencyContact(Base):
    __tablename__ = "contacts"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    phone = Column(String)
    relationship = Column(String)

class DailyNote(Base):
    __tablename__ = "notes"
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(String)
    note = Column(Text)

# Create all tables
Base.metadata.create_all(bind=engine)

# --- Pydantic Schemas ---
class SeniorProfileSchema(BaseModel):
    full_name: str
    age: int
    medical_conditions: str
    class Config: from_attributes = True

class MedicationSchema(BaseModel):
    id: int
    name: str
    dosage: str
    time: str
    class Config: from_attributes = True

class MedicationCreate(BaseModel):
    name: str
    dosage: str
    time: str

class EmergencyContactSchema(BaseModel):
    id: int
    name: str
    phone: str
    relationship: str
    class Config: from_attributes = True

class EmergencyContactCreate(BaseModel):
    name: str
    phone: str
    relationship: str

class DailyNoteSchema(BaseModel):
    id: int
    timestamp: str
    note: str
    class Config: from_attributes = True

class DailyNoteCreate(BaseModel):
    note: str

# --- FastAPI App ---
app = FastAPI()

# --- DB Dependency ---
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- Fall Detection Simulation ---
prev_frame = None
async def process_video(ws: WebSocket):
    global prev_frame
    while True:
        try:
            bytes_data = await ws.receive_bytes()
            nparr = np.frombuffer(bytes_data, np.uint8)
            frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            if frame is None: continue

            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            gray = cv2.GaussianBlur(gray, (21, 21), 0)

            if prev_frame is None:
                prev_frame = gray
                continue

            frame_delta = cv2.absdiff(prev_frame, gray)
            thresh = cv2.threshold(frame_delta, 30, 255, cv2.THRESH_BINARY)[1]
            thresh = cv2.dilate(thresh, None, iterations=2)
            contours, _ = cv2.findContours(thresh.copy(), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            
            motion_detected = False
            for contour in contours:
                if cv2.contourArea(contour) > 18000:
                    motion_detected = True
                    break
            
            prev_frame = gray

            if motion_detected:
                await ws.send_json({"status": "POTENTIAL FALL DETECTED"})
            else:
                await ws.send_json({"status": "OK"})

        except WebSocketDisconnect:
            prev_frame = None
            break
        except Exception:
            break

@app.websocket("/ws/video")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    await process_video(websocket)

# --- API Endpoints ---
@app.get("/api/profile", response_model=SeniorProfileSchema)
def get_profile(db: Session = Depends(get_db)):
    profile = db.query(SeniorProfile).first()
    if not profile:
        profile = SeniorProfile()
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile

@app.put("/api/profile", response_model=SeniorProfileSchema)
def update_profile(profile_data: SeniorProfileSchema, db: Session = Depends(get_db)):
    profile = db.query(SeniorProfile).first()
    if not profile: raise HTTPException(status_code=404, detail="Profile not found")
    profile.full_name = profile_data.full_name
    profile.age = profile_data.age
    profile.medical_conditions = profile_data.medical_conditions
    db.commit()
    db.refresh(profile)
    return profile

@app.get("/api/medications", response_model=List[MedicationSchema])
def get_medications(db: Session = Depends(get_db)):
    return db.query(Medication).all()

@app.post("/api/medications", response_model=MedicationSchema)
def add_medication(med: MedicationCreate, db: Session = Depends(get_db)):
    db_med = Medication(**med.model_dump())
    db.add(db_med)
    db.commit()
    db.refresh(db_med)
    return db_med

@app.delete("/api/medications/{med_id}")
def delete_medication(med_id: int, db: Session = Depends(get_db)):
    db_med = db.query(Medication).filter(Medication.id == med_id).first()
    if not db_med: raise HTTPException(status_code=404, detail="Medication not found")
    db.delete(db_med)
    db.commit()
    return {"ok": True}

@app.get("/api/contacts", response_model=List[EmergencyContactSchema])
def get_contacts(db: Session = Depends(get_db)):
    return db.query(EmergencyContact).all()

@app.post("/api/contacts", response_model=EmergencyContactSchema)
def add_contact(contact: EmergencyContactCreate, db: Session = Depends(get_db)):
    db_contact = EmergencyContact(**contact.model_dump())
    db.add(db_contact)
    db.commit()
    db.refresh(db_contact)
    return db_contact

@app.delete("/api/contacts/{contact_id}")
def delete_contact(contact_id: int, db: Session = Depends(get_db)):
    db_contact = db.query(EmergencyContact).filter(EmergencyContact.id == contact_id).first()
    if not db_contact: raise HTTPException(status_code=404, detail="Contact not found")
    db.delete(db_contact)
    db.commit()
    return {"ok": True}

@app.get("/api/notes", response_model=List[DailyNoteSchema])
def get_notes(db: Session = Depends(get_db)):
    return db.query(DailyNote).order_by(DailyNote.id.desc()).all()

@app.post("/api/notes", response_model=DailyNoteSchema)
def add_note(note: DailyNoteCreate, db: Session = Depends(get_db)):
    from datetime import datetime
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    db_note = DailyNote(note=note.note, timestamp=timestamp)
    db.add(db_note)
    db.commit()
    db.refresh(db_note)
    return db_note

@app.post("/api/shutdown")
def shutdown():
    # A forceful but effective way to shut down the server in a packaged app
    os.kill(os.getpid(), signal.SIGTERM)
    return {"message": "Server is shutting down"}

# --- Serve Frontend ---
build_path = resource_path("frontend/build")
app.mount("/static", StaticFiles(directory=os.path.join(build_path, "static")), name="static")

@app.get("/{full_path:path}")
async def serve_react_app(full_path: str):
    index_path = os.path.join(build_path, 'index.html')
    if not os.path.exists(index_path):
        return {"error": "index.html not found"}
    return FileResponse(index_path)

# --- Main Execution Block ---
def open_browser():
    time.sleep(2)
    webbrowser.open("http://127.0.0.1:8000")

if __name__ == "__main__":
    if getattr(sys, 'frozen', False):
        exe_dir = os.path.dirname(sys.executable)
        log_file = os.path.join(exe_dir, 'app_log.txt')
        sys.stdout = open(log_file, 'w', encoding='utf-8')
        sys.stderr = sys.stdout
    
    threading.Thread(target=open_browser, daemon=True).start()
    uvicorn.run(app, host="127.0.0.1", port=8000)