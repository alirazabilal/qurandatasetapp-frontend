import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import './App.css';

const API = 'https://qurandatasetapp-backend-1.onrender.com';

function BulkRecording29() {
    const [ayatsGroup, setAyatsGroup] = useState([]);
    const [currentSurahName, setCurrentSurahName] = useState('');
    const [currentSurahNameAr, setCurrentSurahNameAr] = useState('');
    const [scriptStyle, setScriptStyle] = useState('indopak');
    const [recordings, setRecordings] = useState({});
    const [recordingStates, setRecordingStates] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [userName, setUserName] = useState('');
    const [userProgress, setUserProgress] = useState({ recorded: 0, total: 0 });
    const mediaRecordersRef = useRef({});
    const chunksRef = useRef({});
    const navigate = useNavigate();

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

    const fetchNextSurah = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await fetch(`${API}/api/para29-bulk/next`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();

            if (response.ok) {
                if (data.ayats && data.ayats.length > 0) {
                    setAyatsGroup(data.ayats);
                    setCurrentSurahName(data.surahNameEn || '');
                    setCurrentSurahNameAr(data.surahNameAr || '');
                    setUserProgress({ recorded: data.userRecorded, total: data.totalAyats });
                    setRecordings({});
                    setRecordingStates({});
                } else {
                    setAyatsGroup([]);
                    setUserProgress({ recorded: data.userRecorded || 0, total: data.totalAyats || 0 });
                }
            } else {
                alert(data.error || 'Failed to fetch ayats');
                if (response.status === 401) navigate('/login');
            }
        } catch (error) {
            console.error('Error fetching ayats:', error);
            alert('Failed to fetch ayats');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (userName) fetchNextSurah();
    }, [userName]);

    const startRecording = async (ayatIndex) => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecordersRef.current[ayatIndex] = { mediaRecorder, stream };
            chunksRef.current[ayatIndex] = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current[ayatIndex].push(e.data);
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunksRef.current[ayatIndex], { type: 'audio/webm' });
                setRecordings(prev => ({ ...prev, [ayatIndex]: blob }));
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setRecordingStates(prev => ({ ...prev, [ayatIndex]: true }));
        } catch (error) {
            console.error('Error accessing microphone:', error);
            alert('Please allow microphone access to record');
        }
    };

    const stopRecording = (ayatIndex) => {
        const recorderData = mediaRecordersRef.current[ayatIndex];
        if (recorderData && recordingStates[ayatIndex]) {
            recorderData.mediaRecorder.stop();
            setRecordingStates(prev => ({ ...prev, [ayatIndex]: false }));
        }
    };

    const deleteRecording = (ayatIndex) => {
        setRecordings(prev => {
            const next = { ...prev };
            delete next[ayatIndex];
            return next;
        });
    };

    const saveAllRecordings = async () => {
        const recordingsList = Object.entries(recordings);

        if (recordingsList.length === 0) {
            alert('Please record at least one ayah before saving.');
            return;
        }

        setSaving(true);
        try {
            const token = localStorage.getItem('token');
            let successCount = 0;
            let failCount = 0;

            for (const [ayatIndex, audioBlob] of recordingsList) {
                const ayat = ayatsGroup.find(a => a.index === parseInt(ayatIndex));
                if (!ayat) continue;

                const formData = new FormData();
                formData.append('audio', audioBlob, 'recording.webm');
                formData.append('ayatIndex', ayatIndex);
                formData.append('ayatText', ayat.text);

                try {
                    const response = await fetch(`${API}/api/para29-bulk/save`, {
                        method: 'POST',
                        headers: { Authorization: `Bearer ${token}` },
                        body: formData
                    });

                    if (response.ok) {
                        successCount++;
                    } else {
                        failCount++;
                        console.error(`Failed to save ayat ${ayatIndex}`);
                    }
                } catch (error) {
                    failCount++;
                    console.error(`Error saving ayat ${ayatIndex}:`, error);
                }
            }

            if (successCount > 0) {
                alert(`✅ Successfully saved ${successCount} recording(s)!${failCount > 0 ? `\n⚠️ Failed to save ${failCount} recording(s)` : ''}`);
                fetchNextSurah();
            } else {
                alert('❌ Failed to save recordings. Please try again.');
            }
        } catch (error) {
            console.error('Error saving recordings:', error);
            alert('Error saving recordings');
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        setUserName('');
        navigate('/login');
    };

    useEffect(() => {
        return () => {
            Object.values(mediaRecordersRef.current).forEach(({ stream }) => {
                if (stream) stream.getTracks().forEach(track => track.stop());
            });
        };
    }, []);

    if (!userName) {
        return <div className="container"><div className="loading">Authenticating...</div></div>;
    }

    if (loading) {
        return <div className="container"><div className="loading">Loading...</div></div>;
    }

    if (ayatsGroup.length === 0) {
        return (
            <div className="container">
                <div className="header">
                    <h1>Bulk Recording - Para 29</h1>
                    <button className="btn btn-logout" onClick={handleLogout}>Logout</button>
                </div>
                <div className="complete-message">
                    <h2>🎉 All Ayahs Recorded!</h2>
                    <p>You have successfully recorded all {userProgress.total} ayahs from Para 29.</p>
                </div>
            </div>
        );
    }

    const recordedCount = Object.keys(recordings).length;

    return (
        <div className="recorder-page">
            <div className="container">
                <div className="header">
                    <h1 style={{ color: 'white' }}>Bulk Recording - Para 29</h1>
                    <div>
                        <span className="logged-in">Logged in as: {userName}</span>
                        <button className="btn btn-logout" onClick={handleLogout}>Logout</button>
                    </div>
                </div>

                <div className="progress">
                    <span style={{ color: 'white' }}>
                        Your Progress: {userProgress.recorded} / {userProgress.total} ayahs recorded
                    </span>
                    <div className="progress-bar">
                        <div
                            className="progress-fill"
                            style={{ width: `${userProgress.total ? (userProgress.recorded / userProgress.total) * 100 : 0}%` }}
                        />
                    </div>
                    <p style={{ color: 'white', marginTop: '10px', fontSize: '16px', fontWeight: 'bold' }}>
                        📖 Current Surah: {currentSurahName} ({currentSurahNameAr})
                    </p>
                    <p style={{ color: 'white', marginTop: '5px' }}>
                        📝 Recording {recordedCount} of {ayatsGroup.length} ayahs in this surah
                    </p>
                </div>

                {/* Script Style Selector */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                    gap: '10px',
                    marginBottom: '20px',
                    background: 'white',
                    padding: '15px',
                    borderRadius: '8px'
                }}>
                    <span style={{ fontWeight: 'bold', color: '#333', fontSize: '18px' }}>Script Style:</span>
                    <button
                        onClick={() => setScriptStyle('uthmani')}
                        style={{
                            backgroundColor: scriptStyle === 'uthmani' ? '#28a745' : '#e0e0e0',
                            color: scriptStyle === 'uthmani' ? 'white' : 'black',
                            border: 'none', padding: '8px 16px', borderRadius: '8px',
                            cursor: 'pointer', fontWeight: 'bold', minWidth: '100px'
                        }}
                    >
                        Uthmani
                    </button>
                    <button
                        onClick={() => setScriptStyle('indopak')}
                        style={{
                            backgroundColor: scriptStyle === 'indopak' ? '#28a745' : '#e0e0e0',
                            color: scriptStyle === 'indopak' ? 'white' : 'black',
                            border: 'none', padding: '8px 16px', borderRadius: '8px',
                            cursor: 'pointer', fontWeight: 'bold', minWidth: '100px'
                        }}
                    >
                        Indopak
                    </button>
                </div>

                {/* Ayahs List */}
                {ayatsGroup.map((ayat) => {
                    const isRecording = recordingStates[ayat.index];
                    const hasRecording = recordings[ayat.index];

                    return (
                        <div key={ayat.index} className="ayat-card" style={{ marginBottom: '20px' }}>
                            <div className="ayat-header" style={{
                                display: 'flex', justifyContent: 'space-between',
                                alignItems: 'center', marginBottom: '10px', color: 'black'
                            }}>
                                <div className="ayat-number" style={{ fontWeight: 'bold' }}>
                                    Ayah #{ayat.ayahNoQuran}
                                </div>
                                <div className="ayat-meta">
                                    <strong>Surah:</strong> {ayat.surahNameEn} ({ayat.surahNameAr})
                                    {' | '}
                                    <strong>Para:</strong> {ayat.juzNo}
                                    {' | '}
                                    <strong>Ayah in Surah:</strong> {ayat.ayahNoInSurah}
                                </div>
                            </div>

                            <div className="quran-text" style={{
                                fontFamily: scriptStyle === 'uthmani'
                                    ? "'Amiri Quran', 'Scheherazade New', serif"
                                    : "'NooreHiraVolt', serif",
                                fontSize: scriptStyle === 'indopak' ? '38px' : '36px',
                                lineHeight: scriptStyle === 'indopak' ? '2.7' : '2.5',
                                direction: 'rtl',
                                textAlign: 'right',
                                marginBottom: '15px'
                            }}>
                                {scriptStyle === 'uthmani'
                                    ? ayat.uthmani_script || ayat.text
                                    : ayat.indopak_script || ayat.text}
                            </div>

                            {/* Recording Controls */}
                            <div style={{
                                display: 'flex', gap: '10px', alignItems: 'center',
                                justifyContent: 'center', flexWrap: 'wrap'
                            }}>
                                {!hasRecording ? (
                                    <>
                                        {!isRecording ? (
                                            <button
                                                style={{ color: 'white' }}
                                                className="btn btn-record"
                                                onClick={() => startRecording(ayat.index)}
                                                disabled={saving}
                                            >
                                                🎤 Start Recording
                                            </button>
                                        ) : (
                                            <button
                                                style={{ color: 'white' }}
                                                className="btn btn-stop"
                                                onClick={() => stopRecording(ayat.index)}
                                                disabled={saving}
                                            >
                                                ⏹ Stop Recording
                                            </button>
                                        )}
                                        {isRecording && (
                                            <span style={{ color: 'red', fontWeight: 'bold' }}>
                                                🔴 Recording...
                                            </span>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        <audio controls src={URL.createObjectURL(hasRecording)} style={{ maxWidth: '300px' }} />
                                        <button
                                            style={{ color: 'white' }}
                                            className="btn btn-discard"
                                            onClick={() => deleteRecording(ayat.index)}
                                            disabled={saving}
                                        >
                                            🗑️ Re-record
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    );
                })}

                {/* Save All Button */}
                <div style={{ textAlign: 'center', marginTop: '30px', marginBottom: '30px' }}>
                    <button
                        className="btn btn-save"
                        onClick={saveAllRecordings}
                        disabled={saving || recordedCount === 0}
                        style={{
                            fontSize: '18px', padding: '15px 40px',
                            opacity: recordedCount === 0 ? 0.5 : 1, color: 'white'
                        }}
                    >
                        {saving ? '⏳ Saving...' : `💾 Save All Recordings (${recordedCount}/${ayatsGroup.length})`}
                    </button>
                    {recordedCount > 0 && recordedCount < ayatsGroup.length && (
                        <p style={{ color: 'orange', marginTop: '10px' }}>
                            ⚠️ You have recorded {recordedCount} of {ayatsGroup.length} ayahs.
                            You can save partial recordings and continue later.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default BulkRecording29;
