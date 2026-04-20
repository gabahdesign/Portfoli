/**
 * MOVE MODERN — SYNC & BRIDGE
 * Sincronitza el tema i l'idioma amb el Portfolio principal
 */

const MoveSync = {
    init() {
        this.syncTheme();
        this.syncLanguage();
        this.setupPortfolioLink();
        this.observeAnimations();
    },

    /**
     * Sincronitza el tema visual (Fosc/Clar)
     */
    syncTheme() {
        // El Portfolio usa 'theme' o guarda l'estat a localStorage
        const theme = localStorage.getItem('theme') || localStorage.getItem('dark-mode');
        const isDark = theme === 'dark' || theme === 'true';
        
        if (isDark) {
            document.documentElement.setAttribute('data-theme', 'dark');
            document.body.classList.add('dark-mode');
        } else {
            document.documentElement.removeAttribute('data-theme');
            document.body.classList.remove('dark-mode');
        }
    },

    /**
     * Sincronitza l'idioma (Català, Castellà, Anglès)
     */
    syncLanguage() {
        // El Portfolio usa 'NEXT_LOCALE' per next-intl
        const savedLocale = localStorage.getItem('NEXT_LOCALE');
        if (savedLocale && window.I18N) {
            window.I18N.setLanguage(savedLocale);
        }
    },

    /**
     * Configura el botó de tornada al Portfolio
     */
    setupPortfolioLink() {
        const backBtn = document.querySelector('#back-to-portfolio');
        if (backBtn) {
            backBtn.addEventListener('click', (e) => {
                e.preventDefault();
                // Tornem a l'arrel on viu el portfolio
                window.location.href = '../'; 
            });
        }
    },

    /**
     * Intersection Observer per a les animacions d'entrada
     */
    observeAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.classList.add('animate-entrance');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.sa > div, .ip, .gc').forEach(el => {
            observer.observe(el);
        });
    }
};

document.addEventListener('DOMContentLoaded', () => MoveSync.init());
