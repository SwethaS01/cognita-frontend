import { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { downloadFile, formatSize } from '../utils/download';
import { yearLabel } from '../utils/year';

const TYPES = [
  ['general', 'General', '💬'],
  ['experience', 'Experience', '🎯'],
  ['placement', 'Placement', '🚀'],
  ['achievement', 'Achievement', '🏆']
];

export default function Feed() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');
  const [type, setType] = useState('general');
  const [file, setFile] = useState(null);
  const [posting, setPosting] = useState(false);
  const [commentDrafts, setCommentDrafts] = useState({});

  const load = () => {
    setLoading(true);
    api
      .get('/posts')
      .then((r) => setPosts(r.data || []))
      .catch((err) => console.error('Feed load failed:', err))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const submitPost = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    setPosting(true);
    try {
      const fd = new FormData();
      fd.append('content', content);
      fd.append('type', type);
      if (file) fd.append('file', file);
      const r = await api.post('/posts', fd);
      setPosts((p) => [r.data, ...p]);
      setContent('');
      setFile(null);
      setType('general');
    } catch (err) {
      alert(err.response?.data?.message || 'Unable to publish post');
    } finally {
      setPosting(false);
    }
  };

  const toggleLike = async (postId) => {
    try {
      const r = await api.post(`/posts/${postId}/like`);
      setPosts((current) =>
        current.map((p) =>
          p._id === postId
            ? {
                ...p,
                likes: r.data.liked
                  ? [...p.likes, user._id]
                  : p.likes.filter((id) => String(id) !== String(user._id))
              }
            : p
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  const submitComment = async (postId) => {
    const text = (commentDrafts[postId] || '').trim();
    if (!text) return;
    try {
      const r = await api.post(`/posts/${postId}/comments`, { text });
      setPosts((current) =>
        current.map((p) => (p._id === postId ? { ...p, comments: [...p.comments, r.data] } : p))
      );
      setCommentDrafts((d) => ({ ...d, [postId]: '' }));
    } catch (err) {
      alert(err.response?.data?.message || 'Unable to add comment');
    }
  };

  return (
    <>
      <div className="pageHead">
        <div>
          <span className="eyebrow">COMMUNITY FEED</span>
          <h1>Feed</h1>
          <p>Share experiences, placement news, achievements and useful content with the community.</p>
        </div>
      </div>

      <form className="panel" style={{ marginBottom: 20 }} onSubmit={submitPost}>
        <textarea
          rows={3}
          placeholder="Share a placement update, an achievement, or something useful you learned..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <div className="formRow" style={{ marginTop: 12 }}>
          <label className="outlineBtn" style={{ cursor: 'pointer' }}>
            📎 {file ? file.name : 'Attach PDF / PPT / file'}
            <input
              type="file"
              style={{ display: 'none' }}
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </label>
          {file && (
            <button type="button" className="outlineBtn" onClick={() => setFile(null)}>
              Remove
            </button>
          )}
          <select value={type} onChange={(e) => setType(e.target.value)}>
            {TYPES.map(([v, label, icon]) => (
              <option key={v} value={v}>
                {icon} {label}
              </option>
            ))}
          </select>
          <button className="btn" disabled={posting || !content.trim()}>
            {posting ? 'Posting…' : 'Post'}
          </button>
        </div>
      </form>

      {loading ? (
        <div className="loading">Loading feed…</div>
      ) : posts.length ? (
        <div className="feed">
          {posts.map((p) => {
            const liked = p.likes?.some((id) => String(id) === String(user._id));
            const typeMeta = TYPES.find((t) => t[0] === p.type) || TYPES[0];
            return (
              <article className="doubtCard" key={p._id}>
                <div className="mentorMini" style={{ borderTop: 'none', padding: '0 0 10px' }}>
                  <div className="avatar">{(p.author?.name || 'S').charAt(0).toUpperCase()}</div>
                  <div>
                    <b>{p.author?.name}</b>
                    <span>
                      {p.author?.role}{p.author?.year ? ` • ${yearLabel(p.author.year)}` : ''} • {new Date(p.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <span className="tag">
                    {typeMeta[2]} {typeMeta[1]}
                  </span>
                </div>
                <p>{p.content}</p>
                {p.fileId && (
                  <button
                    type="button"
                    className="outlineBtn"
                    style={{ marginBottom: 10 }}
                    onClick={() => downloadFile(p.fileId, p.fileName)}
                  >
                    ⬇ Download {p.fileName}
                    {p.fileSize ? ` (${formatSize(p.fileSize)})` : ''}
                  </button>
                )}
                <div className="formRow">
                  <button className="outlineBtn" onClick={() => toggleLike(p._id)}>
                    {liked ? '❤️' : '🤍'} {p.likes?.length || 0}
                  </button>
                  <span className="muted">{p.comments?.length || 0} comments</span>
                </div>
                {p.comments?.length > 0 && (
                  <div className="answers" style={{ marginTop: 12 }}>
                    {p.comments.map((c, idx) => (
                      <div className="answer" key={c._id || idx}>
                        <div className="avatar">{(c.user?.name || 'S').charAt(0).toUpperCase()}</div>
                        <div>
                          <b>{c.user?.name}</b>
                          <p>{c.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="reply">
                  <input
                    placeholder="Write a comment..."
                    value={commentDrafts[p._id] || ''}
                    onChange={(e) =>
                      setCommentDrafts((d) => ({ ...d, [p._id]: e.target.value }))
                    }
                    onKeyDown={(e) => e.key === 'Enter' && submitComment(p._id)}
                  />
                  <button className="outlineBtn" onClick={() => submitComment(p._id)}>
                    Comment
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="empty">No posts yet. Be the first to share something with the community.</div>
      )}
    </>
  );
}
