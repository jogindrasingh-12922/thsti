const fs = require('fs');
const path = require('path');

const srcDir = 'f:/date22022026/thsti/thsti-web/src';

function updateFile(filePath, replacer) {
    let content = fs.readFileSync(filePath, 'utf8');
    content = replacer(content);
    fs.writeFileSync(filePath, content, 'utf8');
}

// 1. HeroSlider
updateFile(path.join(srcDir, 'components/home/HeroSlider.jsx'), (content) => {
    return content.replace(/autoplay="autoplay"/g, 'autoPlay')
        .replace(/loop="true"/g, 'loop')
        .replace(/muted=""/g, 'muted');
});

// 2. Marquee
updateFile(path.join(srcDir, 'components/home/Marquee.jsx'), (content) => {
    return content.replace(/onmouseover="this\.stop\(\);"/g, 'onMouseOver={(e) => e.target.stop()}')
        .replace(/onmouseout="this\.start\(\);"/g, 'onMouseOut={(e) => e.target.start()}');
});

// 3. LifeAtTHSTI.jsx
updateFile(path.join(srcDir, 'components/home/LifeAtTHSTI.jsx'), (content) => {
    return content.replace(/stroke-width/g, 'strokeWidth')
        .replace(/stroke-linecap/g, 'strokeLinecap')
        .replace(/stroke-linejoin/g, 'strokeLinejoin');
});

// 4. NewsEvents.jsx
updateFile(path.join(srcDir, 'components/home/NewsEvents.jsx'), (content) => {
    return content.replace(/hreflang=/g, 'hrefLang=')
        .replace(/alt \/>/g, 'alt="" />')
        .replace(/alt\n/g, 'alt=""\n');
});

// 5. Accessibility.jsx
updateFile(path.join(srcDir, 'components/layout/Accessibility.jsx'), (content) => {
    let newContent = content.replace(/onClick="([a-zA-Z]+)\(\)"/g, 'onClick={() => window.$1 && window.$1()}');

    // Remove duplicate accessibility block if it exists twice
    const toolsStart = '{/* Accessibility Tools Button */}';
    if (newContent.split(toolsStart).length > 2) {
        // It appears twice. We can extract from start of first to start of second
        const idx1 = newContent.indexOf(toolsStart);
        const idx2 = newContent.indexOf(toolsStart, idx1 + 1);
        if (idx2 !== -1) {
            const tail = newContent.substring(newContent.indexOf('</>', idx2));
            newContent = newContent.substring(0, idx2) + tail;
        }
    }

    // Also remove the extra copy from line 217-260
    const extraPattern = /\{\/\*  Accessibility Tools  \*\/\}.*?<\/div>/gs;
    const matches = newContent.match(extraPattern);
    if (matches && matches.length > 1) {
        newContent = newContent.replace(matches[1], '');
    }

    return newContent;
});

console.log("Fixed JSX attributes and properties!");
