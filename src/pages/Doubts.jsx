import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Doubts() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();
  const nav = useNavigate();

  const load = () => {
    setLoading(true);

    api
      .get('/doubts', {
        params: {
          search,
          category: categoryFilter === 'All' ? undefined : categoryFilter,
          status: filter === 'all' ? undefined : filter
        }
      })
      .then((r) => setItems(r.data || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [categoryFilter, filter]);

  const categories = ['All', 'Subject', 'Coding', 'Placement', 'Project', 'General'];

  const handleVote = async (doubtId, voteType) => {
    try {
      await api.post(`/doubts/${doubtId}/vote`, { voteType });
      load();
    } catch (error) {
      console.error('Failed to vote:', error);
    }
  };

  const filteredItems =
    filter === 'all'
      ? items
      : items.filter(
          (item) =>
            item.status?.toLowerCase() === filter
        );

  const total = items.length;

  const solved = items.filter(
    (item) =>
      item.status?.toLowerCase() === 'solved' ||
      item.status?.toLowerCase() === 'accepted'
  ).length;

  const open = total - solved;

  return (
    <div className="doubtsPage">

      {/* HEADER */}
      <section className="doubtsHero">

        <div className="doubtsHeroText">

          <span className="eyebrow">
            KNOWLEDGE EXCHANGE
          </span>

          <h1>
            Ask. Discuss. <span>Understand.</span>
          </h1>

          <p>
            Stuck on a concept, coding problem or exam topic?
            Ask the Cognita Nexus community and learn from
            students who have already been there.
          </p>

          <div className="doubtHeroActions">

            {user?.role === 'junior' && (
              <button
                className="btn"
                onClick={() => nav('/doubts/new')}
              >
                + Ask a Doubt
              </button>
            )}

            <Link
              to="/mentors"
              className="btn outline"
            >
              Find a Mentor
            </Link>

          </div>

        </div>

        <div className="doubtsHeroVisual">

          <div className="questionBubble bubbleOne">
            <span>💡</span>
            How does async/await work?
          </div>

          <div className="questionBubble bubbleTwo">
            <span>📚</span>
            Need help with DBMS?
          </div>

          <div className="questionBubble bubbleThree">
            <span>✓</span>
            Doubt solved!
          </div>

          <div className="bigQuestion">
            ?
          </div>

        </div>

      </section>


      {/* STATS */}
      <section className="doubtStats">

        <div className="doubtStatCard">
          <div className="doubtStatIcon">💬</div>
          <div>
            <strong>{total || 12}</strong>
            <span>Total Discussions</span>
          </div>
        </div>

        <div className="doubtStatCard">
          <div className="doubtStatIcon green">✓</div>
          <div>
            <strong>{solved || 8}</strong>
            <span>Doubts Solved</span>
          </div>
        </div>

        <div className="doubtStatCard">
          <div className="doubtStatIcon orange">🔥</div>
          <div>
            <strong>{open || 4}</strong>
            <span>Need Answers</span>
          </div>
        </div>

        <div className="doubtStatCard">
          <div className="doubtStatIcon purple">👥</div>
          <div>
            <strong>24</strong>
            <span>Active Contributors</span>
          </div>
        </div>

      </section>


      {/* SEARCH / FILTER */}
      <section className="doubtToolbar">

        <div className="doubtSearch">

          <span>⌕</span>

          <input
            placeholder="Search questions, subjects or tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) =>
              e.key === 'Enter' && load()
            }
          />

          {search && (
            <button
              onClick={() => {
                setSearch('');
                setTimeout(load, 0);
              }}
            >
              ×
            </button>
          )}

        </div>

        <button
          className="outlineBtn"
          onClick={load}
        >
          Search
        </button>

      </section>


      {/* FILTERS */}
      <div className="doubtFilters">

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="categoryFilter"
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <button
          className={filter === 'all' ? 'active' : ''}
          onClick={() => setFilter('all')}
        >
          All Discussions
        </button>

        <button
          className={filter === 'open' ? 'active' : ''}
          onClick={() => setFilter('open')}
        >
          Open
        </button>

        <button
          className={filter === 'solved' ? 'active' : ''}
          onClick={() => setFilter('solved')}
        >
          Solved
        </button>

      </div>


      {/* CONTENT */}
      <div className="doubtsContent">

        {/* FEED */}
        <main className="doubtsFeed">

          <div className="feedHeader">

            <div>
              <span className="sectionEyebrow">
                COMMUNITY QUESTIONS
              </span>

              <h2>
                Latest discussions
              </h2>
            </div>

            <span className="resultCount">
              {filteredItems.length} discussions
            </span>

          </div>


          {loading ? (

            <div className="doubtsLoading">
              <div className="loadingSpinner"></div>
              Loading discussions...
            </div>

          ) : filteredItems.length ? (

            filteredItems.map((d) => (

              <Link
                className="enhancedDoubtCard"
                to={`/doubts/${d._id}`}
                key={d._id}
              >

                <div className="doubtCardTop">

                  <span className="tag">
                    {d.category || d.subject || 'General'}
                  </span>

                  {d.isPrivate && (
                    <span className="privateBadge">
                      🔒 Private
                    </span>
                  )}

                  <span
                    className={`doubtStatus ${
                      d.status?.toLowerCase() === 'solved' ||
                      d.status?.toLowerCase() === 'resolved'
                        ? 'solved'
                        : ''
                    }`}
                  >
                    {d.status || 'Open'}
                  </span>

                </div>

                <h3>{d.title}</h3>

                <p>
                  {d.description?.length > 180
                    ? `${d.description.slice(0, 180)}...`
                    : d.description}
                </p>

                <div className="doubtVotes">
                  <button 
                    className={`voteBtn ${d.userVote === 'upvote' ? 'upvoted' : ''}`}
                    onClick={(e) => {
                      e.preventDefault();
                      handleVote(d._id, 'upvote');
                    }}
                  >
                    ▲ {d.upvotes || 0}
                  </button>
                  <button 
                    className={`voteBtn ${d.userVote === 'downvote' ? 'downvoted' : ''}`}
                    onClick={(e) => {
                      e.preventDefault();
                      handleVote(d._id, 'downvote');
                    }}
                  >
                    ▼ {d.downvotes || 0}
                  </button>
                </div>

                <div className="doubtCardBottom">

                  <div className="doubtAuthor">

                    <div className="smallAvatar">
                      {d.askedBy?.name?.[0]?.toUpperCase() ||
                        'S'}
                    </div>

                    <span>
                      Asked by{' '}
                      <strong>
                        {d.askedBy?.name || 'Student'}
                      </strong>
                    </span>

                  </div>

                  <div className="doubtMeta">

                    <span>
                      💬 {d.answersCount || 0} answers
                    </span>

                    <span>
                      {d.tags?.length
                        ? d.tags.slice(0, 2).join(' · ')
                        : 'Discussion'}
                    </span>

                  </div>

                </div>

              </Link>

            ))

          ) : (

            <div className="noDoubts">

              <div className="noDoubtIcon">
                💬
              </div>

              <h3>
                No discussions found
              </h3>

              <p>
                Try another search or start a new discussion.
              </p>

              {user?.role === 'junior' && (
                <button
                  className="btn small"
                  onClick={() => nav('/doubts/new')}
                >
                  Ask a Doubt
                </button>
              )}

            </div>

          )}

        </main>


        {/* SIDEBAR */}
        <aside className="doubtsSidebar">

          <div className="doubtSideCard">

            <span className="sectionEyebrow">
              QUICK TIP
            </span>

            <h3>
              Get better answers
            </h3>

            <p>
              Add the error message, what you tried,
              and what you expected to happen.
            </p>

            <div className="tipList">

              <div>
                <span>01</span>
                Explain the problem
              </div>

              <div>
                <span>02</span>
                Add relevant details
              </div>

              <div>
                <span>03</span>
                Share what you tried
              </div>

            </div>

          </div>


          <div className="doubtSideCard">

            <span className="sectionEyebrow">
              POPULAR TOPICS
            </span>

            <h3>
              Explore subjects
            </h3>

            <div className="topicList">

              <Link to="/doubts">
                <span>☕</span>
                Java
                <b>24</b>
              </Link>

              <Link to="/doubts">
                <span>⚛️</span>
                React
                <b>18</b>
              </Link>

              <Link to="/doubts">
                <span>🗄️</span>
                DBMS
                <b>15</b>
              </Link>

              <Link to="/doubts">
                <span>🐍</span>
                Python
                <b>12</b>
              </Link>

              <Link to="/doubts">
                <span>📐</span>
                Algorithms
                <b>9</b>
              </Link>

            </div>

          </div>


          <div className="doubtSideCard contributorCard">

            <div className="contributorIcon">
              🏆
            </div>

            <span className="sectionEyebrow">
              COMMUNITY
            </span>

            <h3>
              Become a contributor
            </h3>

            <p>
              Help juniors solve their doubts and
              build your knowledge-sharing profile.
            </p>

            <Link
              to="/doubts"
              className="outlineBtn"
            >
              Answer Questions →
            </Link>

          </div>

        </aside>

      </div>

    </div>
  );
}


