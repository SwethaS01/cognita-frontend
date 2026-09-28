import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { yearLabel } from '../utils/year';

export default function Profile() {
  const { user, setUser } = useAuth();

  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const [d, setD] = useState({
    name: user?.name || '',
    department: user?.department || '',
    year: user?.year || '',
    college: user?.college || '',
    bio: user?.bio || '',
    skills: (user?.skills || []).join(', '),
    interests: (user?.interests || []).join(', ')
  });

  useEffect(() => {
    if (!user) return;

    setD({
      name: user.name || '',
      department: user.department || '',
      year: user.year || '',
      college: user.college || '',
      bio: user.bio || '',
      skills: (user.skills || []).join(', '),
      interests: (user.interests || []).join(', ')
    });
  }, [user]);

  const updateField = (field, value) => {
    setD((prev) => ({
      ...prev,
      [field]: value
    }));

    setSaved(false);
  };

  const cancelEdit = () => {
    setD({
      name: user?.name || '',
      department: user?.department || '',
      year: user?.year || '',
      college: user?.college || '',
      bio: user?.bio || '',
      skills: (user?.skills || []).join(', '),
      interests: (user?.interests || []).join(', ')
    });

    setEditing(false);
    setSaved(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      const res = await api.patch('/users/' + user._id, {
        ...d,

        skills: d.skills
          .split(',')
          .map((x) => x.trim())
          .filter(Boolean),

        interests: d.interests
          .split(',')
          .map((x) => x.trim())
          .filter(Boolean)
      });

      const wasRole = user.role;
      setUser((prev) => ({ ...prev, ...res.data }));
      setSaved(true);
      setEditing(false);
      if (res.data.role !== wasRole) {
        alert(res.data.role === 'senior' ? 'Congratulations! You are now a Senior 🎓 You can answer doubts and share experiences.' : 'Your role is now ' + res.data.role + '.');
      }
    } catch (error) {
      console.error('Profile update failed:', error);

      alert(
        error.response?.data?.message ||
          'Failed to update profile'
      );
    } finally {
      setSaving(false);
    }
  };

  const skills = d.skills
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean);

  const interests = d.interests
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean);

  const completionFields = [
    d.name,
    d.department,
    d.year,
    d.college,
    d.bio,
    skills.length,
    interests.length
  ];

  const completion = Math.round(
    (completionFields.filter(Boolean).length /
      completionFields.length) *
      100
  );

  return (
    <div className="professionalProfile">

      {/* PROFILE HEADER */}
      <section className="professionalProfileHero">

        <div className="profileHeroLeft">

          <div className="largeProfileAvatar">
            {user?.name?.[0]?.toUpperCase() || 'U'}

            <span className="profileOnline"></span>
          </div>

          <div className="professionalIdentity">

            <span className="eyebrow">
              COGNITA NEXUS PROFILE
            </span>

            <h1>{user?.name || 'Student'}</h1>

            <p className="profileRole">
              {user?.role || 'Student'}
              <span> • </span>
              {user?.department || 'CSE'}
              <span> • </span>
              {yearLabel(d.year) || 'Student'}
            </p>

            <p className="profileCollege">
              ◉ {user?.college || 'S.A. Engineering College'}
            </p>

            <div className="profileStatus">
              <span></span>
              Available for mentorship & collaboration
            </div>

          </div>

        </div>

        {/* HEADER ACTIONS */}
        <div className="profileHeaderActions">

          {!editing ? (
            <button
              className="profileEditBtn"
              onClick={() => {
                setEditing(true);
                setSaved(false);
              }}
            >
              ✎ Edit Profile
            </button>
          ) : (
            <div className="editActions">

              <button
                type="button"
                className="profileCancelBtn"
                onClick={cancelEdit}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                form="profileForm"
                className="btn"
                disabled={saving}
              >
                {saving
                  ? 'Saving...'
                  : '✓ Save Changes'}
              </button>

            </div>
          )}

        </div>

      </section>


      {/* SUCCESS MESSAGE */}
      {saved && (
        <div className="profileSuccess">
          ✓ Your profile has been updated successfully.
        </div>
      )}


      <form
        id="profileForm"
        onSubmit={handleSubmit}
        className="professionalProfileGrid"
      >

        {/* LEFT COLUMN */}
        <main className="professionalMain">

          {/* ABOUT */}
          <section className="professionalCard">

            <div className="professionalCardHeader">

              <div>
                <span className="sectionLabel">
                  INTRODUCTION
                </span>

                <h2>About Me</h2>
              </div>

              {!editing && (
                <span className="viewLabel">
                  Public profile
                </span>
              )}

            </div>

            {editing ? (
              <textarea
                className="professionalTextarea"
                rows="6"
                value={d.bio}
                placeholder="Tell the Cognita Nexus community about yourself..."
                onChange={(e) =>
                  updateField('bio', e.target.value)
                }
              />
            ) : (
              <p className="aboutText">
                {d.bio ||
                  'This student has not added a bio yet.'}
              </p>
            )}

          </section>


          {/* SKILLS */}
          <section className="professionalCard">

            <div className="professionalCardHeader">

              <div>
                <span className="sectionLabel">
                  EXPERTISE
                </span>

                <h2>Skills</h2>
              </div>

              {!editing && (
                <span className="skillCount">
                  {skills.length} skills
                </span>
              )}

            </div>

            {editing ? (
              <>
                <input
                  className="professionalInput"
                  value={d.skills}
                  placeholder="React, JavaScript, Node.js, MongoDB"
                  onChange={(e) =>
                    updateField(
                      'skills',
                      e.target.value
                    )
                  }
                />

                <small className="fieldHint">
                  Separate each skill using commas.
                </small>
              </>
            ) : (
              <div className="professionalChips">
                {skills.length ? (
                  skills.map((skill, index) => (
                    <span key={index}>
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="emptyChip">
                    No skills added
                  </span>
                )}
              </div>
            )}

          </section>


          {/* INTERESTS */}
          <section className="professionalCard">

            <div className="professionalCardHeader">

              <div>
                <span className="sectionLabel">
                  INTERESTS
                </span>

                <h2>Areas of Interest</h2>
              </div>

            </div>

            {editing ? (
              <>
                <input
                  className="professionalInput"
                  value={d.interests}
                  placeholder="Artificial Intelligence, UI/UX, Web Development"
                  onChange={(e) =>
                    updateField(
                      'interests',
                      e.target.value
                    )
                  }
                />

                <small className="fieldHint">
                  Add topics that you enjoy learning about.
                </small>
              </>
            ) : (
              <div className="professionalInterestChips">
                {interests.length ? (
                  interests.map((interest, index) => (
                    <span key={index}>
                      ♡ {interest}
                    </span>
                  ))
                ) : (
                  <span className="emptyChip">
                    No interests added
                  </span>
                )}
              </div>
            )}

          </section>


          {/* COMMUNITY */}
          <section className="professionalCard communityCard">

            <div className="communityIcon">
              ✦
            </div>

            <div>
              <h3>Be part of the Cognita Nexus community</h3>

              <p>
                Share knowledge, answer doubts, upload resources
                and help other students grow.
              </p>
            </div>

          </section>

        </main>


        {/* RIGHT COLUMN */}
        <aside className="professionalSide">

          {/* COMPLETION */}
          <section className="professionalCard completionCard">

            <div className="professionalCardHeader">

              <div>
                <span className="sectionLabel">
                  PROFILE STATUS
                </span>

                <h2>Profile Completion</h2>
              </div>

              <strong className="completionPercent">
                {completion}%
              </strong>

            </div>

            <div className="completionTrack">
              <div
                style={{
                  width: `${completion}%`
                }}
              ></div>
            </div>

            <p className="completionText">
              {completion >= 90
                ? 'Your profile is looking great!'
                : 'Complete your profile to help others know you better.'}
            </p>

          </section>


          {/* PERSONAL INFORMATION */}
          <section className="professionalCard">

            <div className="professionalCardHeader">

              <div>
                <span className="sectionLabel">
                  DETAILS
                </span>

                <h2>Academic Information</h2>
              </div>

            </div>

            <div className="professionalDetails">

              <ProfileDetail
                label="Full Name"
                value={d.name}
                editing={editing}
                type="input"
                onChange={(value) =>
                  updateField('name', value)
                }
              />

              <ProfileDetail
                label="Department"
                value={d.department}
                editing={editing}
                type="input"
                onChange={(value) =>
                  updateField(
                    'department',
                    value
                  )
                }
              />

              <ProfileDetail
                label="Academic Year"
                value={d.year}
                editing={editing && user?.role !== 'alumni'}
                type="select"
                onChange={(value) =>
                  updateField('year', value)
                }
              />

              <ProfileDetail
                label="College"
                value={d.college}
                editing={editing}
                type="input"
                onChange={(value) =>
                  updateField(
                    'college',
                    value
                  )
                }
              />

              <div className="detailRow">
                <span>Role</span>
                <strong>
                  {user?.role || 'Student'}
                </strong>
              </div>

              {user?.role !== 'alumni' && (
                <p className="muted" style={{ fontSize: 12, marginTop: 8 }}>
                  Year 1–2 = Junior, Year 3–4 = Senior. Your role updates automatically when you change your year.
                </p>
              )}

            </div>

          </section>


          {/* COMMUNITY ACTIVITY */}
          <section className="professionalCard">

            <div className="professionalCardHeader">

              <div>
                <span className="sectionLabel">
                  COMMUNITY
                </span>

                <h2>Your Presence</h2>
              </div>

            </div>

            <div className="profileActivity">

              <div>
                <strong>Q&A</strong>
                <span>Knowledge sharing</span>
              </div>

              <div>
                <strong>Resources</strong>
                <span>Learning contribution</span>
              </div>

              <div>
                <strong>Mentorship</strong>
                <span>Community support</span>
              </div>

            </div>

          </section>


          {/* ACCOUNT */}
          <section className="professionalCard accountCard">

            <div className="accountRow">
              <span>Account type</span>

              <strong>
                {user?.role || 'Student'}
              </strong>
            </div>

            <div className="accountRow">
              <span>Member status</span>

              <strong className="verifiedStatus">
                ✓ Active
              </strong>
            </div>

          </section>

        </aside>

      </form>

    </div>
  );
}


function ProfileDetail({
  label,
  value,
  editing,
  type,
  onChange
}) {
  return (
    <div className="detailRow">

      <span>{label}</span>

      {editing ? (
        type === 'select' ? (
          <select
            value={value}
            onChange={(e) =>
              onChange(e.target.value)
            }
          >
            <option value="">
              Select year
            </option>

            <option value="1">
              1st Year
            </option>

            <option value="2">
              2nd Year
            </option>

            <option value="3">
              3rd Year
            </option>

            <option value="4">
              4th Year
            </option>
          </select>
        ) : (
          <input
            value={value}
            onChange={(e) =>
              onChange(e.target.value)
            }
          />
        )
      ) : (
        <strong>
          {label === 'Academic Year' ? yearLabel(value) || '-' : value || '-'}
        </strong>
      )}

    </div>
  );
}