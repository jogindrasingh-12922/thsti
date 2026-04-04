import React, { useState, useEffect } from 'react';
import { ASSETS_BASE_URL } from '../../config/env';
import api from '../../api/axios';

const PreFooterStrip = () => {
    const [links, setLinks] = useState([]);
    const [settings, setSettings] = useState(null);

    useEffect(() => {
        api.get('/pre-footer-links')
            .then(res => {
                if (res.data && res.data.length > 0) {
                    setLinks(res.data);
                }
            })
            .catch(err => console.error("CMS Pre-Footer Fetch Error:", err));

        api.get('/settings')
            .then(res => setSettings(res.data))
            .catch(err => console.error("CMS Settings Fetch Error:", err));
    }, []);

    if (!links || links.length === 0) return null;

    return (
        <section className="clients-section" style={{ padding: '60px 0', borderTop: '1px solid #e5e5e5', backgroundColor: '#f9f9f9', position: 'relative', zIndex: 10 }}>
            <div className="auto-container">
                <div className="row clearfix align-items-center">
                    <div className="col-lg-10 col-md-9 col-sm-12">
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '30px', alignItems: 'center', justifyContent: 'center' }}>
                            {links.map((link) => (
                                <div key={link.id} className="sponsor-logo" style={{ flex: '0 0 auto' }}>
                                    {link.url ? (
                                        <a href={link.url} target={link.openInNewTab ? "_blank" : "_self"} rel="noreferrer" title={link.title}>
                                            {link.imageUrl ? (
                                                <img src={link.imageUrl.startsWith('http') ? link.imageUrl : `${ASSETS_BASE_URL}${link.imageUrl}`} alt={link.title} style={{ maxHeight: '70px', maxWidth: '180px', objectFit: 'contain', filter: 'grayscale(0%)', transition: 'all 0.3s ease' }}
                                                    onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
                                                    onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                                                />
                                            ) : (
                                                <span style={{ fontWeight: 'bold', color: '#333' }}>{link.title}</span>
                                            )}
                                        </a>
                                    ) : (
                                        <div title={link.title}>
                                            {link.imageUrl ? (
                                                <img src={link.imageUrl.startsWith('http') ? link.imageUrl : `${ASSETS_BASE_URL}${link.imageUrl}`} alt={link.title} style={{ maxHeight: '70px', maxWidth: '180px', objectFit: 'contain' }} />
                                            ) : (
                                                <span style={{ fontWeight: 'bold', color: '#333' }}>{link.title}</span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {settings?.preFooterViewAllActive && settings?.preFooterViewAllText && (
                        <div className="col-lg-2 col-md-3 col-sm-12 text-center text-md-right mt-4 mt-md-0">
                            <a href={settings.preFooterViewAllUrl || '#'} className="theme-btn btn-style-one" style={{ padding: '10px 24px', fontSize: '14px' }}>
                                {settings.preFooterViewAllText}
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default PreFooterStrip;
