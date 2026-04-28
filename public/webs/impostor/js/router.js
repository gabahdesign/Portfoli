import { config } from './config.js';
import { gestorJugadores } from './players.js';
import { modalManager } from './modal.js';

export const router = {
    pantallaActual: 'home',

    init() {
        console.log('Router: Inicializando...');
        this.configurarEventosNavegacion();
        window.addEventListener('hashchange', () => {
            console.log('Router: Hash cambiado a', window.location.hash);
            this.manejarRuta();
        });
        this.manejarRuta();
    },

    manejarRuta() {
        const rutasValidas = ['home', 'game', 'players', 'config', 'help', 'history',
                              'final-results', 'privacy-policy', 'cookies', 'legal-notice', 'custom-themes'];
        let hash = window.location.hash.substring(1) || 'home';

        if (rutasValidas.includes(hash)) {
            console.log('Router: Navegando a', hash);
            this.cambiarPantallaBase(hash);
        } else {
            console.warn('Router: Ruta no válida', hash, '- Redirigiendo a home');
            window.location.hash = 'home';
        }
    },

    cambiarPantalla(nombrePantalla) {
        console.log('Router: Solicitando pantalla', nombrePantalla);
        window.location.hash = nombrePantalla;
    },

    cambiarPantallaBase(nombrePantalla) {
        // Ocultar todas las pantallas
        document.querySelectorAll('.screen').forEach(p => p.classList.remove('active'));

        // Mostrar la pantalla actual
        const pantallaActiva = document.getElementById('screen-' + nombrePantalla);
        if (pantallaActiva) {
            pantallaActiva.classList.add('active');
            
            // Scroll al inicio en pantallas legales
            if (['privacy-policy', 'cookies', 'legal-notice', 'help'].includes(nombrePantalla)) {
                const mc = document.getElementById('main-content');
                if (mc) mc.scrollTop = 0;
            }
            
            this.pantallaActual = nombrePantalla;
            
            // Re-inicializar iconos si lucide está disponible
            if (window.lucide) {
                lucide.createIcons();
            }
        } else {
            console.error('Router: No se encontró el elemento con ID screen-' + nombrePantalla);
        }

        // Actualizar UI de navegación
        this.toggleNavegacion(nombrePantalla);
        
        // Actualizar item activo en el nav
        const navItem = document.querySelector(`.nav-item[data-screen="${nombrePantalla}"]`);
        if (navItem) {
            this.actualizarNavActiva(navItem);
        }
    },

    toggleNavegacion(nombrePantalla) {
        const body = document.body;
        // Pantallas donde se oculta el bottom nav
        const sinBottomNav = ['final-results', 'privacy-policy', 'cookies', 'legal-notice'];
        if (sinBottomNav.includes(nombrePantalla)) {
            body.classList.add('hide-bottom-nav');
        } else {
            body.classList.remove('hide-bottom-nav');
        }
    },

    actualizarNavActiva(itemActivo) {
        document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
        if (itemActivo) itemActivo.classList.add('active');
    },

    configurarEventosNavegacion() {
        console.log('Router: Configurando eventos...');
        
        // Bottom nav
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', () => {
                const screen = item.getAttribute('data-screen');
                this.cambiarPantalla(screen);
            });
        });

        // Header logo -> home
        const headerLogo = document.querySelector('.header-logo');
        if (headerLogo) {
            headerLogo.addEventListener('click', () => this.cambiarPantalla('home'));
        }

        // Header help btn (toggle)
        const headerHelpBtn = document.getElementById('header-help-btn');
        if (headerHelpBtn) {
            headerHelpBtn.addEventListener('click', () => {
                const destino = (this.pantallaActual === 'help') ? 'home' : 'help';
                this.cambiarPantalla(destino);
            });
        }

        // Header config btn (toggle)
        const headerConfigBtn = document.getElementById('header-config-btn');
        if (headerConfigBtn) {
            headerConfigBtn.addEventListener('click', () => {
                const destino = (this.pantallaActual === 'config') ? 'home' : 'config';
                this.cambiarPantalla(destino);
            });
        }

        // Botones dentro de las pantallas (usando delegación o búsqueda directa)
        
        // Home: Nueva Partida
        const btnNewGame = document.getElementById('btn-new-game');
        if (btnNewGame) {
            btnNewGame.addEventListener('click', () => this.cambiarPantalla('players'));
        }

        // Legal buttons in config
        const btnPrivacy = document.getElementById('btn-privacy-policy');
        if (btnPrivacy) btnPrivacy.addEventListener('click', () => this.cambiarPantalla('privacy-policy'));
        
        const btnCookies = document.getElementById('btn-cookies');
        if (btnCookies) btnCookies.addEventListener('click', () => this.cambiarPantalla('cookies'));
        
        const btnLegal = document.getElementById('btn-legal-notice');
        if (btnLegal) btnLegal.addEventListener('click', () => this.cambiarPantalla('legal-notice'));

        // Botones de cierre (X) en pantallas legales
        ['close-privacy-policy', 'close-cookies', 'close-legal-notice'].forEach(id => {
            const btn = document.getElementById(id);
            if (btn) {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (window.history.length > 1) {
                        window.history.back();
                    } else {
                        this.cambiarPantalla('config');
                    }
                });
            }
        });

        // Botón volver al inicio desde resultados
        const btnBackHome = document.getElementById('btn-back-home');
        if (btnBackHome) {
            btnBackHome.addEventListener('click', () => this.cambiarPantalla('home'));
        }
    }
};
