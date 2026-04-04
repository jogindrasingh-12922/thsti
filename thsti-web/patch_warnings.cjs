const fs = require('fs');

function fixFiles() {
    // 1. Fix Header.jsx search input value
    const headerPath = 'f:/date22022026/thsti/thsti-web/src/components/layout/Header.jsx';
    let headerContent = fs.readFileSync(headerPath, 'utf8');
    headerContent = headerContent.replace('placeholder="Search..." value=""', 'placeholder="Search..." defaultValue=""');
    fs.writeFileSync(headerPath, headerContent, 'utf8');

    // 2. Fix TabsSection.jsx alt=""
    const tabsPath = 'f:/date22022026/thsti/thsti-web/src/components/home/TabsSection.jsx';
    let tabsContent = fs.readFileSync(tabsPath, 'utf8');
    tabsContent = tabsContent.replace('img src="https://thsti.res.in/public/upload/news/1769753885img.jpg" alt />', 'img src="https://thsti.res.in/public/upload/news/1769753885img.jpg" alt="" />');
    fs.writeFileSync(tabsPath, tabsContent, 'utf8');

    // 3. Fix index.html runtime errors (lines 1684, 1777)
    // The errors occur because elements don't exist when index scripts run (React hasn't mounted yet). We add null checks and wait for load.
    const indexPath = 'f:/date22022026/thsti/thsti-web/index.html';
    let indexContent = fs.readFileSync(indexPath, 'utf8');

    // Fix accessibility btn
    indexContent = indexContent.replace(
        "document.getElementById('accessibility-btn').addEventListener('click', function () {",
        "window.addEventListener('load', function() {\n  const btn = document.getElementById('accessibility-btn');\n  if(btn) {\n    btn.addEventListener('click', function () {"
    );
    indexContent = indexContent.replace(
        "          .classList.toggle('open');\n});",
        "          .classList.toggle('open');\n    });\n  }\n});"
    );

    // Fix scroll ring 
    indexContent = indexContent.replace(
        "circle.style.strokeDasharray = circumference;\ncircle.style.strokeDashoffset = circumference;",
        "if(circle) {\ncircle.style.strokeDasharray = circumference;\ncircle.style.strokeDashoffset = circumference;\n}"
    );

    indexContent = indexContent.replace(
        "window.addEventListener(\"scroll\", () => {\n\n    const scrollTop = window.scrollY;",
        "window.addEventListener(\"scroll\", () => {\n    if(!circle || !scrollBtn) return;\n    const scrollTop = window.scrollY;"
    );

    indexContent = indexContent.replace(
        "scrollBtn.addEventListener(\"click\", ()=>{",
        "if(scrollBtn) {\nscrollBtn.addEventListener(\"click\", ()=>{"
    );

    indexContent = indexContent.replace(
        "        behavior:\"smooth\"\n    });\n});",
        "        behavior:\"smooth\"\n    });\n});\n}"
    );

    // Fix missing fonts by pointing flat-icon in style.css to absolute paths
    const cssPath = 'f:/date22022026/thsti/thsti-web/public/css/style.css';
    let cssContent = fs.readFileSync(cssPath, 'utf8');
    cssContent = cssContent.replace(/url\('\.\.\/fonts\/flaticon/g, "url('/fonts/flaticon");
    fs.writeFileSync(cssPath, cssContent, 'utf8');

    fs.writeFileSync(indexPath, indexContent, 'utf8');
    console.log("Fixed warnings and runtime scripts!");
}

fixFiles();
