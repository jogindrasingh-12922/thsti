import React, { useState, useEffect, useRef } from 'react';
import api from '../../api/axios';

const Marquee = () => {
    const [items, setItems] = useState([]);
    const [isPaused, setIsPaused] = useState(false);
    const [bottomOffset, setBottomOffset] = useState(0);
    const stripRef = useRef(null);

    useEffect(() => {
        api.get('/marquee')
            .then(res => {
                if (res.data && res.data.length > 0) setItems(res.data);
            })
            .catch(err => console.error('Marquee fetch error:', err));
    }, []);

    // The What's New strip stays strictly at bottom: 0 and never hides.
    useEffect(() => {
        setBottomOffset(0);
    }, [items]);

    if (!items || items.length === 0) return null;

    return (
        <div
            ref={stripRef}
            className="whats-new-strip d-flex align-items-center"
            style={{ bottom: bottomOffset }}
        >
            <div className="annoucement-box me-5 d-flex align-items-center justify-content-center">
                <h2 className="h3 mb-0"><strong>What's New</strong></h2>
            </div>
            <div className="marquee-container w-100 position-relative overflow-hidden">
                <div className="marquee">
                    <marquee
                        behavior="scroll"
                        direction="left"
                        scrollamount="5"
                        onMouseOver={(e) => { e.target.stop(); setIsPaused(true); }}
                        onMouseOut={(e) => { e.target.start(); setIsPaused(false); }}
                    >
                        {items.map((item) => (
                            <a
                                key={item.id}
                                className="h3 pointer"
                                href={item.url || '#'}
                                target={item.openInNewTab ? '_blank' : '_self'}
                                rel="noreferrer"
                            >
                                {item.title}
                            </a>
                        ))}
                    </marquee>
                </div>
            </div>
            <button
                className="play-pause-btn ms-2"
                aria-label={isPaused ? 'Play' : 'Pause'}
                onClick={() => setIsPaused(p => !p)}
            >
                <span className="material-symbols-outlined bhashini-skip-translation">
                    <i className={`fa ${isPaused ? 'fa-play' : 'fa-pause'}`} aria-hidden="true"></i>
                </span>
            </button>
        </div>
    );
};

export default Marquee;