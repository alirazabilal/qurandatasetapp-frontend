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

const Para29Row = React.memo(({ recording, index, onDelete, onVerify }) => {
  const handleDelete = () => onDelete(recording._id);
  const handleVerify = () => onVerify(recording._id);
  const timestamp = new Date(recording.recordedAt).getTime();
  const uniqueFilename = `para29_ayat${recording.ayatIndex + 1}_${recording.recorderName}_${recording.recorderGender}_${timestamp}.webm`;

  return (
    <tr key={recording._id}>
      <td style={{ color: 'black', fontSize: '13px', padding: '8px 5px' }}>{index + 1}</td>
      <td style={{ color: 'black', fontSize: '13px', padding: '8px 5px' }}>{recording.ayatIndex + 1}</td>
      <td className="ayat-text2" style={{ color: 'black', textAlign: 'right', fontSize: '16px', maxWidth: '180px', padding: '8px 5px' }}>
        {recording.ayatText?.substring(0, 30)}...
      </td>
      <td style={{ color: 'black', fontSize: '13px', padding: '8px 5px' }}>{recording.recorderName}</td>
      <td style={{ color: 'black', fontSize: '12px', padding: '8px 5px' }}>{recording.recorderGender}</td>
      <td style={{ color: 'black', padding: '8px 5px' }}>
        {recording.audioUrl ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <audio controls src={recording.audioUrl} preload="none" style={{ width: '180px', height: '30px' }} />
            <a href={recording.audioUrl} download={uniqueFilename}
              style={{ background: '#2563eb', color: 'white', padding: '4px 8px', borderRadius: '4px', textDecoration: 'none', fontSize: '11px' }}
            >⬇</a>
          </div>
        ) : '-'}
      </td>
      <td style={{ color: 'black', fontSize: '10px', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', padding: '8px 5px' }}>
        {uniqueFilename}
      </td>
      <td style={{ color: 'black', fontSize: '11px', padding: '8px 5px' }}>
        {new Date(recording.recordedAt).toLocaleDateString()}
      </td>
      <td style={{ color: 'black', padding: '8px 5px' }}>
        <button onClick={handleVerify}
          style={{ background: recording.isVerified ? '#28a745' : '#dc3545', color: 'white', border: 'none', padding: '5px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
        >{recording.isVerified ? '✓' : '✗'}</button>
      </td>
      <td style={{ color: 'black', padding: '8px 5px' }}>
        <button onClick={handleDelete}
          style={{ color: 'white', background: 'red', padding: '5px 8px', border: 'none', borderRadius: '4px', fontSize: '12px', cursor: 'pointer' }}
        >Del</button>
      </td>
    </tr>
  );
});

// ====== Para 29 Bar Chart Component ======
const CHART_COLORS = [
  '#667eea','#f093fb','#4facfe','#43e97b','#fa709a',
  '#a18cd1','#ffecd2','#fda085','#84fab0','#30cfd0',
  '#a1c4fd','#fbc2eb','#fddb92','#96fbc4','#f6d365',
];

const Para29BarChart = ({ stats, date, total }) => {
  const canvasRef = React.useRef(null);

  React.useEffect(() => {
    if (!stats || stats.length === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const padding = { top: 60, right: 30, bottom: 100, left: 60 };
    const W = canvas.width;
    const H = canvas.height;
    const chartW = W - padding.left - padding.right;
    const chartH = H - padding.top - padding.bottom;

    const maxVal = Math.max(...stats.map(s => s.count));
    const barCount = stats.length;
    const barWidth = Math.max(20, Math.min(60, (chartW / barCount) * 0.6));
    const gap = (chartW - barWidth * barCount) / (barCount + 1);

    // Clear
    ctx.clearRect(0, 0, W, H);

    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, W, H);

    // Title
    ctx.fillStyle = '#667eea';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`Para 29 Daily Recordings — ${date}  |  Total: ${total}`, W / 2, 30);

    // Y-axis gridlines + labels
    const ySteps = 5;
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#555';
    ctx.font = '11px Arial';
    ctx.textAlign = 'right';

    for (let i = 0; i <= ySteps; i++) {
      const val = Math.round((maxVal / ySteps) * i);
      const y = padding.top + chartH - (val / maxVal) * chartH;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(padding.left + chartW, y);
      ctx.stroke();
      ctx.fillText(val, padding.left - 8, y + 4);
    }

    // Bars
    stats.forEach((s, i) => {
      const barH = (s.count / maxVal) * chartH;
      const x = padding.left + gap + i * (barWidth + gap);
      const y = padding.top + chartH - barH;
      const color = CHART_COLORS[i % CHART_COLORS.length];

      // Bar shadow
      ctx.shadowColor = 'rgba(0,0,0,0.15)';
      ctx.shadowBlur = 6;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;

      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, barH, [6, 6, 0, 0]);
      ctx.fill();

      // Reset shadow
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;

      // Count label on top of bar
      ctx.fillStyle = '#333';
      ctx.font = 'bold 13px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(s.count, x + barWidth / 2, y - 6);

      // Name label below bar (rotated)
      ctx.save();
      ctx.translate(x + barWidth / 2, padding.top + chartH + 10);
      ctx.rotate(-Math.PI / 4);
      ctx.fillStyle = '#333';
      ctx.font = '11px Arial';
      ctx.textAlign = 'right';
      ctx.fillText(s.recorderName, 0, 0);
      ctx.restore();
    });

    // X axis line
    ctx.strokeStyle = '#aaa';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top + chartH);
    ctx.lineTo(padding.left + chartW, padding.top + chartH);
    ctx.stroke();

    // Y axis line
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top);
    ctx.lineTo(padding.left, padding.top + chartH);
    ctx.stroke();

  }, [stats, date, total]);

  const downloadChart = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `para29_bar_chart_${date}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  if (!stats || stats.length === 0) return null;

  const canvasWidth = Math.max(600, stats.length * 80 + 120);

  return (
    <div style={{ marginTop: '28px', textAlign: 'center' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <h3 style={{ margin: 0, color: '#333', fontSize: '15px' }}>📊 Bar Chart</h3>
        <button
          onClick={downloadChart}
          style={{
            background: '#764ba2',
            color: 'white',
            border: 'none',
            padding: '7px 18px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '13px'
          }}
        >
          🖼️ Download Chart (PNG)
        </button>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <canvas
          ref={canvasRef}
          width={canvasWidth}
          height={420}
          style={{ border: '1px solid #eee', borderRadius: '8px', maxWidth: '100%' }}
        />
      </div>
    </div>
  );
};
// ====== End Para29BarChart ======

// ====== Para 29 Overall Bar Chart Component ======
const Para29OverallBarChart = ({ stats, grandTotal }) => {
  const canvasRef = React.useRef(null);

  React.useEffect(() => {
    if (!stats || stats.length === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const padding = { top: 60, right: 30, bottom: 100, left: 70 };
    const W = canvas.width;
    const H = canvas.height;
    const chartW = W - padding.left - padding.right;
    const chartH = H - padding.top - padding.bottom;

    const maxVal = Math.max(...stats.map(s => s.totalCount));
    const barCount = stats.length;
    const barWidth = Math.max(20, Math.min(60, (chartW / barCount) * 0.6));
    const gap = (chartW - barWidth * barCount) / (barCount + 1);

    // Clear
    ctx.clearRect(0, 0, W, H);

    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, W, H);

    // Title
    ctx.fillStyle = '#764ba2';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`Para 29 Overall Recordings — All Time  |  Grand Total: ${grandTotal}`, W / 2, 30);

    // Y-axis gridlines + labels
    const ySteps = 5;
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#555';
    ctx.font = '11px Arial';
    ctx.textAlign = 'right';

    for (let i = 0; i <= ySteps; i++) {
      const val = Math.round((maxVal / ySteps) * i);
      const y = padding.top + chartH - (val / maxVal) * chartH;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(padding.left + chartW, y);
      ctx.stroke();
      ctx.fillText(val, padding.left - 8, y + 4);
    }

    // Bars
    stats.forEach((s, i) => {
      const barH = (s.totalCount / maxVal) * chartH;
      const x = padding.left + gap + i * (barWidth + gap);
      const y = padding.top + chartH - barH;
      const color = CHART_COLORS[i % CHART_COLORS.length];

      // Bar shadow
      ctx.shadowColor = 'rgba(0,0,0,0.15)';
      ctx.shadowBlur = 6;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;

      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, barH, [6, 6, 0, 0]);
      ctx.fill();

      // Reset shadow
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;

      // Count label on top of bar
      ctx.fillStyle = '#333';
      ctx.font = 'bold 13px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(s.totalCount, x + barWidth / 2, y - 6);

      // Name label below bar (rotated)
      ctx.save();
      ctx.translate(x + barWidth / 2, padding.top + chartH + 10);
      ctx.rotate(-Math.PI / 4);
      ctx.fillStyle = '#333';
      ctx.font = '11px Arial';
      ctx.textAlign = 'right';
      ctx.fillText(s.recorderName, 0, 0);
      ctx.restore();
    });

    // X axis line
    ctx.strokeStyle = '#aaa';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top + chartH);
    ctx.lineTo(padding.left + chartW, padding.top + chartH);
    ctx.stroke();

    // Y axis line
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top);
    ctx.lineTo(padding.left, padding.top + chartH);
    ctx.stroke();

  }, [stats, grandTotal]);

  const downloadChart = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `para29_overall_chart.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  if (!stats || stats.length === 0) return null;

  const canvasWidth = Math.max(600, stats.length * 80 + 120);

  return (
    <div style={{ marginTop: '28px', textAlign: 'center' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <h3 style={{ margin: 0, color: '#333', fontSize: '15px' }}>📊 Overall Recordings Chart (All Time)</h3>
        <button
          onClick={downloadChart}
          style={{
            background: '#764ba2',
            color: 'white',
            border: 'none',
            padding: '7px 18px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '13px'
          }}
        >
          🖼️ Download Chart (PNG)
        </button>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <canvas
          ref={canvasRef}
          width={canvasWidth}
          height={420}
          style={{ border: '1px solid #eee', borderRadius: '8px', maxWidth: '100%' }}
        />
      </div>
    </div>
  );
};
// ====== End Para29OverallBarChart ======

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
        : type === 'para29'
        ? `/api/download-para29-audios?start=${start}&end=${end}`
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

  // Para 29 states
  const [para29Recordings, setPara29Recordings] = useState([]);
  const [para29Page, setPara29Page] = useState(1);
  const [para29Pagination, setPara29Pagination] = useState(null);

  // Download modal states
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [downloadType, setDownloadType] = useState('');

  // Para 29 Daily Stats
  const [para29DailyStats, setPara29DailyStats] = useState(null);
  const [para29StatsDate, setPara29StatsDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [para29StatsLoading, setPara29StatsLoading] = useState(false);

  // Para 29 Overall Stats
  const [para29OverallStats, setPara29OverallStats] = useState(null);
  const [para29OverallLoading, setPara29OverallLoading] = useState(false);

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
      } else if (tab === 'para29') {
        const p29Res = await fetch(`https://qurandatasetapp-backend-1.onrender.com/api/admin/para29?page=${page}&limit=200`, {
          headers: { Authorization: `Bearer ${token}`, 'Cache-Control': 'no-cache' },
        });
        if (p29Res.ok) {
          const p29Data = await p29Res.json();
          setPara29Recordings(p29Data.recordings || []);
          setPara29Pagination(p29Data.pagination);
        }
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

  useEffect(() => {
    if (activeTab === 'para29') {
      fetchData(para29Page, 'para29');
      fetchPara29DailyStats(para29StatsDate);
    }
  }, [para29Page, activeTab]);

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

  const deletePara29Recording = useCallback(async (recordingId) => {
    if (!window.confirm('Are you sure you want to delete this Para 29 recording?')) return;
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`https://qurandatasetapp-backend-1.onrender.com/api/admin/para29/${recordingId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setPara29Recordings(prev => prev.filter(rec => rec._id !== recordingId));
        alert('Para 29 recording deleted!');
      } else {
        const err = await res.json();
        alert('Failed: ' + err.error);
      }
    } catch (err) {
      console.error('Error deleting para29 recording:', err);
      alert('Error deleting recording');
    }
  }, []);

  const handleVerifyPara29Toggle = useCallback(async (recordingId) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`https://qurandatasetapp-backend-1.onrender.com/api/admin/para29/verify/${recordingId}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        setPara29Recordings(prev => prev.map(rec =>
          rec._id === recordingId ? { ...rec, isVerified: !rec.isVerified } : rec
        ));
      } else {
        alert('Failed to update verification');
      }
    } catch (error) {
      console.error('Error updating para29 verification:', error);
      alert('Error updating verification');
    }
  }, []);

  const downloadPara29CSV = useCallback(async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('https://qurandatasetapp-backend-1.onrender.com/api/admin/para29/export-csv', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) { alert('Failed to download CSV.'); return; }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'para29_recordings.csv';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading para29 CSV:', error);
      alert('Error downloading CSV.');
    }
  }, []);

  const openDownloadModal = (type) => {
    setDownloadType(type);
    setShowDownloadModal(true);
  };

  const fetchPara29DailyStats = useCallback(async (date) => {
    try {
      setPara29StatsLoading(true);
      const token = localStorage.getItem('adminToken');
      const res = await fetch(
        `https://qurandatasetapp-backend-1.onrender.com/api/admin/para29/daily-stats?date=${date}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.ok) {
        const data = await res.json();
        setPara29DailyStats(data);
      } else {
        alert('Failed to load daily stats.');
      }
    } catch (err) {
      console.error('Error fetching para29 daily stats:', err);
      alert('Error fetching daily stats.');
    } finally {
      setPara29StatsLoading(false);
    }
  }, []);

  const fetchPara29OverallStats = useCallback(async () => {
    try {
      setPara29OverallLoading(true);
      const token = localStorage.getItem('adminToken');
      if (!token) return;
      const res = await fetch(
        `https://qurandatasetapp-backend-1.onrender.com/api/admin/para29/overall-stats`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.ok) {
        const data = await res.json();
        setPara29OverallStats(data);
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(`Failed to load overall stats. Status: ${res.status}`);
      }
    } catch (err) {
      alert('Network error fetching overall stats: ' + err.message);
    } finally {
      setPara29OverallLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'para29') {
      fetchPara29OverallStats();
    }
  }, [activeTab, fetchPara29OverallStats]);

  const downloadPara29DailyStatsCSV = useCallback(async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(
        `https://qurandatasetapp-backend-1.onrender.com/api/admin/para29/daily-stats/export-csv?date=${para29StatsDate}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) { alert('Failed to download CSV.'); return; }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `para29_daily_stats_${para29StatsDate}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading daily stats CSV:', err);
      alert('Error downloading CSV.');
    }
  }, [para29StatsDate]);

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

  const downloadCompleteCSV = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("adminToken");
      
      // Fetch all pages
      let allAyats = [];
      let currentPage = 1;
      let totalPages = 1;
      
      while (currentPage <= totalPages) {
        const response = await fetch(`https://qurandatasetapp-backend-1.onrender.com/api/admin/ayats?page=${currentPage}&limit=200`, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Cache-Control': 'no-cache'
          },
        });
        
        if (!response.ok) {
          alert('Failed to fetch data');
          setLoading(false);
          return;
        }
        
        const result = await response.json();
        allAyats = [...allAyats, ...result.data];
        totalPages = result.pagination.totalPages;
        currentPage++;
      }
      
      let csv = 'Index,Ayat_Number,Ayat_Text_Uthmani,Status,Recording_Path,Recorded_Date,Recorder_Name,Gender,Verified\n';
      
      allAyats.forEach((ayat) => {
        const status = ayat.isRecorded ? 'Recorded' : 'Not Recorded';
        const audioPath = ayat.audioPath || '-';
        const recordedDate = ayat.recordedAt ? new Date(ayat.recordedAt).toLocaleDateString() : '-';
        const recorderName = ayat.recorderName || '-';
        const recorderGender = ayat.recorderGender || '-';
        const verified = ayat.isVerified ? 'Yes' : 'No';
        const ayatText = (ayat.uthmani_script || ayat.text || '').replace(/"/g, '""');
        
        const row = [
          ayat.index,
          ayat.index + 1,
          `"${ayatText}"`,
          status,
          audioPath,
          recordedDate,
          recorderName,
          recorderGender,
          verified
        ].join(',');
        
        csv += row + '\n';
      });

      const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'complete_ayats_list_uthmani.csv';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      setLoading(false);
    } catch (error) {
      console.error('Error downloading complete CSV:', error);
      alert('Error downloading CSV: ' + error.message);
      setLoading(false);
    }
  }, []);

  const downloadRecordedOnlyCSV = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("adminToken");
      
      // Fetch all pages
      let allAyats = [];
      let currentPage = 1;
      let totalPages = 1;
      
      while (currentPage <= totalPages) {
        const response = await fetch(`https://qurandatasetapp-backend-1.onrender.com/api/admin/ayats?page=${currentPage}&limit=200`, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Cache-Control': 'no-cache'
          },
        });
        
        if (!response.ok) {
          alert('Failed to fetch data');
          setLoading(false);
          return;
        }
        
        const result = await response.json();
        allAyats = [...allAyats, ...result.data];
        totalPages = result.pagination.totalPages;
        currentPage++;
      }
      
      const recordedAyats = allAyats.filter(ayat => ayat.isRecorded);
      
      let csv = 'Index,Ayat_Number,Ayat_Text_Uthmani,Recording_Path,Recorded_Date,Recorder_Name,Gender,Verified\n';
      
      recordedAyats.forEach((ayat) => {
        const ayatText = (ayat.uthmani_script || ayat.text || '').replace(/"/g, '""');
        
        const row = [
          ayat.index,
          ayat.index + 1,
          `"${ayatText}"`,
          ayat.audioPath || '-',
          ayat.recordedAt ? new Date(ayat.recordedAt).toLocaleDateString() : '-',
          ayat.recorderName || '-',
          ayat.recorderGender || '-',
          ayat.isVerified ? 'Yes' : 'No'
        ].join(',');
        
        csv += row + '\n';
      });

      const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'recorded_only_ayats_uthmani.csv';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      setLoading(false);
    } catch (error) {
      console.error('Error downloading recorded CSV:', error);
      alert('Error downloading CSV: ' + error.message);
      setLoading(false);
    }
  }, []);

  const downloadMemorizationCompleteCSV = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("adminToken");
      
      // Fetch all pages
      let allRecordings = [];
      let currentPage = 1;
      let totalPages = 1;
      
      while (currentPage <= totalPages) {
        const response = await fetch(`https://qurandatasetapp-backend-1.onrender.com/api/admin/memorization?page=${currentPage}&limit=200`, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Cache-Control': 'no-cache'
          },
        });
        
        if (!response.ok) {
          alert('Failed to fetch data');
          setLoading(false);
          return;
        }
        
        const result = await response.json();
        allRecordings = [...allRecordings, ...result.recordings];
        totalPages = result.pagination.totalPages;
        currentPage++;
      }
      
      let csv = 'Recording_ID,Ayat_Index,Ayat_Number,Ayat_Text_Uthmani,Recording_Path,Recorded_Date,Recorder_Name,Gender,Verified\n';
      
      allRecordings.forEach((rec) => {
        const ayatText = (rec.ayatText || '').replace(/"/g, '""');
        
        const row = [
          rec._id,
          rec.ayatIndex,
          rec.ayatIndex + 1,
          `"${ayatText}"`,
          rec.audioPath || '-',
          rec.recordedAt ? new Date(rec.recordedAt).toLocaleDateString() : '-',
          rec.recorderName || '-',
          rec.recorderGender || '-',
          rec.isVerified ? 'Yes' : 'No'
        ].join(',');
        
        csv += row + '\n';
      });

      const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'para30_complete_recordings_uthmani.csv';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      setLoading(false);
    } catch (error) {
      console.error('Error downloading complete CSV:', error);
      alert('Error downloading CSV: ' + error.message);
      setLoading(false);
    }
  }, []);

  const downloadMemorizationRecordedOnlyCSV = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("adminToken");
      
      // Fetch all pages
      let allRecordings = [];
      let currentPage = 1;
      let totalPages = 1;
      
      while (currentPage <= totalPages) {
        const response = await fetch(`https://qurandatasetapp-backend-1.onrender.com/api/admin/memorization?page=${currentPage}&limit=200`, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Cache-Control': 'no-cache'
          },
        });
        
        if (!response.ok) {
          alert('Failed to fetch data');
          setLoading(false);
          return;
        }
        
        const result = await response.json();
        allRecordings = [...allRecordings, ...result.recordings];
        totalPages = result.pagination.totalPages;
        currentPage++;
      }
      
      const verifiedRecordings = allRecordings.filter(rec => rec.isVerified);
      
      let csv = 'Recording_ID,Ayat_Index,Ayat_Number,Ayat_Text_Uthmani,Recording_Path,Recorded_Date,Recorder_Name,Gender,Verified\n';
      
      verifiedRecordings.forEach((rec) => {
        const ayatText = (rec.ayatText || '').replace(/"/g, '""');
        
        const row = [
          rec._id,
          rec.ayatIndex,
          rec.ayatIndex + 1,
          `"${ayatText}"`,
          rec.audioPath || '-',
          rec.recordedAt ? new Date(rec.recordedAt).toLocaleDateString() : '-',
          rec.recorderName || '-',
          rec.recorderGender || '-',
          'Yes'
        ].join(',');
        
        csv += row + '\n';
      });

      const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'para30_verified_only_recordings_uthmani.csv';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      setLoading(false);
    } catch (error) {
      console.error('Error downloading verified CSV:', error);
      alert('Error downloading CSV: ' + error.message);
      setLoading(false);
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

  const para29Rows = useMemo(() =>
    para29Recordings.map((rec, i) => (
      <Para29Row
        key={rec._id}
        recording={rec}
        index={i + ((para29Page - 1) * 200)}
        onDelete={deletePara29Recording}
        onVerify={handleVerifyPara29Toggle}
      />
    )), [para29Recordings, deletePara29Recording, handleVerifyPara29Toggle, para29Page]
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
            border: 'none', borderRadius: '6px', cursor: 'pointer',
            fontWeight: 'bold', fontSize: '16px'
          }}
        >
          📿 30th Para Recorder
        </button>
        <button
          onClick={() => setActiveTab('para29')}
          style={{
            padding: '10px 20px',
            background: activeTab === 'para29' ? '#667eea' : 'transparent',
            color: activeTab === 'para29' ? 'white' : '#667eea',
            border: 'none', borderRadius: '6px', cursor: 'pointer',
            fontWeight: 'bold', fontSize: '16px'
          }}
        >
          📚 29th Para Recorder
        </button>
      </div>

      {activeTab === 'recorder' ? (
        <>
          <div className="action-buttons">
            <button onClick={downloadCompleteCSV}>📊 Download Complete Recorded CSV</button>
            <button onClick={downloadRecordedOnlyCSV}>📊 Download Only Verified Recorded CSV</button>
            <button onClick={() => openDownloadModal('recorder')}>
              📥 Download All Audios (ZIP)
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
                <th style={{ padding: "12px 8px", fontSize: "14px", fontWeight: "bold", color: "black" }}>#</th>
                <th style={{ padding: "12px 8px", fontSize: "14px", fontWeight: "bold", color: "black" }}>Ayat</th>
                <th style={{ padding: "12px 8px", fontSize: "14px", fontWeight: "bold", color: "black" }}>Status</th>
                <th style={{ padding: "12px 8px", fontSize: "14px", fontWeight: "bold", color: "black" }}>Recording</th>
                <th style={{ padding: "12px 8px", fontSize: "14px", fontWeight: "bold", color: "black" }}>Name</th>
                <th style={{ padding: "12px 8px", fontSize: "14px", fontWeight: "bold", color: "black" }}>Date</th>
                <th style={{ padding: "12px 8px", fontSize: "14px", fontWeight: "bold", color: "black" }}>Recorder</th>
                <th style={{ padding: "12px 8px", fontSize: "14px", fontWeight: "bold", color: "black" }}>Gender</th>
                <th style={{ padding: "12px 8px", fontSize: "14px", fontWeight: "bold", color: "black" }}>Verified</th>
                <th style={{ padding: "12px 8px", fontSize: "14px", fontWeight: "bold", color: "black" }}>Action</th>
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
      ) : activeTab === 'memorization' ? (
        <>
          <div className="action-buttons">
            <button onClick={downloadMemorizationCompleteCSV}>📊 Complete Download CSV</button>
            <button onClick={downloadMemorizationRecordedOnlyCSV}>📊 Only Recorded Download CSV</button>
            <button onClick={() => openDownloadModal('memorization')}>
              📥 Download All Audios (ZIP)
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
                <th style={{ padding: "12px 8px", fontSize: "14px", fontWeight: "bold", color: "black" }}>#</th>
                <th style={{ padding: "12px 8px", fontSize: "14px", fontWeight: "bold", color: "black" }}>Ayat#</th>
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
      ) : (
        <>
          <div className="action-buttons">
            <button onClick={downloadPara29CSV}>📊 Download CSV</button>
            <button onClick={() => openDownloadModal('para29')}>
              📥 Download All Audios (ZIP)
            </button>
            <button onClick={() => fetchData(para29Page, 'para29')} className="btn-refresh">
              🔄 Refresh
            </button>
          </div>

          {/* ====== DAILY STATS SECTION ====== */}
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '24px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ margin: '0 0 16px 0', color: '#667eea', fontSize: '18px' }}>
              📅 Daily Recording Stats — Para 29
            </h2>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '16px' }}>
              <label style={{ color: 'black', fontWeight: 'bold', fontSize: '14px' }}>
                Select Date:
              </label>
              <input
                type="date"
                value={para29StatsDate}
                onChange={e => setPara29StatsDate(e.target.value)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: '1px solid #ccc',
                  fontSize: '14px',
                  color: 'black'
                }}
              />
              <button
                onClick={() => fetchPara29DailyStats(para29StatsDate)}
                disabled={para29StatsLoading}
                style={{
                  background: '#667eea',
                  color: 'white',
                  border: 'none',
                  padding: '7px 18px',
                  borderRadius: '6px',
                  cursor: para29StatsLoading ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold',
                  fontSize: '14px'
                }}
              >
                {para29StatsLoading ? '⏳ Loading...' : '🔍 Load Stats'}
              </button>
              {para29DailyStats && (
                <button
                  onClick={downloadPara29DailyStatsCSV}
                  style={{
                    background: '#28a745',
                    color: 'white',
                    border: 'none',
                    padding: '7px 18px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '14px'
                  }}
                >
                  ⬇ Download Stats CSV
                </button>
              )}
            </div>

            {para29DailyStats && (
              <>
                <div style={{
                  background: '#f0f4ff',
                  borderRadius: '8px',
                  padding: '12px 18px',
                  marginBottom: '14px',
                  display: 'inline-block'
                }}>
                  <span style={{ color: '#333', fontSize: '14px', fontWeight: 'bold' }}>
                    📆 Date: {para29DailyStats.date} &nbsp;|&nbsp; 🎙️ Total Recordings Today:{' '}
                    <span style={{ color: '#667eea', fontSize: '18px' }}>
                      {para29DailyStats.totalRecordingsToday}
                    </span>
                    &nbsp;|&nbsp; 👥 Active Users:{' '}
                    <span style={{ color: '#667eea', fontSize: '18px' }}>
                      {para29DailyStats.userStats.length}
                    </span>
                  </span>
                </div>

                {para29DailyStats.userStats.length === 0 ? (
                  <p style={{ color: '#888', fontSize: '14px', margin: 0 }}>
                    No recordings found for this date.
                  </p>
                ) : (
                  <>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                    <thead>
                      <tr style={{ background: '#667eea' }}>
                        <th style={{ padding: '10px 12px', color: 'black', textAlign: 'left', fontWeight: 'bold' }}>Rank</th>
                        <th style={{ padding: '10px 12px', color: 'black', textAlign: 'left', fontWeight: 'bold' }}>Recorder Name</th>
                        <th style={{ padding: '10px 12px', color: 'black', textAlign: 'left', fontWeight: 'bold' }}>Gender</th>
                        <th style={{ padding: '10px 12px', color: 'black', textAlign: 'center', fontWeight: 'bold' }}>Recordings Today</th>
                        <th style={{ padding: '10px 12px', color: 'black', textAlign: 'left', fontWeight: 'bold' }}>Last Recorded At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {para29DailyStats.userStats.map((s, i) => (
                        <tr key={s.recorderName} style={{ background: i % 2 === 0 ? '#f9f9f9' : 'white' }}>
                          <td style={{ padding: '9px 12px', color: 'black', fontWeight: 'bold' }}>
                            {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                          </td>
                          <td style={{ padding: '9px 12px', color: 'black', fontWeight: 'bold' }}>{s.recorderName}</td>
                          <td style={{ padding: '9px 12px', color: 'black' }}>{s.recorderGender}</td>
                          <td style={{ padding: '9px 12px', textAlign: 'center' }}>
                            <span style={{
                              background: '#667eea',
                              color: 'white',
                              borderRadius: '20px',
                              padding: '3px 14px',
                              fontWeight: 'bold',
                              fontSize: '15px'
                            }}>
                              {s.count}
                            </span>
                          </td>
                          <td style={{ padding: '9px 12px', color: '#555', fontSize: '12px' }}>
                            {new Date(s.lastRecordedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* ====== BAR CHART ====== */}
                  <Para29BarChart stats={para29DailyStats.userStats} date={para29DailyStats.date} total={para29DailyStats.totalRecordingsToday} />
                  </>
                )}
              </>
            )}
          </div>
          {/* ====== END DAILY STATS SECTION ====== */}

          {/* ====== OVERALL STATS SECTION ====== */}
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '24px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ margin: 0, color: '#764ba2', fontSize: '18px' }}>
                📈 Overall Recordings — Para 29 (All Time)
              </h2>
              <button
                onClick={fetchPara29OverallStats}
                disabled={para29OverallLoading}
                style={{
                  background: '#764ba2',
                  color: 'white',
                  border: 'none',
                  padding: '7px 18px',
                  borderRadius: '6px',
                  cursor: para29OverallLoading ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold',
                  fontSize: '14px'
                }}
              >
                {para29OverallLoading ? '⏳ Loading...' : '🔄 Refresh'}
              </button>
            </div>

            {para29OverallLoading && (
              <p style={{ color: '#888', fontSize: '14px' }}>Loading overall stats...</p>
            )}

            {para29OverallStats && !para29OverallLoading && (
              <>
                <div style={{
                  background: '#f5f0ff',
                  borderRadius: '8px',
                  padding: '12px 18px',
                  marginBottom: '14px',
                  display: 'inline-block'
                }}>
                  <span style={{ color: '#333', fontSize: '14px', fontWeight: 'bold' }}>
                    🎙️ Grand Total Recordings:{' '}
                    <span style={{ color: '#764ba2', fontSize: '20px' }}>
                      {para29OverallStats.grandTotal}
                    </span>
                    &nbsp;|&nbsp; 👥 Total Users:{' '}
                    <span style={{ color: '#764ba2', fontSize: '20px' }}>
                      {para29OverallStats.userStats.length}
                    </span>
                  </span>
                </div>

                {para29OverallStats.userStats.length === 0 ? (
                  <p style={{ color: '#888', fontSize: '14px', margin: 0 }}>No recordings found.</p>
                ) : (
                  <>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                      <thead>
                        <tr style={{ background: '#764ba2' }}>
                          <th style={{ padding: '10px 12px', color: 'black', textAlign: 'left', fontWeight: 'bold' }}>Rank</th>
                          <th style={{ padding: '10px 12px', color: 'black', textAlign: 'left', fontWeight: 'bold' }}>Recorder Name</th>
                          <th style={{ padding: '10px 12px', color: 'black', textAlign: 'left', fontWeight: 'bold' }}>Gender</th>
                          <th style={{ padding: '10px 12px', color: 'black', textAlign: 'center', fontWeight: 'bold' }}>Total Recordings</th>
                          <th style={{ padding: '10px 12px', color: 'black', textAlign: 'left', fontWeight: 'bold' }}>Last Recorded At</th>
                        </tr>
                      </thead>
                      <tbody>
                        {para29OverallStats.userStats.map((s, i) => (
                          <tr key={s.recorderName} style={{ background: i % 2 === 0 ? '#f9f9f9' : 'white' }}>
                            <td style={{ padding: '9px 12px', color: 'black', fontWeight: 'bold' }}>
                              {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                            </td>
                            <td style={{ padding: '9px 12px', color: 'black', fontWeight: 'bold' }}>{s.recorderName}</td>
                            <td style={{ padding: '9px 12px', color: 'black' }}>{s.recorderGender}</td>
                            <td style={{ padding: '9px 12px', textAlign: 'center' }}>
                              <span style={{
                                background: '#764ba2',
                                color: 'white',
                                borderRadius: '20px',
                                padding: '3px 14px',
                                fontWeight: 'bold',
                                fontSize: '15px'
                              }}>
                                {s.totalCount}
                              </span>
                            </td>
                            <td style={{ padding: '9px 12px', color: '#555', fontSize: '12px' }}>
                              {new Date(s.lastRecordedAt).toLocaleDateString()} {new Date(s.lastRecordedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* ====== OVERALL BAR CHART ====== */}
                    <Para29OverallBarChart stats={para29OverallStats.userStats} grandTotal={para29OverallStats.grandTotal} />
                  </>
                )}
              </>
            )}
          </div>
          {/* ====== END OVERALL STATS SECTION ====== */}

          {para29Pagination && (
            <Pagination
              currentPage={para29Pagination.currentPage}
              totalPages={para29Pagination.totalPages}
              onPageChange={setPara29Page}
            />
          )}

          <table className="ayat-table" style={{ fontSize: "13px", width: "100%" }}>
            <thead>
              <tr style={{ background: "#667eea", color: "white" }}>
                <th style={{ padding: "12px 8px", fontSize: "14px", fontWeight: "bold", color: "black" }}>#</th>
                <th style={{ padding: "12px 8px", fontSize: "14px", fontWeight: "bold", color: "black" }}>Ayat#</th>
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
            <tbody>{para29Rows}</tbody>
          </table>

          {para29Pagination && (
            <Pagination
              currentPage={para29Pagination.currentPage}
              totalPages={para29Pagination.totalPages}
              onPageChange={setPara29Page}
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
            : downloadType === 'para29'
            ? (para29Pagination?.totalItems || 0)
            : (memorizationPagination?.totalItems || 0)
        }
      />
    </div>
  );
}

export default Admin;