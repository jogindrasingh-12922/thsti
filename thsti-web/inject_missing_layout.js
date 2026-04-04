import fs from 'fs';
import path from 'path';

const html = fs.readFileSync('F:/projects/thstihtmltemplates/design6/index.html', 'utf8');

// 1. Extract internal style block
const styleStart = html.indexOf('<style>');
const styleEnd = html.indexOf('</style>', styleStart);
const internalCss = html.substring(styleStart, styleEnd + '</style>'.length);

// 2. Extract inline scripts block at the bottom
const scriptSectionStart = html.indexOf('<script>', html.lastIndexOf('js/script.js'));
const scriptSectionEnd = html.indexOf('</body>');
let inlineScripts = html.substring(scriptSectionStart, scriptSectionEnd);

// 3. Inject CSS and Scripts into thsti-web/index.html
const indexHtmlPath = 'f:/date22022026/thsti/thsti-web/index.html';
let reactIndexHtml = fs.readFileSync(indexHtmlPath, 'utf8');

// Inject CSS before </head>
if (!reactIndexHtml.includes('<style>')) {
    reactIndexHtml = reactIndexHtml.replace('</head>', `  ${internalCss}\n  </head>`);
}

// Replace the placeholder App.jsx scripts/scroll to top with the real ones
// We just put script before </body>
if (!reactIndexHtml.includes('function openSidebar()')) {
    reactIndexHtml = reactIndexHtml.replace('</body>', `\n${inlineScripts}\n  </body>`);
}

fs.writeFileSync(indexHtmlPath, reactIndexHtml);
console.log('Injected internal styles and scripts into index.html');

// 4. Update Accessibility Component
function extractSection(startStr, endStr, compName, isHeaderOrFooter = false) {
    let startIndex = html.indexOf(startStr);
    if (startIndex === -1) {
        console.log('Could not find start for ', compName);
        return;
    }
    let endIndex;
    if (typeof endStr === 'string') {
        endIndex = html.indexOf(endStr, startIndex);
    } else {
        let m = html.substring(startIndex).match(endStr);
        if (m) {
            endIndex = startIndex + m.index + m[0].length - endStr.source.length;
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
    snippet = snippet.replace(/onclick="/g, 'onClick="');

    // Use 'gis' to match across newlines
    snippet = snippet.replace(/<img(.*?)>/gis, (match, p1) => {
        if (p1.endsWith('/')) return match;
        return `<img${p1} />`;
    });
    snippet = snippet.replace(/<input(.*?)>/gis, (match, p1) => {
        if (p1.endsWith('/')) return match;
        return `<input${p1} />`;
    });
    snippet = snippet.replace(/<br(.*?)>/gis, (match, p1) => {
        if (p1.endsWith('/')) return match;
        return `<br${p1} />`;
    });
    snippet = snippet.replace(/<!--(.*?)-->/gs, '{/* $1 */}');

    snippet = snippet.replace(/style="([^"]*)"/gi, (match, p1) => {
        return `style={{}} /* Original: style="${p1}" */`;
    });

    snippet = snippet.replace(/alt="" \/>/g, 'alt="" />');
    snippet = snippet.replace(/href="javascript:void\(0\)"/g, 'href="#"');

    return snippet;
}

// Re-extract Accessibility to include the button
// Original has <div id="sidebar" ...> ... </div> then <div class="accessibility-tools-area"> ... </div>
const sidebarHtml = extractSection('<div id="sidebar"', '<!--Scroll to top-->', 'AccessibilitySidebar');
// we know the start string for accessibility tools area:
const accessToolsStart = '<div class="accessibility-tools-area">';
const accessToolsHtml = extractSection(accessToolsStart, '<!--Scroll to top-->', 'AccessibilityTools');

// Assemble Accessibility.jsx
const accessibilityJsx = `import React from 'react';

const Accessibility = () => {
  return (
    <>
      {/* Sidebar Content */}
${sidebarHtml.substring(0, sidebarHtml.indexOf('<!-- Accessibility Tools -->')) || sidebarHtml}

      {/* Accessibility Tools Button */}
${accessToolsHtml}
    </>
  );
};

export default Accessibility;
`;
fs.writeFileSync('src/components/layout/Accessibility.jsx', accessibilityJsx);
console.log('Saved Accessibility.jsx');

// Extract Scroll To Top natively into Footer or App
const scrollStart = '<div class="scroll-to-top" id="scrollTopBtn">';
const scrollSnippet = extractSection(scrollStart, '<!--Scroll to top-->', 'ScrollToTop');
// We will simply let App.jsx render this or append it later. Let's create a ScrollToTop component
const scrollJsx = `import React from 'react';\n\nconst ScrollToTop = () => {\n  return (\n    <>\n${scrollSnippet}\n    </>\n  );\n};\n\nexport default ScrollToTop;`;
fs.writeFileSync('src/components/layout/ScrollToTop.jsx', scrollJsx);
console.log('Saved ScrollToTop.jsx');
