import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';
import {jwtDecode} from 'jwt-decode';

function Recorder() {
  const [currentAyat, setCurrentAyat] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [recordedCount, setRecordedCount] = useState(0);
  const [totalAyats, setTotalAyats] = useState(0);
  const [userName, setUserName] = useState('');
  const navigate = useNavigate();
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

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
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Please allow microphone access to record');
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

  return (
    <div className="container">
      <div className="header">
        <h1 style={{"color":"white"}}>Quran Ayat Recording System</h1>
        <div>
          <span  style={{"color":"white"}}>Logged in as: {userName}</span>
          <button className="btn btn-logout" onClick={handleLogout}>Logout</button>
        </div>
      </div>
      <div className="progress">
        <span style={{"color":"white"}}>Progress: {recordedCount} / {totalAyats} ayats recorded</span>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${(recordedCount / totalAyats) * 100}%` }}></div>
        </div>
      </div>
      <div className="ayat-card">
        <div className="ayat-header">
          <span style={{"color":"white"}} className="ayat-number">Ayat #{currentAyat.index + 1}</span>
        </div>
        <div style={{"color":"black"}} className="quran-text ayat-text">{currentAyat.text}</div>
      </div>
      <div className="controls">
        {!audioBlob ? (
          <div className="recording-controls">
            <button
              className="btn btn-skip"
              onClick={handleSkip}
              disabled={loading || saving}
            >
              ⏭ Skip to Next Unrecorded Ayat
            </button>
            {!isRecording ? (
              <button style={{"color":"white"}} className="btn btn-record" onClick={startRecording} disabled={loading || saving}>
                🎤 Start Recording
              </button>
            ) : (
              <button style={{"color":"white"}} className="btn btn-stop" onClick={stopRecording} disabled={loading || saving}>
                ⏹ Stop Recording
              </button>
            )}
            {isRecording && <div style={{"color":"white"}} className="recording-indicator">Recording...</div>}
          </div>
        ) : (
          <div className="playback-controls">
            <audio controls src={URL.createObjectURL(audioBlob)} />
            <div className="button-group">
              <button
              style={{"color":"white"}}
                className="btn btn-save"
                onClick={saveRecording}
                disabled={saving}
              >
                {saving ? 'Saving...' : '💾 Save Recording'}
              </button>
              <button style={{"color":"yellow"}} className="btn btn-discard" onClick={discardRecording} disabled={saving}>
                🗑️ Discard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Recorder;
