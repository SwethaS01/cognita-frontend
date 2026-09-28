import {NavLink,useNavigate,useLocation} from 'react-router-dom';
import {Link} from 'react-router-dom';
import {useEffect,useState} from 'react';
import {
  LayoutDashboard,HelpCircle,BookOpen,Briefcase,GraduationCap,Users,
  MessageCircle,Bell,UserCircle,LogOut,ShieldCheck,Rss,UserPlus,
  ChevronDown,LayoutGrid,FileCheck,Megaphone,Activity,Settings
} from 'lucide-react';
import {useAuth} from '../context/AuthContext';

// Related menu items are grouped so the sidebar stays clean while every
// feature remains reachable.
const studentGroups=[
  {label:'Overview',items:[
    ['Dashboard','/dashboard',LayoutDashboard]
  ]},
  {label:'Community',items:[
    ['Feed','/feed',Rss],
    ['Student Directory','/directory',Users],
    ['Connections','/connections',UserPlus],
    ['Mentors','/mentors',GraduationCap],
    ['Mentorship','/mentorship',GraduationCap]
  ]},
  {label:'Learning',items:[
    ['Ask Doubts','/doubts',HelpCircle],
    ['Resources','/resources',BookOpen]
  ]},
  {label:'Experiences',items:[
    ['Placement Experiences','/experiences/placement',Briefcase],
    ['Internship Experiences','/experiences/internship',GraduationCap]
  ]},
  {label:'Inbox',items:[
    ['Messages','/chat',MessageCircle],
    ['Notifications','/notifications',Bell]
  ]},
  {label:'Account',items:[
    ['Profile','/profile',UserCircle]
  ]}
];

const adminGroups=[
  {label:'Overview',items:[
    ['Dashboard','/admin/dashboard',LayoutDashboard]
  ]},
  {label:'User Management',items:[
    ['All Users','/admin/users',Users]
  ]},
  {label:'Content Management',items:[
    ['Content Review','/admin/content',FileCheck]
  ]},
  {label:'Moderation',items:[
    ['Reports','/admin/reports',ShieldCheck]
  ]},
  {label:'Communication',items:[
    ['Announcements','/admin/announcements',Megaphone]
  ]},
  {label:'System',items:[
    ['Activity Logs','/admin/activity',Activity],
    ['Admin Profile','/admin/profile',Settings]
  ]}
];

export default function Sidebar({onNavigate}){
  const {user,logout}=useAuth();
  const nav=useNavigate();
  const location=useLocation();
  const groups=user?.role==='admin'?adminGroups:studentGroups;

  // Groups start open; the group containing the active route is always
  // force-open so the current page's item is never hidden.
  const [collapsed,setCollapsed]=useState({});

  const isActivePath=(p)=>location.pathname===p||(p!=='/dashboard'&&p!=='/admin/dashboard'&&location.pathname.startsWith(p));

  useEffect(()=>{
    // auto-expand whichever group holds the active page on route change
    const activeGroup=groups.find(g=>g.items.some(([,p])=>isActivePath(p)));
    if(activeGroup) setCollapsed(c=>({...c,[activeGroup.label]:false}));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[location.pathname]);

  const toggleGroup=(label)=>setCollapsed(c=>({...c,[label]:!c[label]}));

  return (
    <aside className="sidebar">
      <Link to={user?.role==='admin'?'/admin/dashboard':'/dashboard'} className="brand sidebrand">
        <span className="brandMark">CN</span>Cognita Nexus
      </Link>
      <div className="sideRole"><LayoutGrid size={11} style={{marginRight:6,verticalAlign:'-2px'}}/>{user?.role}</div>
      <nav className="sideNav">
        {groups.map(group=>{
          const isCollapsed=!!collapsed[group.label];
          return (
            <div className="sideGroup" key={group.label}>
              <button
                type="button"
                className={isCollapsed?'sideGroupHead collapsed':'sideGroupHead'}
                onClick={()=>toggleGroup(group.label)}
                aria-expanded={!isCollapsed}
              >
                {group.label}
                <ChevronDown size={13} className="chev"/>
              </button>
              {!isCollapsed&&(
                <div className="sideGroupItems">
                  {group.items.map(([n,p,I])=>(
                    <NavLink key={p} to={p} onClick={onNavigate} className={({isActive})=>isActive?'active':''}>
                      <I size={18}/>{n}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>
      <button className="logout" onClick={()=>{logout();nav('/')}}>
        <LogOut size={18}/> Logout
      </button>
    </aside>
  );
}
