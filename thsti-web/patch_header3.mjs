import fs from 'fs';

let content = fs.readFileSync('f:/date22022026/thsti/thsti-web/src/components/layout/Header.jsx', 'utf8');

// Fix unclosed img tag
content = content.replace(/<img([^>]*?)>/g, (match, p1) => {
    if (p1.trim().endsWith('/')) return match;
    return `<img${p1} />`;
});

// Fix unclosed input tag
content = content.replace(/<input([^>]*?)>/g, (match, p1) => {
    if (p1.trim().endsWith('/')) return match;
    let newAttr = p1;
    // Also replace value="" with defaultValue="" if present
    newAttr = newAttr.replace(/value=""/g, 'defaultValue=""');
    return `<input${newAttr} />`;
});

fs.writeFileSync('f:/date22022026/thsti/thsti-web/src/components/layout/Header.jsx', content, 'utf8');
console.log('Fixed Header.jsx unclosed elements');
