import { config, traducciones } from './config.js';
import { initModals, modalManager } from './modal.js';
import { initJugadores, gestorJugadores } from './players.js';
import { initGame, gestorJuego } from './game.js';
import { router } from './router.js';
import { obtenerTemas } from './data.js';

// app.js - Punto de entrada principal

const gestorResultados = {
    // Mostrar/ocultar botón acabar partida
    actualizarBotonAcabarPartida() {
        const btnEndGame = document.getElementById('btn-end-game');
        const hayJuego = gestorJuego && gestorJuego.estado !== 'setup';

        if (btnEndGame) {
            btnEndGame.style.display = hayJuego ? 'block' : 'none';
        }
    },

    // Calcular ranking de jugadores
    calcularRanking() {
        const jugadores = gestorJugadores.jugadores;
        const eliminados = gestorJuego.jugadoresEliminados || [];

        // Crear array con jugadores y su orden de eliminación
        const ranking = jugadores.map(jugador => {
            const indiceEliminacion = eliminados.findIndex(e => e.nombre === jugador.nombre);
            return {
                nombre: jugador.nombre,
                posicion: indiceEliminacion === -1 ? 0 : eliminados.length - indiceEliminacion
            };
        });

        // Ordenar por posición (0 = no eliminado = ganador, luego inverso de eliminación)
        ranking.sort((a, b) => {
            if (a.posicion === 0 && b.posicion === 0) return 0;
            if (a.posicion === 0) return -1;
            if (b.posicion === 0) return 1;
            return a.posicion - b.posicion;
        });

        return ranking;
    },

    // Agrupar jugadores por posición
    agruparPorPosicion(ranking) {
        const grupos = {};
        let posicionActual = 1;

        ranking.forEach((jugador, index) => {
            if (index === 0 || jugador.posicion === ranking[index - 1].posicion) {
                if (!grupos[posicionActual]) {
                    grupos[posicionActual] = [];
                }
                grupos[posicionActual].push(jugador.nombre);
            } else {
                posicionActual += grupos[Object.keys(grupos).pop()].length;
                grupos[posicionActual] = [jugador.nombre];
            }
        });

        return grupos;
    },

    // Mostrar resultados finales
    mostrarResultadosFinales() {
        const ranking = this.calcularRanking();
        const grupos = this.agruparPorPosicion(ranking);

        // Llenar podio (top 3)
        const posiciones = Object.keys(grupos).map(Number).sort((a, b) => a - b);

        // Primer lugar
        const podium1 = document.querySelector('#podium-1 .podium-player');
        if (posiciones[0] && grupos[posiciones[0]]) {
            podium1.textContent = grupos[posiciones[0]].join(', ');
        } else {
            podium1.textContent = '-';
        }

        // Segundo lugar
        const podium2 = document.querySelector('#podium-2 .podium-player');
        if (posiciones[1] && grupos[posiciones[1]]) {
            podium2.textContent = grupos[posiciones[1]].join(', ');
        } else {
            podium2.textContent = '-';
        }

        // Tercer lugar
        const podium3 = document.querySelector('#podium-3 .podium-player');
        if (posiciones[2] && grupos[posiciones[2]]) {
            podium3.textContent = grupos[posiciones[2]].join(', ');
        } else {
            podium3.textContent = '-';
        }

        // Llenar ranking completo
        const rankingsContent = document.getElementById('rankings-content');
        if(rankingsContent) {
            rankingsContent.innerHTML = '';
            posiciones.forEach(pos => {
                const jugadores = grupos[pos];
                const item = document.createElement('div');
                item.className = 'ranking-item';

                const posicionDiv = document.createElement('div');
                posicionDiv.className = 'ranking-position';
                posicionDiv.textContent = `${pos}º`;

                const nombresDiv = document.createElement('div');
                nombresDiv.className = 'ranking-players-list';

                jugadores.forEach(nombre => {
                    const nombreSpan = document.createElement('div');
                    nombreSpan.className = 'ranking-player-name';
                    nombreSpan.textContent = nombre;
                    nombresDiv.appendChild(nombreSpan);
                });

                item.appendChild(posicionDiv);
                item.appendChild(nombresDiv);
                rankingsContent.appendChild(item);
            });
        }

        // Cambiar a pantalla de resultados finales
        router.cambiarPantalla('final-results');
    }
};

