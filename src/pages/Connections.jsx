import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Connections() {
  const { user } = useAuth();
  const [incoming, setIncoming] = useState([]);
  const [all, setAll] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    Promise.all([api.get('/connections/incoming'), api.get('/connections')])
      .then(([incRes, allRes]) => {
        setIncoming(incRes.data || []);
        setAll(allRes.data || []);
      })
      .catch((err) => console.error('Connections load failed:', err))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const respond = async (id, status) => {
    try {
      await api.patch(`/connections/${id}`, { status });
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Unable to update request');
    }
  };

  const accepted = all.filter((c) => c.status === 'accepted');
  const outgoingPending = all.filter(
    (c) => c.status === 'pending' && String(c.requester?._id) === String(user._id)
  );

  const other = (c) =>
    String(c.requester?._id) === String(user._id) ? c.recipient : c.requester;

  return (
    <>
      <div className="pageHead">
        <div>
          <span className="eyebrow">YOUR NETWORK</span>
          <h1>Connections</h1>
          <p>Accept requests and manage the students you're connected with.</p>
        </div>
        <Link className="btn" to="/directory">
          + Find Students
        </Link>
      </div>

      {loading ? (
        <div className="loading">Loading connections…</div>
      ) : (
        <>
          <section className="panel" style={{ marginBottom: 20 }}>
            <div className="panelHead">
              <h2>Incoming Requests ({incoming.length})</h2>
            </div>
            {incoming.length ? (
              incoming.map((c) => (
                <div className="mentorMini" key={c._id}>
                  <div className="avatar">{(c.requester?.name || 'S').charAt(0).toUpperCase()}</div>
                  <div>
                    <b>{c.requester?.name}</b>
                    <span>
                      {c.requester?.role} • {c.requester?.department || 'General'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn small" onClick={() => respond(c._id, 'accepted')}>
                      Accept
                    </button>
                    <button className="outlineBtn" onClick={() => respond(c._id, 'declined')}>
                      Decline
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty">No pending requests.</div>
            )}
          </section>

          <section className="panel" style={{ marginBottom: 20 }}>
            <div className="panelHead">
              <h2>Sent Requests ({outgoingPending.length})</h2>
            </div>
            {outgoingPending.length ? (
              outgoingPending.map((c) => (
                <div className="listItem" key={c._id}>
                  <div>
                    <b>{c.recipient?.name}</b>
                    <span>Waiting for response</span>
                  </div>
                  <em>pending</em>
                </div>
              ))
            ) : (
              <div className="empty">No requests waiting on a response.</div>
            )}
          </section>

          <section className="panel">
            <div className="panelHead">
              <h2>Connected ({accepted.length})</h2>
            </div>
            {accepted.length ? (
              accepted.map((c) => {
                const person = other(c);
                return (
                  <div className="mentorMini" key={c._id}>
                    <div className="avatar">{(person?.name || 'S').charAt(0).toUpperCase()}</div>
                    <div>
                      <b>{person?.name}</b>
                      <span>
                        {person?.role} • {person?.department || 'General'}
                      </span>
                    </div>
                    <Link className="outlineBtn" to="/chat">
                      💬 Message
                    </Link>
                  </div>
                );
              })
            ) : (
              <div className="empty">
                No connections yet. Visit the{' '}
                <Link to="/directory">Student Directory</Link> to connect with someone.
              </div>
            )}
          </section>
        </>
      )}
    </>
  );
}
