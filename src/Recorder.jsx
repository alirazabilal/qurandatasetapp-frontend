import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';
//import SurahParaSelector from './SurahParaSelector';
import { jwtDecode } from 'jwt-decode';

function Recorder() {
    const [currentAyat, setCurrentAyat] = useState(null);
    const [scriptStyle, setScriptStyle] = useState("uthmani");
    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [recordedCount, setRecordedCount] = useState(0);
    const [totalAyats, setTotalAyats] = useState(0);
    const [userName, setUserName] = useState('');
    const [recordingTime, setRecordingTime] = useState(0);
    const [timeLimitExceeded, setTimeLimitExceeded] = useState(false);
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

    // Fetch next unrecorded ayat
    const fetchNextAyat = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await fetch('https://qurandatasetapp-backend-1.onrender.com/api/ayats/next', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok) {
                if (data.ayat) {
                    setCurrentAyat({ ...data.ayat, isRecorded: false });
                    setRecordedCount(data.recordedCount);
                    setTotalAyats(data.totalAyats);
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

    // Fetch next unrecorded ayat after current index
    const fetchNextAfterIndex = async (currentIndex) => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await fetch(`https://qurandatasetapp-backend-1.onrender.com/api/ayats/next-after/${currentIndex}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok) {
                if (data.ayat) {
                    setCurrentAyat({ ...data.ayat, isRecorded: false });
                    setRecordedCount(data.recordedCount);
                    setTotalAyats(data.totalAyats);
                    setAudioBlob(null);
                    setTimeLimitExceeded(false);
                } else {
                    alert('No more unrecorded ayats available after this one');
                    setCurrentAyat(null);
                }
            } else {
                alert(data.error || 'Failed to fetch next ayat');
                if (response.status === 401) navigate('/login');
            }
        } catch (error) {
            console.error('Error fetching next ayat after index:', error);
            alert('Failed to fetch next ayat');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (userName) fetchNextAyat();
    }, [userName]);

    // Start recording timer
    const startRecordingTimer = () => {
        setRecordingTime(0);
        setTimeLimitExceeded(false);
        recordingTimerRef.current = setInterval(() => {
            setRecordingTime(prevTime => {
                const newTime = prevTime + 1;
                // Auto-stop recording after 30 seconds
                if (newTime >= 30) {
                    stopRecording();
                    setTimeLimitExceeded(true);
                    return 30;
                }
                return newTime;
            });
        }, 1000);
    };

    // Stop recording timer
    const stopRecordingTimer = () => {
        if (recordingTimerRef.current) {
            clearInterval(recordingTimerRef.current);
            recordingTimerRef.current = null;
        }
        setRecordingTime(0);
    };

    // Format time for display
    const formatTime = (seconds) => {
        return `${seconds}s`;
    };

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
            const response = await fetch('https://qurandatasetapp-backend-1.onrender.com/api/recordings/save', {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: formData
            });
            const result = await response.json();
            if (response.ok) {
                alert('Recording saved successfully!');
                fetchNextAyat();
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

    // Handle Skip button click
    const handleSkip = () => {
        if (currentAyat) {
            fetchNextAfterIndex(currentAyat.index);
        } else {
            alert('No current ayat to skip from');
        }
    };

    // Handle Logout
    const handleLogout = () => {
        localStorage.removeItem('token');
        setUserName('');
        navigate('/login');
    };

    // Cleanup timer on unmount
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
                    <h1>Quran Ayat Recording System</h1>
                    <button className="btn btn-logout" onClick={handleLogout}>Logout</button>
                </div>
                <div className="complete-message">
                    <h2>🎉 All Ayats Recorded!</h2>
                    <p>You have successfully recorded all {totalAyats} ayats.</p>
                </div>
            </div>
        );
    }
    console.log("🧩 Current Ayat:", currentAyat);

    return (
        <div className="recorder-page">
            <div className="container">
                <div className="header">
                    <h1 style={{ color: "white" }}>Quran Ayat Recording System</h1>
                    <div>
                        <span className="logged-in">Logged in as: {userName}</span>
                        <button className="btn btn-logout" onClick={handleLogout}>Logout</button>
                    </div>
                </div>

                <div className="progress">
                    <span style={{ color: "white" }}>Progress: {recordedCount} / {totalAyats} ayats recorded</span>
                    <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${(recordedCount / totalAyats) * 100}%` }}></div>
                    </div>
                </div>

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
                        <div className="ayat-meta" >
                            <strong>Surah:</strong> {currentAyat.surahNameEn} ({currentAyat.surahNameAr})
                            {" | "}
                            <strong>Para:</strong> {currentAyat.juzNo}
                            {" | "}
                            <strong>Ayah in Surah:</strong> {currentAyat.ayahNoInSurah}
                        </div>
                    </div>
                    <div
                        style={{
                            display: "flex",
                            flexWrap: "wrap", // ✅ ensures they wrap properly on small screens
                            justifyContent: "flex-end",
                            alignItems: "center",
                            gap: "10px",
                            marginBottom: "14px",
                        }}
                    >
                        <span
                            style={{
                                fontWeight: "600",
                                color: "#333",
                                fontSize: "18px",
                                marginRight: "6px",
                            }}
                        >
                            Script Style:
                        </span>

                        <button
                            onClick={() => setScriptStyle("uthmani")}
                            style={{
                                backgroundColor: scriptStyle === "uthmani" ? "#28a745" : "#e0e0e0",
                                color: scriptStyle === "uthmani" ? "white" : "black",
                                border: "none",
                                padding: "10px 20px", // ✅ increased padding for better touch feel
                                borderRadius: "10px", // ✅ slightly rounder for mobile comfort
                                cursor: "pointer",
                                fontWeight: "bold",
                                fontSize: "16px", // ✅ larger readable text
                                transition: "0.2s",
                                minWidth: "110px", // ✅ wider for mobile
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
                                padding: "10px 20px",
                                borderRadius: "10px",
                                cursor: "pointer",
                                fontWeight: "bold",
                                fontSize: "16px",
                                transition: "0.2s",
                                minWidth: "110px",
                            }}
                        >
                            Indopak
                        </button>
                    </div>



                    <div
                        className="quran-text"
                        style={{
                            fontSize: scriptStyle === "indopak" ? "38px" : "36px",
                            lineHeight: scriptStyle === "indopak" ? "2.7" : "2.5",
                            fontFamily:
                                scriptStyle === "uthmani"
                                    ? "'Amiri Quran', 'Scheherazade New', serif"
                                    : "'Scheherazade New', serif", // ✅ fix diacritics for Indopak
                            letterSpacing: scriptStyle === "indopak" ? "0.3px" : "0px",
                            fontWeight: scriptStyle === "indopak" ? "700" : "400",
                            direction: "rtl",
                            textAlign: "right",
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
                        ⚠️ Note: Please keep recordings under 30 seconds
                    </p>
                    {!audioBlob ? (
                        <div className="recording-controls">
                            <button
                                style={{ color: "white" }}
                                className="btn btn-skip"
                                onClick={handleSkip}
                                disabled={loading || saving}
                            >
                                ⏭ Skip to Next Unrecorded Ayat
                            </button>
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
                                    // Only show Discard button when time limit is exceeded
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
                                    // Show both Save and Discard buttons for normal recordings
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

export default Recorder;