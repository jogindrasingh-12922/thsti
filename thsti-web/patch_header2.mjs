import fs from 'fs';

let content = fs.readFileSync('f:/date22022026/thsti/thsti-web/src/components/layout/Header.jsx', 'utf8');

// Fix unclosed input tag
content = content.replace(/<input type="search"([\s\S]*?)value="">/g, '<input type="search"$1defaultValue="" />');

fs.writeFileSync('f:/date22022026/thsti/thsti-web/src/components/layout/Header.jsx', content, 'utf8');
console.log('Fixed Header.jsx unclosed input tag');
