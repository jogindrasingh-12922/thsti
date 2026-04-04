import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config/env';

export default function FacultyProfile() {
    const { slug } = useParams();
    const [faculty, setFaculty] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        const fetchFaculty = async () => {
            try {
                // Since our backend doesn't have getFacultyBySlug right now, but rather getById,
                // Oh wait! I didn't add getFacultyBySlug. I'll need to fetch all and filter or update backend.
                // Assuming backend will be updated to fetch by slug or ID. 
                const res = await axios.get(`${API_BASE_URL}/faculty`); 
                const data = res.data;
                const found = data.find(f => f.slug === slug || f.id.toString() === slug);
                if(found) setFaculty(found);
            } catch (err) {
                console.error("Failed to fetch faculty", err);
            } finally {
                setLoading(false);
            }
        };
        fetchFaculty();
    }, [slug]);

    if (loading) return <div className="text-center py-20 text-xl font-bold">Loading Profile...</div>;
    if (!faculty) return <div className="text-center py-20 text-xl font-bold text-red-600">Faculty not found</div>;

    const tabs = [
        { id: 'overview', icon: 'fa-user', label: 'Overview', content: faculty.overviewContent },
        { id: 'education', icon: 'fa-graduation-cap', label: 'Education', content: faculty.educationContent },
        { id: 'research', icon: 'fa-flask', label: 'Research', content: faculty.researchContent },
        { id: 'publications', icon: 'fa-book-open', label: 'Publications', content: faculty.publicationsContent },
        { id: 'books', icon: 'fa-book', label: 'Books', content: faculty.booksContent },
        { id: 'patents', icon: 'fa-lightbulb', label: 'Patents', content: faculty.patentsContent },
        { id: 'awards', icon: 'fa-trophy', label: 'Awards', content: faculty.awardsContent }
    ].filter(t => t.content && t.content.trim() !== '');

    if(!tabs.find(t => t.id === activeTab) && tabs.length > 0) {
        setActiveTab(tabs[0].id);
    }

    return (
        <section className="faculty-details">
            <div className="auto-container">
                {/* HERO CARD */}
                <div className="fd-hero-card">
                    <div className="fd-photo-wrapper">
                        <div className="fd-photo-ring">
                            {faculty.imageUrl ? (
                                <img src={`${process.env.REACT_APP_PUBLIC_URL || 'http://localhost:5000'}${faculty.imageUrl}`} alt={faculty.name} 
                                   onError={(e)=>{ e.target.style.display='none'; e.target.parentElement.innerHTML=`<div style='width:100%;height:100%;border-radius:50%;background:linear-gradient(135deg,#1a5fa8,#9d302b);display:flex;align-items:center;justify-content:center;font-size:40px;font-weight:800;color:#fff'>${faculty.name.charAt(0)}</div>`}} />
                            ) : (
                                <div style={{width:'100%',height:'100%',borderRadius:'50%',background:'linear-gradient(135deg,#1a5fa8,#9d302b)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'40px',fontWeight:'800',color:'#fff'}}>{faculty.name.charAt(0)}</div>
                            )}
                        </div>
                    </div>
                    
                    <div className="fd-hero-info">
                        {faculty.designation && <span className="fd-designation-badge">{faculty.designation}</span>}
                        <h1 className="fd-hero-name">{faculty.name}</h1>
                        <p className="fd-hero-title">{faculty.department}</p>
                        
                        <div className="fd-hero-meta">
                            {faculty.location && <span><i className="fa-solid fa-building-columns"></i> {faculty.location}</span>}
                            {faculty.researchFocus && <span><i className="fa-solid fa-flask"></i> {faculty.researchFocus}</span>}
                            {faculty.educationSnippet && <span><i className="fa-solid fa-graduation-cap"></i> {faculty.educationSnippet}</span>}
                            {faculty.office && <span><i className="fa-solid fa-location-dot"></i> {faculty.office}</span>}
                        </div>
                        
                        <div className="fd-hero-actions">
                            {faculty.email && (
                                <a href={`mailto:${faculty.email}`} className="fd-btn fd-btn-light">
                                    <i className="fa-solid fa-envelope"></i> Send Email
                                </a>
                            )}
                            {faculty.cvUrl && (
                                <a href={`${faculty.cvUrl.startsWith('http') ? '' : 'http://localhost:5000'}${faculty.cvUrl}`} target="_blank" rel="noreferrer" className="fd-btn fd-btn-outline-light">
                                    <i className="fa-solid fa-file-pdf"></i> Download CV
                                </a>
                            )}
                            {faculty.labWebsiteUrl && (
                                <a href={faculty.labWebsiteUrl} target="_blank" rel="noreferrer" className="fd-btn fd-btn-outline-light">
                                    <i className="fa-solid fa-globe"></i> Lab Website
                                </a>
                            )}
                        </div>
                    </div>
                </div>

                {/* STATS BAR */}
                <div className="fd-stats-bar">
                    <div className="fd-stat-item">
                        <div className="fd-stat-icon"><i className="fa-solid fa-book-open"></i></div>
                        <span className="fd-stat-number">{faculty.publicationsCount || 0}</span>
                        <div className="fd-stat-label">Publications</div>
                    </div>
                    <div className="fd-stat-item">
                        <div className="fd-stat-icon"><i className="fa-solid fa-quote-right"></i></div>
                        <span className="fd-stat-number">{faculty.citationsCount || 0}</span>
                        <div className="fd-stat-label">Citations</div>
                    </div>
                    <div className="fd-stat-item">
                        <div className="fd-stat-icon"><i className="fa-solid fa-chart-line"></i></div>
                        <span className="fd-stat-number">{faculty.hIndex || 0}</span>
                        <div className="fd-stat-label">H-Index</div>
                    </div>
                    <div className="fd-stat-item">
                        <div className="fd-stat-icon"><i className="fa-solid fa-lightbulb"></i></div>
                        <span className="fd-stat-number">{faculty.patentsCount || 0}</span>
                        <div className="fd-stat-label">Patents</div>
                    </div>
                    <div className="fd-stat-item">
                        <div className="fd-stat-icon"><i className="fa-solid fa-diagram-project"></i></div>
                        <span className="fd-stat-number">{faculty.projectsCount || 0}</span>
                        <div className="fd-stat-label">Projects</div>
                    </div>
                </div>

                {/* MAIN LAYOUT */}
                <div className="fd-layout">
                    {/* SIDEBAR */}
                    <aside className="fd-sidebar">
                        <div className="fd-sidebar-card">
                            <div className="fd-sidebar-card-header">
                                <i className="fa-solid fa-address-card"></i> Contact Info
                            </div>
                            <div className="fd-sidebar-card-body">
                                <ul className="fd-contact-list">
                                    {faculty.email && (
                                        <li>
                                            <div className="fd-cl-icon"><i className="fa-solid fa-envelope"></i></div>
                                            <div className="fd-cl-text">
                                                <strong>Email</strong>
                                                <a href={`mailto:${faculty.email}`}>{faculty.email.replace('@','[AT]').replace('.','[DOT]')}</a>
                                            </div>
                                        </li>
                                    )}
                                    {faculty.phone && (
                                        <li>
                                            <div className="fd-cl-icon"><i className="fa-solid fa-phone"></i></div>
                                            <div className="fd-cl-text">
                                                <strong>Phone</strong>
                                                {faculty.phone}
                                            </div>
                                        </li>
                                    )}
                                    {faculty.office && (
                                        <li>
                                            <div className="fd-cl-icon"><i className="fa-solid fa-building"></i></div>
                                            <div className="fd-cl-text">
                                                <strong>Office</strong>
                                                {faculty.office}
                                            </div>
                                        </li>
                                    )}
                                    {faculty.orcid && (
                                        <li>
                                            <div className="fd-cl-icon"><i className="fa-brands fa-orcid"></i></div>
                                            <div className="fd-cl-text">
                                                <strong>ORCID</strong>
                                                <a href={`https://orcid.org/${faculty.orcid}`} target="_blank" rel="noreferrer">{faculty.orcid}</a>
                                            </div>
                                        </li>
                                    )}
                                </ul>
                            </div>
                        </div>

                        {/* Social Links */}
                        <div className="fd-sidebar-card">
                            <div className="fd-sidebar-card-header">
                                <i className="fa-solid fa-share-nodes"></i> Academic Profiles
                            </div>
                            <div className="fd-sidebar-card-body">
                                <div className="fd-social-links">
                                    {faculty.googleScholarUrl && (
                                        <a href={faculty.googleScholarUrl} target="_blank" rel="noreferrer" className="fd-social-link scholar">
                                            <i className="fa-brands fa-google"></i> Google Scholar
                                        </a>
                                    )}
                                    {faculty.researchGateUrl && (
                                        <a href={faculty.researchGateUrl} target="_blank" rel="noreferrer" className="fd-social-link resgate">
                                            <i className="fa-brands fa-researchgate"></i> ResearchGate
                                        </a>
                                    )}
                                    {faculty.linkedinUrl && (
                                        <a href={faculty.linkedinUrl} target="_blank" rel="noreferrer" className="fd-social-link linkedin">
                                            <i className="fa-brands fa-linkedin"></i> LinkedIn
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* TABBED CONTENT */}
                    <div className="fd-content-panel">
                        <nav className="fd-tab-nav" role="tablist">
                            {tabs.map(tab => (
                                <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`fd-tab-btn ${activeTab === tab.id ? 'fd-active' : ''}`} role="tab">
                                    <i className={`fa-solid ${tab.icon}`}></i> {tab.label}
                                </button>
                            ))}
                        </nav>
                        
                        <div className="fd-tab-pane fd-active" style={{overflowX: 'auto'}}>
                            {tabs.map(tab => (
                                activeTab === tab.id && (
                                    <div key={tab.id}>
                                         <h2 className="fd-pane-heading">
                                            <i className={`fa-solid ${tab.icon}`}></i> {tab.label}
                                         </h2>
                                         <div className="fd-bio-text" dangerouslySetInnerHTML={{ __html: tab.content }}></div>
                                    </div>
                                )
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
