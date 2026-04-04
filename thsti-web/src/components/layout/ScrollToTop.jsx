import React, { useState, useEffect } from 'react';

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  const radius = 26;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      
      // Handle button visibility
      if (scrollTop > 200) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }

      // Handle progress ring math
      const docHeight = document.body.scrollHeight - window.innerHeight;
      if (docHeight > 0) {
        const scrollPercent = scrollTop / docHeight;
        const offset = circumference - (scrollPercent * circumference);
        setScrollProgress(offset);
      } else {
          setScrollProgress(circumference);
      }
    };

    window.addEventListener('scroll', handleScroll);
    
    // Check initial position on mount and set initial array/offset
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [circumference]);

  // Smooth scroll to top when clicked
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <>
      <div 
        className="scroll-to-top" 
        id="scrollTopBtn"
        style={{ display: isVisible ? 'flex' : 'none' }}
        onClick={scrollToTop}
        aria-label="Scroll to top"
      >
        <svg 
            className="progress-ring" 
            width="60" 
            height="60"
            style={{ position: 'absolute', transform: 'rotate(-90deg)' }}
        >
          <circle
            className="progress-ring-circle"
            stroke="#ff0b00"
            strokeWidth="3"
            fill="transparent"
            r={radius}
            cx="30"
            cy="30"
            style={{
                strokeDasharray: circumference,
                strokeDashoffset: scrollProgress,
                transition: 'stroke-dashoffset 0.1s linear'
            }}
          />
        </svg>
        <span className="arrow" style={{ position: 'absolute', color: '#fff', fontSize: '22px' }}>↑</span>
      </div>
    </>
  );
};

export default ScrollToTop;