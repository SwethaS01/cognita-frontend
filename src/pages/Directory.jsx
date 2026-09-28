import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Directory() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [connections, setConnections] = useState([]);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('All');
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  const load = () => {
    setLoading(true);
    Promise.all([
      api.get('/users/directory', { params: { search } }),
      api.get('/connections')
    ])
      .then(([dirRes, connRes]) => {
        setItems((dirRes.data || []).filter((s) => s._id !== user._id));
        setConnections(connRes.data || []);
      })
      .catch((err) => console.error('Directory load failed:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const statusFor = (personId) => {
    const c = connections.find(
      (x) =>
        String(x.requester?._id) === String(personId) ||
        String(x.recipient?._id) === String(personId)
    );
    if (!c) return null;
    return { status: c.status, id: c._id, mine: String(c.requester?._id) === String(user._id) };
  };

  const connect = async (personId) => {
    setBusyId(personId);
    try {
      const r = await api.post('/connections', { recipientId: personId });
      setConnections((c) => [r.data, ...c]);
    } catch (err) {
      alert(err.response?.data?.message || 'Unable to send connection request');
    } finally {
      setBusyId(null);
    }
  };

  const filtered = useMemo(
    () => (role === 'All' ? items : items.filter((i) => i.role === role)),
    [items, role]
  );

  return (
    <>
      <div className="pageHead">
        <div>
          <span className="eyebrow">SA ENGINEERING COLLEGE</span>
          <h1>Student Directory</h1>
          <p>Find and connect with juniors, seniors and alumni by name, college ID or department.</p>
        </div>
      </div>

      <div className="toolbar">
        <input
          placeholder="Search by name, college ID, department or skills..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="All">All students</option>
          <option value="junior">Juniors</option>
          <option value="senior">Seniors</option>
          <option value="alumni">Alumni</option>
        </select>
      </div>

      {loading ? (
        <div className="loading">Loading students…</div>
      ) : filtered.length ? (
        <div className="mentorGrid">
          {filtered.map((s) => {
            const conn = statusFor(s._id);
            return (
              <article className="mentorCard" key={s._id}>
                <div className="mentorTop">
                  <div className="avatar big">{(s.name || 'S').charAt(0).toUpperCase()}</div>
                  <div>
                    <h2>{s.name}</h2>
                    <span>
                      {s.role === 'alumni' ? 'Alumni' : s.role === 'senior' ? 'Senior' : 'Junior'} •{' '}
                      {s.department || 'General'}
                    </span>
                  </div>
                </div>
                <p>{s.collegeId ? `College ID: ${s.collegeId}` : 'College ID not set'}</p>
                <p>{s.bio || 'No bio added yet.'}</p>
                <div className="mentorActions">
                  <Link className="outlineBtn" to={`/students/${s._id}`}>
                    View Profile
                  </Link>
                  {!conn && (
                    <button className="btn" disabled={busyId === s._id} onClick={() => connect(s._id)}>
                      {busyId === s._id ? 'Sending…' : '+ Connect'}
                    </button>
                  )}
                  {conn && conn.status === 'pending' && (
                    <button className="outlineBtn" disabled>
                      {conn.mine ? 'Request sent' : 'Respond in Connections'}
                    </button>
                  )}
                  {conn && conn.status === 'accepted' && (
                    <Link className="btn" to="/chat">
                      💬 Message
                    </Link>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="empty">No students found. Try a different search.</div>
      )}
    </>
  );
}
