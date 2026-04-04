import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { ASSETS_BASE_URL } from '../config/env';
import FacultyGrid from '../components/faculty/FacultyGrid';

const Page = () => {
    const { slug } = useParams();
    const [pageData, setPageData] = useState(null);
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        window.scrollTo(0, 0);
        setLoading(true);

        const fetchData = async () => {
            try {
                // Fetch the current page content
                const pageRes = await api.get(`/pages/slug/${slug}`);
                setPageData(pageRes.data);
                setError(false);
            } catch (err) {
                console.error('Error fetching page content:', err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [slug]);

    if (error) {
        return (
            <div className="container py-5 text-center mt-5 mb-5" style={{ minHeight: '50vh' }}>
                <h3>Page Not Found</h3>
                <p>The page you are looking for does not exist or has been moved.</p>
            </div>
        );
    }

    if (loading || !pageData) {
        return (
            <div className="container py-5 text-center mt-5 mb-5" style={{ minHeight: '50vh' }}>
                <p>Loading content...</p>
            </div>
        );
    }

    return (
        <main className="main-content">
            {/* Standard Page Title Header matching THSTI design templates */}
            <section className="page-banner" style={{ backgroundImage: `url(${pageData.ogImage ? ASSETS_BASE_URL + pageData.ogImage : '/images/background/baby-11.png'})`, position: "relative" }}>
                <div className="auto-container">
                    <div className="inner-container clearfix">
                        <h1>{pageData.title}</h1>
                        <ul className="bread-crumb clearfix">
                            <li><Link to="/">Home</Link></li>
                            <li>{pageData.title}</li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* Main Content Container (Full Width) - HIDE for custom component pages */}
            {slug !== 'faculty-and-scientists' && (
                <section className="sidebar-page-container py-5 mb-5">
                    <div className="auto-container">
                        <div className="row clearfix">
                            <div className="content-side col-lg-12 col-md-12 col-sm-12">
                                <div className="thsti-details bg-white p-4 md:p-8 rounded shadow-sm border border-gray-100">
                                    <div className="inner-box">
                                        <div className="text-gray-700 leading-relaxed text" dangerouslySetInnerHTML={{ __html: pageData.content }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* Dynamically embed the full-width grid for the faculty page outside the text container */}
            {slug === 'faculty-and-scientists' && (
                <FacultyGrid />
            )}
        </main>
    );
};

export default Page;
