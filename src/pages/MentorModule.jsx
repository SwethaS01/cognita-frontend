import { useEffect, useState } from 'react';
import api from '../services/api';
import { yearLabel } from '../utils/year';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function MentorModule() {
  const [activeTab, setActiveTab] = useState('find');
  const { user } = useAuth();

  const tabs = [
    { id: 'find', label: 'Find Mentor', icon: '🔍' },
    { id: 'requests', label: 'Requests', icon: '📨' },
    { id: 'my-mentors', label: 'My Mentors', icon: '🎓' },
    { id: 'my-mentees', label: 'My Mentees', icon: '👥' },
    { id: 'profile', label: 'Mentor Profile', icon: '⚙️' }
  ];

  // Only show "My Mentees" for seniors/alumni
  const filteredTabs = user?.role === 'senior' || user?.role === 'alumni'
    ? tabs
    : tabs.filter(t => t.id !== 'my-mentees');

  return (
    <div className="mentorModule">
      <div className="mentorModuleHeader">
        <h1>Mentorship Program</h1>
        <p>Connect with mentors and mentees for guidance and support</p>
      </div>

      <div className="mentorTabs">
        {filteredTabs.map(tab => (
          <button
            key={tab.id}
            className={`mentorTab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mentorTabContent">
        {activeTab === 'find' && <FindMentor user={user} />}
        {activeTab === 'requests' && <MentorshipRequests user={user} />}
        {activeTab === 'my-mentors' && <MyMentors user={user} />}
        {activeTab === 'my-mentees' && <MyMentees user={user} />}
        {activeTab === 'profile' && <MentorProfile user={user} />}
      </div>
    </div>
  );
}

// Find Mentor Tab
function FindMentor({ user }) {
  const [skill, setSkill] = useState('');
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState(null);

  const searchMentors = async () => {
    if (!skill.trim()) return;
    setLoading(true);
    try {
      const response = await api.get(`/mentor/search?skill=${encodeURIComponent(skill)}`);
      setMentors(response.data || []);
    } catch (error) {
      console.error('Failed to search mentors:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendRequest = async (mentorId, mentorName) => {
    try {
      await api.post('/mentor/request', {
        mentorId,
        requestedSkill: skill,
        message: `I would like mentorship in ${skill}`
      });
      alert('Mentorship request sent successfully!');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to send request');
    }
  };

  return (
    <div className="findMentorSection">
      <div className="searchBox">
        <input
          type="text"
          placeholder="Enter a skill (e.g., Java, React, SQL, Interview Preparation)"
          value={skill}
          onChange={(e) => setSkill(e.target.value)}
        />
        <button onClick={searchMentors} disabled={loading}>
          {loading ? 'Searching...' : 'Find Mentors'}
        </button>
      </div>

      {mentors.length > 0 && (
        <div className="mentorsList">
          <h3>Mentors who can help with "{skill}"</h3>
          {mentors.map((profile) => (
            <div key={profile._id} className="mentorResultCard">
              <div className="mentorResultInfo">
                <h4>{profile.user?.name || 'Mentor'}</h4>
                <p>
                  {profile.user?.department} • {yearLabel(profile.user?.year)} • {profile.user?.role}
                </p>
                {profile.about && <p className="mentorAbout">{profile.about}</p>}
                {profile.skills && profile.skills.length > 0 && (
                  <div className="skillTags">
                    {profile.skills.slice(0, 5).map((s, i) => (
                      <span key={i} className="skillTag">{s}</span>
                    ))}
                  </div>
                )}
              </div>
              {user?.role === 'junior' && (
                <button
                  className="btn"
                  onClick={() => sendRequest(profile.user._id, profile.user?.name)}
                >
                  Request Mentorship
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {mentors.length === 0 && skill && !loading && (
        <div className="emptyState">
          <p>No mentors found for "{skill}" yet.</p>
        </div>
      )}
    </div>
  );
}

// Mentorship Requests Tab
function MentorshipRequests({ user }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      const response = await api.get('/mentor/requests');
      setRequests(response.data || []);
    } catch (error) {
      console.error('Failed to load requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const respondToRequest = async (requestId, status) => {
    try {
      await api.patch('/mentor/requests/respond', { requestId, status });
      loadRequests();
      alert(`Request ${status} successfully!`);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to respond');
    }
  };

  if (loading) return <div className="loading">Loading requests...</div>;

  const pendingRequests = requests.filter(r => r.status === 'pending');

  return (
    <div className="requestsSection">
      <h3>Mentorship Requests</h3>
      
      {pendingRequests.length === 0 ? (
        <div className="emptyState">
          <p>No pending mentorship requests.</p>
        </div>
      ) : (
        <div className="requestsList">
          {pendingRequests.map((request) => {
            const isMentor = String(request.mentor._id) === String(user?._id);
            const otherUser = isMentor ? request.sender : request.mentor;
            
            return (
              <div key={request._id} className="requestCard">
                <div className="requestInfo">
                  <h4>{otherUser?.name}</h4>
                  <p>
                    {otherUser?.department} • {yearLabel(otherUser?.year)} • {otherUser?.role}
                  </p>
                  <p><strong>Requested skill:</strong> {request.requestedSkill}</p>
                  {request.message && <p className="requestMessage">"{request.message}"</p>}
                  <p className="requestType">
                    {request.requestType === 'student_request' ? '👤 Student Request' : '🎓 Mentor Offer'}
                  </p>
                </div>
                <div className="requestActions">
                  <button
                    className="btn accept"
                    onClick={() => respondToRequest(request._id, 'accepted')}
                  >
                    Accept
                  </button>
                  <button
                    className="btn reject"
                    onClick={() => respondToRequest(request._id, 'rejected')}
                  >
                    Reject
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {requests.filter(r => r.status !== 'pending').length > 0 && (
        <div className="pastRequests">
          <h4>Past Requests</h4>
          {requests.filter(r => r.status !== 'pending').map((request) => (
            <div key={request._id} className="requestCard past">
              <div className="requestInfo">
                <h4>{request.sender?.name} → {request.mentor?.name}</h4>
                <p><strong>Skill:</strong> {request.requestedSkill}</p>
                <p className={`status ${request.status}`}>{request.status.toUpperCase()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// My Mentors Tab
function MyMentors({ user }) {
  const [relationships, setRelationships] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMentors();
  }, []);

  const loadMentors = async () => {
    try {
      const response = await api.get('/mentor/my-mentors');
      setRelationships(response.data || []);
    } catch (error) {
      console.error('Failed to load mentors:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading mentors...</div>;

  return (
    <div className="myMentorsSection">
      <h3>My Mentors</h3>
      
      {relationships.length === 0 ? (
        <div className="emptyState">
          <p>You don't have any active mentors yet.</p>
          <p>Use the "Find Mentor" tab to connect with mentors.</p>
        </div>
      ) : (
        <div className="mentorsList">
          {relationships.map((rel) => (
            <div key={rel._id} className="mentorCard">
              <div className="mentorInfo">
                <h4>{rel.mentor?.name}</h4>
                <p>
                  {rel.mentor?.department} • {yearLabel(rel.mentor?.year)} • {rel.mentor?.role}
                </p>
                {rel.skill && <p><strong>Mentoring in:</strong> {rel.skill}</p>}
                <p className="status active">ACTIVE</p>
              </div>
              <Link to={`/students/${rel.mentor._id}`} className="btn">
                View Profile
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// My Mentees Tab
function MyMentees({ user }) {
  const [relationships, setRelationships] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMentees();
  }, []);

  const loadMentees = async () => {
    try {
      const response = await api.get('/mentor/my-mentees');
      setRelationships(response.data || []);
    } catch (error) {
      console.error('Failed to load mentees:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading mentees...</div>;

  return (
    <div className="myMenteesSection">
      <h3>My Mentees</h3>
      
      {relationships.length === 0 ? (
        <div className="emptyState">
          <p>You don't have any active mentees yet.</p>
        </div>
      ) : (
        <div className="menteesList">
          {relationships.map((rel) => (
            <div key={rel._id} className="menteeCard">
              <div className="menteeInfo">
                <h4>{rel.mentee?.name}</h4>
                <p>
                  {rel.mentee?.department} • {yearLabel(rel.mentee?.year)}
                </p>
                {rel.skill && <p><strong>Requested help with:</strong> {rel.skill}</p>}
                <p className="status active">ACTIVE</p>
              </div>
              <Link to={`/students/${rel.mentee._id}`} className="btn">
                View Profile
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Mentor Profile Tab
function MentorProfile({ user }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await api.get('/mentor/profile');
      setProfile(response.data);
      setFormData({
        skills: response.data?.skills || [],
        placementSkills: response.data?.placementSkills || [],
        subjects: response.data?.subjects || [],
        guidanceAreas: response.data?.guidanceAreas || [],
        about: response.data?.about || '',
        preferredTopics: response.data?.preferredTopics || [],
        mentorshipStatus: response.data?.mentorshipStatus || 'available',
        isActive: response.data?.isActive !== false
      });
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    try {
      await api.put('/mentor/profile', formData);
      setEditing(false);
      loadProfile();
      alert('Profile updated successfully!');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update profile');
    }
  };

  const handleArrayChange = (field, value) => {
    const current = formData[field] || [];
    if (current.includes(value)) {
      setFormData({ ...formData, [field]: current.filter(v => v !== value) });
    } else {
      setFormData({ ...formData, [field]: [...current, value] });
    }
  };

  const commonSkills = [
    'Java', 'Python', 'C', 'C++', 'JavaScript', 'React', 'SQL', 'HTML', 'CSS',
    'Node.js', 'MongoDB', 'AWS', 'Git', 'Aptitude', 'Communication',
    'Interview Preparation', 'Resume Preparation', 'Data Structures', 'Algorithms'
  ];

  const guidanceOptions = [
    'Placement Preparation', 'Programming/Coding', 'Technical Skills',
    'Projects', 'Subjects', 'Career Guidance', 'Interview Preparation',
    'Resume Preparation', 'Internship Guidance'
  ];

  if (loading) return <div className="loading">Loading profile...</div>;

  if (!['senior', 'alumni'].includes(user?.role)) {
    return (
      <div className="mentorProfileSection">
        <div className="emptyState">
          <h3>Mentor Profile</h3>
          <p>Only senior students (3rd/4th year) and alumni can become mentors.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mentorProfileSection">
      <div className="profileHeader">
        <h3>Mentor Profile</h3>
        {!editing && (
          <button className="btn" onClick={() => setEditing(true)}>
            Edit Profile
          </button>
        )}
      </div>

      {editing ? (
        <div className="profileForm">
          <div className="formGroup">
            <label>Skills you can help with:</label>
            <div className="skillTags">
              {commonSkills.map(skill => (
                <button
                  key={skill}
                  type="button"
                  className={`skillTag ${formData.skills?.includes(skill) ? 'selected' : ''}`}
                  onClick={() => handleArrayChange('skills', skill)}
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>

          <div className="formGroup">
            <label>Placement-related skills:</label>
            <div className="skillTags">
              {['Aptitude', 'Communication', 'Interview Preparation', 'Resume Preparation', 'Group Discussion'].map(skill => (
                <button
                  key={skill}
                  type="button"
                  className={`skillTag ${formData.placementSkills?.includes(skill) ? 'selected' : ''}`}
                  onClick={() => handleArrayChange('placementSkills', skill)}
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>

          <div className="formGroup">
            <label>Subjects you can teach:</label>
            <input
              type="text"
              placeholder="e.g., Data Structures, Operating Systems, DBMS"
              value={formData.subjects?.join(', ') || ''}
              onChange={(e) => setFormData({
                ...formData,
                subjects: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
              })}
            />
          </div>

          <div className="formGroup">
            <label>Guidance areas:</label>
            <div className="skillTags">
              {guidanceOptions.map(area => (
                <button
                  key={area}
                  type="button"
                  className={`skillTag ${formData.guidanceAreas?.includes(area) ? 'selected' : ''}`}
                  onClick={() => handleArrayChange('guidanceAreas', area)}
                >
                  {area}
                </button>
              ))}
            </div>
          </div>

          <div className="formGroup">
            <label>About you:</label>
            <textarea
              rows="4"
              placeholder="Tell students about yourself and how you can help them..."
              value={formData.about || ''}
              onChange={(e) => setFormData({ ...formData, about: e.target.value })}
            />
          </div>

          <div className="formGroup">
            <label>Mentorship status:</label>
            <select
              value={formData.mentorshipStatus}
              onChange={(e) => setFormData({ ...formData, mentorshipStatus: e.target.value })}
            >
              <option value="available">Available</option>
              <option value="busy">Busy</option>
              <option value="not_accepting">Not Accepting</option>
            </select>
          </div>

          <div className="formActions">
            <button className="btn" onClick={saveProfile}>
              Save Profile
            </button>
            <button className="outlineBtn" onClick={() => {
              setEditing(false);
              loadProfile();
            }}>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="profileDisplay">
          {profile?.skills && profile.skills.length > 0 && (
            <div className="profileSection">
              <h4>Skills</h4>
              <div className="skillTags">
                {profile.skills.map((skill, i) => (
                  <span key={i} className="skillTag">{skill}</span>
                ))}
              </div>
            </div>
          )}

          {profile?.placementSkills && profile.placementSkills.length > 0 && (
            <div className="profileSection">
              <h4>Placement Skills</h4>
              <div className="skillTags">
                {profile.placementSkills.map((skill, i) => (
                  <span key={i} className="skillTag">{skill}</span>
                ))}
              </div>
            </div>
          )}

          {profile?.subjects && profile.subjects.length > 0 && (
            <div className="profileSection">
              <h4>Subjects</h4>
              <div className="skillTags">
                {profile.subjects.map((subject, i) => (
                  <span key={i} className="skillTag">{subject}</span>
                ))}
              </div>
            </div>
          )}

          {profile?.guidanceAreas && profile.guidanceAreas.length > 0 && (
            <div className="profileSection">
              <h4>Guidance Areas</h4>
              <div className="skillTags">
                {profile.guidanceAreas.map((area, i) => (
                  <span key={i} className="skillTag">{area}</span>
                ))}
              </div>
            </div>
          )}

          {profile?.about && (
            <div className="profileSection">
              <h4>About</h4>
              <p>{profile.about}</p>
            </div>
          )}

          <div className="profileSection">
            <h4>Status</h4>
            <p className={`status ${profile?.mentorshipStatus}`}>
              {profile?.mentorshipStatus?.toUpperCase() || 'AVAILABLE'}
            </p>
          </div>

          {!profile || Object.keys(profile).length <= 2 || (
            !profile.skills || profile.skills.length === 0
          ) && (
            <div className="emptyState">
              <p>Your mentor profile is not set up yet.</p>
              <button className="btn" onClick={() => setEditing(true)}>
                Create Profile
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
