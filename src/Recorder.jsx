import React, { useState, useEffect, useRef } from 'react';
import './App.css';

function Recorder() {
  const [currentAyat, setCurrentAyat] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [recordedCount, setRecordedCount] = useState(0);
  const [totalAyats, setTotalAyats] = useState(0);
  const [recorderName, setRecorderName] = useState(""); // ✅ new state

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  // fetch next ayat...
  const fetchNextAyat = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://qurandatasetapp-backend-1.onrender.com/api/ayats/next');
      const data = await response.json();

      if (data.ayat) {
        setCurrentAyat(data.ayat);
        setRecordedCount(data.recordedCount);
        setTotalAyats(data.totalAyats);
        setAudioBlob(null);
      } else {
        setCurrentAyat(null);
      }
    } catch (error) {
      console.error('Error fetching ayat:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNextAyat();
  }, []);

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
    if (!audioBlob || !currentAyat || !recorderName) {
      alert("Please enter your unique name before saving.");
      return;
    }

    setSaving(true);
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');
    formData.append('ayatIndex', currentAyat.index);
    formData.append('ayatText', currentAyat.text);
    formData.append('recorderName', recorderName);

    try {
      const response = await fetch('https://qurandatasetapp-backend-1.onrender.com/api/recordings/save', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (response.ok) {
        alert('Recording saved successfully!');
        fetchNextAyat();
      } else {
        alert(result.error || 'Failed to save recording');
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

  if (loading) {
    return <div className="container"><div className="loading">Loading...</div></div>;
  }

  if (!currentAyat) {
    return (
      <div className="container">
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
        <h1>Quran Ayat Recording System</h1>
        <div className="progress">
          <span>Progress: {recordedCount} / {totalAyats} ayats recorded</span>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${(recordedCount / totalAyats) * 100}%` }}></div>
          </div>
        </div>
      </div>

      {/* ✅ Unique name input */}
      <div style={{"margin":30}} className="recorder-name-input">
        <label >Enter your unique name (always use this name when re record):</label>
        <input
          type="text"
          value={recorderName}
          onChange={(e) => setRecorderName(e.target.value)}
          placeholder="Your Name"
          required
        />
      </div>

      <div className="ayat-card">
        <div className="ayat-header">
          <span className="ayat-number">Ayat #{currentAyat.index + 1}</span>
        </div>
        <div className="quran-text ayat-text">{currentAyat.text}</div>
      </div>

      <div className="controls">
        {!audioBlob ? (
          <div className="recording-controls">
            {!isRecording ? (
              <button className="btn btn-record" onClick={startRecording}>
                🎤 Start Recording
              </button>
            ) : (
              <button className="btn btn-stop" onClick={stopRecording}>
                ⏹ Stop Recording
              </button>
            )}
            {isRecording && <div className="recording-indicator">Recording...</div>}
          </div>
        ) : (
          <div className="playback-controls">
            <audio controls src={URL.createObjectURL(audioBlob)} />
            <div className="button-group">
              <button
                className="btn btn-save"
                onClick={saveRecording}
                disabled={saving || !recorderName.trim()}
              >
                {saving ? 'Saving...' : '💾 Save Recording'}
              </button>
              <button className="btn btn-discard" onClick={discardRecording}>
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
