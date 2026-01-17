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
      <td style={{ color: "black", fontSize: "13px", padding: "8px 5px" }}>
        {index + 1}
      </td>
      <td className="ayat-text2" style={{ color: "black", textAlign: "right", fontSize: "16px", maxWidth: "200px", padding: "8px 5px" }}>
        {ayat.text?.substring(0, 40)}...
      </td>
      <td style={{ color: "black", fontSize: "12px", padding: "8px 5px" }}>
        {ayat.isRecorded ? "✔" : "❌"}
      </td>
      <td style={{ color: "black", padding: "8px 5px" }}>
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
      <td style={{ color: "black", fontSize: "11px", maxWidth: "150px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", padding: "8px 5px" }}>
        {ayat.audioPath || "-"}
      </td>
      <td style={{ color: "black", fontSize: "11px", padding: "8px 5px" }}>
        {ayat.recordedAt ? new Date(ayat.recordedAt).toLocaleDateString() : "-"}
      </td>
      <td style={{ color: "black", fontSize: "13px", padding: "8px 5px" }}>
        {ayat.recorderName || "-"}
      </td>
      <td style={{ color: "black", fontSize: "12px", padding: "8px 5px" }}>
        {ayat.recorderGender || "-"}
      </td>
      <td style={{ color: "black", padding: "8px 5px" }}>
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
      <td style={{ color: "black", padding: "8px 5px" }}>
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
      <td style={{ color: "black", fontSize: "13px", padding: "8px 5px" }}>
        {index + 1}
      </td>
      <td style={{ color: "black", fontSize: "13px", padding: "8px 5px" }}>
        {recording.ayatIndex + 1}
      </td>
      <td className="ayat-text2" style={{ color: "black", textAlign: "right", fontSize: "16px", maxWidth: "180px", padding: "8px 5px" }}>
        {recording.ayatText?.substring(0, 30)}...
      </td>
      <td style={{ color: "black", fontSize: "13px", padding: "8px 5px" }}>
        {recording.recorderName}
      </td>
      <td style={{ color: "black", fontSize: "12px", padding: "8px 5px" }}>
        {recording.recorderGender}
      </td>
      <td style={{ color: "black", padding: "8px 5px" }}>
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
      <td style={{ color: "black", fontSize: "10px", maxWidth: "120px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", padding: "8px 5px" }}>
        {uniqueFilename}
      </td>
      <td style={{ color: "black", fontSize: "11px", padding: "8px 5px" }}>
        {new Date(recording.recordedAt).toLocaleDateString()}
      </td>
      <td style={{ color: "black", padding: "8px 5px" }}>
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
      <td style={{ color: "black", padding: "8px 5px" }}>
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

