import { useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Experiences({ type = 'placement' }) {
  const { user } = useAuth();

  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('Latest');

  const canShare = ['senior', 'alumni'].includes(user?.role);

  const isPlacement = type === 'placement';

  const title = isPlacement
    ? 'Placement Experiences'
    : 'Internship Experiences';

  const subtitle = isPlacement
    ? 'Learn how students prepared, interviewed and secured their placements.'
    : 'Explore real internship journeys, selection processes and preparation strategies.';

  const load = async () => {
    try {
      const response = await api.get('/experiences', {
        params: {
          type,
          search
        }
      });

      setItems(response.data || []);
    } catch (error) {
      console.error('Failed to load experiences:', error);
    }
  };

  useEffect(() => {
    load();
  }, [type]);

  const sortedItems = useMemo(() => {
    const result = [...items];

    if (sortBy === 'A-Z') {
      result.sort((a, b) =>
        (a.company || '').localeCompare(b.company || '')
      );
    }

    if (sortBy === 'Z-A') {
      result.sort((a, b) =>
        (b.company || '').localeCompare(a.company || '')
      );
    }

    return result;
  }, [items, sortBy]);

  const uniqueCompanies = [
    ...new Set(items.map((item) => item.company).filter(Boolean))
  ];

  const uniqueRoles = [
    ...new Set(items.map((item) => item.role).filter(Boolean))
  ];

  const totalRounds = items.reduce(
    (total, item) => total + (item.rounds?.length || 0),
    0
  );

  return (
    <>
      {/* HERO */}
      <section className="experienceHero">
        <div className="experienceHeroContent">
          <span className="eyebrow">
            {type.toUpperCase()} EXPERIENCES
          </span>

          <h1>
            Learn from those
            <br />
            <span>who went before you.</span>
          </h1>

          <p>{subtitle}</p>

          <div className="experienceHeroActions">
            <button
              className="btn"
              onClick={() =>
                document
                  .getElementById('experienceSearch')
                  ?.focus()
              }
            >
              Explore Experiences →
            </button>

            {canShare && (
              <button
                className="outlineBtn experienceHeroBtn"
                onClick={() =>
                  document
                    .getElementById('experience')
                    ?.showModal()
                }
              >
                + Share Your Journey
              </button>
            )}
          </div>
        </div>

        <div className="experienceHeroVisual">
          <div className="journeyCard main">
            <div className="journeyIcon">
              {isPlacement ? '🎯' : '🚀'}
            </div>

            <div>
              <strong>
                {isPlacement
                  ? 'Placement Journey'
                  : 'Internship Journey'}
              </strong>

              <span>
                Real experiences from seniors & alumni
              </span>
            </div>
          </div>

          <div className="journeyMiniCard one">
            <span>💻</span>
            <div>
              <b>Technical Round</b>
              <small>Prepare smart</small>
            </div>
          </div>

          <div className="journeyMiniCard two">
            <span>💡</span>
            <div>
              <b>Pro Tips</b>
              <small>Learn from experience</small>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="experienceStats">
        <div className="experienceStatCard">
          <div className="experienceStatIcon">🏢</div>
          <div>
            <strong>{uniqueCompanies.length}</strong>
            <span>Companies</span>
          </div>
        </div>

        <div className="experienceStatCard">
          <div className="experienceStatIcon">📖</div>
          <div>
            <strong>{items.length}</strong>
            <span>Total Experiences</span>
          </div>
        </div>

        <div className="experienceStatCard">
          <div className="experienceStatIcon">💼</div>
          <div>
            <strong>{uniqueRoles.length}</strong>
            <span>Job Roles</span>
          </div>
        </div>

        <div className="experienceStatCard">
          <div className="experienceStatIcon">🧩</div>
          <div>
            <strong>{totalRounds}</strong>
            <span>Interview Rounds</span>
          </div>
        </div>
      </section>

      {/* SEARCH */}
      <section className="experienceExplorer">
        <div className="experienceSectionHeading">
          <div>
            <span className="eyebrow">EXPLORE JOURNEYS</span>
            <h2>Find your next opportunity</h2>
            <p>
              Search real experiences and understand what companies
              expect from candidates.
            </p>
          </div>
        </div>

        <div className="experienceSearchBox">
          <span>⌕</span>

          <input
            id="experienceSearch"
            placeholder="Search company, role or experience..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) =>
              e.key === 'Enter' && load()
            }
          />

          <button className="btn" onClick={load}>
            Search
          </button>
        </div>

        <div className="experienceToolbar">
          <div className="experienceQuickInfo">
            <span className="activeExperienceType">
              {isPlacement ? '🎯 Placement' : '🚀 Internship'}
            </span>

            <span>
              {items.length} shared journeys
            </span>
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="Latest">Latest</option>
            <option value="A-Z">Company A → Z</option>
            <option value="Z-A">Company Z → A</option>
          </select>
        </div>
      </section>

      {/* EXPERIENCE LIST */}
      <section className="experienceListSection">
        <div className="experienceListHeader">
          <div>
            <span className="eyebrow">
              COMMUNITY STORIES
            </span>

            <h2>
              {isPlacement
                ? 'Placement Stories'
                : 'Internship Stories'}
            </h2>
          </div>

          <span className="experienceCount">
            {sortedItems.length} experiences
          </span>
        </div>

        <div className="experienceGrid enhanced">
          {sortedItems.map((x) => (
            <ExperienceCard
              key={x._id}
              experience={x}
              isPlacement={isPlacement}
            />
          ))}
        </div>

        {!sortedItems.length && (
          <div className="experienceEmpty">
            <div className="experienceEmptyIcon">
              {isPlacement ? '🎯' : '🚀'}
            </div>

            <h3>No experiences found</h3>

            <p>
              There are no matching {type} experiences yet.
              Try another company name or search term.
            </p>

            <button
              className="outlineBtn"
              onClick={() => {
                setSearch('');
                load();
              }}
            >
              Clear Search
            </button>
          </div>
        )}
      </section>

      {/* SHARE DIALOG */}
      {canShare && (
        <dialog
          id="experience"
          className="experienceDialog"
        >
          <ExperienceForm
            type={type}
            close={() =>
              document
                .getElementById('experience')
                ?.close()
            }
            reload={load}
          />
        </dialog>
      )}
    </>
  );
}


