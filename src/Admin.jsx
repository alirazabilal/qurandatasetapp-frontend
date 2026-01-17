import React, { useEffect, useState, useCallback, useMemo } from "react";
import "./Admin.css"

const AyatRow = React.memo(({ ayat, index, onDelete, onVerify }) => {
  const handleDelete = () => {
    onDelete(ayat.index);
  };

  const handleVerify = () => {
    onVerify(ayat.index);
  };

  return (
    <tr key={index}>
      <td style={{ color: "black", fontSize: "13px", padding: "8px 5px" }} data-label="#">
        {index + 1}
      </td>
      <td className="ayat-text2" style={{ color: "black", textAlign: "right", fontSize: "16px", maxWidth: "200px", padding: "8px 5px" }} data-label="Ayat Text">
        {ayat.text?.substring(0, 40)}...
      </td>
      <td style={{ color: "black", fontSize: "12px", padding: "8px 5px" }} data-label="Status">
        {ayat.isRecorded ? "✔" : "❌"}
      </td>
      <td style={{ color: "black", padding: "8px 5px" }} data-label="Recording">
        {ayat.audioUrl ? (
          <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <audio controls src={ayat.audioUrl} preload="none" style={{ width: "180px", height: "30px" }} />
            <a
              href={ayat.audioUrl}
              download={`ayat_${index + 1}_${ayat.recorderName || "unknown"}.webm`}
              style={{
                background: "#2563eb",
                color: "white",
                padding: "4px 8px",
                borderRadius: "4px",
                textDecoration: "none",
                fontSize: "11px",
              }}
            >
              ⬇
            </a>
          </div>
        ) : (
          "-"
        )}
      </td>
      <td style={{ color: "black", fontSize: "11px", maxWidth: "150px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", padding: "8px 5px" }} data-label="Recording Name">
        {ayat.audioPath || "-"}
      </td>
      <td style={{ color: "black", fontSize: "11px", padding: "8px 5px" }} data-label="Recorded At">
        {ayat.recordedAt ? new Date(ayat.recordedAt).toLocaleDateString() : "-"}
      </td>
      <td style={{ color: "black", fontSize: "13px", padding: "8px 5px" }} data-label="Recorder">
        {ayat.recorderName || "-"}
      </td>
      <td style={{ color: "black", fontSize: "12px", padding: "8px 5px" }} data-label="Gender">
        {ayat.recorderGender || "-"}
      </td>
      <td style={{ color: "black", padding: "8px 5px" }} data-label="Verified">
        {ayat.isRecorded ? (
          <button
            onClick={handleVerify}
            style={{
              background: ayat.isVerified ? "#28a745" : "#dc3545",
              color: "white",
              border: "none",
              padding: "5px 8px",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: "bold"
            }}
          >
            {ayat.isVerified ? "✓" : "✗"}
          </button>
        ) : (
          "-"
        )}
      </td>
      <td style={{ color: "black", padding: "8px 5px" }} data-label="Action">
        {ayat.isRecorded ? (
          <button
            style={{
              color: "white",
              background: "red",
              padding: "5px 8px",
              border: "none",
              borderRadius: "4px",
              fontSize: "12px",
              cursor: "pointer"
            }}
            onClick={handleDelete}
          >
            Del
          </button>
        ) : (
          "-"
        )}
      </td>
    </tr>
  );
});

