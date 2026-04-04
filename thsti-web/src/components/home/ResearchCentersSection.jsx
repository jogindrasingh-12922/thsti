import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../../config/env';

const ResearchCentersSection = () => {
    const [centers, setCenters] = useState([]);
    const [loading, setLoading] = useState(true);

    

    useEffect(() => {
        const fetchCenters = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/research-centers`);
                if (response.ok) {
                    const data = await response.json();
                    if (data.items && data.items.length > 0) {
                        setCenters(data.items);
                        return;
                    }
                }
            } catch (error) {
                console.error("Failed to fetch research centers:", error);
            } finally {
                setLoading(false);
            }
            
        };

        fetchCenters();
    }, []);

    const renderLink = (center, children) => {
        const linkClass = "read-more";
        const url = center.routeUrl || `/research-centers/${center.slug}`;

        if (center.isExternal && center.openInNewTab) {
            return <a href={url} target="_blank" rel="noreferrer" className={linkClass}>{children}</a>;
        } else if (center.isExternal && !center.openInNewTab) {
            return <a href={url} className={linkClass}>{children}</a>;
        } else if (!center.isExternal && center.openInNewTab) {
            // Edge case: Internal link but admin forced new tab
            return <a href={url} target="_blank" rel="noreferrer" className={linkClass}>{children}</a>;
        } else {
            return <Link to={url} className={linkClass}>{children}</Link>;
        }
    };

    const renderTitleLink = (center, children) => {
        const url = center.routeUrl || `/research-centers/${center.slug}`;
        if (center.isExternal && center.openInNewTab) {
            return <a href={url} target="_blank" rel="noreferrer">{children}</a>;
        } else if (center.isExternal && !center.openInNewTab) {
            return <a href={url}>{children}</a>;
        } else if (!center.isExternal && center.openInNewTab) {
            return <a href={url} target="_blank" rel="noreferrer">{children}</a>;
        } else {
            return <Link to={url}>{children}</Link>;
        }
    };

    if (centers.length === 0) return null;

    return (
        <section className="what-we-offer pt-5 pb-0 what-we-offer-first" style={{}}>
            <div className="auto-container">
                <div className="row clearfix">
                    {/* Text Column */}
                    <div className="text-column col-lg-12 col-md-12 col-sm-12 ">
                        <div className="sec-title sec-title-box">
                            <div className="auto-container clearfix">
                                <h2>Research Centers</h2>
                            </div>
                        </div>

                        <div className="row clearfix">
                            {centers.map((center, index) => {
                                // Calculate delay to stagger animation like original template
                                const delay = index % 4 === 1 || index % 4 === 3 ? "300ms" : index % 4 === 2 ? "0ms" : "600ms";

                                let finalImageUrl = '';
                                if (center.imageUrl) {
                                    if (center.imageUrl.startsWith('http')) {
                                        finalImageUrl = center.imageUrl;
                                    } else if (center.imageUrl.includes('uploads/')) {
                                        finalImageUrl = `${API_BASE_URL.replace('/api', '')}/${center.imageUrl.replace(/^\//, '')}`;
                                    } else {
                                        finalImageUrl = `/${center.imageUrl.replace(/^\//, '')}`;
                                    }
                                } else {
                                    finalImageUrl = '/images/resource/res-1.jpg';
                                }

                                return (
                                    <div key={center.id || index} className="services-block-three col-xl-3 col-lg-6 col-md-6 col-sm-12">
                                        <div className="inner-box wow fadeInUp" data-wow-delay={delay} data-wow-duration="1500ms">
                                            <div className="image">
                                                {finalImageUrl ? renderTitleLink(center, <img src={finalImageUrl} alt={center.title} onError={(e) => { e.target.style.display = 'none'; }} />) : renderTitleLink(center, <div style={{width: '100%', height: '250px', backgroundColor: '#e2e8f0'}}></div>)}
                                            </div>
                                            <div className="lower-content">
                                                <h3>{renderTitleLink(center, center.title)}</h3>
                                                <div className="text" dangerouslySetInnerHTML={{ __html: center.excerpt }}></div>
                                                {renderLink(center, <>Read More <span className="fas fa-angle-right"></span></>)}
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

export default ResearchCentersSection;