const gestorMios = {
    data: {
        folders: [],
        lastSort: 'recent'
    },
    currentFolderId: null,

    init() {
        this.cargar();
        this.configurarEventos();
    },

    cargar() {
        const guardadas = localStorage.getItem('impostor-custom-words');
        if (guardadas) {
            try {
                const parsed = JSON.parse(guardadas);
                // Migración de formato viejo (array) a nuevo (objeto con folders)
                if (Array.isArray(parsed)) {
                    this.data = {
                        folders: [{
                            id: 'folder-' + Date.now(),
                            name: 'General',
                            words: parsed,
                            selected: true,
                            createdAt: Date.now()
                        }],
                        lastSort: 'recent'
                    };
                    this.guardar();
                } else if (parsed && parsed.folders) {
                    this.data = parsed;
                }
            } catch (e) {
                console.error('Error cargando Míos:', e);
            }
        } else {
            // Inicializar vacío
            this.data = { folders: [], lastSort: 'recent' };
        }
        this.actualizarUI();
    },

    guardar() {
        localStorage.setItem('impostor-custom-words', JSON.stringify(this.data));
        // Notificar que los temas han podido cambiar
        generarTemasCheckboxes();
    },

    crearCarpeta(nombre) {
        if (!nombre || nombre.trim() === '') return;
        const limpia = nombre.trim();
        
        const nueva = {
            id: 'folder-' + Date.now(),
            name: limpia,
            words: [],
            selected: true,
            createdAt: Date.now()
        };

        this.data.folders.push(nueva);
        this.guardar();
        this.actualizarUI();
    },

    borrarCarpeta(id) {
        this.data.folders = this.data.folders.filter(f => f.id !== id);
        this.guardar();
        this.actualizarUI();
    },

    toggleSeleccionCarpeta(id) {
        const folder = this.data.folders.find(f => f.id === id);
        if (folder) {
            folder.selected = !folder.selected;
            this.guardar();
            this.actualizarUI();
        }
    },

    añadirPalabra(palabra) {
        if (!palabra || palabra.trim() === '') return;
        if (!this.currentFolderId) return;

        const folder = this.data.folders.find(f => f.id === this.currentFolderId);
        if (!folder) return;

        const limpia = palabra.trim();
        if (folder.words.includes(limpia)) {
            modalManager.showError('Esta palabra ya existe en esta carpeta');
            return;
        }

        folder.words.push(limpia);
        this.guardar();
        this.actualizarUI();
    },

    borrarPalabra(index) {
        const folder = this.data.folders.find(f => f.id === this.currentFolderId);
        if (folder) {
            folder.words.splice(index, 1);
            this.guardar();
            this.actualizarUI();
        }
    },

    ordenar(tipo) {
        this.data.lastSort = tipo;
        this.actualizarUI();
    },

    getFoldersOrdenados() {
        const folders = [...this.data.folders];
        const tipo = this.data.lastSort;

        if (tipo === 'az') {
            folders.sort((a, b) => a.name.localeCompare(b.name));
        } else if (tipo === 'za') {
            folders.sort((a, b) => b.name.localeCompare(a.name));
        } else {
            // Recent (createdAt desc)
            folders.sort((a, b) => b.createdAt - a.createdAt);
        }
        return folders;
    },

    actualizarUI() {
        const viewFolders = document.getElementById('view-folders');
        const viewWords = document.getElementById('view-words');
        if (!viewFolders || !viewWords) return;

        if (this.currentFolderId) {
            // Mostrar palabras de la carpeta actual
            viewFolders.style.display = 'none';
            viewWords.style.display = 'block';
            this.renderizarPalabras();
        } else {
            // Mostrar lista de carpetas
            viewFolders.style.display = 'block';
            viewWords.style.display = 'none';
            this.renderizarCarpetas();
        }

        if (window.lucide) lucide.createIcons();
    },

    renderizarCarpetas() {
        const lista = document.getElementById('folders-list');
        if (!lista) return;

        const folders = this.getFoldersOrdenados();

        if (folders.length === 0) {
            lista.innerHTML = `<p class="empty-state">No hay carpetas. Crea una para empezar.</p>`;
            return;
        }

        lista.innerHTML = '';
        folders.forEach(folder => {
            const item = document.createElement('div');
            item.className = 'folder-item';
            if (!folder.selected) item.classList.add('deselected');

            item.innerHTML = `
                <div class="folder-main" onclick="gestorMios.abrirCarpeta('${folder.id}')">
                    <div class="folder-icon-box">
                        <i data-lucide="folder"></i>
                    </div>
                    <div class="folder-info-text">
                        <span class="folder-name">${folder.name}</span>
                        <span class="folder-count">${folder.words.length} palabras</span>
                    </div>
                </div>
                <div class="folder-actions">
                    <input type="checkbox" class="checkbox-input folder-select-check" ${folder.selected !== false ? 'checked' : ''} 
                           onchange="event.stopPropagation(); gestorMios.toggleSeleccionCarpeta('${folder.id}')">
                    <button class="btn btn-danger btn-icon-only btn-small trash-btn-custom" onclick="event.stopPropagation(); gestorMios.borrarCarpeta('${folder.id}')">
                        <i data-lucide="trash-2"></i>
                    </button>
                </div>
            `;
            lista.appendChild(item);
        });

        // Actualizar botones de orden
        document.querySelectorAll('.sort-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.sort === this.data.lastSort);
        });
    },

    renderizarPalabras() {
        const lista = document.getElementById('custom-words-list');
        const title = document.getElementById('current-folder-name');
        const folder = this.data.folders.find(f => f.id === this.currentFolderId);

        if (!folder || !lista) return;

        title.textContent = folder.name;

        if (folder.words.length === 0) {
            lista.innerHTML = `<p class="empty-state">Esta carpeta está vacía.</p>`;
            return;
        }

        lista.innerHTML = '';
        folder.words.forEach((palabra, index) => {
            const item = document.createElement('div');
            item.className = 'player-item';
            item.innerHTML = `
                <div class="player-info">
                    <span class="player-name">${palabra}</span>
                </div>
                <button class="btn btn-danger btn-icon-only btn-small trash-btn-custom" onclick="gestorMios.borrarPalabra(${index})">
                    <i data-lucide="trash-2"></i>
                </button>
            `;
            lista.appendChild(item);
        });
    },

    abrirCarpeta(id) {
        this.currentFolderId = id;
        this.actualizarUI();
    },

    volverACarpetas() {
        this.currentFolderId = null;
        this.actualizarUI();
    },

    hasAnyWords() {
        return this.data.folders.some(f => f.words.length > 0);
    },

    configurarEventos() {
        // Eventos generales ya configurados en initApp o manejados por onclick en línea
        const btnAddFolder = document.getElementById('btn-add-folder');
        const inputFolder = document.getElementById('input-new-folder');
        if (btnAddFolder && inputFolder) {
            btnAddFolder.onclick = () => {
                this.crearCarpeta(inputFolder.value);
                inputFolder.value = '';
            };
            inputFolder.onkeypress = (e) => {
                if (e.key === 'Enter') {
                    this.crearCarpeta(inputFolder.value);
                    inputFolder.value = '';
                }
            };
        }

        const btnAddWord = document.getElementById('btn-add-custom-word');
        const inputWord = document.getElementById('input-custom-word');
        if (btnAddWord && inputWord) {
            btnAddWord.onclick = () => {
                this.añadirPalabra(inputWord.value);
                inputWord.value = '';
            };
            inputWord.onkeypress = (e) => {
                if (e.key === 'Enter') {
                    this.añadirPalabra(inputWord.value);
                    inputWord.value = '';
                }
            };
        }

        const btnBackToFolders = document.getElementById('btn-back-to-folders');
        if (btnBackToFolders) {
            btnBackToFolders.onclick = () => this.volverACarpetas();
        }

        const btnBackToConfig = document.getElementById('btn-back-custom-themes');
        if (btnBackToConfig) {
            btnBackToConfig.onclick = () => {
                if (this.currentFolderId) {
                    this.volverACarpetas();
                } else {
                    router.cambiarPantalla('config');
                }
            };
        }

        // Sorting buttons
        document.querySelectorAll('.sort-btn').forEach(btn => {
            btn.onclick = () => this.ordenar(btn.dataset.sort);
        });
    }
};

