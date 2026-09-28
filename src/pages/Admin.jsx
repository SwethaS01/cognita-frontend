import {useEffect,useMemo,useState} from 'react';
import api from '../services/api';
import {useAuth} from '../context/AuthContext';
import {Activity,AlertTriangle,BarChart3,Bell,BookOpen,Briefcase,CheckCircle,FileText,MessageSquare,RefreshCw,Search,ShieldCheck,Trash2,UserCheck,UserCog,Users,XCircle} from 'lucide-react';

const fmtDate=(value)=>value?new Date(value).toLocaleString():'';
const statusClass=(status)=>status==='open'||status==='active'||status==='approved'?'status ok':status==='removed'||status==='dismissed'?'status off':'status';

export function AdminDashboard(){
  const [s,setS]=useState({});
  const [loading,setLoading]=useState(true);
  const load=()=>{setLoading(true);api.get('/admin/stats').then(r=>setS(r.data)).catch(console.error).finally(()=>setLoading(false));};
  useEffect(load,[]);
  const cards=[['users','Total Users',Users],['activeUsers','Active Users',UserCheck],['junior','Juniors',Users],['senior','Seniors',UserCog],['alumni','Alumni',ShieldCheck],['doubts','Doubts',MessageSquare],['resources','Resources',BookOpen],['experiences','Experiences',Briefcase],['posts','Feed Posts',FileText],['openReports','Open Reports',AlertTriangle]];
  return <div className="adminPage">
    <AdminHero eyebrow="ADMINISTRATION" title="Platform overview" text="Monitor users, content, reports and community activity from one place." action={<button className="outlineBtn" onClick={load}><RefreshCw size={15}/> Refresh</button>}/>
    <section className="adminStatGrid">{cards.map(([key,label,Icon])=><div className="adminStatCard" key={key}><div className="adminStatIcon"><Icon size={19}/></div><span>{label}</span><strong>{loading?'—':s[key]??0}</strong></div>)}</section>
    <div className="adminTwoCol">
      <section className="adminPanel"><div className="adminPanelHead"><div><span className="eyebrow">USER DISTRIBUTION</span><h2>Community composition</h2></div><Users size={20}/></div>
        {['junior','senior','alumni'].map(role=>{const total=s.users||1;const value=s[role]||0;return <div className="distributionRow" key={role}><div><b>{role[0].toUpperCase()+role.slice(1)}</b><span>{value} users</span></div><div className="distributionTrack"><i style={{width:`${Math.min(100,(value/total)*100)}%`}}/></div></div>})}
      </section>
      <section className="adminPanel"><div className="adminPanelHead"><div><span className="eyebrow">MODERATION</span><h2>Content health</h2></div><BarChart3 size={20}/></div>
        <div className="miniMetricGrid"><MiniMetric label="Doubts" value={s.doubts}/><MiniMetric label="Resources" value={s.resources}/><MiniMetric label="Experiences" value={s.experiences}/><MiniMetric label="Feed posts" value={s.posts}/></div>
        <div className="adminCallout"><AlertTriangle size={18}/><div><b>{s.openReports||0} open reports</b><span>Review reported content from the moderation section.</span></div></div>
      </section>
    </div>
    <section className="adminPanel"><div className="adminPanelHead"><div><span className="eyebrow">RECENT ACTIVITY</span><h2>Administrator actions</h2></div><Activity size={20}/></div>
      <ActivityList items={s.recent||[]}/>
    </section>
  </div>;
}

