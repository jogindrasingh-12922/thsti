import React, { useState, useEffect } from 'react';
import { ASSETS_BASE_URL } from '../../config/env';
import api from '../../api/axios';

const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

// Fallback view all mapping
const getViewAllLink = (tabName) => {
    if (tabName === 'Announcements') return '/News';
    if (tabName === 'Work With Us' || tabName === 'Jobs') return '/Jobs';
    if (tabName === 'Results') return '/notification-results';
    if (tabName === 'Tenders') return '/Tender';
    return '#';
};

const TabsSection = () => {
    const [tabs, setTabs] = useState([]);
    const [activeTab, setActiveTab] = useState('');
    const [data, setData] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCategoriesAndData = async () => {
            try {
                // Fetch dynamic categories
                const catRes = await api.get('/notifications/categories/public');
                const categories = catRes.data || [];
                
                if (categories.length === 0) {
                    setLoading(false);
                    return;
                }
                
                setTabs(categories);
                setActiveTab(categories[0].name);

                // Fetch data for each category
                const results = await Promise.all(
                    categories.map(cat => api.get(`/notifications?type=${encodeURIComponent(cat.name)}`))
                );
                
                const newData = {};
                categories.forEach((cat, i) => {
                    newData[cat.name] = results[i].data || [];
                });
                setData(newData);
            } catch (err) {
                console.error('TabsSection fetch error:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchCategoriesAndData();
    }, []);

    // Only show if at least one tab has data
    const hasAnyData = tabs.some(tab => data[tab.name] && data[tab.name].length > 0);
    if (loading || !hasAnyData) return null;

    const activeItems = data[activeTab] || [];
    const isAnnouncement = activeTab.toLowerCase().includes('announcement');

    return (
        <section className="what-we-offer" style={{ backgroundImage: 'url(images/background/5-2.jpg)' }}>
            <div className="auto-container">
                <div className="row clearfix">
                    <div className="text-column col-lg-12 col-md-12 col-sm-12"
                        style={{ backgroundColor: '#fff', padding: '50px', borderRadius: '20px' }}>
                        <div className="inner">
                            <div className="tabs-box tabs-style-one">
                                <ul className="tab-buttons clearfix">
                                    {tabs.filter(tab => data[tab.name] && data[tab.name].length > 0).map(tab => (
                                        <li
                                            key={tab.id}
                                            className={`tab-btn${activeTab === tab.name ? ' active-btn' : ''}`}
                                            onClick={() => setActiveTab(tab.name)}
                                            style={{ cursor: 'pointer', textTransform: 'uppercase' }}
                                        >
                                            <div className="txt">{tab.name}</div>
                                        </li>
                                    ))}
                                </ul>

                                <div className="tabs-content">
                                    {isAnnouncement ? (
                                        <div className="tab active-tab" id="announcements">
                                            <div className="row">
                                                {activeItems.slice(0, 4).map(item => (
                                                    <div key={item.id} className="col-lg-6">
                                                        <div className="announcements-card">
                                                            <div className="announcements-card-item">
                                                                {item.imageUrl && (
                                                                    <div className="card-item-icon1">
                                                                        <img
                                                                            src={item.imageUrl.startsWith('http') ? item.imageUrl : `${ASSETS_BASE_URL}${item.imageUrl}`}
                                                                            alt={item.title}
                                                                        />
                                                                    </div>
                                                                )}
                                                                <div className="card-content">
                                                                    <div className="announcements-tags">
                                                                        <span>
                                                                            <i className="fa fa-calendar" aria-hidden="true"></i>
                                                                            {' '}{formatDate(item.publishDate)}
                                                                        </span>
                                                                        {item.isNew && <span style={{ background: '#e74c3c', color: '#fff', marginLeft: 6 }}>New</span>}
                                                                    </div>
                                                                    <h5>{item.title}</h5>
                                                                    {item.summary && <p>{item.summary}</p>}
                                                                    {item.url && (
                                                                        <div className="link-box" style={{ marginTop: '10px' }}>
                                                                            <a
                                                                                href={item.url}
                                                                                target={item.openInNewTab ? '_blank' : '_self'}
                                                                                rel="noreferrer"
                                                                                className="read-more"
                                                                                style={{ fontSize: '12px', fontWeight: 'bold' }}
                                                                            >
                                                                                {(item.buttonText || 'READ MORE').toUpperCase()}
                                                                            </a>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="link-box">
                                                <a href={getViewAllLink(activeTab)} className="read-more">
                                                    View All <span className="fas fa-angle-right"></span>
                                                </a>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="tab active-tab" id={activeTab.replace(/\s+/g, '-').toLowerCase()}>
                                            <div className="work-with-us">
                                                {activeItems.slice(0, 4).map(item => {
                                                    const d = new Date(item.publishDate);
                                                    const month = d.toLocaleString('en-US', { month: 'short' });
                                                    const day = d.getDate();
                                                    return (
                                                        <div key={item.id} className="work-with-us-card">
                                                            <div className="work-with-us-card-item">
                                                                <div className="card-item-icon">
                                                                    <span className="month">{month}</span>
                                                                    <span className="day">{day}</span>
                                                                </div>
                                                                <div className="card-content">
                                                                    {item.isNew && (
                                                                        <div className="announcements-tags">
                                                                            <span style={{ background: '#e74c3c', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '11px' }}>New</span>
                                                                        </div>
                                                                    )}
                                                                    <h5>{item.title}</h5>
                                                                    {item.summary && <p>{item.summary}</p>}
                                                                    {item.url && (
                                                                        <div className="link-box">
                                                                            <a
                                                                                href={item.url}
                                                                                target={item.openInNewTab ? '_blank' : '_self'}
                                                                                rel="noreferrer"
                                                                                className="read-more"
                                                                            >
                                                                                {(item.buttonText || 'READ MORE').toUpperCase()}
                                                                            </a>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                            <div className="link-box">
                                                <a
                                                    href={getViewAllLink(activeTab)}
                                                    className="read-more"
                                                >
                                                    View All <span className="fas fa-angle-right"></span>
                                                </a>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default TabsSection;