const MemorizationRow = React.memo(({ recording, index, onDelete, onVerify }) => {
  const handleDelete = () => {
    onDelete(recording._id);
  };

  const handleVerify = () => {
    onVerify(recording._id);
  };

  const timestamp = new Date(recording.recordedAt).getTime();
  const uniqueFilename = `para30_ayat${recording.ayatIndex + 1}_${recording.recorderName}_${recording.recorderGender}_${timestamp}.webm`;

  return (
    <tr key={recording._id}>
      <td style={{ color: "black", fontSize: "13px", padding: "8px 5px" }} data-label="#">
        {index + 1}
      </td>
      <td style={{ color: "black", fontSize: "13px", padding: "8px 5px" }} data-label="Ayat #">
        {recording.ayatIndex + 1}
      </td>
      <td className="ayat-text2" style={{ color: "black", textAlign: "right", fontSize: "16px", maxWidth: "180px", padding: "8px 5px" }} data-label="Ayat Text">
        {recording.ayatText?.substring(0, 30)}...
      </td>
      <td style={{ color: "black", fontSize: "13px", padding: "8px 5px" }} data-label="Recorder">
        {recording.recorderName}
      </td>
      <td style={{ color: "black", fontSize: "12px", padding: "8px 5px" }} data-label="Gender">
        {recording.recorderGender}
      </td>
      <td style={{ color: "black", padding: "8px 5px" }} data-label="Recording">
        {recording.audioUrl ? (
          <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <audio controls src={recording.audioUrl} preload="none" style={{ width: "180px", height: "30px" }} />
            <a
              href={recording.audioUrl}
              download={uniqueFilename}
              style={{
                background: "#2563eb",
                color: "white",
                padding: "4px 8px",
                borderRadius: "4px",
                textDecoration: "none",
                fontSize: "11px",
              }}
            >
              ⬇
            </a>
          </div>
        ) : (
          "-"
        )}
      </td>
      <td style={{ color: "black", fontSize: "10px", maxWidth: "120px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", padding: "8px 5px" }} data-label="Filename">
        {uniqueFilename}
      </td>
      <td style={{ color: "black", fontSize: "11px", padding: "8px 5px" }} data-label="Date">
        {new Date(recording.recordedAt).toLocaleDateString()}
      </td>
      <td style={{ color: "black", padding: "8px 5px" }} data-label="Verified">
        <button
          onClick={handleVerify}
          style={{
            background: recording.isVerified ? "#28a745" : "#dc3545",
            color: "white",
            border: "none",
            padding: "5px 8px",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "12px",
            fontWeight: "bold"
          }}
        >
          {recording.isVerified ? "✓" : "✗"}
        </button>
      </td>
      <td style={{ color: "black", padding: "8px 5px" }} data-label="Action">
        <button
          style={{
            color: "white",
            background: "red",
            padding: "5px 8px",
            border: "none",
            borderRadius: "4px",
            fontSize: "12px",
            cursor: "pointer"
          }}
          onClick={handleDelete}
        >
          Del
        </button>
      </td>
    </tr>
  );
});

