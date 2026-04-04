import fs from 'fs';
import path from 'path';

const html = fs.readFileSync('F:/projects/thstihtmltemplates/design6/index.html', 'utf8');

function extractSection(startStr, endStr, compName) {
    let startIndex = html.indexOf(startStr);
    if (startIndex === -1) {
        console.log('Could not find start for ', compName);
        return;
    }
    let endIndex;
    if (typeof endStr === 'string') {
        endIndex = html.indexOf(endStr, startIndex);
    } else {
        // use regex
        let m = html.substring(startIndex).match(endStr);
        if (m) {
            endIndex = startIndex + m.index + m[0].length - endStr.source.length; // rough
            // Actually simpler: just find the index using string if we can.
        }
    }

    if (endIndex === -1 || !endIndex) {
        console.log('Could not find end for ', compName);
        return;
    }

    let snippet = '';
    if (typeof endStr === 'string') {
        snippet = html.substring(startIndex, endIndex + endStr.length);
    } else {
        // Find the first </section> or </div> after the start string
        let offset = html.substring(startIndex).search(endStr);
        if (offset !== -1) {
            let match = html.substring(startIndex).match(endStr);
            snippet = html.substring(startIndex, startIndex + offset + match[0].length);
        }
    }

    // Basic JSX conversions
    snippet = snippet.replace(/class="/g, 'className="');
    snippet = snippet.replace(/for="/g, 'htmlFor="');
    snippet = snippet.replace(/tabindex="/g, 'tabIndex="');
    snippet = snippet.replace(/aria-hidden="/g, 'aria-hidden="');
    snippet = snippet.replace(/<img(.*?)>/gi, (match, p1) => {
        if (p1.endsWith('/')) return match;
        return `<img${p1} />`;
    });
    snippet = snippet.replace(/<input(.*?)>/gi, (match, p1) => {
        if (p1.endsWith('/')) return match;
        return `<input${p1} />`;
    });
    snippet = snippet.replace(/<source(.*?)>/gi, (match, p1) => {
        if (p1.endsWith('/')) return match;
        return `<source${p1} />`;
    });
    snippet = snippet.replace(/<br(.*?)>/gi, (match, p1) => {
        if (p1.endsWith('/')) return match;
        return `<br${p1} />`;
    });

    // Replace HTML comments
    snippet = snippet.replace(/<!--(.*?)-->/gs, '{/* $1 */}');

    // Replace inline styles
    snippet = snippet.replace(/style="([^"]*)"/gi, (match, p1) => {
        // For now, strip inline style or output empty object to avoid React errors. 
        // We will use inline react style format later if needed, but for now we put `{}`
        return `style={{}} /* Original: style="${p1}" */`;
    });

    // some stray unclosed tags in the template
    snippet = snippet.replace(/alt="" \/>/g, 'alt="" />');

    const outputFn = `src/components/home/${compName}.jsx`;
    const jsx = `import React from 'react';

const ${compName} = () => {
  return (
    <>
${snippet}
    </>
  );
};

export default ${compName};
`;
    if (!fs.existsSync('src/components/home')) fs.mkdirSync('src/components/home', { recursive: true });
    fs.writeFileSync(outputFn, jsx);
    console.log('Saved', outputFn);
}

extractSection('<section class="main-slider-two">', '</section>', 'HeroSlider');
// Marquee ends before innovation section, so we extract up to that
const marqueeStart = '<div class="banner-img-footer-box d-flex align-items-center">';
const marqueeEndIndex = html.indexOf('<section class="innovation-section">');
let marqueeSnippet = html.substring(html.indexOf(marqueeStart), marqueeEndIndex);
// convert marquee snippet manually
marqueeSnippet = marqueeSnippet.replace(/class="/g, 'className="').replace(/<!--(.*?)-->/gs, '{/* $1 */}').replace(/<img(.*?)>/gi, (m, p) => { if (p.endsWith('/')) return m; return `<img${p} />`; });
marqueeSnippet = marqueeSnippet.replace(/style="([^"]*)"/gi, 'style={{}}');
fs.writeFileSync('src/components/home/Marquee.jsx', `import React from 'react';\nconst Marquee = () => {\n  return (\n    <>\n${marqueeSnippet}\n    </>\n  );\n};\nexport default Marquee;`);
console.log('Saved src/components/home/Marquee.jsx');

extractSection('<section class="innovation-section">', '</section>', 'Innovation');
extractSection('<section class="what-we-offer pt-5 pb-0 what-we-offer-first"', '</section>', 'ResearchCenters');
extractSection('<section class="what-we-offer pt-5 pb-0 what-we-offer-second"', '</section>', 'Facilities');
extractSection('<section class="what-we-offer Explore-our-Programmes-outer-box pt-5"', '</section>', 'Programmes');
extractSection('<section class="about-section pt-5"', '</section>', 'LifeAtTHSTI');
extractSection('<section class="what-we-offer News-outer-box pt-5"', '</section>', 'NewsEvents');

// TabsSection starting at line 3200
const tabsStart = '<section class="what-we-offer" style="background-image:url(images/background/5-2.jpg);">';
extractSection(tabsStart, '</section>', 'TabsSection');

extractSection('<section class="news-section alternate">', '</section>', 'InternationalCollaboration');
extractSection('<section class="sponsors-section alternate"', '</section>', 'Partners');
