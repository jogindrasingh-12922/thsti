import React, { useState, useEffect } from 'react';
import { ASSETS_BASE_URL } from '../../config/env';
import api from '../../api/axios';
import PreFooterStrip from './PreFooterStrip';

const Footer = () => {
    const [settings, setSettings] = useState(null);
    const [footerLinks, setFooterLinks] = useState([]);

    useEffect(() => {
        api.get('/settings')
            .then(res => setSettings(res.data))
            .catch(err => console.error("CMS Settings Fetch Error:", err));

        api.get('/footer-links')
            .then(res => setFooterLinks(res.data))
            .catch(err => console.error("CMS Footer Links Fetch Error:", err));
    }, []);

    const importantLinks = footerLinks.filter(l => l.column === 'IMPORTANT');
    const usefulLinks = footerLinks.filter(l => l.column === 'USEFUL');

    const currentYear = new Date().getFullYear();

    return (
        <>
            <PreFooterStrip />
            <footer className="main-footer" style={{ position: 'relative', zIndex: 11 }}>

                <div className="auto-container">

                    {/* Widgets Section */}
                    <div className="widgets-section">
                        <div className="row clearfix">

                            {/* big column */}
                            <div className="big-column col-lg-6 col-md-12 col-sm-12">
                                <div className="row clearfix">

                                    {/* Footer Column */}
                                    <div className="footer-column col-lg-6 col-md-6 col-sm-12">
                                        <div className="footer-widget about-widget">
                                            <div className="logo">
                                                <a className="logobox" href="/"><img src="images/logo-small1.png" alt={settings?.siteName || "THSTI Logo"} title={settings?.siteName || "THSTI Logo"} /></a>
                                            </div>
                                            <div className="text">Translational Health Science and Technology Institute and
                                                Institute of Biotechnology Research and Innovation Council Dept. of
                                                Biotechnology, Ministry of Science and Technology Govt. of India.</div>
                                            {/* <a href="#" className="theme-btn btn-style-four">About Company</a> */}
                                        </div>
                                    </div>

                                    {/* Footer Column */}
                                    <div className="footer-column col-lg-6 col-md-6 col-sm-12">
                                        <div className="footer-widget services-widget">
                                            <h2>Important Links</h2>
                                            <ul className="footer-service-list">
                                                {importantLinks.length > 0 ? (
                                                    importantLinks.map(link => (
                                                        <li key={link.id}><a href={link.url}>{link.label}</a></li>
                                                    ))
                                                ) : (
                                                    <li><span className="text-gray-400">No links available</span></li>
                                                )}
                                            </ul>
                                        </div>
                                    </div>

                                </div>
                            </div>

                            {/* big column */}
                            <div className="big-column col-lg-6 col-md-12 col-sm-12">
                                <div className="row clearfix">

                                    {/* Footer Column */}
                                    <div className="footer-column col-lg-6 col-md-6 col-sm-12">
                                        <div className="footer-widget services-widget">
                                            <h2>Useful Links</h2>
                                            <ul className="footer-service-list">
                                                {usefulLinks.length > 0 ? (
                                                    usefulLinks.map(link => (
                                                        <li key={link.id}><a href={link.url}>{link.label}</a></li>
                                                    ))
                                                ) : (
                                                    <li><span className="text-gray-400">No links available</span></li>
                                                )}
                                            </ul>
                                        </div>
                                    </div>

                                    {/* Footer Column */}
                                    <div className="footer-column col-lg-6 col-md-6 col-sm-12">
                                        <div className="footer-widget contact-widget">
                                            <h2>Contact</h2>
                                            <div className="number">{settings?.contactPhone || '0129-2876300/350'}</div>
                                            <ul>
                                                <li>{settings?.address ? settings.address.split('\n').map((line, i) => <React.Fragment key={i}>{line}<br /></React.Fragment>) : 'NCR Biotech Science Cluster, 3rd Milestone, Faridabad – Gurugram Expressway, PO box #04,'}</li>
                                                <li><a href="#">{(settings?.contactEmail || 'info@thsti.res.in').replace('@', '[AT]').replaceAll('.', '[DOT]')}</a></li>
                                                <li>{settings?.workingHours || 'Mon to Sat: 9:am to 6pm'}</li>
                                            </ul>
                                        </div>
                                    </div>

                                </div>
                            </div>

                        </div>
                    </div>

                    {/*  Footer Bottom  */}
                    <div className="footer-bottom">
                        <div className="clearfix">
                            <div className="pull-left">
                                <div className="copyright">Copyright @ {currentYear} {settings?.copyrightText || 'Translational Health Science and Technology Institute. All rights reserved.'}</div>
                            </div>
                            <div className="pull-right">
                                {/*  Social Links  */}
                                <ul className="social-links">
                                    {settings?.facebookUrl && settings.facebookUrl !== '' && <li><a href={settings.facebookUrl} target="_blank" rel="noreferrer"><span className="fab fa-facebook-f"></span></a></li>}
                                    {settings?.twitterUrl && settings.twitterUrl !== '' && <li><a href={settings.twitterUrl} target="_blank" rel="noreferrer"><span className="fab fa-twitter"></span></a></li>}
                                    {settings?.linkedinUrl && settings.linkedinUrl !== '' && <li><a href={settings.linkedinUrl} target="_blank" rel="noreferrer"><span className="fab fa-linkedin-in"></span></a></li>}
                                    <li><a href="#"><span className="fab fa-google-plus-g"></span></a></li>
                                    <li><a href="#"><span className="fab fa-youtube"></span></a></li>
                                </ul>
                            </div>
                        </div>
                    </div>

                </div>
            </footer>
        </>
    );
};

export default Footer;
