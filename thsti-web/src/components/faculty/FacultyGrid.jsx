import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { ASSETS_BASE_URL } from '../../config/env';

const FacultyGrid = () => {
    const [faculty, setFaculty] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filter & Pagination States
    const [searchQuery, setSearchQuery] = useState('');
    const [sortOption, setSortOption] = useState('Sort by');
    const [categoryFilter, setCategoryFilter] = useState('Category');
    const [perPage, setPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        const fetchFaculty = async () => {
            try {
                const res = await api.get('/faculty');
                const active = res.data.filter(f => f.isActive);
                setFaculty(active);
            } catch (err) {
                console.error('Failed to fetch faculty:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchFaculty();
    }, []);

    // Get unique categories (designations)
    const designations = useMemo(() => {
        const set = new Set(faculty.map(f => f.designation).filter(Boolean));
        return Array.from(set).sort();
    }, [faculty]);

    // Apply filtering, sorting and pagination
    const { displayedFaculty, totalPages } = useMemo(() => {
        let filtered = [...faculty];

        // 1. Search Filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(f => 
                f.name.toLowerCase().includes(query) || 
                (f.department && f.department.toLowerCase().includes(query)) ||
                (f.designation && f.designation.toLowerCase().includes(query))
            );
        }

        // 2. Category Filter
        if (categoryFilter !== 'Category') {
            filtered = filtered.filter(f => f.designation === categoryFilter);
        }

        // 3. Sorting
        if (sortOption === 'Name') {
            filtered.sort((a, b) => a.name.localeCompare(b.name));
        } else if (sortOption === 'Oldest') {
            filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        } else if (sortOption === 'Latest') {
            filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        } else {
            // Default "Sort by" => use displayOrder
            filtered.sort((a, b) => a.displayOrder - b.displayOrder);
        }

        const totalPages = Math.ceil(filtered.length / perPage) || 1;
        
        // Reset to page 1 if current page is out of bounds
        const validPage = Math.min(currentPage, totalPages);
        if (validPage !== currentPage) {
            setCurrentPage(validPage);
        }

        // 4. Pagination
        const startIndex = (validPage - 1) * perPage;
        const displayed = filtered.slice(startIndex, startIndex + perPage);

        return { displayedFaculty: displayed, totalPages };
    }, [faculty, searchQuery, categoryFilter, sortOption, perPage, currentPage]);

    if (loading) {
        return (
            <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <section className="team-section pt-5">
            <div className="auto-container">
                 
                {/* Sec Title */}
                <div className="sec-title centered">
                    <h2>Faculty & Scientists</h2>
                </div>
                
                <div className="row">
                    <div className="col-lg-12 col-md-12 col-sm-12">
                        <div className="filter-bar">
                            {/* Search */}
                            <div className="search-box position-relative" style={{ display: 'inline-block', marginRight: '15px', marginBottom: '15px' }}>
                                <span className="icon position-absolute" style={{ top: '10px', left: '15px', color: '#999' }}>
                                    <i className="fa fa-search" aria-hidden="true"></i>
                                </span>
                                <input 
                                    type="text" 
                                    placeholder="Search..." 
                                    value={searchQuery}
                                    onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                                    style={{ paddingLeft: '40px', height: '45px', borderRadius: '4px', border: '1px solid #ddd', width: '250px' }}
                                />
                            </div>

                            {/* Sort */}
                            <div className="select-box position-relative" style={{ display: 'inline-block', marginRight: '15px', marginBottom: '15px' }}>
                                <span className="icon position-absolute" style={{ top: '12px', left: '15px', color: '#999' }}>
                                    <i className="fa fa-sort-amount-desc" aria-hidden="true"></i>
                                </span>
                                <select 
                                    value={sortOption} 
                                    onChange={(e) => { setSortOption(e.target.value); setCurrentPage(1); }}
                                    style={{ paddingLeft: '40px', height: '45px', borderRadius: '4px', border: '1px solid #ddd', width: '180px', appearance: 'auto', background: '#fff' }}
                                >
                                    <option>Sort by</option>
                                    <option>Name</option>
                                    <option>Latest</option>
                                    <option>Oldest</option>
                                </select>
                            </div>

                            {/* Category */}
                            <div className="select-box position-relative" style={{ display: 'inline-block', marginRight: '15px', marginBottom: '15px' }}>
                                <span className="icon position-absolute" style={{ top: '12px', left: '15px', color: '#999' }}>
                                    <i className="fa fa-tag" aria-hidden="true"></i>
                                </span>
                                <select 
                                    value={categoryFilter} 
                                    onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
                                    style={{ paddingLeft: '40px', height: '45px', borderRadius: '4px', border: '1px solid #ddd', width: '220px', appearance: 'auto', background: '#fff' }}
                                >
                                    <option>Category</option>
                                    {designations.map(desig => (
                                        <option key={desig} value={desig}>{desig}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Per Page */}
                            <div className="select-box small position-relative" style={{ display: 'inline-block', marginBottom: '15px' }}>
                                <span className="icon position-absolute" style={{ top: '12px', left: '15px', color: '#999' }}>
                                    <i className="fa fa-bars" aria-hidden="true"></i>
                                </span>
                                <select 
                                    value={perPage} 
                                    onChange={(e) => { setPerPage(Number(e.target.value)); setCurrentPage(1); }}
                                    style={{ paddingLeft: '40px', height: '45px', borderRadius: '4px', border: '1px solid #ddd', width: '150px', appearance: 'auto', background: '#fff' }}
                                >
                                    <option value={10}>10 per page</option>
                                    <option value={20}>20 per page</option>
                                    <option value={50}>50 per page</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            
                <div className="row">
                    {displayedFaculty.length === 0 ? (
                        <div className="col-12 text-center py-5 text-muted">
                            <p>No faculty members found matching your criteria.</p>
                        </div>
                    ) : (
                        displayedFaculty.map((member) => (
                            <div key={member.id} className="team-block-two col-lg-3 col-md-6 col-sm-12 wow fadeInLeft" data-wow-delay="0ms">
                                <div className="inner-box border shadow-sm h-100 d-flex flex-column bg-white">
                                    <div className="image-box position-relative">
                                        <figure className="image m-0" style={{ height: '300px', backgroundColor: '#f4f4f4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Link to={`/faculty/${member.slug}`} className="w-100 h-100">
                                                {member.imageUrl ? (
                                                    <img 
                                                        src={`${ASSETS_BASE_URL}${member.imageUrl}`} 
                                                        alt={member.name}
                                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                    />
                                                ) : (
                                                    <div className="w-100 h-100 d-flex flex-column align-items-center justify-content-center text-muted">
                                                        <i className="fa fa-user" style={{ fontSize: '80px' }}></i>
                                                    </div>
                                                )}
                                            </Link>
                                        </figure>
                                        <div className="overlay-box">
                                            <ul className="contact-list">
                                                {member.phone && (
                                                    <li><i className="icon icon-call-in"></i> <a href={`tel:${member.phone}`}>{member.phone}</a></li>
                                                )}
                                                {member.email && (
                                                    <li><i className="icon icon-envelope-open"></i> <a href={`mailto:${member.email}`}>{member.email}</a></li>
                                                )}
                                                {member.location && (
                                                    <li><i className="icon icon-pointer"></i> <span>{member.location}</span></li>
                                                )}
                                            </ul>
                                        </div>
                                    </div>
                                    <div className="lower-content p-4 text-center mt-auto">
                                        <h3 className="name mb-1"><Link to={`/faculty/${member.slug}`}>{member.name}</Link></h3>
                                        {member.designation && <span className="designation text-primary font-weight-bold d-block mb-3">{member.designation}</span>}
                                        {member.department && <p className="mb-0 text-muted small">{member.department}</p>}
                                        
                                        {/* Social Links if available */}
                                        <ul className="social-links mt-3 list-unstyled d-flex justify-content-center gap-2">
                                            {member.linkedinUrl && <li><a href={member.linkedinUrl} target="_blank" rel="noreferrer"><i className="fab fa-linkedin-in"></i></a></li>}
                                            {member.googleScholarUrl && <li><a href={member.googleScholarUrl} target="_blank" rel="noreferrer"><i className="fab fa-google"></i></a></li>}
                                            {member.researchGateUrl && <li><a href={member.researchGateUrl} target="_blank" rel="noreferrer"><i class="fab fa-researchgate"></i></a></li>}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="styled-pagination text-center pb-5">
                        <ul className="clearfix list-unstyled d-flex justify-content-center gap-2">
                            {currentPage > 1 && (
                                <li>
                                    <button onClick={() => setCurrentPage(prev => prev - 1)} className="btn btn-outline-primary rounded-circle">
                                        <span className="fa fa-angle-left"></span>
                                    </button>
                                </li>
                            )}
                            
                            {Array.from({ length: totalPages }).map((_, idx) => {
                                const pageNum = idx + 1;
                                return (
                                    <li key={pageNum}>
                                        <button 
                                            onClick={() => setCurrentPage(pageNum)}
                                            className={`btn ${currentPage === pageNum ? 'btn-primary' : 'btn-outline-primary'} rounded-circle`}
                                            style={{ width: '40px', height: '40px' }}
                                        >
                                            {pageNum}
                                        </button>
                                    </li>
                                );
                            })}
                            
                            {currentPage < totalPages && (
                                <li>
                                    <button onClick={() => setCurrentPage(prev => prev + 1)} className="btn btn-outline-primary rounded-circle">
                                        <span className="fa fa-angle-right"></span>
                                    </button>
                                </li>
                            )}
                        </ul>
                    </div>
                )}
            </div>
            
            <style>{`
            .filter-bar {
                background: #f8f9fa;
                padding: 20px;
                border-radius: 8px;
                margin-bottom: 40px;
                text-align: center;
                box-shadow: 0 2px 10px rgba(0,0,0,0.05);
            }
            .team-block-two .inner-box {
                transition: transform 0.3s ease, box-shadow 0.3s ease;
            }
            .team-block-two .inner-box:hover {
                transform: translateY(-8px);
                box-shadow: 0 10px 20px rgba(0,0,0,0.1) !important;
            }
            .team-block-two .overlay-box {
                position: absolute;
                bottom: 0;
                left: 0;
                width: 100%;
                background: rgba(0, 0, 0, 0.7);
                padding: 15px;
                transform: translateY(100%);
                transition: transform 0.3s ease;
                opacity: 0;
            }
            .team-block-two .inner-box:hover .overlay-box {
                transform: translateY(0);
                opacity: 1;
            }
            .team-block-two .contact-list {
                list-style: none;
                margin: 0;
                padding: 0;
            }
            .team-block-two .contact-list li {
                color: #fff;
                font-size: 13px;
                margin-bottom: 5px;
                display:flex;
                align-items:center;
                gap:8px;
            }
            .team-block-two .contact-list li a {
                color: #fff;
                text-decoration: none;
            }
            .team-block-two .contact-list li a:hover {
                color: #e5cc98;
            }
            .team-block-two .name a {
                color: #0b2d55;
                font-size: 18px;
                text-decoration: none;
                font-weight: 700;
                text-transform: uppercase;
            }
            .team-block-two .name a:hover {
                color: #ab1f24;
            }
            .team-block-two .social-links a {
                color: #666;
                transition: color 0.3s ease;
            }
            .team-block-two .social-links a:hover {
                color: #ab1f24;
            }
            `}</style>
        </section>
    );
};

export default FacultyGrid;
