import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../../config/env';

const Facilities = () => {
    const [facilities, setFacilities] = useState([]);
    const [loading, setLoading] = useState(true);

    

    useEffect(() => {
        const fetchFacilities = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/research-facilities`);
                if (response.ok) {
                    const data = await response.json();
                    if (data.items && data.items.length > 0) {
                        setFacilities(data.items);
                        return;
                    }
                }
            } catch (error) {
                console.error("Failed to fetch research facilities:", error);
            } finally {
                setLoading(false);
            }
            
        };

        fetchFacilities();
    }, []);

    const renderLink = (facility, children) => {
        const linkClass = "read-more";
        const url = facility.routeUrl || `/research-facilities/${facility.slug}`;

        if (facility.isExternal && facility.openInNewTab) {
            return <a href={url} target="_blank" rel="noreferrer" className={linkClass}>{children}</a>;
        } else if (facility.isExternal && !facility.openInNewTab) {
            return <a href={url} className={linkClass}>{children}</a>;
        } else if (!facility.isExternal && facility.openInNewTab) {
            return <a href={url} target="_blank" rel="noreferrer" className={linkClass}>{children}</a>;
        } else {
            return <Link to={url} className={linkClass}>{children}</Link>;
        }
    };

    const renderTitleLink = (facility, children) => {
        const url = facility.routeUrl || `/research-facilities/${facility.slug}`;
        if (facility.isExternal && facility.openInNewTab) {
            return <a href={url} target="_blank" rel="noreferrer">{children}</a>;
        } else if (facility.isExternal && !facility.openInNewTab) {
            return <a href={url}>{children}</a>;
        } else if (!facility.isExternal && facility.openInNewTab) {
            return <a href={url} target="_blank" rel="noreferrer">{children}</a>;
        } else {
            return <Link to={url}>{children}</Link>;
        }
    };

    if (facilities.length === 0) return null;

    return (
        <section className="what-we-offer pt-5 pb-0 what-we-offer-second">
            <div className="auto-container">
                <div className="row clearfix">
                    {/* Text Column */}
                    <div className="text-column col-lg-12 col-md-12 col-sm-12 ">
                        <div className="sec-title sec-title-box">
                            <div className="auto-container clearfix">
                                <h2>Research Facilities</h2>
                            </div>
                        </div>

                        <div className="row clearfix">
                            {facilities.map((facility, index) => {
                                // Calculate delay to stagger animation
                                const delay = index % 4 === 1 || index % 4 === 3 ? "300ms" : index % 4 === 2 ? "0ms" : "600ms";

                                let finalImageUrl = '';
                                if (facility.imageUrl) {
                                    if (facility.imageUrl.startsWith('http')) {
                                        finalImageUrl = facility.imageUrl;
                                    } else if (facility.imageUrl.includes('uploads/')) {
                                        finalImageUrl = `${API_BASE_URL.replace('/api', '')}/${facility.imageUrl.replace(/^\//, '')}`;
                                    } else {
                                        finalImageUrl = `/${facility.imageUrl.replace(/^\//, '')}`;
                                    }
                                } else {
                                    finalImageUrl = '/images/photo/19.jpg';
                                }

                                return (
                                    <div key={facility.id || index} className="services-block-three col-xl-3 col-lg-6 col-md-6 col-sm-12">
                                        <div className="inner-box wow fadeInUp" data-wow-delay={delay} data-wow-duration="1500ms">
                                            <div className="image">
                                                {finalImageUrl ? renderTitleLink(facility, <img src={finalImageUrl} alt={facility.title} onError={(e) => { e.target.style.display = 'none'; }} />) : renderTitleLink(facility, <div style={{width: '100%', height: '250px', backgroundColor: '#e2e8f0'}}></div>)}
                                            </div>
                                            <div className="lower-content">
                                                <h3>{renderTitleLink(facility, facility.title)}</h3>
                                                <div className="text" dangerouslySetInnerHTML={{ __html: facility.excerpt }}></div>
                                                {renderLink(facility, <>Read More <span className="fas fa-angle-right"></span></>)}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Facilities;
