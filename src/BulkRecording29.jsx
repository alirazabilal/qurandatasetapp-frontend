import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import './App.css';

const API = 'https://qurandatasetapp-backend-1.onrender.com';

// Session-level skipped surahs — relogin pe reset ho jaata hai
const getSkippedSurahs = () => {
    try {
        const s = sessionStorage.getItem('para29_skipped_surahs');
        return s ? JSON.parse(s) : [];
    } catch { return []; }
};
const setSkippedSurahs = (arr) => {
    sessionStorage.setItem('para29_skipped_surahs', JSON.stringify(arr));
};
const addSkippedSurah = (surahNo) => {
    const current = getSkippedSurahs();
    if (!current.includes(surahNo)) {
        setSkippedSurahs([...current, surahNo]);
    }
};
const removeSkippedSurah = (surahNo) => {
    setSkippedSurahs(getSkippedSurahs().filter(s => s !== surahNo));
};
const clearSkippedSurahs = () => {
    sessionStorage.removeItem('para29_skipped_surahs');
};

function BulkRecording29() {
    const [ayatsGroup, setAyatsGroup] = useState([]);
    const [currentSurahName, setCurrentSurahName] = useState('');
    const [currentSurahNameAr, setCurrentSurahNameAr] = useState('');
    const [currentSurahNo, setCurrentSurahNo] = useState(null);
    const [hasSkipped, setHasSkipped] = useState(false);
    const [skippedCount, setSkippedCount] = useState(0);
    const [scriptStyle, setScriptStyle] = useState('indopak');
    const [recordings, setRecordings] = useState({});
    const [recordingStates, setRecordingStates] = useState({});
    const [movingNext, setMovingNext] = useState(false);
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
                // Relogin pe skipped surahs reset
                clearSkippedSurahs();
            } catch (err) {
                navigate('/login');
            }
        } else {
            navigate('/login');
        }
    }, [navigate]);

    const fetchNextSurah = async (skipList = null) => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const skipped = skipList !== null ? skipList : getSkippedSurahs();
            const skipParam = skipped.length > 0 ? `?skipSurahs=${skipped.join(',')}` : '';
            const response = await fetch(`${API}/api/para29-bulk/next${skipParam}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();

            if (response.ok) {
                if (data.ayats && data.ayats.length > 0) {
                    setAyatsGroup(data.ayats);
                    setCurrentSurahName(data.surahNameEn || '');
                    setCurrentSurahNameAr(data.surahNameAr || '');
                    setCurrentSurahNo(data.currentSurah);
                    setHasSkipped(data.hasSkipped || false);
                    setSkippedCount(data.skippedCount || 0);
                    setUserProgress({ recorded: data.userRecorded, total: data.totalAyats });
                    setRecordings({});
                    setRecordingStates({});
                } else {
                    setAyatsGroup([]);
                    setUserProgress({ recorded: data.userRecorded || 0, total: data.totalAyats || 0 });
                    setHasSkipped(false);
                    setSkippedCount(0);
                }
            } else {
                alert(data.error || 'Failed to fetch ayats');
                if (response.status === 401) navigate('/login');
            }
        } catch (error) {
            alert('Failed to fetch ayats');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (userName) fetchNextSurah([]);  // Fresh start — no skips on login
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
                stream.getTracks().forEach(t => t.stop());
            };
            mediaRecorder.start();
            setRecordingStates(prev => ({ ...prev, [ayatIndex]: true }));
        } catch (error) {
            alert('Please allow microphone access to record');
        }
    };

    const stopRecording = (ayatIndex) => {
        const r = mediaRecordersRef.current[ayatIndex];
        if (r && recordingStates[ayatIndex]) {
            r.mediaRecorder.stop();
            setRecordingStates(prev => ({ ...prev, [ayatIndex]: false }));
        }
    };

    const deleteRecording = (ayatIndex) => {
        setRecordings(prev => {
            const n = { ...prev };
            delete n[ayatIndex];
            return n;
        });
    };

    // Move to Next Surah — skip current surah (session only, relogin pe reset)
    const moveToNextSurah = async () => {
        if (!currentSurahNo || movingNext) return;
        setMovingNext(true);
        try {
            addSkippedSurah(currentSurahNo);
            const newSkipped = getSkippedSurahs();
            await fetchNextSurah(newSkipped);
        } finally {
            setMovingNext(false);
        }
    };

    // Show Pending — skipped surahs wapas dikhao
    const showPendingAyats = async () => {
        if (movingNext) return;
        setMovingNext(true);
        try {
            // Current surah ko skipped mein add karo, phir skipped wali fetch karo
            if (currentSurahNo) addSkippedSurah(currentSurahNo);
            // Saari skipped surahs clear karo aur pehli skipped dikhao
            const skipped = getSkippedSurahs();
            if (skipped.length === 0) {
                alert('No pending ayahs! All surahs are in progress.');
                return;
            }
            // Sirf skipped wali dikhao — non-skipped ignore karo temporarily
            // by passing empty skipSurahs (server non-skipped first dikhayega)
            // Actually: pending = wahi surahs jo skip ki hain, unhe dikhao directly
            const token = localStorage.getItem('token');
            const response = await fetch(
                `${API}/api/para29-bulk/next?skipSurahs=`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const data = await response.json();
            if (response.ok && data.ayats && data.ayats.length > 0) {
                // Pehli skipped surah find karo
                const firstSkipped = skipped[0];
                const skippedParam = skipped.filter(s => s !== firstSkipped).join(',');
                const r2 = await fetch(
                    `${API}/api/para29-bulk/next?skipSurahs=${skippedParam}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                const d2 = await r2.json();
                if (r2.ok && d2.ayats && d2.ayats.length > 0) {
                    setAyatsGroup(d2.ayats);
                    setCurrentSurahName(d2.surahNameEn || '');
                    setCurrentSurahNameAr(d2.surahNameAr || '');
                    setCurrentSurahNo(d2.currentSurah);
                    setHasSkipped(true);
                    setUserProgress({ recorded: d2.userRecorded, total: d2.totalAyats });
                    setRecordings({});
                    setRecordingStates({});
                    // Update session skip list
                    setSkippedSurahs(skippedParam ? skippedParam.split(',').map(Number) : []);
                }
            }
        } finally {
            setMovingNext(false);
        }
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
            let successCount = 0, failCount = 0;
            for (const [ayatIndex, audioBlob] of recordingsList) {
                const ayat = ayatsGroup.find(a => a.index === parseInt(ayatIndex));
                if (!ayat) continue;
                const formData = new FormData();
                formData.append('audio', audioBlob, 'recording.webm');
                formData.append('ayatIndex', ayatIndex);
                formData.append('ayatText', ayat.text);
                try {
                    const r = await fetch(`${API}/api/para29-bulk/save`, {
                        method: 'POST',
                        headers: { Authorization: `Bearer ${token}` },
                        body: formData
                    });
                    if (r.ok) successCount++;
                    else failCount++;
                } catch { failCount++; }
            }
            if (successCount > 0) {
                // Agar saari ayats record ho gayi to is surah ki skip entry hata do
                const allRecorded = ayatsGroup.every(a => recordings[a.index]);
                if (allRecorded) removeSkippedSurah(currentSurahNo);
                alert(`✅ Saved ${successCount} recording(s)!${failCount > 0 ? `\n⚠️ Failed: ${failCount}` : ''}`);
                await fetchNextSurah();
            } else {
                alert('❌ Failed to save recordings. Please try again.');
            }
        } catch (error) {
            alert('Error saving recordings');
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        clearSkippedSurahs();
        navigate('/login');
    };

    useEffect(() => {
        return () => {
            Object.values(mediaRecordersRef.current).forEach(({ stream }) => {
                if (stream) stream.getTracks().forEach(t => t.stop());
            });
        };
    }, []);

    if (!userName) return <div className="container"><div className="loading">Authenticating...</div></div>;
    if (loading) return <div className="container"><div className="loading">Loading...</div></div>;

    if (ayatsGroup.length === 0) {
        const skipped = getSkippedSurahs();
        return (
            <div className="container">
                <div className="header">
                    <h1>Bulk Recording - Para 29</h1>
                    <button className="btn btn-logout" onClick={handleLogout}>Logout</button>
                </div>
                {skipped.length > 0 ? (
                    <div className="complete-message">
                        <h2>✅ All non-skipped surahs done!</h2>
                        <p>You have {skipped.length} skipped surah(s) remaining.</p>
                        <button
                            className="btn btn-record"
                            style={{ color: 'white', marginTop: '20px' }}
                            onClick={() => {
                                clearSkippedSurahs();
                                fetchNextSurah([]);
                            }}
                        >
                            📖 Record Pending Surahs
                        </button>
                    </div>
                ) : (
                    <div className="complete-message">
                        <h2>🎉 All Ayahs Recorded!</h2>
                        <p>You have successfully recorded all {userProgress.total} ayahs from Para 29.</p>
                    </div>
                )}
            </div>
        );
    }

    const recordedCount = Object.keys(recordings).length;
    const skippedSurahs = getSkippedSurahs();

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
                        <div className="progress-fill"
                            style={{ width: `${userProgress.total ? (userProgress.recorded / userProgress.total) * 100 : 0}%` }}
                        />
                    </div>
                    <p style={{ color: 'white', marginTop: '10px', fontSize: '16px', fontWeight: 'bold' }}>
                        📖 {hasSkipped ? '⏭️ Skipped Surah: ' : 'Current Surah: '}{currentSurahName} ({currentSurahNameAr})
                    </p>
                    <p style={{ color: 'white', marginTop: '5px' }}>
                        📝 {recordedCount} of {ayatsGroup.length} ayahs recorded
                        {skippedSurahs.length > 0 && (
                            <span style={{ color: 'orange', marginLeft: '10px' }}>
                                | ⏭️ {skippedSurahs.length} surah(s) skipped this session
                            </span>
                        )}
                    </p>
                </div>

                {/* Script Style */}
                <div style={{
                    display: 'flex', justifyContent: 'flex-end', alignItems: 'center',
                    gap: '10px', marginBottom: '20px', background: 'white',
                    padding: '15px', borderRadius: '8px'
                }}>
                    <span style={{ fontWeight: 'bold', color: '#333', fontSize: '18px' }}>Script Style:</span>
                    {['uthmani', 'indopak'].map(style => (
                        <button key={style} onClick={() => setScriptStyle(style)} style={{
                            backgroundColor: scriptStyle === style ? '#28a745' : '#e0e0e0',
                            color: scriptStyle === style ? 'white' : 'black',
                            border: 'none', padding: '8px 16px', borderRadius: '8px',
                            cursor: 'pointer', fontWeight: 'bold', minWidth: '100px'
                        }}>
                            {style.charAt(0).toUpperCase() + style.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Ayahs */}
                {ayatsGroup.map((ayat) => {
                    const isRecording = recordingStates[ayat.index];
                    const hasRecording = recordings[ayat.index];
                    return (
                        <div key={ayat.index} className="ayat-card" style={{
                            marginBottom: '20px',
                            border: ayat.isSkipped ? '2px solid orange' : undefined,
                            borderRadius: ayat.isSkipped ? '12px' : undefined
                        }}>
                            {ayat.isSkipped && (
                                <div style={{
                                    background: 'orange', color: 'white', fontSize: '12px',
                                    fontWeight: 'bold', padding: '4px 12px',
                                    borderRadius: '8px 8px 0 0', textAlign: 'center'
                                }}>
                                    ⏭️ Previously Skipped Surah
                                </div>
                            )}
                            <div className="ayat-header" style={{
                                display: 'flex', justifyContent: 'space-between',
                                alignItems: 'center', marginBottom: '10px', color: 'black'
                            }}>
                                <div style={{ fontWeight: 'bold' }}>Ayah #{ayat.ayahNoQuran}</div>
                                <div style={{ fontSize: '13px' }}>
                                    <strong>Surah:</strong> {ayat.surahNameEn} ({ayat.surahNameAr})
                                    {' | '}<strong>Para:</strong> {ayat.juzNo}
                                    {' | '}<strong>Ayah in Surah:</strong> {ayat.ayahNoInSurah}
                                </div>
                            </div>
                            <div className="quran-text" style={{
                                fontFamily: scriptStyle === 'uthmani' ? "'Amiri Quran', serif" : "'NooreHiraVolt', serif",
                                fontSize: scriptStyle === 'indopak' ? '38px' : '36px',
                                lineHeight: scriptStyle === 'indopak' ? '2.7' : '2.5',
                                direction: 'rtl', textAlign: 'right', marginBottom: '15px'
                            }}>
                                {scriptStyle === 'uthmani' ? ayat.uthmani_script || ayat.text : ayat.indopak_script || ayat.text}
                            </div>
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }}>
                                {!hasRecording ? (
                                    <>
                                        {!isRecording ? (
                                            <button style={{ color: 'white' }} className="btn btn-record"
                                                onClick={() => startRecording(ayat.index)} disabled={saving}>
                                                🎤 Start Recording
                                            </button>
                                        ) : (
                                            <button style={{ color: 'white' }} className="btn btn-stop"
                                                onClick={() => stopRecording(ayat.index)} disabled={saving}>
                                                ⏹ Stop Recording
                                            </button>
                                        )}
                                        {isRecording && <span style={{ color: 'red', fontWeight: 'bold' }}>🔴 Recording...</span>}
                                    </>
                                ) : (
                                    <>
                                        <audio controls src={URL.createObjectURL(hasRecording)} style={{ maxWidth: '300px' }} />
                                        <button style={{ color: 'white' }} className="btn btn-discard"
                                            onClick={() => deleteRecording(ayat.index)} disabled={saving}>
                                            🗑️ Re-record
                                        </button>
                                        <span style={{ color: 'green', fontWeight: 'bold' }}>✅ Ready</span>
                                    </>
                                )}
                            </div>
                        </div>
                    );
                })}

                {/* Bottom Sticky Bar */}
                <div style={{
                    position: 'sticky', bottom: '20px', background: 'white',
                    padding: '20px', borderRadius: '12px',
                    boxShadow: '0 -4px 20px rgba(0,0,0,0.15)',
                    textAlign: 'center', marginTop: '30px'
                }}>
                    <p style={{ color: recordedCount > 0 ? '#28a745' : '#666', fontWeight: 'bold', marginBottom: '10px', fontSize: '16px' }}>
                        {recordedCount > 0 ? `✅ ${recordedCount} ayah(s) ready to save` : '⚠️ Record at least one ayah to save'}
                    </p>

                    <button className="btn btn-save" onClick={saveAllRecordings}
                        disabled={saving || recordedCount === 0}
                        style={{ fontSize: '18px', padding: '15px 40px', width: '100%', maxWidth: '400px', opacity: recordedCount === 0 ? 0.5 : 1, color: 'white' }}>
                        {saving ? '⏳ Saving...' : `💾 Save All (${recordedCount}/${ayatsGroup.length})`}
                    </button>

                    {saving && <p style={{ color: '#666', marginTop: '10px' }}>Please wait, uploading...</p>}

                    {/* Navigation Buttons */}
                    <div style={{ marginTop: '15px', borderTop: '1px solid #eee', paddingTop: '15px', display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button onClick={moveToNextSurah} disabled={saving || movingNext} style={{
                            background: movingNext ? '#aaa' : '#6c757d', color: 'white', border: 'none',
                            padding: '10px 20px', borderRadius: '8px', cursor: movingNext ? 'not-allowed' : 'pointer',
                            fontWeight: 'bold', fontSize: '14px'
                        }}>
                            {movingNext ? '⏳...' : '⏭️ Move to Next Surah'}
                        </button>

                        {skippedSurahs.length > 0 && (
                            <button onClick={showPendingAyats} disabled={saving || movingNext} style={{
                                background: '#f59e0b', color: 'white', border: 'none',
                                padding: '10px 20px', borderRadius: '8px', cursor: 'pointer',
                                fontWeight: 'bold', fontSize: '14px'
                            }}>
                                📋 Show Pending ({skippedSurahs.length})
                            </button>
                        )}
                    </div>
                    <p style={{ color: '#aaa', fontSize: '11px', marginTop: '6px' }}>
                        Skipped surahs reset on next login
                    </p>
                </div>
            </div>
        </div>
    );
}

export default BulkRecording29;