export function AdminUsers(){
  const [users,setUsers]=useState([]),[q,setQ]=useState(''),[role,setRole]=useState('all'),[status,setStatus]=useState('all'),[loading,setLoading]=useState(false);
  const load=()=>{setLoading(true);api.get('/admin/users',{params:{search:q,role,status}}).then(r=>setUsers(r.data)).catch(console.error).finally(()=>setLoading(false));};
  useEffect(load,[]);
  useEffect(()=>{load()},[role,status]);
  return <div className="adminPage"><AdminHero eyebrow="USER MANAGEMENT" title="Community members" text="Search, filter and manage every account registered on Cognita Nexus."/>
    <section className="adminPanel"><div className="adminToolbar"><div className="adminSearch"><Search size={17}/><input placeholder="Search name, email or department…" value={q} onChange={e=>setQ(e.target.value)} onKeyDown={e=>e.key==='Enter'&&load()}/></div><select value={role} onChange={e=>setRole(e.target.value)}><option value="all">All roles</option><option value="junior">Junior</option><option value="senior">Senior</option><option value="alumni">Alumni</option><option value="admin">Admin</option></select><select value={status} onChange={e=>setStatus(e.target.value)}><option value="all">All status</option><option value="active">Active</option><option value="inactive">Inactive</option></select><button className="btn" onClick={load}><Search size={15}/> Search</button></div>
      <div className="adminTableWrap"><table className="adminTable"><thead><tr><th>User</th><th>Email</th><th>Role</th><th>Department</th><th>Year</th><th>Status</th><th>Action</th></tr></thead><tbody>{loading?<tr><td colSpan="7" className="tableMessage">Loading users…</td></tr>:users.map(u=><tr key={u._id}><td><div className="tableUser"><span>{(u.name||'?').slice(0,1).toUpperCase()}</span><div><b>{u.name}</b><small>{u.college||'SA Engineering College'}</small></div></div></td><td>{u.email}</td><td><span className="rolePill">{u.role}</span></td><td>{u.department||'—'}</td><td>{u.year||'—'}</td><td><span className={u.isActive?'status ok':'status off'}>{u.isActive?'Active':'Inactive'}</span></td><td><button className="tableAction" onClick={()=>api.patch(`/admin/users/${u._id}/toggle`).then(load).catch(e=>alert(e.response?.data?.message||'Unable to update user'))}>{u.isActive?'Deactivate':'Activate'}</button></td></tr>)}{!loading&&!users.length&&<tr><td colSpan="7" className="tableMessage">No users found.</td></tr>}</tbody></table></div>
    </section></div>;
}

export function AdminContent(){
  const [type,setType]=useState('all'),[search,setSearch]=useState(''),[items,setItems]=useState([]),[loading,setLoading]=useState(true);
  const load=()=>{setLoading(true);api.get('/admin/content',{params:{type,search}}).then(r=>setItems(r.data)).catch(console.error).finally(()=>setLoading(false));};
  useEffect(load,[type]);
  const labels={doubt:'Doubt',resource:'Resource',experience:'Experience',post:'Feed Post'};
  const getTitle=(row)=>{const x=row.item;if(row.type==='doubt'||row.type==='resource')return x.title;if(row.type==='experience')return `${x.company}${x.role?` — ${x.role}`:''}`;return x.content};
  const getAuthor=(row)=>row.item.askedBy?.name||row.item.uploadedBy?.name||row.item.postedBy?.name||row.item.author?.name||'Unknown';
  const moderate=(row,action)=>api.patch(`/admin/content/${row.type}/${row.item._id}`,{action}).then(load).catch(e=>alert(e.response?.data?.message||'Unable to update content'));
  return <div className="adminPage"><AdminHero eyebrow="CONTENT MANAGEMENT" title="Review community content" text="Monitor doubts, resources, experiences and feed posts without changing the student-facing pages."/>
    <section className="adminPanel"><div className="adminToolbar"><div className="adminSearch"><Search size={17}/><input placeholder="Search content…" value={search} onChange={e=>setSearch(e.target.value)} onKeyDown={e=>e.key==='Enter'&&load()}/></div><select value={type} onChange={e=>setType(e.target.value)}><option value="all">All content</option><option value="doubt">Doubts</option><option value="resource">Resources</option><option value="experience">Experiences</option><option value="post">Feed posts</option></select><button className="btn" onClick={load}><Search size={15}/> Search</button></div>
      <div className="adminContentList">{loading?<div className="tableMessage">Loading content…</div>:items.map(row=><article className="adminContentItem" key={`${row.type}-${row.item._id}`}><div className="contentTypeIcon">{row.type==='doubt'?<MessageSquare size={18}/>:row.type==='resource'?<BookOpen size={18}/>:row.type==='experience'?<Briefcase size={18}/>:<FileText size={18}/>}</div><div className="adminContentMain"><div className="contentMeta"><span className="rolePill">{labels[row.type]}</span><span>{fmtDate(row.item.createdAt)}</span></div><h3>{getTitle(row).slice(0,120)}{getTitle(row).length>120?'…':''}</h3><p>Posted by <b>{getAuthor(row)}</b></p></div><div className="adminContentRight"><span className={statusClass(row.item.status)}>{row.item.status}</span><div>{row.item.status==='removed'?<button className="tableAction successAction" onClick={()=>moderate(row,'restore')}><CheckCircle size={14}/> Restore</button>:<button className="tableAction dangerAction" onClick={()=>moderate(row,'remove')}><Trash2 size={14}/> Remove</button>}</div></div></article>)}{!loading&&!items.length&&<div className="empty">No content found.</div>}</div>
    </section></div>;
}

