import React, { useEffect, useState, useCallback, useMemo } from "react";
import "./Admin.css"

const AyatRow = React.memo(({ ayat, index, onDelete }) => {
  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this recording?")) {
      onDelete(ayat.index);
    }
  };

  return (
    <tr key={index}>
      <td style={{ color: "black" }} data-label="#">
        {index + 1}
      </td>
      <td className="ayat-text2" style={{ color: "black", textAlign: "right" }} data-label="Ayat Text">
        {ayat.text}
      </td>
      <td style={{ color: "black" }} data-label="Status">
        {ayat.isRecorded ? "✔ Recorded" : "❌ Not Recorded"}
      </td>
      <td style={{ color: "black" }} data-label="Recording">
        {ayat.audioUrl ? (
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <audio controls src={ayat.audioUrl} preload="none" />
            <a
              href={ayat.audioUrl}
              download={`ayat_${index + 1}_${ayat.recorderName || "unknown"}.webm`}
              style={{
                background: "#2563eb",
                color: "white",
                padding: "5px 10px",
                borderRadius: "6px",
                textDecoration: "none",
                fontSize: "0.8rem",
              }}
            >
              ⬇ Download
            </a>
          </div>
        ) : (
          "-"
        )}
      </td>
      <td style={{ color: "black" }} data-label="Recording Name">
        {ayat.audioPath || "-"}
      </td>
      <td style={{ color: "black" }} data-label="Recorded At">
        {ayat.recordedAt ? new Date(ayat.recordedAt).toLocaleString() : "-"}
      </td>
      <td style={{ color: "black" }} data-label="Recorder Name">
        {ayat.recorderName || "-"}
      </td>
      <td style={{ color: "black" }} data-label="Gender">
        {ayat.recorderGender || "-"}
      </td>
      <td style={{ color: "black" }} data-label="Action">
        {ayat.isRecorded ? (
          <button
            style={{
              color: "white",
              background: "red",
              padding: "5px 10px",
              border: "none",
              borderRadius: "4px",
            }}
            onClick={handleDelete}
          >
            Delete
          </button>
        ) : (
          "-"
        )}
      </td>
    </tr>
  );
});

// NEW: Memorization Row Component
const MemorizationRow = React.memo(({ recording, index, onDelete }) => {
  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this memorization recording?")) {
      onDelete(recording._id);
    }
  };

  const timestamp = new Date(recording.recordedAt).getTime();
  const uniqueFilename = `para30_ayat${recording.ayatIndex + 1}_${recording.recorderName}_${recording.recorderGender}_${timestamp}.webm`;

  return (
    <tr key={recording._id}>
      <td style={{ color: "black" }} data-label="#">
        {index + 1}
      </td>
      <td style={{ color: "black" }} data-label="Ayat Number">
        {recording.ayatIndex + 1}
      </td>
      <td className="ayat-text2" style={{ color: "black", textAlign: "right" }} data-label="Ayat Text">
        {recording.ayatText}
      </td>
      <td style={{ color: "black" }} data-label="Recorder Name">
        {recording.recorderName}
      </td>
      <td style={{ color: "black" }} data-label="Gender">
        {recording.recorderGender}
      </td>
      <td style={{ color: "black" }} data-label="Recording">
        {recording.audioUrl ? (
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <audio controls src={recording.audioUrl} preload="none" />
            <a
              href={recording.audioUrl}
              download={uniqueFilename}
              style={{
                background: "#2563eb",
                color: "white",
                padding: "5px 10px",
                borderRadius: "6px",
                textDecoration: "none",
                fontSize: "0.8rem",
              }}
            >
              ⬇ Download
            </a>
          </div>
        ) : (
          "-"
        )}
      </td>
      <td style={{ color: "black" }} data-label="Unique Filename">
        {uniqueFilename}
      </td>
      <td style={{ color: "black" }} data-label="Recorded At">
        {new Date(recording.recordedAt).toLocaleString()}
      </td>
      <td style={{ color: "black" }} data-label="Action">
        <button
          style={{
            color: "white",
            background: "red",
            padding: "5px 10px",
            border: "none",
            borderRadius: "4px",
          }}
          onClick={handleDelete}
        >
          Delete
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
  const [activeTab, setActiveTab] = useState('recorder'); // 'recorder' or 'memorization'

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      
      const token = localStorage.getItem("adminToken");
      if (!token) {
        window.location.href = "/admin-login";
        return;
      }

      // Fetch recorder data
      const recorderRes = await fetch("https://qurandatasetapp-backend-1.onrender.com/api/admin/ayats", {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Cache-Control': 'no-cache'
        },
      });
      
      if (recorderRes.status === 401) {
        localStorage.removeItem("adminToken");
        window.location.href = "/admin-login";
        return;
      }
      
      if (!recorderRes.ok) {
        throw new Error(`Failed to load data. Server returned status: ${recorderRes.status}`);
      }
      
      const recorderData = await recorderRes.json();
      setAyats(recorderData);

      // Fetch memorization data
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
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`https://qurandatasetapp-backend-1.onrender.com/api/recordings/${ayatIndex}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (res.ok) {
        alert("Recording deleted!");
        fetchData();
      } else {
        const err = await res.json();
        alert("Failed: " + err.error);
      }
    } catch (err) {
      console.error("Error deleting recording:", err);
      alert("Error deleting recording");
    }
  }, [fetchData]);

  const deleteMemorizationRecording = useCallback(async (recordingId) => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`https://qurandatasetapp-backend-1.onrender.com/api/admin/memorization/${recordingId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (res.ok) {
        alert("Memorization recording deleted!");
        fetchData();
      } else {
        const err = await res.json();
        alert("Failed: " + err.error);
      }
    } catch (err) {
      console.error("Error deleting memorization recording:", err);
      alert("Error deleting recording");
    }
  }, [fetchData]);

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

  const downloadMemorizationCSV = useCallback(() => {
    const link = document.createElement("a");
    link.href = `https://qurandatasetapp-backend-1.onrender.com/api/admin/memorization/export-csv`;
    link.setAttribute("download", "memorization_para30_recordings.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  const tableRows = useMemo(() => 
    ayats.map((ayat, i) => (
      <AyatRow
        key={`${ayat.index}-${i}`}
        ayat={ayat}
        index={i}
        onDelete={deleteRecording}
      />
    )), [ayats, deleteRecording]
  );

  const memorizationRows = useMemo(() => 
    memorizationRecordings.map((rec, i) => (
      <MemorizationRow
        key={rec._id}
        recording={rec}
        index={i}
        onDelete={deleteMemorizationRecording}
      />
    )), [memorizationRecordings, deleteMemorizationRecording]
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

      {/* Tab Navigation */}
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
          🎯 Recordings (Para 30) - {memorizationRecordings.length} recordings
        </button>
      </div>

      {activeTab === 'recorder' ? (
        // RECORDER TAB
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

          <table className="ayat-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Ayat Text</th>
                <th>Status</th>
                <th>Recording</th>
                <th>Recording Name</th>
                <th>Recorded At</th>
                <th>Recorder Name</th>
                <th>Gender</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {tableRows}
            </tbody>
          </table>
        </>
      ) : (
        // MEMORIZATION TAB
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
              Para 30 Recordings Indiuidaually Store for all Users
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
            <table className="ayat-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Ayat Number</th>
                  <th>Ayat Text</th>
                  <th>Recorder Name</th>
                  <th>Gender</th>
                  <th>Recording</th>
                  <th>Unique Filename</th>
                  <th>Recorded At</th>
                  <th>Action</th>
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