// Pagination Component
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const pages = [];
  const maxVisible = 5;
  
  let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  let endPage = Math.min(totalPages, startPage + maxVisible - 1);
  
  if (endPage - startPage < maxVisible - 1) {
    startPage = Math.max(1, endPage - maxVisible + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div style={{
      display: 'flex',
      gap: '10px',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '20px 0',
      flexWrap: 'wrap'
    }}>
      <button
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
        style={{
          padding: '8px 12px',
          border: 'none',
          borderRadius: '4px',
          background: currentPage === 1 ? '#ddd' : '#667eea',
          color: 'white',
          cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
          fontSize: '14px'
        }}
      >
        ⏮ First
      </button>
      
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        style={{
          padding: '8px 12px',
          border: 'none',
          borderRadius: '4px',
          background: currentPage === 1 ? '#ddd' : '#667eea',
          color: 'white',
          cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
          fontSize: '14px'
        }}
      >
        ← Prev
      </button>

      {pages.map(page => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          style={{
            padding: '8px 12px',
            border: 'none',
            borderRadius: '4px',
            background: currentPage === page ? '#764ba2' : '#667eea',
            color: 'white',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: currentPage === page ? 'bold' : 'normal'
          }}
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        style={{
          padding: '8px 12px',
          border: 'none',
          borderRadius: '4px',
          background: currentPage === totalPages ? '#ddd' : '#667eea',
          color: 'white',
          cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
          fontSize: '14px'
        }}
      >
        Next →
      </button>

      <button
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages}
        style={{
          padding: '8px 12px',
          border: 'none',
          borderRadius: '4px',
          background: currentPage === totalPages ? '#ddd' : '#667eea',
          color: 'white',
          cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
          fontSize: '14px'
        }}
      >
        Last ⏭
      </button>

      <span style={{ color: 'white', fontSize: '14px', marginLeft: '10px' }}>
        Page {currentPage} of {totalPages}
      </span>
    </div>
  );
};

// Download Modal Component
const DownloadModal = ({ isOpen, onClose, type, totalRecordings }) => {
  const [downloading, setDownloading] = useState(null);
  
  if (!isOpen) return null;

  const CHUNK_SIZE = 300;
  const totalChunks = Math.ceil(totalRecordings / CHUNK_SIZE);
  const chunks = [];

  for (let i = 0; i < totalChunks; i++) {
    const start = i * CHUNK_SIZE + 1;
    const end = Math.min((i + 1) * CHUNK_SIZE, totalRecordings);
    chunks.push({ start, end, index: i });
  }

  const downloadChunk = async (start, end, index) => {
    setDownloading(index);
    try {
      const endpoint = type === 'recorder' 
        ? `/api/download-audios?start=${start}&end=${end}`
        : `/api/download-memorization-audios?start=${start}&end=${end}`;
      
      const link = document.createElement("a");
      link.href = `https://qurandatasetapp-backend-1.onrender.com${endpoint}`;
      link.setAttribute("download", `${type}_recordings_${start}-${end}.zip`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setTimeout(() => setDownloading(null), 2000);
    } catch (error) {
      console.error('Download error:', error);
      alert('Download failed. Please try again.');
      setDownloading(null);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '30px',
        maxWidth: '600px',
        width: '90%',
        maxHeight: '80vh',
        overflow: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, color: '#667eea' }}>Download Recordings</h2>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#999'
            }}
          >
            ✕
          </button>
        </div>

        <p style={{ color: '#666', marginBottom: '20px' }}>
          Total Recordings: <strong>{totalRecordings}</strong><br />
          Download in chunks of 300 recordings to avoid server overload.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {chunks.map(chunk => (
            <div
              key={chunk.index}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '15px',
                background: '#f5f5f5',
                borderRadius: '8px',
                border: '1px solid #ddd'
              }}
            >
              <span style={{ fontWeight: 'bold', color: '#333' }}>
                Recordings {chunk.start} - {chunk.end}
              </span>
              <button
                onClick={() => downloadChunk(chunk.start, chunk.end, chunk.index)}
                disabled={downloading === chunk.index}
                style={{
                  background: downloading === chunk.index ? '#999' : '#667eea',
                  color: 'white',
                  border: 'none',
                  padding: '8px 20px',
                  borderRadius: '6px',
                  cursor: downloading === chunk.index ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                {downloading === chunk.index ? '⏳ Downloading...' : '📥 Download'}
              </button>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <button
            onClick={onClose}
            style={{
              background: '#dc3545',
              color: 'white',
              border: 'none',
              padding: '10px 30px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

function Admin() {
  const [ayats, setAyats] = useState([]);
  const [memorizationRecordings, setMemorizationRecordings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState('recorder');
  
  // Pagination states
  const [recorderPage, setRecorderPage] = useState(1);
  const [recorderPagination, setRecorderPagination] = useState(null);
  const [memorizationPage, setMemorizationPage] = useState(1);
  const [memorizationPagination, setMemorizationPagination] = useState(null);

  // Download modal states
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [downloadType, setDownloadType] = useState('');

  const fetchData = useCallback(async (page = 1, tab = 'recorder') => {
    try {
      setLoading(true);
      setError("");
      
      const token = localStorage.getItem("adminToken");
      if (!token) {
        window.location.href = "/admin-login";
        return;
      }

      if (tab === 'recorder') {
        const recorderRes = await fetch(`https://qurandatasetapp-backend-1.onrender.com/api/admin/ayats?page=${page}&limit=200`, {
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
        setAyats(recorderData.data);
        setRecorderPagination(recorderData.pagination);
      } else {
        const memRes = await fetch(`https://qurandatasetapp-backend-1.onrender.com/api/admin/memorization?page=${page}&limit=200`, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Cache-Control': 'no-cache'
          },
        });

        if (memRes.ok) {
          const memData = await memRes.json();
          setMemorizationRecordings(memData.recordings || []);
          setMemorizationPagination(memData.pagination);
        }
      }
      
    } catch (err) {
      console.error("Error fetching admin data:", err);
      setError(err.message || "Failed to load admin data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(recorderPage, 'recorder');
  }, [recorderPage]);

  useEffect(() => {
    if (activeTab === 'memorization') {
      fetchData(memorizationPage, 'memorization');
    }
  }, [memorizationPage, activeTab]);

  const deleteRecording = useCallback(async (ayatIndex) => {
    if (!window.confirm("Are you sure you want to delete this recording?")) return;
    
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`https://qurandatasetapp-backend-1.onrender.com/api/recordings/${ayatIndex}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (res.ok) {
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

  const openDownloadModal = (type) => {
    setDownloadType(type);
    setShowDownloadModal(true);
  };

  const downloadMemorizationCSV = useCallback(async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch('https://qurandatasetapp-backend-1.onrender.com/api/admin/memorization/export-csv', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) {
        alert('Failed to download CSV.');
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
      alert('Error downloading CSV.');
    }
  }, []);

  const tableRows = useMemo(() => 
    ayats.map((ayat, i) => (
      <AyatRow
        key={`${ayat.index}-${i}`}
        ayat={ayat}
        index={i + ((recorderPage - 1) * 200)}
        onDelete={deleteRecording}
        onVerify={handleVerifyToggle}
      />
    )), [ayats, deleteRecording, handleVerifyToggle, recorderPage]
  );

  const memorizationRows = useMemo(() => 
    memorizationRecordings.map((rec, i) => (
      <MemorizationRow
        key={rec._id}
        recording={rec}
        index={i + ((memorizationPage - 1) * 200)}
        onDelete={deleteMemorizationRecording}
        onVerify={handleVerifyMemorizationToggle}
      />
    )), [memorizationRecordings, deleteMemorizationRecording, handleVerifyMemorizationToggle, memorizationPage]
  );

  if (loading) return (
    <div className="container">
      <div className="loading-container">
        <div className="spinner large"></div>
        <div className="message info-message">Loading dashboard data...</div>
      </div>
    </div>
  );

  if (error) return (
    <div className="container">
      <div className="error-container">
        <div className="message error-message">{error}</div>
        <button onClick={() => fetchData(recorderPage, activeTab)} className="btn-retry">
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
            fontSize: '16px'
          }}
        >
          📖 Recorder
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
            fontSize: '16px'
          }}
        >
          🎯 Memorization
        </button>
      </div>

      {activeTab === 'recorder' ? (
        <>
          <div className="action-buttons">
            <button onClick={() => openDownloadModal('recorder')}>
              📥 Download ZIP (Chunked)
            </button>
            <button onClick={() => fetchData(recorderPage, 'recorder')} className="btn-refresh">
              🔄 Refresh
            </button>
          </div>

          {recorderPagination && (
            <Pagination
              currentPage={recorderPagination.currentPage}
              totalPages={recorderPagination.totalPages}
              onPageChange={setRecorderPage}
            />
          )}

          <table className="ayat-table" style={{ fontSize: "13px", width: "100%" }}>
            <thead>
              <tr style={{ background: "#667eea", color: "white" }}>
                <th style={{ padding: "12px 8px", fontSize: "14px", fontWeight: "bold", color: "white" }}>#</th>
                <th style={{ padding: "12px 8px", fontSize: "14px", fontWeight: "bold", color: "white" }}>Ayat</th>
                <th style={{ padding: "12px 8px", fontSize: "14px", fontWeight: "bold", color: "white" }}>Status</th>
                <th style={{ padding: "12px 8px", fontSize: "14px", fontWeight: "bold", color: "white" }}>Recording</th>
                <th style={{ padding: "12px 8px", fontSize: "14px", fontWeight: "bold", color: "white" }}>Name</th>
                <th style={{ padding: "12px 8px", fontSize: "14px", fontWeight: "bold", color: "white" }}>Date</th>
                <th style={{ padding: "12px 8px", fontSize: "14px", fontWeight: "bold", color: "white" }}>Recorder</th>
                <th style={{ padding: "12px 8px", fontSize: "14px", fontWeight: "bold", color: "white" }}>Gender</th>
                <th style={{ padding: "12px 8px", fontSize: "14px", fontWeight: "bold", color: "white" }}>Verified</th>
                <th style={{ padding: "12px 8px", fontSize: "14px", fontWeight: "bold", color: "white" }}>Action</th>
              </tr>
            </thead>
            <tbody>{tableRows}</tbody>
          </table>

          {recorderPagination && (
            <Pagination
              currentPage={recorderPagination.currentPage}
              totalPages={recorderPagination.totalPages}
              onPageChange={setRecorderPage}
            />
          )}
        </>
      ) : (
        <>
          <div className="action-buttons">
            <button onClick={downloadMemorizationCSV}>📊 CSV</button>
            <button onClick={() => openDownloadModal('memorization')}>
              📥 ZIP (Chunked)
            </button>
            <button onClick={() => fetchData(memorizationPage, 'memorization')} className="btn-refresh">
              🔄 Refresh
            </button>
          </div>

          {memorizationPagination && (
            <Pagination
              currentPage={memorizationPagination.currentPage}
              totalPages={memorizationPagination.totalPages}
              onPageChange={setMemorizationPage}
            />
          )}

          <table className="ayat-table" style={{ fontSize: "13px", width: "100%" }}>
            <thead>
              <tr style={{ background: "#667eea", color: "white" }}>
                <th style={{ padding: "12px 8px", fontSize: "14px", fontWeight: "bold", color: "white" }}>#</th>
                <th style={{ padding: "12px 8px", fontSize: "14px", fontWeight: "bold", color: "white" }}>Ayat#</th>
                <th style={{ padding: "12px 8px", fontSize: "14px", fontWeight: "bold", color: "white" }}>Ayat Text</th>
                <th style={{ padding: "12px 8px", fontSize: "14px", fontWeight: "bold", color: "white" }}>Recorder</th>
                <th style={{ padding: "12px 8px", fontSize: "14px", fontWeight: "bold", color: "white" }}>Gender</th>
                <th style={{ padding: "12px 8px", fontSize: "14px", fontWeight: "bold", color: "white" }}>Recording</th>
                <th style={{ padding: "12px 8px", fontSize: "14px", fontWeight: "bold", color: "white" }}>Filename</th>
                <th style={{ padding: "12px 8px", fontSize: "14px", fontWeight: "bold", color: "white" }}>Date</th>
                <th style={{ padding: "12px 8px", fontSize: "14px", fontWeight: "bold", color: "white" }}>Verified</th>
                <th style={{ padding: "12px 8px", fontSize: "14px", fontWeight: "bold", color: "white" }}>Action</th>
              </tr>
            </thead>
            <tbody>{memorizationRows}</tbody>
          </table>

          {memorizationPagination && (
            <Pagination
              currentPage={memorizationPagination.currentPage}
              totalPages={memorizationPagination.totalPages}
              onPageChange={setMemorizationPage}
            />
          )}
        </>
      )}

      <DownloadModal
        isOpen={showDownloadModal}
        onClose={() => setShowDownloadModal(false)}
        type={downloadType}
        totalRecordings={
          downloadType === 'recorder' 
            ? (recorderPagination?.totalItems || 0)
            : (memorizationPagination?.totalItems || 0)
        }
      />
    </div>
  );
}

export default Admin;