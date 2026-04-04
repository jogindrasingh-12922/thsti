import fs from 'fs';

const html = fs.readFileSync('F:/projects/thstihtmltemplates/design6/index.html', 'utf8');

function extractAndConvert(startStr, endStr, outputFn, compName) {
    let startIndex = html.indexOf(startStr);
    let endIndex = html.indexOf(endStr, startIndex);
    if (startIndex === -1 || endIndex === -1) {
        console.log('Could not find boundaries for ', compName);
        return;
    }
    let snippet = html.substring(startIndex, endIndex + endStr.length);

    // Basic JSX conversions
    snippet = snippet.replace(/class="/g, 'className="');
    snippet = snippet.replace(/for="/g, 'htmlFor="');
    snippet = snippet.replace(/tabindex="/g, 'tabIndex="');
    snippet = snippet.replace(/aria-hidden="/g, 'aria-hidden="');
    // Handle self-closing tags (img, input, source)
    snippet = snippet.replace(/<img(.*?)>/g, (match, p1) => {
        if (p1.endsWith('/')) return match;
        return `<img${p1} />`;
    });
    snippet = snippet.replace(/<input(.*?)>/g, (match, p1) => {
        if (p1.endsWith('/')) return match;
        return `<input${p1} />`;
    });
    snippet = snippet.replace(/<source(.*?)>/g, (match, p1) => {
        if (p1.endsWith('/')) return match;
        return `<source${p1} />`;
    });

    // Handle inline styles roughly
    snippet = snippet.replace(/style="([^"]*)"/g, (match, p1) => {
        return 'style={{}}'; // Will fix manually if needed
    });

    // Replace HTML comments
    snippet = snippet.replace(/<!--(.*?)-->/g, '{/* $1 */}');

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

    fs.writeFileSync(outputFn, jsx);
    console.log('Saved', outputFn);
}

// Make sure dirs exist
if (!fs.existsSync('src/components/layout')) fs.mkdirSync('src/components/layout', { recursive: true });

// Extract Header: `<header className="main-header header-style-two">` to `</header>` (Note className replacement happened in string vars earlier so we search original html)
extractAndConvert('<header class="main-header header-style-two">', '</header>', 'src/components/layout/Header.jsx', 'Header');
