import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../config/env';

const LifeAtTHSTI = () => {
    const [items, setItems] = useState([]);
    const [sectionData, setSectionData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchItems = async () => {
            try {
                const [itemsRes, sectionsRes] = await Promise.all([
                    fetch(`${API_BASE_URL}/life-at-thsti`),
                    fetch(`${API_BASE_URL}/home-sections`)
                ]);
                
                if (itemsRes.ok) {
                    const data = await itemsRes.json();
                    setItems(data.items || []);
                }
                
                if (sectionsRes.ok) {
                    const sections = await sectionsRes.json();
                    const lifeSection = sections.find(s => s.sectionType === 'LIFE_AT_THSTI');
                    setSectionData(lifeSection || null);
                }
            } catch (error) {
                console.error("Failed to fetch Life on THSTI items:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchItems();
    }, []);

    const getImageUrl = (url) => {
        if (!url) return '';
        if (url.startsWith('http') || url.startsWith('data:')) return url;
        const base = import.meta.env.VITE_ASSETS_BASE_URL || 'http://localhost:5000';
        const clean = url.startsWith('/') ? url.slice(1) : url;
        return `${base}/${clean}`;
    };

    if (items.length === 0 && !loading) return null;

    // Use fetched items or fallback to original template text if data is missing right now
    const item1 = items[0] || {
        imageUrl: 'images/main-content.jpg',
        category: 'Feature',
        title: 'The Annual Arts Gala'
    };

    const item2 = items[1] || {
        imageUrl: 'images/dance.jpg',
        category: 'Performing Arts',
        title: '30+ Productions'
    };

    const item3 = items[2] || {
        title: 'Varsity Athletics',
        description: '25 State Championships in 2024.',
        buttonLink: '#',
        buttonText: 'View Teams'
    };

    const getMetadata = (item) => {
        let meta = { titleColor: '', titleFontSize: '', categoryColor: '', descColor: '', bgColor: '' };
        try {
            if (item && item.metadata) {
                const parsed = typeof item.metadata === 'string' ? JSON.parse(item.metadata) : item.metadata;
                meta = { ...meta, ...parsed };
            }
        } catch (e) { console.error(e); }
        return meta;
    };

    const meta1 = getMetadata(items[0]);
    const meta2 = getMetadata(items[1]);
    const meta3 = getMetadata(items[2]);

    return (
        <>
            <section className="about-section pt-5" style={{}}>
                <div className="auto-container">
                    <div className="row clearfix">
                        
                        {/* Left Side Main Box */}
                        <div className="col-lg-8 col-md-12 col-sm-12">
                            <div className="sec-title">
                                <h2>{sectionData?.title || 'Life on The THSTI'}</h2>
                            </div>
                            
                            <div className="campus-tour-box">
                                <img className="campis-img" alt={item1.title} src={item1.imageUrl ? getImageUrl(item1.imageUrl) : "images/main-content.jpg"} />
                                <div className="camp-text-outer-box" style={{ backgroundColor: meta1.bgColor || '' }}>
                                    {item1.category && (
                                        <span className="camp-title-box" style={{ color: meta1.categoryColor || '' }}>
                                            {item1.category}
                                        </span>
                                    )}
                                    {item1.title && (
                                        <h3 className="sub-camp-title-box" style={{ color: meta1.titleColor || '', fontSize: meta1.titleFontSize || '' }}>
                                            {item1.title}
                                        </h3>
                                    )}
                                    {item1.description && (
                                        <p style={{ color: meta1.descColor || '', marginTop: '10px' }}>
                                            {item1.description}
                                        </p>
                                    )}
                                    {item1.buttonText && (
                                        <a href={item1.buttonLink || "#"} target={item1.openInNewTab ? "_blank" : "_self"} className="over-link-btn" style={{ marginTop: '15px', display: 'inline-block' }}>
                                            {item1.buttonText}
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right Side Two Boxes */}
                        <div className="col-lg-4 col-md-12 col-sm-12">
                            <div className="sec-title">
                                <p className="text-educave-950 font-medium">
                                    {sectionData?.description || 'A curated ecosystem of arts, athletics, and traditions that shapes the whole student.'}
                                </p>
                            </div>

                            <div className="row clearfix">
                                {/* Service Block 1 */}
                                <div className="services-block-six col-lg-12 col-md-12 col-sm-12 mb-4">
                                    <div className="campus-tour-box Performing-Arts-box">
                                        <img className="campis-img" alt={item2.title} src={item2.imageUrl ? getImageUrl(item2.imageUrl) : "images/dance.jpg"} />
                                        <div className="camp-text-outer-box" style={{ backgroundColor: meta2.bgColor || '' }}>
                                            {item2.category && (
                                                <span className="camp-title-box" style={{ color: meta2.categoryColor || '' }}>
                                                    {item2.category}
                                                </span>
                                            )}
                                            {item2.title && (
                                                <h3 className="sub-camp-title-box" style={{ color: meta2.titleColor || '', fontSize: meta2.titleFontSize || '' }}>
                                                    {item2.title}
                                                </h3>
                                            )}
                                            {item2.description && (
                                                <p style={{ color: meta2.descColor || '', marginTop: '10px' }}>
                                                    {item2.description}
                                                </p>
                                            )}
                                            {item2.buttonText && (
                                                <a href={item2.buttonLink || "#"} target={item2.openInNewTab ? "_blank" : "_self"} className="over-link-btn" style={{ marginTop: '15px', display: 'inline-block' }}>
                                                    {item2.buttonText}
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Service Block 2 */}
                                <div className="services-block-six col-lg-12 col-md-12 col-sm-12">
                                    <div className="varsity-box" style={{ backgroundColor: meta3.bgColor || '' }}>
                                        {item3.imageUrl ? (
                                            <div className="icon" style={{ marginBottom: '24px' }}>
                                                <img src={getImageUrl(item3.imageUrl)} alt="Icon" style={{ maxHeight: '45px', objectFit: 'contain' }} />
                                            </div>
                                        ) : (
                                            <div className="icon">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-award mb-6 text-educave-100" aria-hidden="true"><path d="m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526"></path><circle cx="12" cy="8" r="6"></circle></svg>
                                            </div>
                                        )}
                                        {item3.category && (
                                            <span style={{ color: meta3.categoryColor || '', display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
                                                {item3.category}
                                            </span>
                                        )}
                                        {item3.title && (
                                            <h3>
                                                <a href={item3.buttonLink || "#"} style={{ color: meta3.titleColor || '', fontSize: meta3.titleFontSize || '' }}>
                                                    {item3.title}
                                                </a>
                                            </h3>
                                        )}
                                        {item3.description && (
                                            <p style={{ color: meta3.descColor || '' }}>
                                                {item3.description}
                                            </p>
                                        )}
                                        {item3.buttonText && (
                                            <a href={item3.buttonLink || "#"} target={item3.openInNewTab ? "_blank" : "_self"} className="over-link-btn">
                                                {item3.buttonText}
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </section>
        </>
    );
};

export default LifeAtTHSTI;
