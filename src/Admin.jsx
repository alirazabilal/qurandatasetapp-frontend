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

function Admin() {
  const [ayats, setAyats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      
      const token = localStorage.getItem("adminToken");
      if (!token) {
        window.location.href = "/admin-login";
        return;
      }

      const res = await fetch("https://qurandatasetapp-backend-1.onrender.com/api/admin/ayats", {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Cache-Control': 'no-cache'
        },
      });
      
      if (res.status === 401) {
        localStorage.removeItem("adminToken");
        window.location.href = "/admin-login";
        return;
      }
      
      if (!res.ok) {
        throw new Error(`Failed to load data. Server returned status: ${res.status}`);
      }
      
      const data = await res.json();
      setAyats(data);
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
    </div>
  );
}

export default Admin;