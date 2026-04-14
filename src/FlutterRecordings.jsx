import React, { useEffect, useState, useCallback, useMemo } from 'react';
import './Admin.css';

const API = 'https://qurandatasetapp-backend-1.onrender.com';

// ─── Pagination ──────────────────────────────────────────────────────────────
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const maxVisible = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  let endPage = Math.min(totalPages, startPage + maxVisible - 1);
  if (endPage - startPage < maxVisible - 1) startPage = Math.max(1, endPage - maxVisible + 1);
  const pages = [];
  for (let i = startPage; i <= endPage; i++) pages.push(i);

  const btn = (label, page, disabled) => (
    <button
      onClick={() => !disabled && onPageChange(page)}
      disabled={disabled}
      style={{
        padding: '8px 12px', border: 'none', borderRadius: '4px',
        background: disabled ? '#ddd' : '#667eea', color: 'white',
        cursor: disabled ? 'not-allowed' : 'pointer', fontSize: '14px'
      }}
    >
      {label}
    </button>
  );

  return (
    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', justifyContent: 'center', margin: '20px 0', flexWrap: 'wrap' }}>
      {btn('⏮ First', 1, currentPage === 1)}
      {btn('← Prev', currentPage - 1, currentPage === 1)}
      {pages.map(p => (
        <button key={p} onClick={() => onPageChange(p)} style={{
          padding: '8px 12px', border: 'none', borderRadius: '4px',
          background: currentPage === p ? '#764ba2' : '#667eea',
          color: 'white', cursor: 'pointer', fontSize: '14px',
          fontWeight: currentPage === p ? 'bold' : 'normal'
        }}>{p}</button>
      ))}
      {btn('Next →', currentPage + 1, currentPage === totalPages)}
      {btn('Last ⏭', totalPages, currentPage === totalPages)}
      <span style={{ color: 'white', fontSize: '14px', marginLeft: '10px' }}>
        Page {currentPage} of {totalPages}
      </span>
    </div>
  );
};

