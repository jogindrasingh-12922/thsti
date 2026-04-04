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

// Extract Footer
extractAndConvert('<footer class="main-footer">', '</footer>', 'src/components/layout/Footer.jsx', 'Footer');

// Extract Accessibility sidebar
extractAndConvert('<div id="sidebar"', '<!--Scroll to top-->', 'src/components/layout/Accessibility.jsx', 'Accessibility');