function initApp() {
    // Configurar toggle modo oscuro
    const toggleModoOscuro = document.getElementById('dark-mode-toggle');
    if (toggleModoOscuro) {
        toggleModoOscuro.checked = config.modoOscuro;
        toggleModoOscuro.addEventListener('change', () => {
            config.toggleModoOscuro();
        });
    }

    // Configurar toggle ocultar tema impostor
    const toggleOcultarTema = document.getElementById('hide-theme-toggle');
    if (toggleOcultarTema) {
        toggleOcultarTema.checked = config.ocultarTemaImpostor;
        toggleOcultarTema.addEventListener('change', () => {
            config.ocultarTemaImpostor = toggleOcultarTema.checked;
            config.guardar();
        });
    }

    // Configurar selector de idioma con banderas
    const languageOptions = document.querySelectorAll('.language-option');
    // Marcar idioma activo
    languageOptions.forEach(option => {
        const lang = option.getAttribute('data-lang');
        if (lang === config.idioma) {
            option.classList.add('active');
        }

        // Añadir evento click
        option.addEventListener('click', () => {
            languageOptions.forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
            config.cambiarIdioma(lang);
            generarTemasCheckboxes();
            gestorJugadores.actualizarUI();
        });
    });

    generarTemasCheckboxes();

    // Eventos de resultados
    const btnEndGame = document.getElementById('btn-end-game');
    if (btnEndGame) {
        btnEndGame.addEventListener('click', () => {
            gestorResultados.mostrarResultadosFinales();
        });
    }

    const btnResetStats = document.getElementById('btn-reset-stats');
    if (btnResetStats) {
        btnResetStats.addEventListener('click', () => {
            modalManager.showConfirm(
                config.t('resetStatsConfirm'),
                () => {
                    localStorage.removeItem('impostor-estadisticas');
                    gestorJugadores.estadisticas = {};
                    gestorJugadores.actualizarPodiEstadisticas();
                    modalManager.showSuccess(config.t('resetStatsSuccess'));
                },
                () => {}
            );
        });
    }
    
    // Inicializar gestor de palabras propias
    gestorMios.init();
}