/* =========================================================
   NEW DOUBT
   ========================================================= */

export function NewDoubt() {

  const [d, setD] = useState({
    title: '',
    description: '',
    subject: '',
    category: 'General',
    tags: '',
    isPrivate: false,
    targetUser: ''
  });

  const [posting, setPosting] = useState(false);
  const [connections, setConnections] = useState([]);
  const { user } = useAuth();

  const nav = useNavigate();

  useEffect(() => {
    if (d.isPrivate) {
      api.get('/doubts/connections')
        .then(res => setConnections(res.data || []))
        .catch(err => console.error(err));
    }
  }, [d.isPrivate]);

  const submit = async (e) => {

    e.preventDefault();

    try {

      setPosting(true);

      await api.post('/doubts', {
        ...d,
        tags: d.tags
          .split(',')
          .map((x) => x.trim())
          .filter(Boolean)
      });

      nav('/doubts');

    } catch (err) {

      console.error(err);
      alert('Unable to post doubt. Please try again.');

    } finally {

      setPosting(false);

    }
  };


  return (
    <div className="newDoubtPage">

      <Link to="/doubts" className="back">
        ← Back to discussions
      </Link>

      <div className="newDoubtLayout">

        <div className="newDoubtIntro">

          <span className="eyebrow">
            ASK A DOUBT
          </span>

          <h1>
            What are you
            <span> stuck on?</span>
          </h1>

          <p>
            Don't worry about asking basic questions.
            Cognita Nexus is built for students to learn
            from one another.
          </p>

          <div className="postingTips">

            <h3>Before you post</h3>

            <div>
              <span>✓</span>
              Give your question a clear title
            </div>

            <div>
              <span>✓</span>
              Explain what you have already tried
            </div>

            <div>
              <span>✓</span>
              Add relevant subject and tags
            </div>

          </div>

        </div>


        <form
          className="newDoubtForm"
          onSubmit={submit}
        >

          <div className="formTitle">
            <div className="formTitleIcon">
              ?
            </div>

            <div>
              <h2>Create a discussion</h2>
              <p>
                Your question will be visible to the community.
              </p>
            </div>
          </div>


          <label>
            Question title

            <input
              required
              placeholder="e.g. Why is my React useEffect running twice?"
              value={d.title}
              onChange={(e) =>
                setD({
                  ...d,
                  title: e.target.value
                })
              }
            />

          </label>


          <label>
            Describe your problem

            <textarea
              required
              rows="8"
              placeholder="Explain the problem clearly. Include errors, code snippets or what you have already tried..."
              value={d.description}
              onChange={(e) =>
                setD({
                  ...d,
                  description: e.target.value
                })
              }
            />

          </label>


          <div className="two">

            <label>
              Subject

              <input
                placeholder="Java, DBMS, React..."
                value={d.subject}
                onChange={(e) =>
                  setD({
                    ...d,
                    subject: e.target.value
                  })
                }
              />

            </label>


            <label>
              Category

              <select
                value={d.category}
                onChange={(e) =>
                  setD({
                    ...d,
                    category: e.target.value
                  })
                }
              >
                <option value="Subject">Subject</option>
                <option value="Coding">Coding</option>
                <option value="Placement">Placement</option>
                <option value="Project">Project</option>
                <option value="General">General</option>
              </select>

            </label>

          </div>


          <label>
            Tags

            <input
              placeholder="react, javascript, debugging"
              value={d.tags}
              onChange={(e) =>
                setD({
                  ...d,
                  tags: e.target.value
                })
              }
            />

            <small className="fieldHint">
              Separate multiple tags using commas.
            </small>

          </label>


          <label className="checkboxLabel">
            <input
              type="checkbox"
              checked={d.isPrivate}
              onChange={(e) =>
                setD({
                  ...d,
                  isPrivate: e.target.checked,
                  targetUser: e.target.checked ? '' : ''
                })
              }
            />
            <span>Make this doubt private (only visible to selected person)</span>
          </label>


          {d.isPrivate && (
            <label>
              Select Person

              <select
                required
                value={d.targetUser}
                onChange={(e) =>
                  setD({
                    ...d,
                    targetUser: e.target.value
                  })
                }
              >
                <option value="">Select a person...</option>
                {connections.map(conn => (
                  <option key={conn._id} value={conn._id}>
                    {conn.name} - {conn.department} ({conn.role})
                  </option>
                ))}
              </select>
            </label>
          )}


          <div className="formActions">

            <Link
              to="/doubts"
              className="outlineBtn"
            >
              Cancel
            </Link>

            <button
              className="btn"
              disabled={posting}
            >
              {posting
                ? 'Posting...'
                : 'Post Doubt →'}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}


/* =========================================================
   DOUBT DETAILS
   ========================================================= */

export function DoubtDetails() {

  const { id } = useParams();
  const { user } = useAuth();

  const [data, setData] = useState();
  const [answer, setAnswer] = useState('');
  const [posting, setPosting] = useState(false);

  const load = () =>
    api
      .get('/doubts/' + id)
      .then((r) => setData(r.data));


  useEffect(() => {
    load();
  }, [id]);


  if (!data) {
    return (
      <div className="loading">
        Loading discussion...
      </div>
    );
  }


  const doubt = data.doubt;
  const answers = data.answers || [];


  const submitAnswer = async (e) => {

    e.preventDefault();

    try {

      setPosting(true);

      await api.post(
        '/doubts/' + id + '/answers',
        { answer }
      );

      setAnswer('');
      load();

    } catch (err) {

      console.error(err);

    } finally {

      setPosting(false);

    }
  };

  const handleReplyVote = async (replyId, voteType) => {
    try {
      await api.post(`/doubts/${id}/replies/${replyId}/vote`, { voteType });
      load();
    } catch (error) {
      console.error('Failed to vote:', error);
    }
  };

  const handleAcceptAnswer = async (replyId) => {
    try {
      await api.patch(`/doubts/${id}/accept`, { answerId: replyId });
      load();
    } catch (error) {
      console.error('Failed to accept answer:', error);
    }
  };


  return (
    <div className="doubtDetailsPage">

      <Link to="/doubts" className="back">
        ← Back to discussions
      </Link>


      <div className="detailLayout">

        <main>

          {/* QUESTION */}
          <article className="enhancedDetail">

            <div className="detailTop">

              <span className="tag">
                {doubt.subject || 'General'}
              </span>

              <span
                className={`doubtStatus ${
                  doubt.status === 'solved'
                    ? 'solved'
                    : ''
                }`}
              >
                {doubt.status || 'Open'}
              </span>

            </div>


            <h1>{doubt.title}</h1>

            <div className="detailAuthor">

              <div className="detailAvatar">
                {doubt.askedBy?.name?.[0]?.toUpperCase() ||
                  'S'}
              </div>

              <div>
                <strong>
                  {doubt.askedBy?.name || 'Student'}
                </strong>

                <span>
                  {doubt.askedBy?.role || 'Student'}
                </span>
              </div>

            </div>


            <div className="detailDescription">
              <p>{doubt.description}</p>
            </div>


            {doubt.tags?.length > 0 && (

              <div className="detailTags">

                {doubt.tags.map((tag) => (
                  <span key={tag}>
                    #{tag}
                  </span>
                ))}

              </div>

            )}


            <div className="detailStats">

              <span>
                💬 {answers.length} Answers
              </span>

              <span>
                🕐 Community Discussion
              </span>

            </div>

          </article>


          {/* ANSWERS */}
          <section className="answersSection">

            <div className="answersHeader">

              <div>
                <span className="sectionEyebrow">
                  KNOWLEDGE SHARING
                </span>

                <h2>
                  {answers.length} Answers
                </h2>
              </div>

              <span>
                Help make this discussion useful.
              </span>

            </div>


            {answers.length ? (

              <div className="enhancedAnswers">

                {answers.map((a, index) => (

                  <article
                    className={`enhancedAnswer ${
                      index === 0 ? 'firstAnswer' : ''
                    }`}
                    key={a._id}
                  >

                    <div className="answerAvatar">
                      {a.answeredBy?.name?.[0]?.toUpperCase() ||
                        'S'}
                    </div>

                    <div className="answerBody">

                      <div className="answerHeader">

                        <div>
                          <strong>
                            {a.answeredBy?.name}
                          </strong>

                          <span>
                            {a.answeredBy?.role}
                          </span>
                        </div>

                        {a.isAccepted && (
                          <span className="acceptedBadge">
                            ✓ Accepted
                          </span>
                        )}

                      </div>

                      <div className="replyVotes">
                        <button 
                          className={`voteBtn small ${a.userVote === 'upvote' ? 'upvoted' : ''}`}
                          onClick={() => handleReplyVote(a._id, 'upvote')}
                        >
                          ▲ {a.upvotes || 0}
                        </button>
                        <button 
                          className={`voteBtn small ${a.userVote === 'downvote' ? 'downvoted' : ''}`}
                          onClick={() => handleReplyVote(a._id, 'downvote')}
                        >
                          ▼ {a.downvotes || 0}
                        </button>
                      </div>

                      <p>
                        {a.answer}
                      </p>


                      {user?.role === 'junior' &&
                        String(
                          doubt.askedBy?._id
                        ) === String(user._id) && !a.isAccepted && (

                          <button
                            className="outlineBtn"
                            onClick={() => handleAcceptAnswer(a._id)}
                          >
                            ✓ Mark as Accepted
                          </button>

                        )}

                    </div>

                  </article>

                ))}

              </div>

            ) : (

              <div className="noAnswers">

                <div>💡</div>

                <h3>
                  Be the first to help!
                </h3>

                <p>
                  No one has answered this question yet.
                </p>

              </div>

            )}

          </section>


          {/* ANSWER BOX */}
          {['senior', 'alumni', 'admin'].includes(
            user?.role
          ) && (

            <form
              className="enhancedReply"
              onSubmit={submitAnswer}
            >

              <div className="replyHeader">

                <div className="replyAvatar">
                  {user?.name?.[0]?.toUpperCase() || 'Y'}
                </div>

                <div>
                  <strong>
                    Share your knowledge
                  </strong>

                  <span>
                    Help this student understand the concept.
                  </span>
                </div>

              </div>


              <textarea
                required
                rows="6"
                placeholder="Write a clear and helpful answer..."
                value={answer}
                onChange={(e) =>
                  setAnswer(e.target.value)
                }
              />


              <div className="replyFooter">

                <span>
                  💡 Be clear, respectful and practical.
                </span>

                <button
                  className="btn"
                  disabled={posting}
                >
                  {posting
                    ? 'Posting...'
                    : 'Post Answer →'}
                </button>

              </div>

            </form>

          )}

        </main>


        {/* DETAIL SIDEBAR */}
        <aside className="detailsSide">

          <div className="detailSideCard">

            <span className="sectionEyebrow">
              DISCUSSION
            </span>

            <h3>
              Community guidelines
            </h3>

            <div className="guideline">
              <span>✓</span>
              Keep answers helpful
            </div>

            <div className="guideline">
              <span>✓</span>
              Explain your approach
            </div>

            <div className="guideline">
              <span>✓</span>
              Be respectful
            </div>

          </div>


          <div className="detailSideCard purpleSide">

            <div className="sideBigIcon">
              🎓
            </div>

            <h3>
              Need more guidance?
            </h3>

            <p>
              Connect with an experienced senior
              for one-to-one mentorship.
            </p>

            <Link
              to="/mentors"
              className="btn full"
            >
              Find a Mentor
            </Link>

          </div>

        </aside>

      </div>

    </div>
  );
}