// ─── Recording Row ────────────────────────────────────────────────────────────
const RecordingRow = React.memo(({ recording, index, onVerify, onDelete }) => {
  const ts = new Date(recording.recordedAt).toLocaleDateString();
  const ext = recording.audioPath?.split('.').pop() || 'wav';
  const fname = `surah${recording.surahNo}_ayat${recording.ayahNumberInSurah}_${recording.source}_${recording._id}.${ext}`;

  return (
    <tr>
      <td style={{ color: 'black', fontSize: '13px', padding: '8px 5px' }}>{index + 1}</td>
      <td className="ayat-text2" style={{ color: 'black', textAlign: 'right', fontSize: '16px', maxWidth: '160px', padding: '8px 5px' }}>
        {recording.ayahText?.substring(0, 30)}...
      </td>
      <td style={{ color: 'black', fontSize: '12px', padding: '8px 5px' }}>
        {recording.surahName || `S${recording.surahNo}`}:{recording.ayahNumberInSurah}
      </td>
      <td style={{ color: 'black', padding: '8px 5px' }}>
        {recording.audioUrl ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <audio controls src={recording.audioUrl} preload="none" style={{ width: '180px', height: '30px' }} />
            <a
              href={recording.audioUrl}
              download={fname}
              style={{ background: '#2563eb', color: 'white', padding: '4px 8px', borderRadius: '4px', textDecoration: 'none', fontSize: '11px' }}
            >⬇</a>
          </div>
        ) : '-'}
      </td>
      <td style={{ color: 'black', fontSize: '11px', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', padding: '8px 5px' }}>
        {fname}
      </td>
      <td style={{ color: 'black', fontSize: '11px', padding: '8px 5px' }}>{ts}</td>
      <td style={{ padding: '8px 5px' }}>
        <span style={{
          background: recording.source === 'memorization' ? '#7c3aed' : '#0369a1',
          color: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: '11px'
        }}>
          {recording.source}
        </span>
      </td>
      <td style={{ padding: '8px 5px' }}>
        <button
          onClick={() => onVerify(recording._id)}
          style={{
            background: recording.isVerified ? '#28a745' : '#dc3545',
            color: 'white', border: 'none', padding: '5px 8px',
            borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold'
          }}
        >
          {recording.isVerified ? '✓' : '✗'}
        </button>
      </td>
      <td style={{ padding: '8px 5px' }}>
        <button
          onClick={() => onDelete(recording._id)}
          style={{ color: 'white', background: 'red', padding: '5px 8px', border: 'none', borderRadius: '4px', fontSize: '12px', cursor: 'pointer' }}
        >Del</button>
      </td>
    </tr>
  );
});

// ─── Main Component ───────────────────────────────────────────────────────────
function FlutterRecordings() {
  const [recordings, setRecordings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [downloadingCSV, setDownloadingCSV] = useState(false);
  const [downloadingZip, setDownloadingZip] = useState(false);

  const getToken = () => localStorage.getItem('adminToken');

  const fetchRecordings = useCallback(async (p = 1) => {
    const token = getToken();
    if (!token) { window.location.href = '/admin-login'; return; }

    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API}/api/admin/flutter-recordings?page=${p}&limit=100`, {
        headers: { Authorization: `Bearer ${token}`, 'Cache-Control': 'no-cache' }
      });
      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem('adminToken');
        window.location.href = '/admin-login';
        return;
      }
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const data = await res.json();
      setRecordings(data.recordings || []);
      setPagination(data.pagination);
    } catch (err) {
      setError(err.message || 'Failed to load recordings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRecordings(page); }, [page, fetchRecordings]);

  const handleVerify = useCallback(async (id) => {
    try {
      const res = await fetch(`${API}/api/admin/flutter-recordings/verify/${id}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      if (res.ok) {
        setRecordings(prev => prev.map(r => r._id === id ? { ...r, isVerified: !r.isVerified } : r));
      } else {
        alert('Failed to update verification');
      }
    } catch (e) { console.error(e); }
  }, []);

  const handleDelete = useCallback(async (id) => {
    if (!window.confirm('Delete this recording?')) return;
    try {
      const res = await fetch(`${API}/api/admin/flutter-recordings/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      if (res.ok) {
        setRecordings(prev => prev.filter(r => r._id !== id));
      } else {
        alert('Failed to delete');
      }
    } catch (e) { console.error(e); }
  }, []);

  const downloadCSV = useCallback(async (verifiedOnly) => {
    setDownloadingCSV(true);
    try {
      const res = await fetch(`${API}/api/admin/flutter-recordings/export-csv?verifiedOnly=${verifiedOnly}`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      if (!res.ok) { alert('Failed to download CSV'); return; }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = verifiedOnly ? 'flutter_recordings_verified.csv' : 'flutter_recordings_all.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) { alert('Error downloading CSV: ' + e.message); }
    finally { setDownloadingCSV(false); }
  }, []);

  const downloadAudios = useCallback(async (verifiedOnly) => {
    setDownloadingZip(true);
    try {
      const res = await fetch(`${API}/api/admin/flutter-recordings/download-audios?verifiedOnly=${verifiedOnly}`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      if (!res.ok) { alert('Failed to download audios (no recordings or server error)'); return; }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = verifiedOnly ? 'flutter_recordings_verified.zip' : 'flutter_recordings_all.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) { alert('Error downloading audios: ' + e.message); }
    finally { setDownloadingZip(false); }
  }, []);

  const rows = useMemo(() =>
    recordings.map((rec, i) => (
      <RecordingRow
        key={rec._id}
        recording={rec}
        index={i + ((page - 1) * 100)}
        onVerify={handleVerify}
        onDelete={handleDelete}
      />
    )),
    [recordings, page, handleVerify, handleDelete]
  );

  if (loading) return (
    <div className="container">
      <div className="loading-container">
        <div className="spinner large"></div>
        <div className="message info-message">Loading app recordings...</div>
      </div>
    </div>
  );

  if (error) return (
    <div className="container">
      <div className="error-container">
        <div className="message error-message">{error}</div>
        <button onClick={() => fetchRecordings(page)} className="btn-retry">Try Again</button>
      </div>
    </div>
  );

  return (
    <div className="container">
      <h1>📱 App Recordings Dashboard</h1>
      <p style={{ color: 'rgba(255,255,255,0.85)', marginBottom: '20px', fontSize: '14px' }}>
        Recordings automatically submitted by app users who opted into <strong>data sharing for model improvement</strong>.
        Only correctly matched (green) ayahs are sent — never mistakes.
      </p>

      <div className="action-buttons">
        <button onClick={() => downloadAudios(false)} disabled={downloadingZip}>
          📥 Download All Audios (ZIP)
        </button>
        <button onClick={() => downloadAudios(true)} disabled={downloadingZip}>
          📥 Download Verified Audios (ZIP)
        </button>
        <button onClick={() => downloadCSV(false)} disabled={downloadingCSV}>
          📊 Download All CSV
        </button>
        <button onClick={() => downloadCSV(true)} disabled={downloadingCSV}>
          📊 Download Verified CSV
        </button>
        <button onClick={() => fetchRecordings(page)} className="btn-refresh">
          🔄 Refresh
        </button>
      </div>

      {pagination && (
        <div style={{ color: 'white', textAlign: 'center', marginBottom: '10px', fontSize: '14px' }}>
          Total recordings: <strong>{pagination.totalItems}</strong>
          &nbsp;|&nbsp; Verified: <strong>{recordings.filter(r => r.isVerified).length}</strong> (this page)
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <Pagination currentPage={pagination.currentPage} totalPages={pagination.totalPages} onPageChange={setPage} />
      )}

      {recordings.length === 0 ? (
        <div style={{ color: 'white', textAlign: 'center', padding: '60px', fontSize: '18px' }}>
          No app recordings yet. Users need to enable data sharing in the app settings.
        </div>
      ) : (
        <table className="ayat-table" style={{ fontSize: '13px', width: '100%' }}>
          <thead>
            <tr style={{ background: '#667eea', color: 'white' }}>
              {['#', 'Ayah', 'Surah:Ayah', 'Recording', 'Filename', 'Date', 'Source', 'Verified', 'Action'].map(h => (
                <th key={h} style={{ padding: '12px 8px', fontSize: '13px', fontWeight: 'bold', color: 'black' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>{rows}</tbody>
        </table>
      )}

      {pagination && pagination.totalPages > 1 && (
        <Pagination currentPage={pagination.currentPage} totalPages={pagination.totalPages} onPageChange={setPage} />
      )}
    </div>
  );
}

export default FlutterRecordings;