// Generar botones de temas
function generarTemasCheckboxes() {
    const grid = document.getElementById('themes-grid');
    if (!grid) return;
    
    // Obtener TODOS los temas, incluyendo adultos (siempre mostrar la opción)
    const temas = obtenerTemas(config.idioma, true);

    grid.innerHTML = '';

    temas.forEach(tema => {
        const button = document.createElement('div');
        button.className = 'theme-button';

        // Añadir icono del tema
        const icon = document.createElement('img');
        icon.src = `icons/temas/${tema}.svg`;
        icon.alt = tema;
        icon.className = 'theme-icon';

        // Añadir texto del tema
        const span = document.createElement('span');
        span.className = 'theme-label';
        span.setAttribute('data-i18n', tema);
        span.textContent = config.t(tema);

        // Marcar como seleccionado si está en la lista
        if (tema === 'mios') {
            button.classList.add('theme-button-custom');
            if (config.temasSeleccionados.includes(tema)) {
                button.classList.add('selected');
            }
        } else if (tema === 'adultos') {
            // Solo puede estar marcado si está desbloqueado
            const puedeEstarMarcado = !config.adultosBloqueado && config.temasSeleccionados.includes(tema);
            if (puedeEstarMarcado) {
                button.classList.add('selected');
            }
        } else {
            // Temas normales
            if (config.temasSeleccionados.includes(tema)) {
                button.classList.add('selected');
            }
        }

        // Manejo especial para tema mios (ir a pantalla de edición)
        if (tema === 'mios') {
            button.addEventListener('click', (e) => {
                // Si hay 0 palabras en total, forzar ir a edición
                if (!gestorMios.hasAnyWords()) {
                    router.cambiarPantalla('custom-themes');
                    return;
                }

                // Si hay palabras, toggle normal
                button.classList.toggle('selected');
                const estaSeleccionado = button.classList.contains('selected');
                toggleTema(tema, estaSeleccionado);
            });

            // Añadir un botón pequeño para editar
            const editBtn = document.createElement('button');
            editBtn.className = 'theme-edit-btn';
            editBtn.innerHTML = '<i data-lucide="edit-3"></i>';
            editBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                router.cambiarPantalla('custom-themes');
            });
            button.appendChild(editBtn);
        } else if (tema === 'adultos') {
            button.addEventListener('click', async () => {
                const estaSeleccionado = button.classList.contains('selected');

                if (!estaSeleccionado) {
                    const confirmado = await config.desbloquearAdultos();
                    if (confirmado) {
                        button.classList.add('selected');
                        toggleTema(tema, true);
                        modalManager.showSuccess(config.t('adultContentEnabled'));
                    }
                } else {
                    button.classList.remove('selected');
                    toggleTema(tema, false);
                    config.bloquearAdultos();
                    modalManager.showSuccess(config.t('adultContentDisabled'));
                }
            });
        } else {
            // Temas normales
            button.addEventListener('click', () => {
                button.classList.toggle('selected');
                const estaSeleccionado = button.classList.contains('selected');
                toggleTema(tema, estaSeleccionado);
            });
        }

        button.appendChild(icon);
        button.appendChild(span);
        grid.appendChild(button);
    });

    // Reinicializar iconos si los hubiera
    if (window.lucide) lucide.createIcons();
}