export function AdminReports(){
  const [rows,setRows]=useState([]),[filter,setFilter]=useState('all'),[loading,setLoading]=useState(true),[error,setError]=useState('');
  const load=async()=>{
    setLoading(true);setError('');
    try{
      const r=await api.get('/admin/reports');
      setRows(Array.isArray(r.data)?r.data:[]);
    }catch(e){
      console.error('Failed to load admin reports:',e);
      setError(e.response?.data?.message||'Unable to load reports. Make sure the backend is running and the admin account is logged in.');
    }finally{setLoading(false)}
  };
  useEffect(()=>{load()},[]);
  const visible=useMemo(()=>filter==='all'?rows:rows.filter(r=>r.status===filter),[rows,filter]);
  const update=async(id,status)=>{
    try{await api.patch(`/admin/reports/${id}`,{status});await load();}
    catch(e){alert(e.response?.data?.message||'Unable to update report')}
  };
  const counts={all:rows.length,open:rows.filter(r=>r.status==='open').length,resolved:rows.filter(r=>r.status==='resolved').length,dismissed:rows.filter(r=>r.status==='dismissed').length};
  return <div className="adminPage">
    <AdminHero eyebrow="MODERATION" title="Reported content" text="Review reports submitted by community members and record the moderation decision." action={<button className="outlineBtn" onClick={load}><RefreshCw size={15}/> Refresh</button>}/>
    <section className="adminPanel">
      <div className="filterTabs">
        {['all','open','resolved','dismissed'].map(x=><button key={x} className={filter===x?'active':''} onClick={()=>setFilter(x)}>{x[0].toUpperCase()+x.slice(1)} {counts[x]}</button>)}
      </div>
      {error&&<div className="adminError"><AlertTriangle size={17}/><span>{error}</span><button className="tableAction" onClick={load}>Try again</button></div>}
      {loading?<div className="tableMessage">Loading reports…</div>:!error&&<div className="reportList">
        {visible.map(r=><article className="reportCard" key={r._id}>
          <div className="reportIcon"><AlertTriangle size={18}/></div>
          <div className="reportBody">
            <div className="contentMeta"><span className="rolePill">{r.targetType||'content'}</span><span>{fmtDate(r.createdAt)}</span></div>
            <h3>{r.reason||'Reported content'}</h3>
            <p>Reported by <b>{r.reportedBy?.name||'Unknown user'}</b>{r.reportedBy?.email?` (${r.reportedBy.email})`:''}</p>
            <small>Target ID: {String(r.targetId||'—')}</small>
          </div>
          <div className="reportActions">
            <span className={statusClass(r.status)}>{r.status||'open'}</span>
            {r.status==='open'&&<><button className="tableAction successAction" onClick={()=>update(r._id,'resolved')}><CheckCircle size={14}/> Resolve</button><button className="tableAction dangerAction" onClick={()=>update(r._id,'dismissed')}><XCircle size={14}/> Dismiss</button></>}
          </div>
        </article>)}
        {!visible.length&&<div className="empty"><ShieldCheck size={30}/><h3>No reports found</h3><p>{filter==='all'?'There are no reports in the system yet.':'There are no '+filter+' reports.'}</p></div>}
      </div>}
    </section>
  </div>;
}

export function AdminAnnouncements(){
  const [title,setTitle]=useState(''),[message,setMessage]=useState(''),[type,setType]=useState('announcement'),[sending,setSending]=useState(false),[sent,setSent]=useState(null);
  const submit=async e=>{e.preventDefault();if(!title.trim()||!message.trim())return;setSending(true);setSent(null);try{const r=await api.post('/notifications/broadcast',{title:title.trim(),message:message.trim(),type});setSent(`Announcement sent to ${r.data.count} active users.`);setTitle('');setMessage('');}catch(e){alert(e.response?.data?.message||'Unable to send announcement')}finally{setSending(false)}};
  return <div className="adminPage"><AdminHero eyebrow="COMMUNICATION" title="Announcements" text="Send an important update to all active Cognita Nexus members."/>
    <section className="adminTwoCol"><form className="adminPanel adminForm" onSubmit={submit}><div className="adminPanelHead"><div><span className="eyebrow">NEW ANNOUNCEMENT</span><h2>Broadcast a message</h2></div><Bell size={20}/></div><label>Title<input value={title} onChange={e=>setTitle(e.target.value)} placeholder="e.g. Placement drive update"/></label><label>Message<textarea rows="7" value={message} onChange={e=>setMessage(e.target.value)} placeholder="Write the announcement students should receive…"/></label><label>Notification type<select value={type} onChange={e=>setType(e.target.value)}><option value="announcement">Announcement</option><option value="system">System update</option><option value="placement">Placement</option><option value="academic">Academic</option></select></label>{sent&&<div className="successMessage"><CheckCircle size={16}/>{sent}</div>}<button className="btn" disabled={sending}>{sending?'Sending…':'Send Announcement'}</button></form><section className="adminPanel"><div className="adminPanelHead"><div><span className="eyebrow">DELIVERY</span><h2>What happens</h2></div><MessageSquare size={20}/></div><div className="adminCallout"><Bell size={18}/><div><b>All active users</b><span>The current backend broadcasts to every active user account.</span></div></div><div className="announcementSteps"><div><b>1</b><span>Admin writes the message.</span></div><div><b>2</b><span>Backend creates notification records in MongoDB.</span></div><div><b>3</b><span>Users see it in their Notifications page.</span></div></div></section></section></div>;
}

