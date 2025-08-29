import React, { useEffect, useState } from "react";

function Admin() {
  const [ayats, setAyats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
    const headers = ["#", "Ayat Text", "Recording Name", "Recorded At", "Recorder Name"];
    const rows = ayats.map((ayat, i) => [
      i + 1,
      ayat.text,
      ayat.audioPath || "-",
      ayat.recordedAt ? new Date(ayat.recordedAt).toLocaleString() : "-",
      ayat.recorderName || "-",
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
  const headers = ["#", "Ayat Text", "Recording Name", "Recorded At", "Recorder Name"];

  // ✅ filter only recorded rows
  const recordedAyats = ayats.filter((ayat) => ayat.isRecorded);

  const rows = recordedAyats.map((ayat, i) => [
    i + 1,
    ayat.text,
    ayat.audioPath || "-",
    ayat.recordedAt ? new Date(ayat.recordedAt).toLocaleString() : "-",
    ayat.recorderName || "-",
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
    const token = localStorage.getItem("adminToken");
    const link = document.createElement("a");
    link.href = `https://qurandatasetapp-backend-1.onrender.com/api/download-audios`;
    link.setAttribute("download", "audios.zip");
    link.setAttribute("Authorization", `Bearer ${token}`);
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
            <th>Action</th> {/* new column */}
          </tr>
        </thead>
        <tbody>
          {ayats.map((ayat, i) => (
            <tr key={i}>
              <td>{i + 1}</td>
              <td style={{ textAlign: "right" }}>{ayat.text}</td>
              <td>{ayat.isRecorded ? "✔ Recorded" : "❌ Not Recorded"}</td>
              <td>{ayat.audioUrl ? <audio controls src={ayat.audioUrl} /> : "-"}</td>
              <td>{ayat.audioPath || "-"}</td>
              <td>{ayat.recordedAt ? new Date(ayat.recordedAt).toLocaleString() : "-"}</td>
              <td>{ayat.recorderName || "-"}</td>
              <td>
                {ayat.isRecorded ? (
                  <button
                    style={{ color: "white", background: "red", padding: "5px 10px", border: "none", borderRadius: "4px" }}
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