function toggleTema(tema, seleccionado) {
    if (seleccionado) {
        if (!config.temasSeleccionados.includes(tema)) {
            config.temasSeleccionados.push(tema);
        }
    } else {
        config.temasSeleccionados = config.temasSeleccionados.filter(t => t !== tema);
    }
    config.guardar();
    document.dispatchEvent(new CustomEvent('configAplicada'));
}

// Inicialización cuando el DOM está listo
document.addEventListener('DOMContentLoaded', () => {
    // Exponer gestores globales para los onclick en línea del HTML
    window.gestorJuego = gestorJuego;
    window.gestorJugadores = gestorJugadores;
    window.gestorMios = gestorMios;

    // Cargar configuración
    config.cargar();

    // Inicializar módulos
    initModals();
    initJugadores();
    initGame();
    initApp();
    router.init();

    // Mensaje de bienvenida en consola
    console.log('%c🕵️ Juego del Impostor', 'font-size: 24px; font-weight: bold; color: #6366f1;');
    console.log('%cDesarrollado con JavaScript Vanilla', 'font-size: 14px; color: #10b981;');
    console.log('%c¡Encuentra al impostor entre los jugadores!', 'font-size: 12px; color: #6b7280;');
});

// Prevenir zoom en iOS
document.addEventListener('gesturestart', function(e) {
    e.preventDefault();
});

// Prevenir pull-to-refresh
let touchStartY = 0;
document.addEventListener('touchstart', (e) => {
    touchStartY = e.touches[0].clientY;
}, { passive: false });

document.addEventListener('touchmove', (e) => {
    const touchY = e.touches[0].clientY;
    const touchDiff = touchY - touchStartY;

    if (touchDiff > 0 && window.scrollY === 0) {
        e.preventDefault();
    }
}, { passive: false });
