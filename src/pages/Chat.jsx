import { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import api, { SOCKET_URL } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Chat() {
  const { user } = useAuth();

  const [mentors, setMentors] = useState([]);
  const [convos, setConvos] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [search, setSearch] = useState('');
  const socket = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    let mounted = true;

    // Private chat is only available with accepted connections, kept
    // separate from the public doubts/feed. Connect first from the
    // Student Directory or Mentors page to unlock a private chat here.
    api.get('/connections', { params: { status: 'accepted' } }).then((r) => {
      if (mounted) {
        const people = (r.data || []).map((c) =>
          String(c.requester?._id) === String(user._id) ? c.recipient : c.requester
        );
        setMentors(people);
      }
    });

    api.get('/chat/conversations').then((r) => {
      if (mounted) setConvos(r.data);
    });

    socket.current = io(
      SOCKET_URL
    );

    socket.current.emit('join', user._id);

    socket.current.on('message', (m) => {
      setMessages((current) =>
        current.some((item) => item._id === m._id)
          ? current
          : [...current, m]
      );
    });

    return () => {
      mounted = false;
      socket.current?.disconnect();
    };
  }, [user._id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
    });
  }, [messages]);

  const open = async (person) => {
    try {
      let conversation = convos.find((x) =>
        x.participants.some(
          (p) => String(p._id) === String(person._id)
        )
      );

      if (!conversation) {
        const response = await api.post('/chat/conversations', {
          userId: person._id,
        });

        conversation = response.data;
        setConvos((current) => [conversation, ...current]);
      }

      setSelected(conversation);

      socket.current?.emit(
        'joinConversation',
        conversation._id
      );

      const response = await api.get(
        `/chat/conversations/${conversation._id}/messages`
      );

      setMessages(response.data);
    } catch (error) {
      alert(
        error.response?.data?.message ||
          'Unable to open chat'
      );
    }
  };

  const partner = selected?.participants.find(
    (p) => String(p._id) !== String(user._id)
  );

  const send = () => {
    if (!text.trim() || !selected) return;

    socket.current.emit('message', {
      conversation: selected._id,
      sender: user._id,
      text: text.trim(),
    });

    setText('');
  };

  const filteredMentors = mentors.filter((mentor) => {
    const value = search.toLowerCase();

    return (
      mentor.name?.toLowerCase().includes(value) ||
      mentor.role?.toLowerCase().includes(value) ||
      mentor.department?.toLowerCase().includes(value)
    );
  });

  return (
    <div className="chatPage">

      {/* HEADER */}
      <div className="chatHero">
        <div>
          <span className="eyebrow">COMMUNITY MESSAGING</span>

          <h1>Connect. Ask. Grow together.</h1>

          <p>
            Private messages stay between you and your accepted connections.
            Connect with someone from the Student Directory or Mentors page to start chatting.
          </p>
        </div>

        <div className="chatHeroVisual">
          <div className="chatVisualIcon">💬</div>

          <div>
            <strong>Peer Conversations</strong>
            <span>Learn directly from experience</span>
          </div>
        </div>
      </div>

      {/* CHAT AREA */}
      <div className="chatLayout">

        {/* LEFT SIDEBAR */}
        <aside className="chatSidebar">

          <div className="chatSidebarHead">
            <div>
              <h2>Messages</h2>
              <span>{mentors.length} mentors available</span>
            </div>

            <div className="messageCount">
              {convos.length}
            </div>
          </div>

          {/* SEARCH */}
          <div className="chatSearch">
            <span>⌕</span>

            <input
              placeholder="Search mentors..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* MENTOR LIST */}
          <div className="chatPeople">

            {filteredMentors.map((mentor) => {
              const isActive =
                String(partner?._id) ===
                String(mentor._id);

              const hasConversation = convos.some((c) =>
                c.participants.some(
                  (p) =>
                    String(p._id) ===
                    String(mentor._id)
                )
              );

              return (
                <button
                  className={
                    isActive
                      ? 'chatPerson active'
                      : 'chatPerson'
                  }
                  key={mentor._id}
                  onClick={() => open(mentor)}
                >
                  <div className="chatAvatar">
                    {mentor.name?.[0]?.toUpperCase()}
                    <span className="onlineDot"></span>
                  </div>

                  <div className="chatPersonInfo">
                    <div className="chatPersonTop">
                      <b>{mentor.name}</b>

                      {hasConversation && (
                        <small>Chat</small>
                      )}
                    </div>

                    <span>
                      {mentor.role}
                      {mentor.department
                        ? ` • ${mentor.department}`
                        : ''}
                    </span>
                  </div>

                  <span className="chatArrow">›</span>
                </button>
              );
            })}

            {!filteredMentors.length && (
              <div className="chatNoPeople">
                <div>🔎</div>
                <b>No mentors found</b>
                <span>
                  Try another search term.
                </span>
              </div>
            )}

          </div>
        </aside>

        {/* CHAT WINDOW */}
        <section className="chatWindow">

          {selected ? (
            <>
              {/* CHAT HEADER */}
              <header className="chatHeader">

                <div className="chatHeaderPerson">

                  <div className="chatAvatar large">
                    {partner?.name?.[0]?.toUpperCase()}
                    <span className="onlineDot"></span>
                  </div>

                  <div>
                    <h3>{partner?.name}</h3>

                    <span>
                      {partner?.role}
                      {partner?.department
                        ? ` • ${partner.department}`
                        : ''}
                    </span>
                  </div>

                </div>

                <div className="chatStatus">
                  <span></span>
                  Available to chat
                </div>

              </header>

              {/* MESSAGES */}
              <div className="messages">

                <div className="conversationIntro">
                  <div className="conversationIcon">
                    💬
                  </div>

                  <strong>
                    Start a conversation
                  </strong>

                  <span>
                    Ask questions, share ideas and
                    learn from each other.
                  </span>
                </div>

                {messages.map((m) => {
                  const mine =
                    String(m.sender?._id || m.sender) ===
                    String(user._id);

                  return (
                    <div
                      className={
                        mine
                          ? 'messageRow mineRow'
                          : 'messageRow'
                      }
                      key={m._id}
                    >

                      {!mine && (
                        <div className="messageAvatar">
                          {partner?.name?.[0]?.toUpperCase()}
                        </div>
                      )}

                      <div
                        className={
                          mine
                            ? 'bubble mine'
                            : 'bubble'
                        }
                      >
                        <p>{m.text}</p>

                        <small>
                          {new Date(
                            m.createdAt
                          ).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </small>
                      </div>

                    </div>
                  );
                })}

                <div ref={messagesEndRef}></div>

              </div>

              {/* INPUT */}
              <div className="chatInputArea">

                <div className="chatInput">

                  <input
                    placeholder="Write a message..."
                    value={text}
                    onChange={(e) =>
                      setText(e.target.value)
                    }
                    onKeyDown={(e) =>
                      e.key === 'Enter' && send()
                    }
                  />

                  <button
                    className="sendButton"
                    onClick={send}
                    disabled={!text.trim()}
                  >
                    <span>➤</span>
                    Send
                  </button>

                </div>

                <small className="chatHint">
                  Press Enter to send
                </small>

              </div>
            </>
          ) : (
            <div className="chatEmpty">

              <div className="emptyChatIcon">
                💬
              </div>

              <h2>Your conversations start here</h2>

              <p>
                Select a mentor from the left to ask questions,
                discuss your career journey, or get academic guidance.
              </p>

              <div className="chatEmptyFeatures">

                <div>
                  <span>🎓</span>
                  <b>Academic Help</b>
                  <small>Clear your doubts</small>
                </div>

                <div>
                  <span>💼</span>
                  <b>Career Guidance</b>
                  <small>Learn from experience</small>
                </div>

                <div>
                  <span>🚀</span>
                  <b>Mentorship</b>
                  <small>Grow together</small>
                </div>

              </div>

            </div>
          )}

        </section>

      </div>
    </div>
  );
}