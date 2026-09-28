import { useEffect, useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import api from '../services/api';
import { yearLabel } from '../utils/year';
import { useAuth } from '../context/AuthContext';

export default function StudentProfile() {
  const { id } = useParams();
  const { user } = useAuth();
  const [student, setStudent] = useState(null);
  const [connection, setConnection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([api.get(`/users/${id}`), api.get('/connections')])
      .then(([sRes, cRes]) => {
        setStudent(sRes.data);
        const c = (cRes.data || []).find(
          (x) =>
            String(x.requester?._id) === String(id) || String(x.recipient?._id) === String(id)
        );
        setConnection(c || null);
      })
      .catch((err) => console.error('Profile load failed:', err))
      .finally(() => setLoading(false));
  }, [id]);

  if (id === user._id) return <Navigate to="/profile" replace />;
  if (loading) return <div className="loading">Loading profile…</div>;
  if (!student) return <div className="empty">Student not found.</div>;

  const connect = async () => {
    setBusy(true);
    try {
      const r = await api.post('/connections', { recipientId: id });
      setConnection(r.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Unable to send connection request');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="professionalProfile">
      <section className="professionalProfileHero">
        <div className="profileHeroLeft">
          <div className="largeProfileAvatar">
            {student.name?.[0]?.toUpperCase() || 'S'}
          </div>
          <div className="professionalIdentity">
            <span className="eyebrow">COGNITA NEXUS PROFILE</span>
            <h1>{student.name}</h1>
            <p className="profileRole">
              {student.role}
              <span> • </span>
              {student.department || 'General'}
              <span> • </span>
              {yearLabel(student.year) || 'Student'}
            </p>
            <p className="profileCollege">◉ {student.college || 'SA Engineering College'}</p>
          </div>
        </div>

        <div className="profileHeaderActions">
          {!connection && (
            <button className="btn" disabled={busy} onClick={connect}>
              {busy ? 'Sending…' : '+ Connect'}
            </button>
          )}
          {connection && connection.status === 'pending' && (
            <Link className="outlineBtn" to="/connections">
              Request Pending
            </Link>
          )}
          {connection && connection.status === 'accepted' && (
            <Link className="btn" to="/chat">
              💬 Message
            </Link>
          )}
        </div>
      </section>

      <section className="panel" style={{ marginTop: 20 }}>
        <div className="panelHead">
          <h2>About</h2>
        </div>
        <p>{student.bio || 'This student has not added a bio yet.'}</p>
        {student.collegeId && <p className="muted">College ID: {student.collegeId}</p>}
      </section>

      {student.skills?.length > 0 && (
        <section className="panel" style={{ marginTop: 20 }}>
          <div className="panelHead">
            <h2>Skills</h2>
          </div>
          <div className="chips">
            {student.skills.map((s) => (
              <span key={s}>{s}</span>
            ))}
          </div>
        </section>
      )}

      {student.interests?.length > 0 && (
        <section className="panel" style={{ marginTop: 20 }}>
          <div className="panelHead">
            <h2>Interests</h2>
          </div>
          <div className="chips">
            {student.interests.map((s) => (
              <span key={s}>{s}</span>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
