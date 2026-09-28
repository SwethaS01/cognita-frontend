import Sidebar from '../components/Sidebar';
import {useEffect,useState} from 'react';
import {useLocation} from 'react-router-dom';
import {Menu,X} from 'lucide-react';

export default function AppLayout({children}){
  const [open,setOpen]=useState(false);
  const location=useLocation();

  // Close the drawer automatically whenever the route changes (e.g. after
  // a nav link is clicked), so it never stays permanently open.
  useEffect(()=>{setOpen(false)},[location.pathname]);

  // Prevent background scroll while the drawer is open.
  useEffect(()=>{
    document.body.style.overflow=open?'hidden':'';
    return ()=>{document.body.style.overflow=''};
  },[open]);

  return (
    <div className="appShell">
      <div className={open?'mobileOverlay show':'mobileOverlay'} onClick={()=>setOpen(false)}></div>
      <div className={open?'mobileSide open':'mobileSide'}>
        <Sidebar onNavigate={()=>setOpen(false)}/>
      </div>
      <main className="main">
        <div className="topbar">
          <button
            className="hamburgerBtn"
            onClick={()=>setOpen(o=>!o)}
            aria-label={open?'Close menu':'Open menu'}
            aria-expanded={open}
          >
            {open?<X size={20}/>:<Menu size={20}/>}
          </button>
          <span className="topbarBrand">
            <span className="brandMark" style={{width:28,height:28,borderRadius:8,fontSize:11}}>CN</span>
            Cognita Nexus
          </span>
        </div>
        {children}
      </main>
    </div>
  );
}
