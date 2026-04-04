import React, { useState, useEffect } from 'react';
import { ASSETS_BASE_URL } from '../../config/env';
import api from '../../api/axios';

const NewsEvents = () => {
    const [news, setNews] = useState([]);

    useEffect(() => {
        api.get('/news/public?limit=5')
            .then(res => setNews(res.data))
            .catch(err => console.error("CMS News Fetch Error:", err));
    }, []);

    // Find the explicitly featured news item, fallback to the latest one
    const featured = news.find(n => n.isFeatured) || (news.length > 0 ? news[0] : null);
    
    // The list components should be those that are NOT the featured one, limited to 3 items
    const list = news.filter(n => n.id !== featured?.id).slice(0, 3);

    if (news.length === 0) return null;

    return (
        <section className="research-highlights" style={{ backgroundColor: '#f7f9fd', padding: '50px 0' }}>
            <div className="auto-container">
                <div className="row">
                    
                    {/* Left Column (Featured News) */}
                    <div className="image-column col-lg-7 col-md-12 col-sm-12 pl-0">
                        <div className="inner">
                            <div className="sec-title">
                                <h2>Latest News/ Events</h2>
                            </div>
                            
                            {featured && (
                                <div className="camp-outer-box12 sub-campis-box">
                                    <img 
                                        className="campis-img" 
                                        alt={featured.title} 
                                        src={featured.imageUrl ? `${ASSETS_BASE_URL}${featured.imageUrl}` : "images/news-bg.png"} 
                                        style={{ height: '400px', objectFit: 'cover', width: '100%', borderRadius: '8px' }} 
                                    />
                                    <div className="camp-text-outer-box12 news-title-text">
                                        <div className="announcements-tags">
                                            <span>
                                                <i className="fa fa-calendar" aria-hidden="true"></i>{' '}
                                                {new Date(featured.publishDate).toLocaleDateString('en-GB')}
                                            </span>
                                        </div>
                                        <h3 className="sub-camp-title-box">
                                            <a href={`/news/${featured.slug}`} hrefLang="en">{featured.title}</a>
                                        </h3>
                                        <p>
                                            {featured.summary || (featured.content ? featured.content.replace(/<[^>]*>?/gm, '').substring(0, 150) + '...' : '')}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column (Other News) */}
                    <div className="text-column col-lg-5 col-md-12 col-sm-12">
                        <div className="inner">
                            <div className="sec-title">
                                <div className="text-right newrightbtn">
                                    <a href="/news" className="theme-btn btn-style-new">
                                        View all News <i className="fa-solid fa-arrow-right"></i>
                                    </a>
                                </div>
                            </div>
                            <div className="row gy-4">
                                {list.map(item => (
                                    <div className="col-lg-12" key={item.id}>
                                        <div className="research-highlights-card">
                                            <div className="research-highlights-card-item hover-effect">
                                                <div className="card-item-icon1" style={{ width: '150px', flexShrink: 0 }}>
                                                    <img 
                                                        src={item.imageUrl ? `${ASSETS_BASE_URL}${item.imageUrl}` : "images/placeholder-news.jpg"} 
                                                        alt={item.title} 
                                                        style={{ height: '120px', width: '100%', objectFit: 'cover', borderRadius: '4px' }} 
                                                    />
                                                </div>
                                                <div className="card-content">
                                                    <div className="announcements-tags">
                                                        <span>
                                                            <i className="fa fa-calendar" aria-hidden="true"></i>{' '}
                                                            {new Date(item.publishDate).toLocaleDateString('en-GB')}
                                                        </span>
                                                    </div>
                                                    <h5 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>
                                                        <a href={`/news/${item.slug}`} className="text-secondary">{item.title}</a>
                                                    </h5>
                                                    <p className="text-muted" style={{ fontSize: '0.9rem', lineHeight: '1.4' }}>
                                                        {item.summary || (item.content ? item.content.replace(/<[^>]*>?/gm, '').substring(0, 80) + '...' : '')}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default NewsEvents;
