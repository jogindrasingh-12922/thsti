/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: 'var(--primary)',
                secondary: 'var(--secondary)',
                accent: 'var(--accent)',
                'bg-body': 'var(--bg-body)',
                'bg-light': 'var(--bg-light)',
                'text-main': 'var(--text-main)',
                'text-muted': 'var(--text-muted)',
                'text-dark': 'var(--text-dark)',
                'border-light': 'var(--border-light)'
            },
            fontFamily: {
                sans: ['"Familjen Grotesk"', 'sans-serif'],
                btn: ['"Lato"', 'sans-serif']
            }
        },
    },
    plugins: [],
}
