import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import './App.css';

function Memorization() {
    const [currentAyat, setCurrentAyat] = useState(null);
    const [scriptStyle, setScriptStyle] = useState("indopak");
    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [userProgress, setUserProgress] = useState({ recorded: 0, total: 558 });
    const [userName, setUserName] = useState('');
    const [recordingTime, setRecordingTime] = useState(0);
    const [timeLimitExceeded, setTimeLimitExceeded] = useState(false);
    const [recordingHistory, setRecordingHistory] = useState([]);
    const [showHistory, setShowHistory] = useState(false);
    const navigate = useNavigate();
    const mediaRecorderRef = useRef(null);
    const chunksRef = useRef([]);
    const recordingTimerRef = useRef(null);

    // Get user name from token
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                setUserName(decoded.name);
            } catch (err) {
                console.error('Invalid token:', err);
                navigate('/login');
            }
        } else {
            navigate('/login');
        }
    }, [navigate]);

    // Fetch next unrecorded ayat from Para 30
    const fetchNextAyat = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await fetch('https://qurandatasetapp-backend-1.onrender.com/api/memorization/next', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok) {
                if (data.ayat) {
                    setCurrentAyat(data.ayat);
                    setUserProgress({
                        recorded: data.userRecorded,
                        total: data.totalAyats
                    });
                    setAudioBlob(null);
                    setTimeLimitExceeded(false);
                } else {
                    setCurrentAyat(null);
                }
            } else {
                alert(data.error || 'Failed to fetch next ayat');
                if (response.status === 401) navigate('/login');
            }
        } catch (error) {
            console.error('Error fetching ayat:', error);
            alert('Failed to fetch next ayat');
        } finally {
            setLoading(false);
        }
    };

    // Fetch user's recording history
    const fetchHistory = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('https://qurandatasetapp-backend-1.onrender.com/api/memorization/history', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok) {
                setRecordingHistory(data.recordings);
            }
        } catch (error) {
            console.error('Error fetching history:', error);
        }
    };

    useEffect(() => {
        if (userName) {
            fetchNextAyat();
            fetchHistory();
        }
    }, [userName]);

    // Recording timer functions
    const startRecordingTimer = () => {
        setRecordingTime(0);
        setTimeLimitExceeded(false);
        recordingTimerRef.current = setInterval(() => {
            setRecordingTime(prevTime => {
                const newTime = prevTime + 1;
                if (newTime >= 30) {
                    stopRecording();
                    setTimeLimitExceeded(true);
                    return 30;
                }
                return newTime;
            });
        }, 1000);
    };

    const stopRecordingTimer = () => {
        if (recordingTimerRef.current) {
            clearInterval(recordingTimerRef.current);
            recordingTimerRef.current = null;
        }
        setRecordingTime(0);
    };

    const formatTime = (seconds) => `${seconds}s`;

    // Start recording
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
                setAudioBlob(blob);
                stream.getTracks().forEach(track => track.stop());
                stopRecordingTimer();
            };

            mediaRecorder.start();
            setIsRecording(true);
            startRecordingTimer();
        } catch (error) {
            console.error('Error accessing microphone:', error);
            alert('Please allow microphone access to record');
            stopRecordingTimer();
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    // Save recording
    const saveRecording = async () => {
        if (!audioBlob || !currentAyat || !userName) {
            alert('Please log in to save recordings.');
            return;
        }

        setSaving(true);
        const formData = new FormData();
        formData.append('audio', audioBlob, 'recording.webm');
        formData.append('ayatIndex', currentAyat.index);
        formData.append('ayatText', currentAyat.text);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('https://qurandatasetapp-backend-1.onrender.com/api/memorization/save', {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: formData
            });
            const result = await response.json();
            if (response.ok) {
                alert('Recording saved successfully!');
                fetchNextAyat();
                fetchHistory();
            } else {
                alert(result.error || 'Failed to save recording');
                if (response.status === 401) navigate('/login');
            }
        } catch (error) {
            console.error('Error saving recording:', error);
            alert('Error saving recording');
        } finally {
            setSaving(false);
        }
    };

    const discardRecording = () => {
        setAudioBlob(null);
        setTimeLimitExceeded(false);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        setUserName('');
        navigate('/login');
    };

    // Delete recording from history
    const deleteRecording = async (recordingId) => {
        if (!window.confirm('Are you sure you want to delete this recording?')) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`https://qurandatasetapp-backend-1.onrender.com/api/memorization/${recordingId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.ok) {
                alert('Recording deleted successfully!');
                fetchHistory();
                fetchNextAyat();
            } else {
                alert('Failed to delete recording');
            }
        } catch (error) {
            console.error('Error deleting recording:', error);
            alert('Error deleting recording');
        }
    };

    useEffect(() => {
        return () => {
            if (recordingTimerRef.current) {
                clearInterval(recordingTimerRef.current);
            }
        };
    }, []);

    if (!userName) {
        return <div className="container"><div className="loading">Authenticating...</div></div>;
    }

    if (loading) {
        return <div className="container"><div className="loading">Loading...</div></div>;
    }

    if (!currentAyat) {
        return (
            <div className="container">
                <div className="header">
                    <h1>Quran Pak- Para 30th Recording System</h1>
                    <button className="btn btn-logout" onClick={handleLogout}>Logout</button>
                </div>
                <div className="complete-message">
                    <h2>🎉 Congratulations!</h2>
                    <p>You have recorded all {userProgress.total} ayats from Para 30!</p>
                    <button className="btn btn-primary" onClick={() => setShowHistory(!showHistory)}>
                        {showHistory ? 'Hide' : 'Show'} Recording History
                    </button>
                </div>
                {showHistory && (
                    <div className="history-section">
                        <h3>Your Recordings ({recordingHistory.length})</h3>
                        {recordingHistory.map(rec => (
                            <div key={rec._id} className="history-item">
                                <div>Ayah #{rec.ayatIndex + 1}</div>
                                <div>{new Date(rec.recordedAt).toLocaleDateString()}</div>
                                <button onClick={() => deleteRecording(rec._id)} className="btn btn-delete">Delete</button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="recorder-page">
            <div className="container">
                <div className="header">
                    <h1 style={{ color: "white" }}>Quran Pak- Para 30th Recording System</h1>
                    <div>
                        <span className="logged-in">Logged in as: {userName}</span>
                        <button className="btn btn-logout" onClick={handleLogout}>Logout</button>
                    </div>
                </div>

                <div className="progress">
                    <span style={{ color: "white" }}>
                        Your Progress: {userProgress.recorded} / {userProgress.total} ayats recorded
                    </span>
                    <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${(userProgress.recorded / userProgress.total) * 100}%` }}></div>
                    </div>
                    <button 
                        className="btn btn-secondary" 
                        onClick={() => setShowHistory(!showHistory)}
                        style={{ marginTop: '10px' }}
                    >
                        {showHistory ? 'Hide' : 'Show'} History ({recordingHistory.length})
                    </button>
                </div>

                {showHistory && (
                    <div className="history-section" style={{ marginBottom: '20px' }}>
                        <h3>Your Recordings</h3>
                        <div className="history-list">
                            {recordingHistory.map(rec => (
                                <div key={rec._id} className="history-item">
                                    <div>
                                        <strong>Ayah #{rec.ayatIndex + 1}</strong>
                                        <br />
                                        <small>{new Date(rec.recordedAt).toLocaleString()}</small>
                                    </div>
                                    <button 
                                        onClick={() => deleteRecording(rec._id)} 
                                        className="btn btn-delete"
                                        style={{ fontSize: '14px', padding: '5px 10px' }}
                                    >
                                        🗑️ Delete
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="ayat-card">
                    <div className="ayat-header" style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "10px",
                        color: "black"
                    }}>
                        <div className="ayat-number" style={{ fontWeight: "bold" }}>
                            Ayah #{currentAyat.ayahNoQuran}
                        </div>
                        <div className="ayat-meta">
                            <strong>Surah:</strong> {currentAyat.surahNameEn} ({currentAyat.surahNameAr})
                            {" | "}
                            <strong>Para:</strong> {currentAyat.juzNo}
                            {" | "}
                            <strong>Ayah in Surah:</strong> {currentAyat.ayahNoInSurah}
                        </div>
                    </div>

                    <div style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        alignItems: "center",
                        gap: "10px",
                        marginBottom: "12px",
                    }}>
                        <span style={{
                            fontWeight: "bold",
                            color: "#333",
                            fontSize: "18px",
                        }}>
                            Script Style:
                        </span>

                        <button
                            onClick={() => setScriptStyle("uthmani")}
                            style={{
                                backgroundColor: scriptStyle === "uthmani" ? "#28a745" : "#e0e0e0",
                                color: scriptStyle === "uthmani" ? "white" : "black",
                                border: "none",
                                padding: "8px 16px",
                                borderRadius: "8px",
                                cursor: "pointer",
                                fontWeight: "bold",
                                transition: "0.2s",
                                minWidth: "100px",
                            }}
                        >
                            Uthmani
                        </button>

                        <button
                            onClick={() => setScriptStyle("indopak")}
                            style={{
                                backgroundColor: scriptStyle === "indopak" ? "#28a745" : "#e0e0e0",
                                color: scriptStyle === "indopak" ? "white" : "black",
                                border: "none",
                                padding: "8px 16px",
                                borderRadius: "8px",
                                cursor: "pointer",
                                fontWeight: "bold",
                                transition: "0.2s",
                                minWidth: "100px",
                            }}
                        >
                            Indopak
                        </button>
                    </div>

                    <div
                        className="quran-text"
                        style={{
                            fontFamily: scriptStyle === "uthmani"
                                ? "'Amiri Quran', 'Scheherazade New', serif"
                                : "'NooreHiraVolt', serif",
                            fontSize: scriptStyle === "indopak" ? "38px" : "36px",
                            lineHeight: scriptStyle === "indopak" ? "2.7" : "2.5",
                            fontWeight: "normal",
                            direction: "rtl",
                            textAlign: "right",
                            WebkitFontSmoothing: "antialiased",
                            MozOsxFontSmoothing: "grayscale",
                        }}
                    >
                        {scriptStyle === "uthmani"
                            ? currentAyat.uthmani_script || currentAyat.text
                            : currentAyat.indopak_script || currentAyat.text}
                    </div>
                </div>

                <div className="controls">
                    <p style={{
                        textAlign: "center",
                        color: "#764ba2",
                        fontWeight: "500",
                        margin: "1rem",
                    }}>
                        ⚠️ Note: Keep recordings under 30 seconds. You can record each ayat multiple times.
                    </p>
                    {!audioBlob ? (
                        <div className="recording-controls">
                            {!isRecording ? (
                                <button
                                    style={{ color: "white" }}
                                    className="btn btn-record"
                                    onClick={startRecording}
                                    disabled={loading || saving}
                                >
                                    🎤 Start Recording
                                </button>
                            ) : (
                                <button
                                    style={{ color: "white" }}
                                    className="btn btn-stop"
                                    onClick={stopRecording}
                                    disabled={loading || saving}
                                >
                                    ⏹ Stop Recording
                                </button>
                            )}
                            {isRecording && (
                                <div style={{ color: "blue" }} className="recording-indicator">
                                    Recording... {formatTime(recordingTime)}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="playback-controls">
                            <audio controls src={URL.createObjectURL(audioBlob)} />
                            <div className="button-group">
                                {timeLimitExceeded ? (
                                    <div style={{ textAlign: "center", width: "100%" }}>
                                        <p className="limit-warning" style={{ color: "red", marginBottom: "1rem" }}>
                                            ⚠️ Recording exceeded 30 second limit
                                        </p>
                                        <button
                                            style={{ color: "white" }}
                                            className="btn btn-discard"
                                            onClick={discardRecording}
                                            disabled={saving}
                                        >
                                            🗑️ Discard Recording
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <button
                                            style={{ color: "white", width: "auto" }}
                                            className="btn btn-save"
                                            onClick={saveRecording}
                                            disabled={saving}
                                        >
                                            {saving ? 'Saving...' : '💾 Save Recording'}
                                        </button>
                                        <button
                                            style={{ color: "white" }}
                                            className="btn btn-discard"
                                            onClick={discardRecording}
                                            disabled={saving}
                                        >
                                            🗑️ Discard
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Memorization;