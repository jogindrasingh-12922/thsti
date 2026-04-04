import React, { useState, useEffect, useRef } from 'react';
import { API_BASE_URL } from '../../config/env';

const AboutIntroStatsSection = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const trackRef = useRef(null);

    useEffect(() => {
        fetch(`${API_BASE_URL}/home-sections/about`)
            .then(res => res.json())
            .then(resData => {
                if (resData && !resData.error) {
                    setData(resData);
                }
            })
            .catch(err => console.error("About section fetch error:", err))
            .finally(() => setLoading(false));
    }, []);

    const content = data;
    
    let counters = [];
    
    if (content) {
        if (Array.isArray(content.metadata)) {
            counters = content.metadata;
        } else if (content.metadata && typeof content.metadata === 'object' && content.metadata.counters) {
            counters = content.metadata.counters;
        }
    }

    const shouldSlide = counters.length > 4;

    useEffect(() => {
        if (!shouldSlide) return;
        const interval = setInterval(() => {
            if (trackRef.current && trackRef.current.children.length > 0) {
                const itemWidth = trackRef.current.children[0].offsetWidth;
                const maxScroll = trackRef.current.scrollWidth - trackRef.current.clientWidth;
                if (trackRef.current.scrollLeft >= maxScroll - 10) {
                    trackRef.current.scrollTo({ left: 0, behavior: 'smooth' });
                } else {
                    trackRef.current.scrollBy({ left: itemWidth, behavior: 'smooth' });
                }
            }
        }, 3000);
        return () => clearInterval(interval);
    }, [shouldSlide, counters.length]);

    const scrollLeft = () => {
        if (trackRef.current && trackRef.current.children.length > 0) {
            const itemWidth = trackRef.current.children[0].offsetWidth;
            trackRef.current.scrollBy({ left: -itemWidth, behavior: 'smooth' });
        }
    };

    const scrollRight = () => {
        if (trackRef.current && trackRef.current.children.length > 0) {
            const itemWidth = trackRef.current.children[0].offsetWidth;
            trackRef.current.scrollBy({ left: itemWidth, behavior: 'smooth' });
        }
    };

    if (!data) return null;

    // Helper map to explicitly attach original animation speeds or classes based on our exact requirement
    const getCounterHtml = (counter, index) => {
        const speeds = ["2500", "3000", "2000", "3000"];
        return (
            <div key={counter.key || index} className="column counter-column col-md-3 col-xs-6" style={shouldSlide ? { flex: '0 0 auto', width: '25%' } : {}}>
                <div className={`inner ${index % 4 === 3 ? 'last-bor-0' : ''}`}>
                    <div className="count-outer count-box">
                        <span className="count-text" data-speed={speeds[index % 4]} data-stop={counter.value}>{counter.value}</span>{counter.suffix}
                        <h4 className="counter-title" style={{ whiteSpace: 'pre-line' }}>{counter.label}</h4>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <section className="innovation-section" id="about-intro">
            <style>
                {`
                    @media (max-width: 991px) {
                        .sliding-counter-item { width: 50% !important; min-width: 50% !important; }
                    }
                    @media (max-width: 575px) {
                        .sliding-counter-item { width: 100% !important; min-width: 100% !important; }
                    }
                `}
            </style>
            <div className="auto-container">
                <div className="row clearfix">

                    {/* Content Column */}
                    <div className="content-column col-lg-12 col-md-12 col-sm-12">
                        <div className="inner-column pt-5">
                            {/* Sec Title */}
                            <div className="sec-title wow fadeInLeft" data-wow-delay="0ms" data-wow-duration="1500ms">
                                <h2>{content.title}</h2>
                            </div>

                            {/* Render HTML description safely */}
                            <div className="text" dangerouslySetInnerHTML={{ __html: content.description }}></div>
                        </div>
                    </div>

                    <div className="images-column col-lg-12 col-md-12 col-sm-12">
                        <div className="inner-column">

                            {/* Counter Box */}
                            <div className="counter-box wow fadeInLeft" data-wow-delay="0ms" data-wow-duration="1500ms" style={{ position: 'relative' }}>
                                {shouldSlide && (
                                    <>
                                        <button onClick={scrollLeft} style={{ position: 'absolute', left: '-20px', top: '50%', transform: 'translateY(-50%)', zIndex: 10, background: '#fff', border: '1px solid #ddd', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', fontSize: '20px', fontWeight: 'bold' }}>&#8249;</button>
                                        <button onClick={scrollRight} style={{ position: 'absolute', right: '-20px', top: '50%', transform: 'translateY(-50%)', zIndex: 10, background: '#fff', border: '1px solid #ddd', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', fontSize: '20px', fontWeight: 'bold' }}>&#8250;</button>
                                    </>
                                )}
                                <div className="fact-counter mb-4" style={{ padding: '0 10px' }}>
                                    <div 
                                        className="row" 
                                        ref={trackRef}
                                        style={shouldSlide ? { display: 'flex', flexWrap: 'nowrap', overflowX: 'hidden', scrollBehavior: 'smooth' } : {}}
                                    >
                                        {counters.map((counter, index) => {
                                            const speeds = ["2500", "3000", "2000", "3000"];
                                            return (
                                                <div key={counter.key || index} className={`column counter-column col-md-3 col-xs-6 ${shouldSlide ? 'sliding-counter-item' : ''}`} style={shouldSlide ? { flex: '0 0 auto', width: '25%' } : {}}>
                                                    <div className={`inner ${index % 4 === 3 ? 'last-bor-0' : ''}`}>
                                                        <div className="count-outer count-box">
                                                            <span className="count-text" data-speed={speeds[index % 4]} data-stop={counter.value}>{counter.value}</span>{counter.suffix}
                                                            <h4 className="counter-title" style={{ whiteSpace: 'pre-line' }}>{counter.label}</h4>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AboutIntroStatsSection;