export function AdminActivity(){const [items,setItems]=useState([]);useEffect(()=>{api.get('/admin/activity').then(r=>setItems(r.data)).catch(console.error)},[]);return <div className="adminPage"><AdminHero eyebrow="SYSTEM" title="Activity logs" text="A record of important actions performed by administrators."/><section className="adminPanel"><ActivityList items={items} detailed/></section></div>}

export function AdminProfile(){
  const {user}=useAuth();const [d,setD]=useState({name:'',email:'',department:'',year:'',college:'',bio:''});const [editing,setEditing]=useState(false);const [saved,setSaved]=useState(false);
  useEffect(()=>{if(user)setD({name:user.name||'',email:user.email||'',department:user.department||'',year:user.year||'',college:user.college||'',bio:user.bio||''})},[user]);
  const save=async()=>{try{await api.patch(`/users/${user._id}`,{name:d.name,department:d.department,year:d.year,college:d.college,bio:d.bio});setSaved(true);setEditing(false)}catch(e){alert(e.response?.data?.message||'Unable to save profile')}};
  return <div className="adminPage"><AdminHero eyebrow="SYSTEM" title="Administrator profile" text="Manage the profile information associated with your administrator account." action={!editing?<button className="btn" onClick={()=>setEditing(true)}><UserCog size={15}/> Edit Profile</button>:null}/><section className="adminProfileCard"><div className="adminProfileTop"><div className="adminAvatar">{(d.name||'A').slice(0,1).toUpperCase()}</div><div><span className="eyebrow">ADMINISTRATOR</span><h2>{d.name||'Cognita Administrator'}</h2><p>{d.email}</p><span className="rolePill">admin</span></div></div><div className="adminProfileGrid">{[['Name','name'],['Email','email'],['Department','department'],['Account Role','role'],['College','college'],['Account Status','status']].map(([label,key])=><div className="profileField" key={key}><span>{label}</span>{editing&&key!=='email'&&key!=='role'&&key!=='status'?<input value={d[key]} onChange={e=>setD({...d,[key]:e.target.value})}/>:<b>{key==='role'?'Administrator':key==='status'?'Active':d[key]||'—'}</b>}</div>)}</div>{editing&&<label className="profileBio">Bio<textarea rows="4" value={d.bio} onChange={e=>setD({...d,bio:e.target.value})}/></label>}{saved&&<div className="successMessage"><CheckCircle size={16}/> Profile updated successfully.</div>}{editing&&<div className="profileActions"><button className="outlineBtn" onClick={()=>setEditing(false)}>Cancel</button><button className="btn" onClick={save}>Save Changes</button></div>}</section></div>;
}

function AdminHero({eyebrow,title,text,action}){return <div className="adminHero"><div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{text}</p></div>{action}</div>}
function MiniMetric({label,value}){return <div className="miniMetric"><span>{label}</span><strong>{value??0}</strong></div>}
function ActivityList({items,detailed}){return <div className="activityList">{items.map(x=><div className="activityRow" key={x._id}><div className="activityDot"><Activity size={15}/></div><div><b>{x.action?.replaceAll('_',' ')}</b><p>{x.description||'Administrative action recorded.'}</p>{detailed&&<small>{x.admin?.name||'Admin'} {x.admin?.email?`• ${x.admin.email}`:''}</small>}</div><time>{fmtDate(x.createdAt)}</time></div>)}{!items.length&&<div className="empty">No administrator activity has been recorded yet.</div>}</div>}
