import React from 'react';
import HeroSlider from '../components/home/HeroSlider';
import Marquee from '../components/home/Marquee';
import Innovation from '../components/home/Innovation';
import ResearchCentersSection from '../components/home/ResearchCentersSection';
import Facilities from '../components/home/Facilities';
import Programmes from '../components/home/Programmes';
import LifeAtTHSTI from '../components/home/LifeAtTHSTI';
import NewsEvents from '../components/home/NewsEvents';
import TabsSection from '../components/home/TabsSection';
import InternationalCollaboration from '../components/home/InternationalCollaboration';
import Partners from '../components/home/Partners';

const Home = () => {
    return (
        <>
            <HeroSlider />
            <Marquee />
            <Innovation />
            <ResearchCentersSection />
            <Facilities />
            <Programmes />
            <LifeAtTHSTI />
            <NewsEvents />
            <TabsSection />
            <InternationalCollaboration />
            <Partners />
        </>
    );
};

export default Home;