/* =========================================================
   EXPERIENCE CARD
   ========================================================= */

function ExperienceCard({ experience: x, isPlacement }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <article className="experienceCard enhanced">
      <div className="experienceCardTop">
        <div className="companyIdentity">
          <div className="companyLogo enhanced">
            {x.company?.[0]?.toUpperCase() || 'C'}
          </div>

          <div>
            <h2>{x.company || 'Company'}</h2>
            <span>
              {x.role || 'Role not specified'}
            </span>
          </div>
        </div>

        <span className="experienceTypeBadge">
          {isPlacement ? 'PLACEMENT' : 'INTERNSHIP'}
        </span>
      </div>

      <div className="experienceHighlight">
        <div>
          <span>ELIGIBILITY</span>
          <strong>
            {x.eligibility || 'Not specified'}
          </strong>
        </div>

        <div>
          <span>PROCESS</span>
          <strong>
            {x.rounds?.length || 0} Rounds
          </strong>
        </div>
      </div>

      <div className="experienceStory">
        <span className="experienceLabel">
          EXPERIENCE
        </span>

        <p>
          {x.experience ||
            'No detailed experience has been added yet.'}
        </p>
      </div>

      {x.rounds?.length > 0 && (
        <div className="experienceRounds">
          <span className="experienceLabel">
            SELECTION ROUNDS
          </span>

          <div className="roundList">
            {x.rounds.map((round, index) => (
              <div className="roundItem" key={index}>
                <span>{index + 1}</span>
                <b>{round}</b>
              </div>
            ))}
          </div>
        </div>
      )}

      {expanded && (
        <div className="experienceExtra">
          {x.selectionProcess && (
            <div className="experienceInfoBlock">
              <span>📋 Selection Process</span>
              <p>{x.selectionProcess}</p>
            </div>
          )}

          {x.technicalQuestions?.length > 0 && (
            <div className="experienceInfoBlock">
              <span>💻 Technical Questions</span>

              <ul>
                {x.technicalQuestions.map(
                  (question, index) => (
                    <li key={index}>{question}</li>
                  )
                )}
              </ul>
            </div>
          )}

          {x.hrQuestions?.length > 0 && (
            <div className="experienceInfoBlock">
              <span>🗣️ HR Questions</span>

              <ul>
                {x.hrQuestions.map(
                  (question, index) => (
                    <li key={index}>{question}</li>
                  )
                )}
              </ul>
            </div>
          )}

          {x.tips && (
            <div className="experienceTipBox">
              <strong>💡 Preparation Tip</strong>
              <p>{x.tips}</p>
            </div>
          )}
        </div>
      )}

      <div className="experienceCardFooter">
        <div className="experienceAuthor">
          <div className="avatar small">
            {x.postedBy?.name
              ?.charAt(0)
              ?.toUpperCase() || 'U'}
          </div>

          <div>
            <span>Shared by</span>
            <b>
              {x.postedBy?.name || 'Community Member'}
            </b>
          </div>
        </div>

        <button
          className="experienceReadBtn"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? 'Show Less ↑' : 'Read More →'}
        </button>
      </div>
    </article>
  );
}


/* =========================================================
   EXPERIENCE FORM
   ========================================================= */

