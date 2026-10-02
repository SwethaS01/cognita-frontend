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
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('All');
  const [year, setYear] = useState('All');
  const [skill, setSkill] = useState('');
  const [guidanceArea, setGuidanceArea] = useState('All');
  const [mentors, setMentors] = useState([]);
  const [allMentors, setAllMentors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);

  useEffect(() => {
    loadAllMentors();
  }, []);

  const loadAllMentors = async () => {
    setLoading(true);
    try {
      const response = await api.get('/mentor/all');
      setAllMentors(response.data || []);
      setMentors(response.data || []);
    } catch (error) {
      console.error('Failed to load mentors:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchMentors = async () => {
    setLoading(true);
    try {
      let filtered = allMentors;
      
      if (name.trim()) {
        filtered = filtered.filter(m => 
          m.user?.name?.toLowerCase().includes(name.toLowerCase())
        );
      }
      
      if (department !== 'All') {
        filtered = filtered.filter(m => m.user?.department === department);
      }
      
      if (year !== 'All') {
        filtered = filtered.filter(m => m.user?.year === year);
      }
      
      if (skill.trim()) {
        filtered = filtered.filter(m => 
          m.skills?.some(s => s.toLowerCase().includes(skill.toLowerCase()))
        );
      }
      
      if (guidanceArea !== 'All') {
        filtered = filtered.filter(m => 
          m.guidanceAreas?.includes(guidanceArea)
        );
      }
      
      setMentors(filtered);
    } catch (error) {
      console.error('Failed to search mentors:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setName('');
    setDepartment('All');
    setYear('All');
    setSkill('');
    setGuidanceArea('All');
    setMentors(allMentors);
  };

  const viewMentorProfile = async (mentorId) => {
    try {
      const response = await api.get(`/mentor/profile/${mentorId}`);
      setSelectedMentor(response.data);
      setShowProfileModal(true);
    } catch (error) {
      console.error('Failed to load mentor profile:', error);
      alert('Failed to load mentor profile');
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

  const departments = ['All', ...new Set(allMentors.map(m => m.user?.department).filter(Boolean))];
  const years = ['All', '1', '2', '3', '4'];
  const guidanceAreas = ['All', 'Placement Preparation', 'Programming/Coding', 'Technical Skills', 'Projects', 'Subjects', 'Career Guidance', 'Interview Preparation', 'Resume Preparation', 'Internship Guidance'];

  return (
    <div className="findMentorSection">
      <div className="filterGrid">
        <div className="filterGroup">
          <label>Search by Name</label>
          <input
            type="text"
            placeholder="Enter name..."
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        
        <div className="filterGroup">
          <label>Department</label>
          <select value={department} onChange={(e) => setDepartment(e.target.value)}>
            {departments.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        
        <div className="filterGroup">
          <label>Year</label>
          <select value={year} onChange={(e) => setYear(e.target.value)}>
            {years.map(y => <option key={y} value={y}>{y === 'All' ? 'All' : `${y}st Year`}</option>)}
          </select>
        </div>
        
        <div className="filterGroup">
          <label>Skill</label>
          <input
            type="text"
            placeholder="e.g., Java, React"
            value={skill}
            onChange={(e) => setSkill(e.target.value)}
          />
        </div>
        
        <div className="filterGroup">
          <label>Guidance Area</label>
          <select value={guidanceArea} onChange={(e) => setGuidanceArea(e.target.value)}>
            {guidanceAreas.map(ga => <option key={ga} value={ga}>{ga}</option>)}
          </select>
        </div>
      </div>
      
      <div className="filterActions">
        <button className="btn" onClick={searchMentors} disabled={loading}>
          {loading ? 'Searching...' : 'Search Mentors'}
        </button>
        <button className="outlineBtn" onClick={clearFilters}>
          Clear Filters
        </button>
      </div>

      {mentors.length > 0 && (
        <div className="mentorsList">
          <h3>Available Mentors ({mentors.length})</h3>
          {mentors.map((profile) => (
            <div key={profile._id} className="mentorResultCard enhanced">
              <div className="mentorResultInfo">
                <h4>{profile.user?.name || 'Mentor'}</h4>
                <p className="mentorDeptYear">
                  {profile.user?.department || 'N/A'} – {yearLabel(profile.user?.year) || 'N/A'}
                </p>
                {profile.skills && profile.skills.length > 0 && (
                  <p className="mentorSkills">
                    <strong>Skills:</strong> {profile.skills.slice(0, 5).join(', ')}
                    {profile.skills.length > 5 && '...'}
                  </p>
                )}
                {profile.guidanceAreas && profile.guidanceAreas.length > 0 && (
                  <p className="mentorGuidance">
                    <strong>Can help with:</strong> {profile.guidanceAreas.slice(0, 3).join(', ')}
                    {profile.guidanceAreas.length > 3 && '...'}
                  </p>
                )}
              </div>
              <div className="mentorCardActions">
                <button
                  className="outlineBtn"
                  onClick={() => viewMentorProfile(profile.user._id)}
                >
                  View Profile
                </button>
                {user?.role === 'junior' && (
                  <button
                    className="btn"
                    onClick={() => sendRequest(profile.user._id, profile.user?.name)}
                  >
                    Request Mentorship
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {mentors.length === 0 && !loading && (
        <div className="emptyState">
          <p>No mentors found matching your criteria.</p>
          <button className="outlineBtn" onClick={clearFilters}>
            Clear Filters
          </button>
        </div>
      )}

      {showProfileModal && selectedMentor && (
        <MentorProfileModal 
          mentor={selectedMentor} 
          onClose={() => setShowProfileModal(false)}
          user={user}
          onRequest={(mentorId) => {
            sendRequest(mentorId, selectedMentor.user?.name);
            setShowProfileModal(false);
          }}
        />
      )}
    </div>
  );
}

// Mentorship Requests Tab
function MentorshipRequests({ user }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

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

  const filteredRequests = statusFilter === 'all' 
    ? requests 
    : requests.filter(r => r.status === statusFilter);

  const sentRequests = filteredRequests.filter(r => String(r.sender._id) === String(user?._id));
  const receivedRequests = filteredRequests.filter(r => String(r.mentor._id) === String(user?._id));

  return (
    <div className="requestsSection">
      <div className="requestsHeader">
        <h3>Mentorship Requests</h3>
        <select 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)}
          className="statusFilter"
        >
          <option value="all">All Requests</option>
          <option value="pending">Pending</option>
          <option value="accepted">Accepted</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>
      
      {sentRequests.length > 0 && (
        <div className="requestCategory">
          <h4>Requests You Sent</h4>
          <div className="requestsList">
            {sentRequests.map((request) => (
              <div key={request._id} className={`requestCard ${request.status}`}>
                <div className="requestInfo">
                  <h4>To: {request.mentor?.name}</h4>
                  <p>
                    {request.mentor?.department} • {yearLabel(request.mentor?.year)} • {request.mentor?.role}
                  </p>
                  <p><strong>Requested skill:</strong> {request.requestedSkill}</p>
                  {request.message && <p className="requestMessage">"{request.message}"</p>}
                  <p className={`status ${request.status}`}>{request.status.toUpperCase()}</p>
                </div>
                {request.status === 'pending' && (
                  <div className="requestActions">
                    <span className="pendingLabel">Waiting for response...</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {receivedRequests.length > 0 && (
        <div className="requestCategory">
          <h4>Requests You Received</h4>
          <div className="requestsList">
            {receivedRequests.map((request) => {
              const isMentorOffer = request.requestType === 'mentor_offer';
              
              return (
                <div key={request._id} className={`requestCard ${request.status}`}>
                  <div className="requestInfo">
                    <h4>From: {request.sender?.name}</h4>
                    <p>
                      {request.sender?.department} • {yearLabel(request.sender?.year)} • {request.sender?.role}
                    </p>
                    <p><strong>Skill:</strong> {request.requestedSkill}</p>
                    {request.message && <p className="requestMessage">"{request.message}"</p>}
                    <p className="requestType">
                      {isMentorOffer ? '🎓 Mentor Offer' : '👤 Student Request'}
                    </p>
                    <p className={`status ${request.status}`}>{request.status.toUpperCase()}</p>
                  </div>
                  {request.status === 'pending' && (
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
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {filteredRequests.length === 0 && (
        <div className="emptyState">
          <p>No mentorship requests found.</p>
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
            <div key={rel._id} className="mentorCard enhanced">
              <div className="mentorInfo">
                <h4>{rel.mentor?.name}</h4>
                <p className="mentorDeptYear">
                  {yearLabel(rel.mentor?.year)} • {rel.mentor?.department}
                </p>
                {rel.mentor?.skills && rel.mentor.skills.length > 0 && (
                  <p className="mentorSkills">
                    <strong>Skills:</strong> {rel.mentor.skills.slice(0, 4).join(', ')}
                    {rel.mentor.skills.length > 4 && '...'}
                  </p>
                )}
                {rel.skill && (
                  <p className="mentorGuidance">
                    <strong>Mentoring in:</strong> {rel.skill}
                  </p>
                )}
                <p className="status active">Connection Status: Active</p>
                <p className="startDate">
                  Started: {new Date(rel.startDate).toLocaleDateString()}
                </p>
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
            <div key={rel._id} className="menteeCard enhanced">
              <div className="menteeInfo">
                <h4>{rel.mentee?.name}</h4>
                <p className="menteeDeptYear">
                  {yearLabel(rel.mentee?.year)} • {rel.mentee?.department}
                </p>
                {rel.mentee?.skills && rel.mentee.skills.length > 0 && (
                  <p className="menteeSkills">
                    <strong>Skills:</strong> {rel.mentee.skills.slice(0, 4).join(', ')}
                    {rel.mentee.skills.length > 4 && '...'}
                  </p>
                )}
                {rel.skill && (
                  <p className="menteeGuidance">
                    <strong>Requested help with:</strong> {rel.skill}
                  </p>
                )}
                <p className="status active">Connection Status: Active</p>
                <p className="startDate">
                  Started: {new Date(rel.startDate).toLocaleDateString()}
                </p>
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

// Mentor Profile Modal
function MentorProfileModal({ mentor, onClose, user, onRequest }) {
  if (!mentor) return null;

  const u = mentor.user || {};

  return (
    <div className="modalOverlay" onClick={onClose}>
      <div className="modalContent" onClick={(e) => e.stopPropagation()}>
        <div className="modalHeader">
          <h2>{u.name || 'Mentor Profile'}</h2>
          <button className="closeModal" onClick={onClose}>×</button>
        </div>
        
        <div className="modalBody">
          <div className="profileBasicInfo">
            <p><strong>Department:</strong> {u.department || 'N/A'}</p>
            <p><strong>Year:</strong> {yearLabel(u.year) || 'N/A'}</p>
            <p><strong>Role:</strong> {u.role || 'N/A'}</p>
          </div>

          {u.bio && (
            <div className="profileSection">
              <h4>About</h4>
              <p>{u.bio}</p>
            </div>
          )}

          {u.skills && u.skills.length > 0 && (
            <div className="profileSection">
              <h4>Skills</h4>
              <div className="skillTags">
                {u.skills.map((skill, i) => (
                  <span key={i} className="skillTag">{skill}</span>
                ))}
              </div>
            </div>
          )}

          {mentor.skills && mentor.skills.length > 0 && (
            <div className="profileSection">
              <h4>Mentoring Skills</h4>
              <div className="skillTags">
                {mentor.skills.map((skill, i) => (
                  <span key={i} className="skillTag">{skill}</span>
                ))}
              </div>
            </div>
          )}

          {mentor.guidanceAreas && mentor.guidanceAreas.length > 0 && (
            <div className="profileSection">
              <h4>Guidance Areas</h4>
              <div className="skillTags">
                {mentor.guidanceAreas.map((area, i) => (
                  <span key={i} className="skillTag">{area}</span>
                ))}
              </div>
            </div>
          )}

          {u.projects && u.projects.length > 0 && (
            <div className="profileSection">
              <h4>Projects</h4>
              <div className="projectsList">
                {u.projects.map((project, i) => (
                  <div key={i} className="projectItem">
                    <strong>{project.title}</strong>
                    {project.description && <p>{project.description}</p>}
                    {project.techStack && project.techStack.length > 0 && (
                      <div className="skillTags">
                        {project.techStack.map((tech, j) => (
                          <span key={j} className="skillTag small">{tech}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {u.certifications && u.certifications.length > 0 && (
            <div className="profileSection">
              <h4>Certifications</h4>
              <div className="certificationsList">
                {u.certifications.map((cert, i) => (
                  <div key={i} className="certItem">
                    <strong>{cert.name}</strong>
                    <p>{cert.issuer} {cert.date && `• ${cert.date}`}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {u.placementExperience && (
            <div className="profileSection">
              <h4>Placement Experience</h4>
              <p><strong>Company:</strong> {u.placementExperience.company || 'N/A'}</p>
              <p><strong>Role:</strong> {u.placementExperience.role || 'N/A'}</p>
              {u.placementExperience.package && <p><strong>Package:</strong> {u.placementExperience.package}</p>}
              {u.placementExperience.year && <p><strong>Year:</strong> {u.placementExperience.year}</p>}
            </div>
          )}

          {mentor.about && (
            <div className="profileSection">
              <h4>Mentorship About</h4>
              <p>{mentor.about}</p>
            </div>
          )}
        </div>

        <div className="modalFooter">
          {user?.role === 'junior' && (
            <button className="btn" onClick={() => onRequest(u._id)}>
              Request Mentorship
            </button>
          )}
          <button className="outlineBtn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
