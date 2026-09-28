import { useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import { yearLabel } from '../utils/year';
import { Link } from 'react-router-dom';

export default function Mentors() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState('');
  const [department, setDepartment] = useState('All');
  const [role, setRole] = useState('All');
  const [sortBy, setSortBy] = useState('Name');

  useEffect(() => {
    const loadMentors = async () => {
      try {
        const response = await api.get('/users/mentors');
        setItems(response.data || []);
      } catch (error) {
        console.error('Failed to load mentors:', error);
      }
    };

    loadMentors();
  }, []);

  const departments = useMemo(() => {
    return [
      'All',
      ...new Set(
        items
          .map((m) => m.department)
          .filter(Boolean)
      )
    ];
  }, [items]);

  const roles = useMemo(() => {
    return [
      'All',
      ...new Set(
        items
          .map((m) => m.role)
          .filter(Boolean)
      )
    ];
  }, [items]);

  const filtered = useMemo(() => {
    let result = items.filter((m) => {
      const text = (
        (m.name || '') +
        ' ' +
        (m.skills || []).join(' ') +
        ' ' +
        (m.interests || []).join(' ') +
        ' ' +
        (m.department || '') +
        ' ' +
        (m.bio || '')
      ).toLowerCase();

      const matchesSearch = text.includes(
        q.toLowerCase()
      );

      const matchesDepartment =
        department === 'All' ||
        m.department === department;

      const matchesRole =
        role === 'All' ||
        m.role === role;

      return (
        matchesSearch &&
        matchesDepartment &&
        matchesRole
      );
    });

    if (sortBy === 'Name') {
      result.sort((a, b) =>
        (a.name || '').localeCompare(b.name || '')
      );
    }

    if (sortBy === 'Skills') {
      result.sort(
        (a, b) =>
          (b.skills?.length || 0) -
          (a.skills?.length || 0)
      );
    }

    return result;
  }, [items, q, department, role, sortBy]);

  const totalSkills = [
    ...new Set(
      items.flatMap((m) => m.skills || [])
    )
  ].length;

  const totalDepartments = [
    ...new Set(
      items
        .map((m) => m.department)
        .filter(Boolean)
    )
  ].length;

  const alumniCount = items.filter(
    (m) => m.role === 'alumni'
  ).length;

  const seniorCount = items.filter(
    (m) => m.role === 'senior'
  ).length;

  return (
    <>
      {/* HERO */}
      <section className="mentorHero">
        <div className="mentorHeroContent">
          <span className="eyebrow">
            MENTORSHIP COMMUNITY
          </span>

          <h1>
            Find someone
            <br />
            <span>who can guide you.</span>
          </h1>

          <p>
            Connect with experienced seniors and alumni who
            can help you with academics, projects, placements,
            internships and career decisions.
          </p>

          <div className="mentorHeroActions">
            <button
              className="btn"
              onClick={() =>
                document
                  .getElementById('mentorSearch')
                  ?.focus()
              }
            >
              Find a Mentor →
            </button>

            <Link
              className="outlineBtn mentorHeroBtn"
              to="/chat"
            >
              💬 My Conversations
            </Link>
          </div>
        </div>

        <div className="mentorHeroVisual">
          <div className="mentorNetworkCard main">
            <div className="mentorNetworkIcon">
              🤝
            </div>

            <div>
              <strong>Peer Mentorship</strong>
              <span>
                Learn from real student experiences
              </span>
            </div>
          </div>

          <div className="mentorFloatingCard one">
            <span>🎓</span>
            <div>
              <b>Senior Guidance</b>
              <small>Academic support</small>
            </div>
          </div>

          <div className="mentorFloatingCard two">
            <span>💼</span>
            <div>
              <b>Career Advice</b>
              <small>Placement preparation</small>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="mentorStats">
        <div className="mentorStatCard">
          <div className="mentorStatIcon">👥</div>

          <div>
            <strong>{items.length}</strong>
            <span>Available Mentors</span>
          </div>
        </div>

        <div className="mentorStatCard">
          <div className="mentorStatIcon">🎓</div>

          <div>
            <strong>{seniorCount}</strong>
            <span>Senior Mentors</span>
          </div>
        </div>

        <div className="mentorStatCard">
          <div className="mentorStatIcon">💼</div>

          <div>
            <strong>{alumniCount}</strong>
            <span>Alumni Mentors</span>
          </div>
        </div>

        <div className="mentorStatCard">
          <div className="mentorStatIcon">⚡</div>

          <div>
            <strong>{totalSkills}</strong>
            <span>Skills Covered</span>
          </div>
        </div>
      </section>

      {/* SEARCH */}
      <section className="mentorExplorer">
        <div className="mentorSectionHeading">
          <div>
            <span className="eyebrow">
              EXPLORE MENTORS
            </span>

            <h2>Who do you want to learn from?</h2>

            <p>
              Search by name, skills, interests or department.
            </p>
          </div>
        </div>

        <div className="mentorSearchBox">
          <span>⌕</span>

          <input
            id="mentorSearch"
            placeholder="Search mentors, skills or interests..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />

          {q && (
            <button
              className="clearSearch"
              onClick={() => setQ('')}
            >
              ×
            </button>
          )}
        </div>

        <div className="mentorFilters">
          <div>
            <label>Department</label>

            <select
              value={department}
              onChange={(e) =>
                setDepartment(e.target.value)
              }
            >
              {departments.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label>Mentor Type</label>

            <select
              value={role}
              onChange={(e) =>
                setRole(e.target.value)
              }
            >
              {roles.map((item) => (
                <option key={item} value={item}>
                  {item === 'senior'
                    ? 'Senior'
                    : item === 'alumni'
                    ? 'Alumni'
                    : item}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label>Sort By</label>

            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value)
              }
            >
              <option value="Name">Name</option>
              <option value="Skills">
                Most Skills
              </option>
            </select>
          </div>
        </div>
      </section>

      {/* MENTORS */}
      <section className="mentorListSection">
        <div className="mentorListHeader">
          <div>
            <span className="eyebrow">
              COMMUNITY GUIDES
            </span>

            <h2>Meet Your Mentors</h2>
          </div>

          <span className="mentorCount">
            {filtered.length} mentors
          </span>
        </div>

        <div className="mentorGrid enhanced">
          {filtered.map((m) => (
            <MentorCard
              key={m._id}
              mentor={m}
            />
          ))}
        </div>

        {!filtered.length && (
          <div className="mentorEmpty">
            <div className="mentorEmptyIcon">
              🔎
            </div>

            <h3>No mentors found</h3>

            <p>
              Try another name, skill, department or
              mentor type.
            </p>

            <button
              className="outlineBtn"
              onClick={() => {
                setQ('');
                setDepartment('All');
                setRole('All');
              }}
            >
              Clear Filters
            </button>
          </div>
        )}
      </section>
    </>
  );
}


/* =========================================================
   MENTOR CARD
   ========================================================= */

function MentorCard({ mentor: m }) {
  const [expanded, setExpanded] = useState(false);

  const skills = m.skills || [];
  const interests = m.interests || [];

  return (
    <article className="mentorCard enhanced">
      <div className="mentorCardTop">
        <div className="mentorIdentity">
          <div className="mentorAvatar">
            {(m.name || 'M')
              .charAt(0)
              .toUpperCase()}

            <span className="onlineDot"></span>
          </div>

          <div>
            <h2>{m.name || 'Mentor'}</h2>

            <span>
              {m.role === 'alumni'
                ? 'Alumni'
                : 'Senior'}{' '}
              • {m.department || 'General'}
            </span>
          </div>
        </div>

        <span className="mentorRoleBadge">
          {m.role === 'alumni'
            ? 'ALUMNI'
            : 'SENIOR'}
        </span>
      </div>

      <div className="mentorBio">
        <p>
          {m.bio ||
            'Available to support students with academic and career guidance.'}
        </p>
      </div>

      {/* SKILLS */}
      {skills.length > 0 && (
        <div className="mentorSkillSection">
          <span className="mentorLabel">
            EXPERTISE
          </span>

          <div className="mentorSkills">
            {skills.slice(0, expanded ? 20 : 5).map(
              (skill, index) => (
                <span key={index}>
                  {skill}
                </span>
              )
            )}

            {!expanded && skills.length > 5 && (
              <span className="moreSkill">
                +{skills.length - 5}
              </span>
            )}
          </div>
        </div>
      )}

      {/* INTERESTS */}
      {expanded && interests.length > 0 && (
        <div className="mentorInterestSection">
          <span className="mentorLabel">
            INTERESTS
          </span>

          <div className="mentorInterests">
            {interests.map((interest, index) => (
              <span key={index}>
                {interest}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* INFO */}
      <div className="mentorInfoRow">
        <div>
          <span>DEPARTMENT</span>
          <b>{m.department || 'All'}</b>
        </div>

        <div>
          <span>YEAR</span>
          <b>{yearLabel(m.year) || '—'}</b>
        </div>

        <div>
          <span>STATUS</span>
          <b className="availableText">
            Available
          </b>
        </div>
      </div>

      {/* ACTIONS */}
      <div className="mentorActions enhanced">
        <Link
          className="outlineBtn"
          to={`/students/${m._id}`}
        >
          View Profile
        </Link>

        <Link
          className="btn"
          to={`/students/${m._id}`}
        >
          💬 Connect
        </Link>
      </div>

      <button
        className="mentorExpandBtn"
        onClick={() => setExpanded(!expanded)}
      >
        {expanded
          ? 'Show Less ↑'
          : 'View Expertise & Interests →'}
      </button>
    </article>
  );
}