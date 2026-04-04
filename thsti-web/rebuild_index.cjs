const fs = require('fs');
const path = require('path');

const indexPath = 'f:/date22022026/thsti/thsti-web/index.html';
let html = fs.readFileSync(indexPath, 'utf8');

const marker = "    <script>\\n        let baseFontSize = 16;";
const idx = html.indexOf("<script>\\n        let baseFontSize = 16;");

let cleanHtml = html;
if (idx !== -1) {
    cleanHtml = html.substring(0, idx);
} else {
    // try flexible matching
    const match = html.match(/<script>\\s+let baseFontSize = 16;/);
    if (match) {
        cleanHtml = html.substring(0, match.index);
    }
}

const appendScripts = `    <script>
        let baseFontSize = 16;

        /* ONLY toggle on button click */
        window.addEventListener('load', function () {
            const btn = document.getElementById('accessibility-btn');
            if (btn) {
                btn.addEventListener('click', function () {
                    document.querySelector('.accessibility-tools-area').classList.toggle('open');
                });
            }
        });

        /* Font controls */
        window.fontIncrease = function() {
            baseFontSize++;
            document.documentElement.style.fontSize = baseFontSize + 'px';
        };

        window.fontDecrease = function() {
            if (baseFontSize > 12) {
                baseFontSize--;
                document.documentElement.style.fontSize = baseFontSize + 'px';
            }
        };

        window.fontReadable = function() {
            document.body.style.fontFamily = 'Arial, Verdana, sans-serif';
        };

        /* Contrast */
        window.enableContrast = function() {
            document.body.classList.add('high-contrast');
        };

        window.disableContrast = function() {
            document.body.classList.remove('high-contrast');
        };
    </script>

    <script>
        window.addEventListener("load", function() {
            let section = document.querySelector(".what-we-offer-first");
            let title = document.querySelector(".what-we-offer-first .sec-title-box");
            if(!section || !title) return;

            window.addEventListener("scroll", function() {
                let sectionTop = section.offsetTop;
                let sectionHeight = section.offsetHeight;
                let scrollY = window.scrollY;

                // Sticky Start
                if(scrollY >= sectionTop){
                    title.classList.add("sticky-active");
                } else {
                    title.classList.remove("sticky-active");
                }

                // Sticky End (Section End Pe)
                if(scrollY >= sectionTop + sectionHeight - title.offsetHeight){
                    title.classList.remove("sticky-active");
                }
            });
        });
    </script>

    <script>
        window.addEventListener("load", function() {
            let section = document.querySelector(".what-we-offer-second");
            let title = document.querySelector(".what-we-offer-second .sec-title-box");
            if(!section || !title) return;

            window.addEventListener("scroll", function() {
                let sectionTop = section.offsetTop;
                let sectionHeight = section.offsetHeight;
                let scrollY = window.scrollY;

                // Sticky Start
                if(scrollY >= sectionTop){
                    title.classList.add("sticky-active");
                } else {
                    title.classList.remove("sticky-active");
                }

                // Sticky End (Section End Pe)
                if(scrollY >= sectionTop + sectionHeight - title.offsetHeight){
                    title.classList.remove("sticky-active");
                }
            });
        });
    </script>

    <script>
        window.addEventListener("load", function() {
            const circle = document.querySelector(".progress-ring-circle");
            const scrollBtn = document.getElementById("scrollTopBtn");

            const radius = 26;
            const circumference = 2 * Math.PI * radius;

            if(circle) {
                circle.style.strokeDasharray = circumference;
                circle.style.strokeDashoffset = circumference;
            }

            window.addEventListener("scroll", () => {
                const scrollTop = window.scrollY;
                const docHeight = document.body.scrollHeight - window.innerHeight;
                const scrollPercent = scrollTop / docHeight;

                if(circle) {
                    const offset = circumference - (scrollPercent * circumference);
                    circle.style.strokeDashoffset = offset;
                }

                if(scrollBtn) {
                    if(scrollTop > 200){
                        scrollBtn.style.display = "flex";
                    }else{
                        scrollBtn.style.display = "none";
                    }
                }
            });

            if(scrollBtn) {
                scrollBtn.addEventListener("click", ()=>{
                    window.scrollTo({
                        top:0,
                        behavior:"smooth"
                    });
                });
            }
        });
    </script>
</body>
</html>
`;

cleanHtml += appendScripts;
fs.writeFileSync(indexPath, cleanHtml, 'utf8');
console.log("Successfully rebuilt index.html HTML trailers");
