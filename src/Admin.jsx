import React, { useEffect, useState } from "react";
import "./Admin.css"

function Admin() {
  const [ayats, setAyats] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch("https://qurandatasetapp-backend-1.onrender.com/api/admin/ayats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        window.location.href = "/admin-login";
        return;
      }
      const data = await res.json();
      setAyats(data);
    } catch (err) {
      console.error("Error fetching admin data:", err);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchData();
  }, []);

  const deleteRecording = async (ayatIndex) => {
    if (!window.confirm("Are you sure you want to delete this recording?")) return;
    try {
      const token = localStorage.getItem("adminToken");

      const res = await fetch(`https://qurandatasetapp-backend-1.onrender.com/api/recordings/${ayatIndex}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        alert("Recording deleted!");
        fetchData(); // refresh table
      } else {
        const err = await res.json();
        alert("Failed: " + err.error);
      }
    } catch (err) {
      console.error("Error deleting recording:", err);
    }
  };

  const downloadCSVComplete = () => {
    const headers = ["#", "Ayat Text", "Recording Name", "Recorded At", "Recorder Name", "Gender"];
    const rows = ayats.map((ayat, i) => [
      i + 1,
      ayat.text,
      ayat.audioPath || "-",
      ayat.recordedAt ? new Date(ayat.recordedAt).toLocaleString() : "-",
      ayat.recorderName || "-",
      ayat.recorderGender || "-", // ✅ include gender
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((v) => `"${v}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "ayats.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const downloadCSV = () => {
    const headers = ["#", "Ayat Text", "Recording Name", "Recorded At", "Recorder Name", "Gender"];

    // ✅ filter only recorded rows
    const recordedAyats = ayats.filter((ayat) => ayat.isRecorded);

    const rows = recordedAyats.map((ayat, i) => [
      i + 1,
      ayat.text,
      ayat.audioPath || "-",
      ayat.recordedAt ? new Date(ayat.recordedAt).toLocaleString() : "-",
      ayat.recorderName || "-",
      ayat.recorderGender || "-", // ✅ include gender
    ]);

    const csvContent = [
      headers.join(","), // header row
      ...rows.map((row) => row.map((v) => `"${v}"`).join(",")), // data rows
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "recorded_ayats.csv"; // ✅ more meaningful filename
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const downloadZip = () => {
    const link = document.createElement("a");
    link.href = `https://qurandatasetapp-backend-1.onrender.com/api/download-audios`;
    link.setAttribute("download", "audios.zip");
    link.click();
  };

  if (loading) return <div className="container">Loading...</div>;

  return (
    <div className="container">
      <h1>Admin Dashboard</h1>

      <div style={{ marginBottom: "20px" }}>
        <button onClick={downloadCSVComplete}>⬇ Complete Download CSV</button>
        <button onClick={downloadCSV}>⬇ Only Recorded Download CSV</button>
        <button onClick={downloadZip} style={{ marginLeft: "10px" }}>
          ⬇ Download All Audios (ZIP)
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
            <th>Gender</th> {/* ✅ new column */}
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {ayats.map((ayat, i) => (
            <tr key={i}>
              <td style={{ color: "black" }} data-label="#">
                {i + 1}
              </td>
              <td style={{ color: "black", textAlign: "right" }} data-label="Ayat Text">
                {ayat.text}
              </td>
              <td style={{ color: "black" }} data-label="Status">
                {ayat.isRecorded ? "✔ Recorded" : "❌ Not Recorded"}
              </td>
              <td style={{ color: "black" }} data-label="Recording">
                {ayat.audioUrl ? (
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <audio controls src={ayat.audioUrl} />
                    <a
                      href={ayat.audioUrl}
                      download={`ayat_${i + 1}_${ayat.recorderName || "unknown"}.webm`}
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
                    onClick={() => deleteRecording(ayat.index)}
                  >
                    Delete
                  </button>
                ) : (
                  "-"
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Admin;
