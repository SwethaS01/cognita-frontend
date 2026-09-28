import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { useEffect, useState } from 'react';

export default function Dashboard() {
  const { user } = useAuth();

  const [doubts, setDoubts] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/doubts'),
      api.get('/users/mentors')
    ])
      .then(([doubtRes, mentorRes]) => {
        setDoubts(doubtRes.data || []);
        setMentors(mentorRes.data || []);
      })
      .catch((err) => {
        console.error('Dashboard loading error:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const firstName = user?.name?.split(' ')[0] || 'Student';

  const stats = [
    {
      icon: '💬',
      value: doubts.length || 12,
      label: 'Doubts Asked',
      color: 'blue'
    },
    {
      icon: '✓',
      value: 28,
      label: 'Answers Received',
      color: 'green'
    },
    {
      icon: '📚',
      value: 16,
      label: 'Saved Resources',
      color: 'purple'
    },
    {
      icon: '🎓',
      value: 5,
      label: 'Mentorship Sessions',
      color: 'orange'
    }
  ];

  const resources = [
    {
      icon: '☕',
      title: 'Java Interview Guide',
      category: 'Programming',
      meta: '24 pages'
    },
    {
      icon: '🗄️',
      title: 'DBMS Complete Notes',
      category: 'Database',
      meta: '18 pages'
    },
    {
      icon: '⚛️',
      title: 'React Cheat Sheet',
      category: 'Web Development',
      meta: '12 pages'
    }
  ];

  const placements = [
    {
      company: 'TCS',
      role: 'Software Engineer',
      type: 'Placement Experience'
    },
    {
      company: 'Infosys',
      role: 'System Engineer',
      type: 'Interview Experience'
    },
    {
      company: 'Accenture',
      role: 'Associate Software Engineer',
      type: 'Placement Experience'
    }
  ];

  return (
    <div className="dashboardPage">

      {/* HERO */}
      <section className="dashboardHero">

        <div>
          <span className="eyebrow">YOUR COGNITA SPACE</span>

          <h1>
            Welcome back, {firstName} <span>👋</span>
          </h1>

          <p>
            Learn from your peers, share your knowledge and
            grow together with the Cognita Nexus community.
          </p>
        </div>

        <div className="dashboardHeroRight">
          <div className="dashboardDate">
            <span>COMMUNITY STATUS</span>
            <strong>
              <i></i> You're all caught up
            </strong>
          </div>

          <div className="dashboardAvatar">
            {firstName[0]?.toUpperCase()}
          </div>
        </div>

      </section>

      {/* SEARCH */}
      <div className="dashboardSearch">
        <span>⌕</span>
        <input
          type="text"
          placeholder="Search doubts, mentors, resources and experiences..."
        />
      </div>

      {/* STATS */}
      <section className="dashboardStats">

        {stats.map((stat) => (
          <div className="dashboardStat" key={stat.label}>

            <div className={`dashboardStatIcon ${stat.color}`}>
              {stat.icon}
            </div>

            <div>
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </div>

          </div>
        ))}

      </section>

      {/* QUICK ACTIONS */}
      <section className="dashboardSection">

        <div className="dashboardSectionHead">
          <div>
            <span className="sectionEyebrow">GET STARTED</span>
            <h2>What would you like to do?</h2>
          </div>
        </div>

        <div className="dashboardActions">

          <Link to="/doubts" className="dashboardAction actionPurple">
            <div className="actionIcon">💬</div>
            <div>
              <strong>Ask a Doubt</strong>
              <span>Get help from experienced students</span>
            </div>
            <b>→</b>
          </Link>

          <Link to="/mentors" className="dashboardAction actionBlue">
            <div className="actionIcon">🎓</div>
            <div>
              <strong>Find a Mentor</strong>
              <span>Connect with seniors and mentors</span>
            </div>
            <b>→</b>
          </Link>

          <Link to="/resources" className="dashboardAction actionGreen">
            <div className="actionIcon">📚</div>
            <div>
              <strong>Browse Resources</strong>
              <span>Notes, guides and study materials</span>
            </div>
            <b>→</b>
          </Link>

          <Link
            to="/experiences/placement"
            className="dashboardAction actionOrange"
          >
            <div className="actionIcon">🚀</div>
            <div>
              <strong>Placement Experiences</strong>
              <span>Learn from real interview journeys</span>
            </div>
            <b>→</b>
          </Link>

        </div>

      </section>

      {/* MAIN GRID */}
      <div className="dashboardMainGrid">

        {/* RECENT DOUBTS */}
        <section className="dashboardPanel">

          <div className="dashboardPanelHead">
            <div>
              <span className="sectionEyebrow">COMMUNITY</span>
              <h2>Recent Doubts</h2>
            </div>

            <Link to="/doubts">View all →</Link>
          </div>

          <div className="dashboardDoubtList">

            {loading ? (
              <div className="dashboardEmpty">
                Loading doubts...
              </div>
            ) : doubts.length ? (

              doubts.slice(0, 4).map((doubt) => (

                <Link
                  className="dashboardDoubt"
                  to={`/doubts/${doubt._id}`}
                  key={doubt._id}
                >

                  <div className="doubtIcon">
                    ?
                  </div>

                  <div className="doubtContent">
                    <strong>{doubt.title}</strong>

                    <span>
                      {doubt.subject || 'General'} •{' '}
                      {doubt.askedBy?.name || 'Student'}
                    </span>
                  </div>

                  <em className={doubt.status === 'solved' ? 'solved' : ''}>
                    {doubt.status || 'Open'}
                  </em>

                </Link>

              ))

            ) : (

              <div className="dashboardEmpty">
                <span>💬</span>
                <strong>No doubts yet</strong>
                <p>Be the first one to ask a question.</p>

                <Link to="/doubts" className="btn small">
                  Ask a Doubt
                </Link>
              </div>

            )}

          </div>

        </section>

        {/* MENTORS */}
        <section className="dashboardPanel">

          <div className="dashboardPanelHead">

            <div>
              <span className="sectionEyebrow">MENTORSHIP</span>
              <h2>Featured Mentors</h2>
            </div>

            <Link to="/mentors">Explore →</Link>

          </div>

          <div className="dashboardMentors">

            {mentors.length ? (

              mentors.slice(0, 3).map((mentor) => (

                <div className="dashboardMentor" key={mentor._id}>

                  <div className="mentorAvatar">
                    {mentor.name?.[0]?.toUpperCase() || 'M'}
                  </div>

                  <div className="mentorInfo">
                    <strong>{mentor.name}</strong>

                    <span>
                      {mentor.role || 'Senior Student'} •{' '}
                      {mentor.department || 'CSE'}
                    </span>

                    <small>
                      ⭐ 4.8&nbsp;&nbsp; • &nbsp;&nbsp;12 mentees
                    </small>
                  </div>

                  <Link
                    to={`/students/${mentor._id}`}
                    className="outlineBtn"
                  >
                    Connect
                  </Link>

                </div>

              ))

            ) : (

              <div className="dashboardEmpty">
                <span>🎓</span>
                <strong>Find your mentor</strong>
                <p>
                  Connect with seniors who can guide your journey.
                </p>

                <Link to="/mentors" className="btn small">
                  Explore Mentors
                </Link>
              </div>

            )}

          </div>

        </section>

      </div>

      {/* SECOND GRID */}
      <div className="dashboardMainGrid dashboardSecondGrid">

        {/* RESOURCES */}
        <section className="dashboardPanel">

          <div className="dashboardPanelHead">

            <div>
              <span className="sectionEyebrow">LEARNING</span>
              <h2>Trending Resources</h2>
            </div>

            <Link to="/resources">
              View all →
            </Link>

          </div>

          <div className="dashboardResources">

            {resources.map((resource) => (

              <Link
                to="/resources"
                className="dashboardResource"
                key={resource.title}
              >

                <div className="resourceIcon">
                  {resource.icon}
                </div>

                <div>
                  <strong>{resource.title}</strong>
                  <span>{resource.category}</span>
                  <small>{resource.meta}</small>
                </div>

                <b>→</b>

              </Link>

            ))}

          </div>

        </section>

        {/* PROGRESS */}
        <section className="dashboardPanel progressPanel">

          <div className="dashboardPanelHead">

            <div>
              <span className="sectionEyebrow">YOUR JOURNEY</span>
              <h2>Your Progress</h2>
            </div>

            <Link to="/profile">
              Profile →
            </Link>

          </div>

          <div className="progressTop">

            <div className="progressCircle">
              <strong>80%</strong>
            </div>

            <div>
              <strong>Profile completion</strong>
              <p>
                Complete your profile to get better mentor
                recommendations.
              </p>
            </div>

          </div>

          <div className="progressBar">
            <span style={{ width: '80%' }}></span>
          </div>

          <div className="progressItems">

            <div>
              <span>✓</span>
              Basic information
            </div>

            <div>
              <span>✓</span>
              Academic details
            </div>

            <div className="pending">
              <span>+</span>
              Add your interests
            </div>

          </div>

        </section>

      </div>

      {/* BOTTOM GRID */}
      <div className="dashboardBottomGrid">

        {/* PLACEMENT */}
        <section className="dashboardPanel placementPanel">

          <div className="dashboardPanelHead">

            <div>
              <span className="sectionEyebrow">
                CAREER
              </span>
              <h2>Latest Placement Experiences</h2>
            </div>

            <Link to="/experiences/placement">
              Explore →
            </Link>

          </div>

          <div className="placementList">

            {placements.map((item) => (

              <Link
                to="/experiences/placement"
                className="placementItem"
                key={item.company}
              >

                <div className="companyMini">
                  {item.company[0]}
                </div>

                <div>
                  <strong>{item.company}</strong>
                  <span>{item.role}</span>
                </div>

                <small>{item.type}</small>

              </Link>

            ))}

          </div>

        </section>

        {/* UPCOMING */}
        <section className="dashboardPanel">

          <div className="dashboardPanelHead">

            <div>
              <span className="sectionEyebrow">
                ACTIVITIES
              </span>
              <h2>Upcoming</h2>
            </div>

          </div>

          <div className="upcomingCard">

            <div className="calendarIcon">
              <strong>10</strong>
              <span>SEP</span>
            </div>

            <div>
              <strong>Resume Building Workshop</strong>

              <span>
                🎓 Career Development
              </span>

              <small>
                Tomorrow • 4:00 PM
              </small>
            </div>

          </div>

          <div className="upcomingCard">

            <div className="calendarIcon purple">
              <strong>14</strong>
              <span>SEP</span>
            </div>

            <div>
              <strong>Senior–Junior Meetup</strong>

              <span>
                🤝 Community
              </span>

              <small>
                Sunday • 11:00 AM
              </small>
            </div>

          </div>

        </section>

      </div>

    </div>
  );
}