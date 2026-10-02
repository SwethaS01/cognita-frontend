import { useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import { downloadFile, formatSize } from '../utils/download';
import { useAuth } from '../context/AuthContext';

export default function Resources() {
  const { user } = useAuth();

  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [sortBy, setSortBy] = useState('Latest');
  const [showBookmarked, setShowBookmarked] = useState(false);

  const canUpload = ['junior', 'senior', 'alumni', 'admin'].includes(user?.role);

  const load = async () => {
    try {
      const response = await api.get('/resources', {
        params: { 
          search,
          bookmarked: showBookmarked ? 'true' : undefined
        }
      });

      setItems(response.data || []);
    } catch (error) {
      console.error('Failed to load resources:', error);
    }
  };

  useEffect(() => {
    load();
  }, [showBookmarked]);

  const resourceTypes = useMemo(() => {
    const types = items
      .map((item) => item.type || 'PDF')
      .filter(Boolean);

    return ['All', ...new Set(types)];
  }, [items]);

  const departments = useMemo(() => {
    const deps = items
      .map((item) => item.department || 'All')
      .filter(Boolean);

    return ['All', ...new Set(deps)];
  }, [items]);

  const filteredItems = useMemo(() => {
    let result = [...items];

    if (typeFilter !== 'All') {
      result = result.filter(
        (item) => (item.type || 'PDF') === typeFilter
      );
    }

    if (departmentFilter !== 'All') {
      result = result.filter(
        (item) => (item.department || 'All') === departmentFilter
      );
    }

    if (sortBy === 'A-Z') {
      result.sort((a, b) =>
        (a.title || '').localeCompare(b.title || '')
      );
    }

    if (sortBy === 'Z-A') {
      result.sort((a, b) =>
        (b.title || '').localeCompare(a.title || '')
      );
    }

    return result;
  }, [items, typeFilter, departmentFilter, sortBy]);

  const totalResources = items.length;

  const subjects = [
    ...new Set(
      items
        .map((item) => item.subject)
        .filter(Boolean)
    )
  ].slice(0, 6);

  const getFileType = (resource) => {
    if (resource.type) return resource.type.toUpperCase();
    const nm = (resource.fileName || '').toLowerCase();
    if (nm.endsWith('.ppt') || nm.endsWith('.pptx')) return 'PPT';
    if (nm.endsWith('.xls') || nm.endsWith('.xlsx')) return 'XLS';

    if (resource.fileUrl?.toLowerCase().endsWith('.pdf')) {
      return 'PDF';
    }

    if (
      resource.fileUrl?.toLowerCase().endsWith('.doc') ||
      resource.fileUrl?.toLowerCase().endsWith('.docx')
    ) {
      return 'DOC';
    }

    return 'FILE';
  };

  const getFileClass = (type) => {
    const normalized = type.toLowerCase();

    if (normalized.includes('pdf')) return 'pdf';
    if (
      normalized.includes('doc') ||
      normalized.includes('word')
    )
      return 'doc';
    if (
      normalized.includes('ppt') ||
      normalized.includes('presentation')
    )
      return 'ppt';
    if (
      normalized.includes('xls') ||
      normalized.includes('excel')
    )
      return 'xls';

    return 'file';
  };

  const openUpload = () => {
    document.getElementById('upload')?.showModal();
  };

  const handleVote = async (resourceId, voteType) => {
    try {
      await api.post(`/resources/${resourceId}/vote`, { voteType });
      load();
    } catch (error) {
      console.error('Failed to vote:', error);
    }
  };

  const handleBookmark = async (resourceId) => {
    try {
      await api.post(`/resources/${resourceId}/bookmark`);
      load();
    } catch (error) {
      console.error('Failed to bookmark:', error);
    }
  };

  return (
    <>
      {/* HERO */}
      <section className="resourceHero">
        <div className="resourceHeroContent">
          <span className="eyebrow">RESOURCE REPOSITORY</span>

          <h1>
            Learn smarter.
            <br />
            <span>Find everything you need.</span>
          </h1>

          <p>
            Discover notes, study materials, previous papers and
            useful resources shared by your Cognita Nexus community.
          </p>

          <div className="resourceHeroActions">
            <button
              className="btn"
              onClick={() =>
                document
                  .getElementById('resourceSearch')
                  ?.focus()
              }
            >
              Explore Resources →
            </button>

            {canUpload && (
              <button
                className="outlineBtn heroOutlineBtn"
                onClick={openUpload}
              >
                + Share a Resource
              </button>
            )}
          </div>
        </div>

        <div className="resourceHeroVisual">
          <div className="resourceFloatingCard main">
            <div className="resourceBigIcon">📚</div>

            <div>
              <strong>Knowledge Hub</strong>
              <span>{totalResources} resources available</span>
            </div>
          </div>

          <div className="resourceFloatingCard small one">
            <span>📄</span>
            <div>
              <b>Study Notes</b>
              <small>Quick revision</small>
            </div>
          </div>

          <div className="resourceFloatingCard small two">
            <span>🎓</span>
            <div>
              <b>Placement Prep</b>
              <small>Career resources</small>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <div className="resourceStats">
        <div className="resourceStatCard">
          <div className="resourceStatIcon">📚</div>
          <div>
            <strong>{totalResources}</strong>
            <span>Total Resources</span>
          </div>
        </div>

        <div className="resourceStatCard">
          <div className="resourceStatIcon">📄</div>
          <div>
            <strong>
              {
                items.filter(
                  (item) => getFileType(item) === 'PDF'
                ).length
              }
            </strong>
            <span>PDF Materials</span>
          </div>
        </div>

        <div className="resourceStatCard">
          <div className="resourceStatIcon">🎯</div>
          <div>
            <strong>{subjects.length}</strong>
            <span>Active Subjects</span>
          </div>
        </div>

        <div className="resourceStatCard">
          <div className="resourceStatIcon">🤝</div>
          <div>
            <strong>
              {
                items.filter(
                  (item) =>
                    ['senior', 'alumni'].includes(
                      item.uploadedBy?.role
                    )
                ).length
              }
            </strong>
            <span>Community Uploads</span>
          </div>
        </div>
      </div>

      {/* SEARCH + FILTER */}
      <section className="resourceExplorer">
        <div className="resourceSectionTitle">
          <div>
            <span className="eyebrow">EXPLORE</span>
            <h2>Find the right resource</h2>
            <p>
              Search and filter resources based on your learning
              needs.
            </p>
          </div>
        </div>

        <div className="resourceSearchBox">
          <span>⌕</span>

          <input
            id="resourceSearch"
            placeholder="Search notes, subjects, study materials..."
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

        <div className="resourceFilters">
          <div className="filterGroup">
            <label>File Type</label>

            <select
              value={typeFilter}
              onChange={(e) =>
                setTypeFilter(e.target.value)
              }
            >
              {resourceTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className="filterGroup">
            <label>Department</label>

            <select
              value={departmentFilter}
              onChange={(e) =>
                setDepartmentFilter(e.target.value)
              }
            >
              {departments.map((department) => (
                <option
                  key={department}
                  value={department}
                >
                  {department}
                </option>
              ))}
            </select>
          </div>

          <div className="resourceFilterGroup">
            <label>Sort By</label>
            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value)
              }
            >
              <option value="Latest">Latest</option>
              <option value="A-Z">A → Z</option>
              <option value="Z-A">Z → A</option>
            </select>
          </div>

          <div className="resourceFilterGroup">
            <label>View</label>
            <button
              className={`filterToggle ${showBookmarked ? 'active' : ''}`}
              onClick={() => setShowBookmarked(!showBookmarked)}
            >
              {showBookmarked ? '★ Bookmarked' : 'All Resources'}
            </button>
          </div>
        </div>
      </section>

      {/* POPULAR SUBJECTS */}
      {subjects.length > 0 && (
        <section className="resourceTopics">
          <div className="resourceSectionTitle compact">
            <div>
              <span className="eyebrow">QUICK ACCESS</span>
              <h2>Popular Subjects</h2>
            </div>
          </div>

          <div className="topicChips">
            {subjects.map((subject) => (
              <button
                key={subject}
                className="topicChip"
                onClick={() => {
                  setSearch(subject);
                  setTimeout(load, 0);
                }}
              >
                <span>📘</span>
                {subject}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* RESOURCE LIST */}
      <section className="resourceListSection">
        <div className="resourceListHeader">
          <div>
            <span className="eyebrow">COMMUNITY LIBRARY</span>
            <h2>Available Resources</h2>
          </div>

          <span className="resourceCount">
            {filteredItems.length} resources
          </span>
        </div>

        <div className="resourceGrid enhanced">
          {filteredItems.map((r) => {
            const fileType = getFileType(r);
            const fileClass = getFileClass(fileType);

            return (
              <article
                className="resourceCard enhanced"
                key={r._id}
              >
                <div className="resourceCardTop">
                  <div
                    className={`fileIcon large ${fileClass}`}
                  >
                    {fileType}
                  </div>

                  <span className="resourceBadge">
                    {r.subject || 'General'}
                  </span>
                </div>

                <div className="resourceCardBody">
                  <h3>{r.title}</h3>

                  <p>
                    {r.description ||
                      'Useful learning material shared with the community.'}
                  </p>

                  <div className="resourceMeta">
                    <span>
                      🏫 {r.department || 'All Departments'}
                    </span>

                    {r.semester && (
                      <span>
                        📅 Semester {r.semester}
                      </span>
                    )}
                  </div>

                  {r.tags?.length > 0 && (
                    <div className="resourceTags">
                      {r.tags.slice(0, 4).map((tag, index) => (
                        <span key={index}>#{tag}</span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="resourceCardFooter">
                  <div className="resourceUploader">
                    <div className="avatar small">
                      {r.uploadedBy?.name
                        ?.charAt(0)
                        ?.toUpperCase() || 'U'}
                    </div>

                    <div>
                      <span>Shared by</span>
                      <b>
                        {r.uploadedBy?.name || 'Community'}
                      </b>
                    </div>
                  </div>

                  <div className="resourceActions">
                    <div className="resourceVotes">
                      <button 
                        className={`voteBtn ${r.userVote === 'upvote' ? 'upvoted' : ''}`}
                        onClick={() => handleVote(r._id, 'upvote')}
                      >
                        ▲ {r.upvotes || 0}
                      </button>
                      <button 
                        className={`voteBtn ${r.userVote === 'downvote' ? 'downvoted' : ''}`}
                        onClick={() => handleVote(r._id, 'downvote')}
                      >
                        ▼ {r.downvotes || 0}
                      </button>
                    </div>
                    <button 
                      className={`bookmarkBtn ${r.isBookmarked ? 'bookmarked' : ''}`}
                      onClick={() => handleBookmark(r._id)}
                      title={r.isBookmarked ? 'Remove bookmark' : 'Bookmark'}
                    >
                      {r.isBookmarked ? '★' : '☆'}
                    </button>
                  </div>

                  {r.fileId ? (
                    <button
                      type="button"
                      className="resourceViewBtn"
                      onClick={() => downloadFile(r.fileId, r.fileName || r.title)}
                    >
                      ⬇ Download{r.fileSize ? ` (${formatSize(r.fileSize)})` : ''}
                    </button>
                  ) : (
                    <span className="resourceUnavailable">
                      File unavailable
                    </span>
                  )}
                </div>
              </article>
            );
          })}
        </div>

        {!filteredItems.length && (
          <div className="resourceEmpty">
            <div className="emptyIllustration">📚</div>

            <h3>No resources found</h3>

            <p>
              Try a different search term or change your
              filters to discover more learning material.
            </p>

            <button
              className="outlineBtn"
              onClick={() => {
                setSearch('');
                setTypeFilter('All');
                setDepartmentFilter('All');
                load();
              }}
            >
              Clear Filters
            </button>
          </div>
        )}
      </section>

      {/* UPLOAD DIALOG */}
      {canUpload && (
        <dialog id="upload" className="resourceDialog">
          <ResourceForm
            close={() =>
              document.getElementById('upload')?.close()
            }
            reload={load}
          />
        </dialog>
      )}
    </>
  );
}

function ResourceForm({ close, reload }) {
  const [d, setD] = useState({
    title: '',
    description: '',
    subject: '',
    department: 'CSE',
    semester: '',
    type: 'PDF',
    tags: ''
  });

  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const updateField = (key, value) => {
    setD((prev) => ({
      ...prev,
      [key]: value
    }));
  };

  const submit = async (e) => {
    e.preventDefault();

    try {
      setUploading(true);

      const formData = new FormData();

      Object.entries(d).forEach(([key, value]) => {
        if (key === 'tags') {
          formData.append(
            key,
            value
              .split(',')
              .map((tag) => tag.trim())
              .filter(Boolean)
          );
        } else {
          formData.append(key, value);
        }
      });

      if (file) {
        formData.append('file', file);
      }

      await api.post('/resources', formData);

      close();
      setD({
        title: '',
        description: '',
        subject: '',
        department: 'CSE',
        semester: '',
        type: 'PDF',
        tags: ''
      });
      setFile(null);

      reload();
    } catch (error) {
      console.error('Resource upload failed:', error);

      alert(
        error.response?.data?.message ||
          'Failed to upload resource. Please try again.'
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="uploadDialogContent">
      <div className="dialogHeader">
        <div>
          <span className="eyebrow">COMMUNITY CONTRIBUTION</span>
          <h2>Share a Resource</h2>
          <p>
            Help another student learn faster by sharing useful
            study material.
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

      <form className="resourceUploadForm" onSubmit={submit}>
        <div className="uploadFormGrid">
          <label>
            Resource Title
            <input
              required
              placeholder="Example: DBMS Unit 1 Notes"
              value={d.title}
              onChange={(e) =>
                updateField('title', e.target.value)
              }
            />
          </label>

          <label>
            Subject
            <input
              placeholder="Example: Database Management"
              value={d.subject}
              onChange={(e) =>
                updateField('subject', e.target.value)
              }
            />
          </label>
        </div>

        <label>
          Description
          <textarea
            rows="4"
            placeholder="Briefly describe what this resource contains..."
            value={d.description}
            onChange={(e) =>
              updateField('description', e.target.value)
            }
          />
        </label>

        <div className="uploadFormGrid three">
          <label>
            Department
            <select
              value={d.department}
              onChange={(e) =>
                updateField('department', e.target.value)
              }
            >
              <option>CSE</option>
              <option>IT</option>
              <option>ECE</option>
              <option>EEE</option>
              <option>MECH</option>
              <option>CIVIL</option>
              <option>All</option>
            </select>
          </label>

          <label>
            Semester
            <input
              placeholder="Example: 5"
              value={d.semester}
              onChange={(e) =>
                updateField('semester', e.target.value)
              }
            />
          </label>

          <label>
            Resource Type
            <select
              value={d.type}
              onChange={(e) =>
                updateField('type', e.target.value)
              }
            >
              <option>PDF</option>
              <option>DOC</option>
              <option>PPT</option>
              <option>XLS</option>
              <option>Other</option>
            </select>
          </label>
        </div>

        <label>
          Tags
          <input
            placeholder="react, dbms, semester 5, exams"
            value={d.tags}
            onChange={(e) =>
              updateField('tags', e.target.value)
            }
          />
          <small>
            Separate multiple tags using commas.
          </small>
        </label>

        <div className="fileUploadBox">
          <div className="uploadIcon">☁</div>

          <div>
            <strong>
              {file
                ? file.name
                : 'Choose a file to upload'}
            </strong>

            <span>
              {file
                ? `${(file.size / 1024 / 1024).toFixed(2)} MB`
                : 'PDF, DOC, PPT, XLS, ZIP or images (max 15 MB)'}
            </span>
          </div>

          <label className="chooseFileBtn">
            Browse
            <input
              type="file"
              onChange={(e) =>
                setFile(e.target.files?.[0] || null)
              }
            />
          </label>
        </div>

        <div className="dialogActions">
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
            disabled={uploading}
          >
            {uploading
              ? 'Uploading...'
              : 'Upload Resource'}
          </button>
        </div>
      </form>
    </div>
  );
}