import React, { useRef, useEffect, useState } from 'react';

const WebcamFeed = () => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const socketRef = useRef(null);
    const [status, setStatus] = useState('Connecting...');

    useEffect(() => {
        // Function to handle webcam and WebSocket
        const setupWebcamAndSocket = async () => {
            try {
                // Get webcam stream
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }

                // Setup WebSocket connection
                socketRef.current = new WebSocket('ws://localhost:8000/ws/video');

                socketRef.current.onopen = () => {
                    console.log("WebSocket connection established");
                    setStatus('Connected');

                    // Send frames periodically
                    const intervalId = setInterval(() => {
                        if (videoRef.current && canvasRef.current && socketRef.current.readyState === WebSocket.OPEN) {
                            const canvas = canvasRef.current;
                            const context = canvas.getContext('2d');
                            const video = videoRef.current;

                            canvas.width = video.videoWidth;
                            canvas.height = video.videoHeight;
                            context.drawImage(video, 0, 0, canvas.width, canvas.height);

                            canvas.toBlob((blob) => {
                                if (blob) {
                                    socketRef.current.send(blob);
                                }
                            }, 'image/jpeg', 0.7); // Send as JPEG with 70% quality
                        }
                    }, 500); // Send a frame every 500ms

                    // Store interval ID to clear it on cleanup
                    videoRef.current.intervalId = intervalId;
                };

                socketRef.current.onmessage = (event) => {
                    const data = JSON.parse(event.data);
                    setStatus(data.status || 'OK');
                };

                socketRef.current.onclose = () => {
                    console.log("WebSocket connection closed");
                    setStatus('Disconnected');
                };

                socketRef.current.onerror = (error) => {
                    console.error("WebSocket error:", error);
                    setStatus('Connection Error');
                };

            } catch (err) {
                console.error("Error accessing webcam:", err);
                setStatus('Webcam access denied');
            }
        };

        setupWebcamAndSocket();

        // Cleanup function
        return () => {
            if (videoRef.current && videoRef.current.intervalId) {
                clearInterval(videoRef.current.intervalId);
            }
            if (socketRef.current) {
                socketRef.current.close();
            }
            if (videoRef.current && videoRef.current.srcObject) {
                videoRef.current.srcObject.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    return (
        <div>
            <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', borderRadius: '5px' }}></video>
            <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
            <h5 className="mt-2">Status: 
                <span className={status.includes('FALL') ? 'text-danger fw-bold' : 'text-success'}>
                    {status}
                </span>
            </h5>
        </div>
    );
};

export default WebcamFeed;
