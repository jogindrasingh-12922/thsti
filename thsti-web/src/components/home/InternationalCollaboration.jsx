import React, { useState, useEffect } from 'react';
import { ASSETS_BASE_URL } from '../../config/env';
import api from '../../api/axios';

const InternationalCollaboration = () => {
    const [collaborations, setCollaborations] = useState([]);

    useEffect(() => {
        api.get('/international-collaboration/public')
            .then(res => setCollaborations(res.data))
            .catch(err => console.error("CMS International Collaboration Fetch Error:", err));
    }, []);

    // For better display logic, we map out what is there. If none, we can hide the section or show a fallback.
    // If we want exactly 3 items to look like the design, we slice.
    const itemsToShow = collaborations.slice(0, 3);
    
    if (itemsToShow.length === 0) return null;

    // Use predefined wow delays to match the animation design
    const wowDelays = ['0ms', '300ms', '600ms'];

    return (
        <section className="news-section alternate">
            <div className="auto-container">
                <div className="sec-title centered wow fadeInDown" data-wow-delay="0ms" data-wow-duration="1500ms">
                    <h2>International Collaboration</h2>
                </div>
                <div className="row clearfix">
                    {itemsToShow.map((item, index) => (
                        <div key={item.id} className="news-block col-lg-4 col-md-6 col-sm-12">
                            <div className="inner-box wow fadeInUp" data-wow-delay={wowDelays[index] || '0ms'} data-wow-duration="1500ms">
                                <div className="image">
                                    {item.link ? (
                                        <a href={item.link} target="_blank" rel="noreferrer">
                                            <img src={item.imageUrl ? `${ASSETS_BASE_URL}${item.imageUrl}` : "images/resource/news-1.jpg"} alt={item.title} style={{ width: '100%', height: '240px', objectFit: 'cover' }} />
                                        </a>
                                    ) : (
                                        <img src={item.imageUrl ? `${ASSETS_BASE_URL}${item.imageUrl}` : "images/resource/news-1.jpg"} alt={item.title} style={{ width: '100%', height: '240px', objectFit: 'cover' }} />
                                    )}
                                </div>
                                <div className="lower-content">
                                    <h3>
                                        {item.link ? (
                                            <a href={item.link} target="_blank" rel="noreferrer">{item.title}</a>
                                        ) : (
                                            <span>{item.title}</span>
                                        )}
                                    </h3>
                                    {item.link && (
                                        <a className="arrow" href={item.link} target="_blank" rel="noreferrer">
                                            <span className="icon flaticon-next"></span>
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {collaborations.length > 3 && (
                    <div className="text-center">
                        <a href="/international-collaboration" className="theme-btn btn-style-new">View All <i className="fa-solid fa-arrow-right"></i></a>
                    </div>
                )}
            </div>
        </section>
    );
};

export default InternationalCollaboration;
