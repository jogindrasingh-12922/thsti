import fs from 'fs';

let content = fs.readFileSync('f:/date22022026/thsti/thsti-web/src/components/layout/Header.jsx', 'utf8');

// 1. Add imports and hook
content = content.replace("import React from 'react';\r\n\r\nconst Header = () => {", `import React, { useState, useEffect } from 'react';\n\nconst Header = () => {\n  const [dynamicMenus, setDynamicMenus] = useState([]);\n\n  useEffect(() => {\n    fetch('http://localhost:5000/api/menus')\n      .then(res => res.json())\n      .then(data => {\n         if (Array.isArray(data)) setDynamicMenus(data);\n      })\n      .catch(err => console.error("CMS Menu Fetch Error:", err));\n  }, []);\n\n  const renderMenus = () => {\n    return dynamicMenus.map(menu => (\n      <li key={menu.id} className={menu.subMenus && menu.subMenus.length > 0 ? "dropdown cursor-pointer" : "cursor-pointer"}>\n        <a href={menu.route} className={menu.subMenus && menu.subMenus.length > 0 ? "dropdown-toggle" : ""}>\n          {menu.label}\n        </a>\n        {menu.subMenus && menu.subMenus.length > 0 && (\n          <ul>\n            {menu.subMenus.map(sub => (\n               <li key={sub.id}><a href={sub.route}>{sub.label}</a></li>\n            ))}\n          </ul>\n        )}\n      </li>\n    ));\n  };`);
content = content.replace("import React from 'react';\n\nconst Header = () => {", `import React, { useState, useEffect } from 'react';\n\nconst Header = () => {\n  const [dynamicMenus, setDynamicMenus] = useState([]);\n\n  useEffect(() => {\n    fetch('http://localhost:5000/api/menus')\n      .then(res => res.json())\n      .then(data => {\n         if (Array.isArray(data)) setDynamicMenus(data);\n      })\n      .catch(err => console.error("CMS Menu Fetch Error:", err));\n  }, []);\n\n  const renderMenus = () => {\n    return dynamicMenus.map(menu => (\n      <li key={menu.id} className={menu.subMenus && menu.subMenus.length > 0 ? "dropdown cursor-pointer" : "cursor-pointer"}>\n        <a href={menu.route} className={menu.subMenus && menu.subMenus.length > 0 ? "dropdown-toggle" : ""}>\n          {menu.label}\n        </a>\n        {menu.subMenus && menu.subMenus.length > 0 && (\n          <ul>\n            {menu.subMenus.map(sub => (\n               <li key={sub.id}><a href={sub.route}>{sub.label}</a></li>\n            ))}\n          </ul>\n        )}\n      </li>\n    ));\n  };`);


// 2. Inject menus before the 'About' dropdown
content = content.replace(/<li className=" dropdown">\s*<a href="javascript:void\(0\);" className="dropdown-toggle">About <\/a>/g,
    `{/* DYNAMIC CMS MENUS RENDERED HERE */}
                                    {renderMenus()}
                                    <li className=" dropdown">
                                        <a href="javascript:void(0);" className="dropdown-toggle">About </a>`);

// 3. Fix HTML comments (This is the critical 500 error cause)
content = content.replace(/<!--\s*<li><a href="https:\/\/scientificservices\.thsti\.in\/">SCIENTIFIC SERVICES<\/a><\/li>\s*<li><a href="\/Info\/alumni">ALUMNI<\/a><\/li>\s*<li><a href="\/contact-us">CONTACT US<\/a><\/li>\s*-->/g,
    `{/* <li><a href="https://scientificservices.thsti.in/">SCIENTIFIC SERVICES</a></li>
   <li><a href="/Info/alumni">ALUMNI</a></li>
   <li><a href="/contact-us">CONTACT US</a></li> */}`);

fs.writeFileSync('f:/date22022026/thsti/thsti-web/src/components/layout/Header.jsx', content, 'utf8');
console.log('Fixed Header.jsx');