function ExperienceForm({ type, close, reload }) {
  const [d, setD] = useState({
    company: '',
    role: '',
    eligibility: '',
    selectionProcess: '',
    rounds: '',
    technicalQuestions: '',
    hrQuestions: '',
    tips: '',
    experience: ''
  });

  const [publishing, setPublishing] = useState(false);

  const update = (key, value) => {
    setD((prev) => ({
      ...prev,
      [key]: value
    }));
  };

  const submit = async (e) => {
    e.preventDefault();

    const x = {
      ...d,
      type,

      rounds: d.rounds
        .split('\n')
        .map((item) => item.trim())
        .filter(Boolean),

      technicalQuestions: d.technicalQuestions
        .split('\n')
        .map((item) => item.trim())
        .filter(Boolean),

      hrQuestions: d.hrQuestions
        .split('\n')
        .map((item) => item.trim())
        .filter(Boolean)
    };

    try {
      setPublishing(true);

      await api.post('/experiences', x);

      close();
      reload();

      setD({
        company: '',
        role: '',
        eligibility: '',
        selectionProcess: '',
        rounds: '',
        technicalQuestions: '',
        hrQuestions: '',
        tips: '',
        experience: ''
      });
    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.message ||
          'Failed to publish experience'
      );
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="experienceDialogContent">
      <div className="experienceDialogHeader">
        <div>
          <span className="eyebrow">
            COMMUNITY CONTRIBUTION
          </span>

          <h2>
            Share Your{' '}
            {type === 'placement'
              ? 'Placement'
              : 'Internship'}{' '}
            Journey
          </h2>

          <p>
            Your experience can help another student prepare
            with confidence.
          </p>
        </div>

        <button
          type="button"
          className="dialogClose"
          onClick={close}
        >
          ×
        </button>
      </div>

      <form
        className="experienceUploadForm"
        onSubmit={submit}
      >
        <div className="experienceFormSection">
          <h3>Company Details</h3>

          <div className="experienceFormGrid">
            <label>
              Company Name
              <input
                required
                placeholder="Example: TCS"
                value={d.company}
                onChange={(e) =>
                  update('company', e.target.value)
                }
              />
            </label>

            <label>
              Role
              <input
                placeholder="Example: Software Engineer"
                value={d.role}
                onChange={(e) =>
                  update('role', e.target.value)
                }
              />
            </label>
          </div>

          <label>
            Eligibility
            <input
              placeholder="Example: 7.5 CGPA, No standing arrears"
              value={d.eligibility}
              onChange={(e) =>
                update('eligibility', e.target.value)
              }
            />
          </label>
        </div>

        <div className="experienceFormSection">
          <h3>Selection Process</h3>

          <label>
            Selection Process
            <textarea
              rows="3"
              placeholder="Describe the overall selection process..."
              value={d.selectionProcess}
              onChange={(e) =>
                update(
                  'selectionProcess',
                  e.target.value
                )
              }
            />
          </label>

          <label>
            Interview Rounds
            <textarea
              rows="4"
              placeholder={
                'One round per line:\nAptitude Test\nTechnical Interview\nHR Interview'
              }
              value={d.rounds}
              onChange={(e) =>
                update('rounds', e.target.value)
              }
            />

            <small>
              Enter each round on a new line.
            </small>
          </label>
        </div>

        <div className="experienceFormSection">
          <h3>Interview Questions</h3>

          <div className="experienceFormGrid">
            <label>
              Technical Questions
              <textarea
                rows="5"
                placeholder={
                  'One question per line:\nExplain OOP concepts\nWhat is normalization?\nWrite a program for...'
                }
                value={d.technicalQuestions}
                onChange={(e) =>
                  update(
                    'technicalQuestions',
                    e.target.value
                  )
                }
              />
            </label>

            <label>
              HR Questions
              <textarea
                rows="5"
                placeholder={
                  'One question per line:\nTell me about yourself\nWhy should we hire you?\nWhere do you see yourself?'
                }
                value={d.hrQuestions}
                onChange={(e) =>
                  update(
                    'hrQuestions',
                    e.target.value
                  )
                }
              />
            </label>
          </div>
        </div>

        <div className="experienceFormSection">
          <h3>Your Experience</h3>

          <label>
            Experience Story
            <textarea
              rows="6"
              placeholder="Tell juniors what happened from preparation to final selection..."
              value={d.experience}
              onChange={(e) =>
                update('experience', e.target.value)
              }
            />
          </label>

          <label>
            Preparation Tips
            <textarea
              rows="4"
              placeholder="What should students focus on? Share practical advice..."
              value={d.tips}
              onChange={(e) =>
                update('tips', e.target.value)
              }
            />
          </label>
        </div>

        <div className="experienceDialogActions">
          <button
            type="button"
            className="outlineBtn"
            onClick={close}
          >
            Cancel
          </button>

          <button
            className="btn"
            type="submit"
            disabled={publishing}
          >
            {publishing
              ? 'Publishing...'
              : 'Publish Experience'}
          </button>
        </div>
      </form>
    </div>
  );
}