function Admin() {
  const [ayats, setAyats] = useState([]);
  const [memorizationRecordings, setMemorizationRecordings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState('recorder');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      
      const token = localStorage.getItem("adminToken");
      if (!token) {
        window.location.href = "/admin-login";
        return;
      }

      const recorderRes = await fetch("https://qurandatasetapp-backend-1.onrender.com/api/admin/ayats", {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Cache-Control': 'no-cache'
        },
      });
      
      if (recorderRes.status === 401 || recorderRes.status === 403) {
        localStorage.removeItem("adminToken");
        alert("Session expired. Please login again.");
        window.location.href = "/admin-login";
        return;
      }
      
      if (!recorderRes.ok) {
        throw new Error(`Failed to load data. Server returned status: ${recorderRes.status}`);
      }
      
      const recorderData = await recorderRes.json();
      setAyats(recorderData);

      const memRes = await fetch("https://qurandatasetapp-backend-1.onrender.com/api/admin/memorization", {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Cache-Control': 'no-cache'
        },
      });

      if (memRes.ok) {
        const memData = await memRes.json();
        setMemorizationRecordings(memData.recordings || []);
      }
      
    } catch (err) {
      console.error("Error fetching admin data:", err);
      setError(err.message || "Failed to load admin data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const deleteRecording = useCallback(async (ayatIndex) => {
    if (!window.confirm("Are you sure you want to delete this recording?")) return;
    
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`https://qurandatasetapp-backend-1.onrender.com/api/recordings/${ayatIndex}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (res.ok) {
        // Update state locally without page reload
        setAyats(prevAyats => prevAyats.map(ayat => 
          ayat.index === ayatIndex 
            ? { ...ayat, isRecorded: false, audioUrl: null, audioPath: null, recorderName: null, recorderGender: null, isVerified: false }
            : ayat
        ));
        alert("Recording deleted!");
      } else {
        const err = await res.json();
        alert("Failed: " + err.error);
      }
    } catch (err) {
      console.error("Error deleting recording:", err);
      alert("Error deleting recording");
    }
  }, []);

  const deleteMemorizationRecording = useCallback(async (recordingId) => {
    if (!window.confirm("Are you sure you want to delete this memorization recording?")) return;
    
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`https://qurandatasetapp-backend-1.onrender.com/api/admin/memorization/${recordingId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (res.ok) {
        // Remove from state locally without page reload
        setMemorizationRecordings(prevRecordings => 
          prevRecordings.filter(rec => rec._id !== recordingId)
        );
        alert("Memorization recording deleted!");
      } else {
        const err = await res.json();
        alert("Failed: " + err.error);
      }
    } catch (err) {
      console.error("Error deleting memorization recording:", err);
      alert("Error deleting recording");
    }
  }, []);

  const handleVerifyToggle = useCallback(async (index) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`https://qurandatasetapp-backend-1.onrender.com/api/recordings/${index}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        // Update state locally without page reload
        setAyats(prevAyats => prevAyats.map(ayat => 
          ayat.index === index 
            ? { ...ayat, isVerified: !ayat.isVerified }
            : ayat
        ));
      } else {
        alert('Failed to update verification');
      }
    } catch (error) {
      console.error('Error updating verification:', error);
      alert('Error updating verification');
    }
  }, []);

  const handleVerifyMemorizationToggle = useCallback(async (recordingId) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`https://qurandatasetapp-backend-1.onrender.com/api/admin/memorization/verify/${recordingId}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        // Update state locally without page reload
        setMemorizationRecordings(prevRecordings => prevRecordings.map(rec => 
          rec._id === recordingId 
            ? { ...rec, isVerified: !rec.isVerified }
            : rec
        ));
      } else {
        alert('Failed to update verification');
      }
    } catch (error) {
      console.error('Error updating verification:', error);
      alert('Error updating verification');
    }
  }, []);

  const downloadCSVComplete = useCallback(() => {
    const headers = ["#", "Ayat Text", "Recording Name", "Recorded At", "Recorder Name", "Gender"];
    const rows = ayats.map((ayat, i) => [
      i + 1,
      `"${ayat.text.replace(/"/g, '""')}"`,
      ayat.audioPath || "-",
      ayat.recordedAt ? new Date(ayat.recordedAt).toLocaleString() : "-",
      ayat.recorderName || "-",
      ayat.recorderGender || "-",
    ]);

    const csvContent = [headers.join(","), ...rows.map(row => row.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "ayats.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, [ayats]);

  const downloadCSV = useCallback(() => {
    const headers = ["#", "Ayat Text", "Recording Name", "Recorded At", "Recorder Name", "Gender"];
    const recordedAyats = ayats.filter((ayat) => ayat.isRecorded);

    const rows = recordedAyats.map((ayat, i) => [
      i + 1,
      `"${ayat.text.replace(/"/g, '""')}"`,
      ayat.audioPath || "-",
      ayat.recordedAt ? new Date(ayat.recordedAt).toLocaleString() : "-",
      ayat.recorderName || "-",
      ayat.recorderGender || "-",
    ]);

    const csvContent = [headers.join(","), ...rows.map(row => row.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "recorded_ayats.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, [ayats]);

  const downloadZip = useCallback(() => {
    const link = document.createElement("a");
    link.href = `https://qurandatasetapp-backend-1.onrender.com/api/download-audios`;
    link.setAttribute("download", "audios.zip");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  const downloadMemorizationZip = useCallback(() => {
    const link = document.createElement("a");
    link.href = `https://qurandatasetapp-backend-1.onrender.com/api/download-memorization-audios`;
    link.setAttribute("download", "memorization_para30_recordings.zip");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  const downloadMemorizationCSV = useCallback(async () => {
    try {
      const token = localStorage.getItem("adminToken");
      
      const response = await fetch('https://qurandatasetapp-backend-1.onrender.com/api/admin/memorization/export-csv', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) {
        alert('Failed to download CSV. Please try again.');
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'memorization_para30_recordings.csv';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading CSV:', error);
      alert('Error downloading CSV. Please try again.');
    }
  }, []);

  const tableRows = useMemo(() => 
    ayats.map((ayat, i) => (
      <AyatRow
        key={`${ayat.index}-${i}`}
        ayat={ayat}
        index={i}
        onDelete={deleteRecording}
        onVerify={handleVerifyToggle}
      />
    )), [ayats, deleteRecording, handleVerifyToggle]
  );

  const memorizationRows = useMemo(() => 
    memorizationRecordings.map((rec, i) => (
      <MemorizationRow
        key={rec._id}
        recording={rec}
        index={i}
        onDelete={deleteMemorizationRecording}
        onVerify={handleVerifyMemorizationToggle}
      />
    )), [memorizationRecordings, deleteMemorizationRecording, handleVerifyMemorizationToggle]
  );

  if (loading) return (
    <div className="container">
      <div className="loading-container">
        <div className="spinner large"></div>
        <div className="message info-message">
          Loading dashboard data...
        </div>
        <div className="message hint-message">
          This may take a moment while we gather all the information
        </div>
      </div>
    </div>
  );

  if (error) return (
    <div className="container">
      <div className="error-container">
        <div className="message error-message">
          {error}
        </div>
        <button 
          onClick={fetchData}
          className="btn-retry"
        >
          Try Again
        </button>
      </div>
    </div>
  );

  return (
    <div className="container">
      <h1>Admin Dashboard</h1>

      <div style={{
        display: 'flex',
        gap: '10px',
        marginBottom: '20px',
        borderBottom: '2px solid #ddd',
        background: 'white',
        padding: '10px',
        borderRadius: '8px'
      }}>
        <button
          onClick={() => setActiveTab('recorder')}
          style={{
            padding: '10px 20px',
            background: activeTab === 'recorder' ? '#667eea' : 'transparent',
            color: activeTab === 'recorder' ? 'white' : '#667eea',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '16px',
            transition: '0.3s'
          }}
        >
          📖 Recorder (All Ayats)
        </button>
        <button
          onClick={() => setActiveTab('memorization')}
          style={{
            padding: '10px 20px',
            background: activeTab === 'memorization' ? '#667eea' : 'transparent',
            color: activeTab === 'memorization' ? 'white' : '#667eea',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '16px',
            transition: '0.3s'
          }}
        >
          🎯 Memorization (Para 30) - {memorizationRecordings.length} recordings
        </button>
      </div>

      {activeTab === 'recorder' ? (
        <>
          <div className="action-buttons">
            <button onClick={downloadCSVComplete}>⬇ Complete Download CSV</button>
            <button onClick={downloadCSV}>⬇ Only Recorded Download CSV</button>
            <button onClick={downloadZip}>
              ⬇ Download All Audios (ZIP)
            </button>
            <button 
              onClick={fetchData} 
              className="btn-refresh"
            >
              🔄 Refresh
            </button>
          </div>

          <table className="ayat-table" style={{ fontSize: "13px", width: "100%" }}>
            <thead>
              <tr style={{ background: "#b31914ff", color: "white" }}>
                <th style={{ padding: "12px 8px", fontSize: "14px", fontWeight: "bold", color: "black" }}>#</th>
                <th style={{ padding: "12px 8px", fontSize: "14px", fontWeight: "bold", color: "black" }}>Ayat Text</th>
                <th style={{ padding: "12px 8px", fontSize: "14px", fontWeight: "bold", color: "black" }}>Status</th>
                <th style={{ padding: "12px 8px", fontSize: "14px", fontWeight: "bold", color: "black" }}>Recording</th>
                <th style={{ padding: "12px 8px", fontSize: "14px", fontWeight: "bold", color: "black" }}>Recording Name</th>
                <th style={{ padding: "12px 8px", fontSize: "14px", fontWeight: "bold", color: "black" }}>Recorded At</th>
                <th style={{ padding: "12px 8px", fontSize: "14px", fontWeight: "bold", color: "black" }}>Recorder</th>
                <th style={{ padding: "12px 8px", fontSize: "14px", fontWeight: "bold", color: "black" }}>Gender</th>
                <th style={{ padding: "12px 8px", fontSize: "14px", fontWeight: "bold", color: "black" }}>Verified</th>
                <th style={{ padding: "12px 8px", fontSize: "14px", fontWeight: "bold", color: "black" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {tableRows}
            </tbody>
          </table>
        </>
      ) : (
        <>
          <div className="action-buttons">
            <button onClick={downloadMemorizationCSV}>📊 Download CSV</button>
            <button onClick={downloadMemorizationZip}>
              ⬇ Download All Recordings (ZIP)
            </button>
            <button 
              onClick={fetchData} 
              className="btn-refresh"
            >
              🔄 Refresh
            </button>
          </div>

          <div style={{ marginBottom: '20px', padding: '15px', background: '#f0f0f0', borderRadius: '8px' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#667eea' }}>
              Para 30 Memorization Recordings
            </h3>
            <p style={{ margin: 0, color: '#666' }}>
              Total Recordings: <strong>{memorizationRecordings.length}</strong>
              {' | '}
              Users can record same ayat multiple times
              {' | '}
              Each recording has unique filename with username
            </p>
          </div>

          {memorizationRecordings.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '40px',
              background: 'white',
              borderRadius: '8px',
              color: '#999'
            }}>
              <h3>No memorization recordings yet</h3>
              <p>Recordings will appear here once users start recording Para 30</p>
            </div>
          ) : (
            <table className="ayat-table" style={{ fontSize: "13px", width: "100%" }}>
              <thead>
                <tr style={{ background: "#bb1e1eff", color: "white" }}>
                  <th style={{ padding: "12px 8px", fontSize: "14px", fontWeight: "bold", color: "black" }}>#</th>
                  <th style={{ padding: "12px 8px", fontSize: "14px", fontWeight: "bold", color: "black" }}>Ayat #</th>
                  <th style={{ padding: "12px 8px", fontSize: "14px", fontWeight: "bold", color: "black" }}>Ayat Text</th>
                  <th style={{ padding: "12px 8px", fontSize: "14px", fontWeight: "bold", color: "black" }}>Recorder</th>
                  <th style={{ padding: "12px 8px", fontSize: "14px", fontWeight: "bold", color: "black" }}>Gender</th>
                  <th style={{ padding: "12px 8px", fontSize: "14px", fontWeight: "bold", color: "black" }}>Recording</th>
                  <th style={{ padding: "12px 8px", fontSize: "14px", fontWeight: "bold", color: "black" }}>Filename</th>
                  <th style={{ padding: "12px 8px", fontSize: "14px", fontWeight: "bold", color: "black" }}>Date</th>
                  <th style={{ padding: "12px 8px", fontSize: "14px", fontWeight: "bold", color: "black" }}>Verified</th>
                  <th style={{ padding: "12px 8px", fontSize: "14px", fontWeight: "bold", color: "black" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {memorizationRows}
              </tbody>
            </table>
          )}
        </>
      )}
    </div>
  );
}

export default Admin;