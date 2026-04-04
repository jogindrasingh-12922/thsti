import React, { useState, useEffect } from 'react';
import { ASSETS_BASE_URL } from '../../config/env';
import api from '../../api/axios';

const VideoSlide = ({ bgMedia, posterMedia, isActive }) => {
  const videoRef = React.useRef(null);

  React.useEffect(() => {
    if (isActive && videoRef.current) {
      videoRef.current.play().catch(err => console.log('Autoplay prevented:', err));
    } else if (!isActive && videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0; // Reset video to start when not active
    }
  }, [isActive]);

  return (
    <video
      ref={videoRef}
      loop muted playsInline preload="auto"
      {...(!posterMedia.toLowerCase().endsWith('.mp4') ? { poster: posterMedia } : {})}
      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
    >
      <source src={bgMedia} type="video/mp4" />
    </video>
  );
};

const HeroSlider = () => {
  const [slides, setSlides] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const timerRef = React.useRef(null);

  useEffect(() => {
    api.get('/hero-slides')
      .then(res => {
        if (res.data && res.data.length > 0) {
          setSlides(res.data);
        }
      })
      .catch(err => console.error("CMS Hero Fetch Error:", err));
  }, []);

  useEffect(() => {
    // Clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (slides.length <= 1 || !isPlaying) {
      return; 
    }

    // Create new timer every time isPlaying or currentIndex changes (so clicking dot resets timer)
    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 6000); 

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [slides, isPlaying, currentIndex]);

  if (!slides || slides.length === 0) return null;

  return (
    <section className="main-slider-two" style={{ position: 'relative', overflow: 'hidden', height: '80vh', backgroundColor: '#000' }}>
      {slides.map((slide, index) => {
        const isActiveContext = index === currentIndex;
        const bgMedia = slide.mediaUrl ? `${ASSETS_BASE_URL}${slide.mediaUrl}` : '';
        const posterMedia = slide.posterUrl ? `${ASSETS_BASE_URL}${slide.posterUrl}` : '';
        const isVideoSlide = slide.type === 'VIDEO' && slide.isActiveVideo;

        return (
          <div
            key={slide.id}
            style={{
              position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
              opacity: isActiveContext ? 1 : 0,
              visibility: isActiveContext ? 'visible' : 'hidden',
              zIndex: isActiveContext ? 2 : 1,
              transition: 'opacity 1s ease-in-out, visibility 1s'
            }}
          >
            {isVideoSlide ? (
              <VideoSlide bgMedia={bgMedia} posterMedia={posterMedia} isActive={isActiveContext} />
            ) : (
              <div style={{ backgroundImage: `url(${slide.type === 'VIDEO' && !posterMedia.toLowerCase().endsWith('.mp4') ? posterMedia : bgMedia})`, height: '100%', width: '100%', backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
            )}
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.3)' }}></div>

            {slide.showText !== false && (slide.title || slide.subtitle) && (
              <div className="hero-content" style={{ position: 'absolute', top: '50%', left: '10%', transform: 'translateY(-50%)', zIndex: 10, color: '#fff', maxWidth: '800px', pointerEvents: isActiveContext ? 'auto' : 'none' }}>
                {slide.title && <h1 style={{ fontSize: '3.5rem', fontWeight: '800', textShadow: '2px 2px 4px rgba(0,0,0,0.6)', lineHeight: '1.2', marginBottom: '1rem', opacity: isActiveContext ? 1 : 0, transform: isActiveContext ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.8s ease' }}>{slide.title}</h1>}
                {slide.subtitle && <p style={{ fontSize: '1.5rem', textShadow: '1px 1px 3px rgba(0,0,0,0.6)', marginBottom: '2rem', opacity: isActiveContext ? 1 : 0, transform: isActiveContext ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.8s ease 0.2s' }}>{slide.subtitle}</p>}

                {slide.routeUrl && (
                  <div style={{ opacity: isActiveContext ? 1 : 0, transform: isActiveContext ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.8s ease 0.4s' }}>
                    <a href={slide.routeUrl} target={slide.openInNewTab ? "_blank" : "_self"} className="theme-btn btn-style-one">Learn More</a>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      {slides.length > 1 && (
        <>
          <div style={{ position: 'absolute', bottom: '30px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '10px', alignItems: 'center', zIndex: 20 }}>
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                style={{
                  width: '12px', height: '12px', borderRadius: '50%', border: 'none',
                  backgroundColor: i === currentIndex ? '#6ea203' : 'rgba(255,255,255,0.5)',
                  cursor: 'pointer', transition: 'background-color 0.3s'
                }}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
          
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            style={{
              position: 'absolute', bottom: '26px', right: '30px', zIndex: 20,
              background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', 
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '40px', height: '40px', borderRadius: '50%', transition: 'background 0.3s'
            }}
            aria-label={isPlaying ? 'Pause auto-sliding' : 'Play auto-sliding'}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.8)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.5)'}
          >
            {isPlaying ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/></svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
            )}
          </button>
        </>
      )}
    </section>
  );
};

export default HeroSlider;
