/**
 * players.js - Gestión de jugadores
 * Maneja añadir, eliminar y configurar jugadores
 */

import { config } from './config.js';
import { gestorJuego } from './game.js';

const gestorJugadores = {
    jugadores: [],
    numeroImpostores: 1,
    numeroAleatorio: false,
    estadisticas: {}, // { nombreJugador: { victorias: 0, muertes: 0, partidasJugadas: 0 } }
    historicoNombres: [], // Nombres usados anteriormente

    // Añadir jugador
    añadir(nombre) {
        nombre = nombre.trim();

        // Validaciones
        if (nombre === '') {
            alert(config.t('playerNameEmpty'));
            return false;
        }

        if (this.existe(nombre)) {
            alert(config.t('playerExists'));
            return false;
        }

        this.jugadores.push({
            nombre: nombre,
            esImpostor: false,
            eliminado: false
        });

        // Guardar en histórico
        this.guardarEnHistorico(nombre);

        this.actualizarUI();
        this.actualizarSelectorImpostores();
        return true;
    },

    guardarEnHistorico(nombre) {
        if (!this.historicoNombres.includes(nombre)) {
            this.historicoNombres.push(nombre);
            localStorage.setItem('impostor-historico-nombres', JSON.stringify(this.historicoNombres));
            this.actualizarDatalist();
        }
    },

    cargarHistorico() {
        const guardado = localStorage.getItem('impostor-historico-nombres');
        if (guardado) {
            this.historicoNombres = JSON.parse(guardado);
            this.actualizarDatalist();
        }
    },

    actualizarDatalist() {
        const datalist = document.getElementById('player-names-suggestions');
        if (datalist) {
            datalist.innerHTML = '';
            this.historicoNombres.forEach(nombre => {
                const option = document.createElement('option');
                option.value = nombre;
                datalist.appendChild(option);
            });
        }
    },

    // Eliminar jugador
    eliminar(nombre) {
        this.jugadores = this.jugadores.filter(j => j.nombre !== nombre);
        this.actualizarUI();
        this.actualizarSelectorImpostores();
    },

    // Editar jugador (ahora inline)
    editarJugador(nombre, index) {
        const lista = document.getElementById('players-list');
        const items = lista.querySelectorAll('.player-item');
        const item = items[index];
        if (!item) return;

        const playerInfo = item.querySelector('.player-info');
        const playerNameSpan = item.querySelector('.player-name');
        const currentName = this.jugadores[index].nombre;

        // Crear input
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'edit-player-input';
        input.value = currentName;
        input.maxLength = 20;

        // Mantener el badge del número
        const badge = document.createElement('span');
        badge.className = 'player-number-badge';
        badge.textContent = index + 1;

        // Reemplazar contenido
        playerInfo.innerHTML = '';
        playerInfo.appendChild(badge);
        playerInfo.appendChild(input);

        // Ocultar acciones mientras edita
        const actions = item.querySelector('.player-actions');
        if (actions) actions.style.visibility = 'hidden';

        input.focus();
        input.select();

        // Manejar eventos del input
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.finalizarEdicion(index, input.value);
            } else if (e.key === 'Escape') {
                this.actualizarUI();
            }
        });

        input.addEventListener('blur', () => {
            this.finalizarEdicion(index, input.value);
        });
    },

    finalizarEdicion(index, nuevoNombre) {
        const limpio = nuevoNombre.trim();
        const antiguoNombre = this.jugadores[index].nombre;

        if (limpio === '') {
            this.actualizarUI();
            return;
        }

        if (limpio !== antiguoNombre && this.existe(limpio)) {
            alert(config.t('playerExists'));
            this.actualizarUI();
            return;
        }

        this.jugadores[index].nombre = limpio;
        this.actualizarUI();
    },

    // Verificar si jugador existe
    existe(nombre) {
        return this.jugadores.some(j => j.nombre.toLowerCase() === nombre.toLowerCase());
    },

    // Obtener número de jugadores
    cantidad() {
        return this.jugadores.length;
    },

    // Obtener jugadores activos (no eliminados)
    obtenerActivos() {
        return this.jugadores.filter(j => !j.eliminado);
    },

    // Obtener impostores activos
    obtenerImpostoresActivos() {
        return this.jugadores.filter(j => j.esImpostor && !j.eliminado);
    },

    // Obtener civiles activos
    obtenerCivilesActivos() {
        return this.jugadores.filter(j => !j.esImpostor && !j.eliminado);
    },

    // Barajar jugadores (algoritmo Fisher-Yates)
    barajar() {
        for (let i = this.jugadores.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.jugadores[i], this.jugadores[j]] = [this.jugadores[j], this.jugadores[i]];
        }
    },

    // Asignar roles (impostores y civiles)
    asignarRoles() {
        // Resetear roles
        this.jugadores.forEach(j => {
            j.esImpostor = false;
            j.eliminado = false;
        });

        // Determinar número de impostores
        let numImpostores = this.numeroImpostores;

        if (this.numeroAleatorio) {
            const max = this.calcularMaxImpostores();
            numImpostores = Math.floor(Math.random() * max) + 1;
        }

        // Asegurar que hay al menos 1 impostor y al menos 1 civil
        const totalJugadores = this.jugadores.length;
        if (numImpostores <= 0) {
            numImpostores = 1;
        }
        if (numImpostores >= totalJugadores) {
            numImpostores = totalJugadores - 1;
        }

        // Crear array con todos los índices disponibles
        const indicesDisponibles = Array.from({ length: this.jugadores.length }, (_, i) => i);

        // Barajar los índices usando Fisher-Yates
        for (let i = indicesDisponibles.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [indicesDisponibles[i], indicesDisponibles[j]] = [indicesDisponibles[j], indicesDisponibles[i]];
        }

        // Tomar los primeros N índices barajados como impostores
        for (let i = 0; i < numImpostores; i++) {
            this.jugadores[indicesDisponibles[i]].esImpostor = true;
        }

        return numImpostores;
    },

    // Calcular máximo de impostores según número de jugadores
    calcularMaxImpostores() {
        const total = this.cantidad();
        // Permitir hasta la mitad de jugadores como impostores (nunca más que civiles)
        // Con 3 jugadores: max 1 impostor (1 impostor, 2 civiles)
        // Con 4 jugadores: max 2 impostores (2 impostores, 2 civiles)
        // Con 5 jugadores: max 2 impostores (2 impostores, 3 civiles)
        // Con 6 jugadores: max 3 impostores (3 impostores, 3 civiles)
        return Math.floor(total / 2);
    },

    // Actualizar selector de número de impostores
    actualizarSelectorImpostores() {
        const selector = document.getElementById('impostor-count');
        const total = this.cantidad();
        const max = this.calcularMaxImpostores();

        // Limpiar opciones
        selector.innerHTML = '';

        if (total < 3) {
            const option = document.createElement('option');
            option.value = "0";
            option.textContent = "-";
            selector.appendChild(option);
            selector.disabled = true;
            this.numeroImpostores = 0;
        } else {
            selector.disabled = false;
            // Añadir opciones
            for (let i = 1; i <= max; i++) {
                const option = document.createElement('option');
                option.value = i;
                option.textContent = i;
                selector.appendChild(option);
            }
            
            // Valor por defecto para 3+ jugadores es 1
            if (this.numeroImpostores < 1) {
                this.numeroImpostores = 1;
            }
        }

        // Mantener selección si es válida
        if (this.numeroImpostores > max && total >= 3) {
            this.numeroImpostores = max;
        }
        
        selector.value = total < 3 ? "0" : this.numeroImpostores;
    },

    // Marcar jugador como eliminado
    eliminarDelJuego(nombre) {
        const jugador = this.jugadores.find(j => j.nombre === nombre);
        if (jugador) {
            jugador.eliminado = true;
            return jugador.esImpostor;
        }
        return false;
    },

    // Verificar condiciones de victoria
    verificarVictoria() {
        const impostoresActivos = this.obtenerImpostoresActivos().length;
        const civilesActivos = this.obtenerCivilesActivos().length;

        // Civiles ganan si eliminan a todos los impostores
        if (impostoresActivos === 0) {
            return 'civilians';
        }

        // Impostores ganan si hay igual o más impostores que civiles (tienen mayoría o igualdad)
        // O si solo quedan impostores
        if (civilesActivos === 0 || impostoresActivos >= civilesActivos) {
            return 'impostors';
        }

        return null; // Juego continúa
    },

    // Actualizar UI de lista de jugadores
    actualizarUI() {
        const lista = document.getElementById('players-list');

        if (this.jugadores.length === 0) {
            lista.innerHTML = `<p class="empty-state" data-i18n="noPlayers">${config.t('noPlayers')}</p>`;
            return;
        }

        lista.innerHTML = '';
        this.jugadores.forEach((jugador, index) => {
            const item = document.createElement('div');
            item.className = 'player-item';
            item.draggable = true;
            item.dataset.index = index;
            item.innerHTML = `
                <div class="drag-handle">☰</div>
                <div class="player-info">
                    <span class="player-name">
                        <span class="player-number-badge">${index + 1}</span>
                        ${jugador.nombre}
                    </span>
                </div>
                <div class="player-actions">
                    <button class="btn btn-secondary btn-icon-only btn-small" onclick="gestorJugadores.editarJugador('${jugador.nombre}', ${index})" title="${config.t('editPlayer')}">
                        <i data-lucide="edit-2"></i>
                    </button>
                    <button class="btn btn-danger btn-icon-only btn-small" onclick="gestorJugadores.eliminar('${jugador.nombre}')" title="${config.t('removePlayer')}">
                        <i data-lucide="trash-2"></i>
                    </button>
                </div>
            `;

            // Event listeners para drag & drop
            item.addEventListener('dragstart', (e) => this.handleDragStart(e));
            item.addEventListener('dragover', (e) => this.handleDragOver(e));
            item.addEventListener('drop', (e) => this.handleDrop(e));
            item.addEventListener('dragenter', (e) => this.handleDragEnter(e));
            item.addEventListener('dragleave', (e) => this.handleDragLeave(e));
            item.addEventListener('dragend', (e) => this.handleDragEnd(e));

            lista.appendChild(item);
        });

        // Habilitar/deshabilitar botón de inicio
        this.actualizarBotonInicio();

        // Reinicializar iconos de Lucide
        if (window.lucide) lucide.createIcons();
    },

    // Manejar inicio de arrastre
    handleDragStart(e) {
        e.target.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', e.target.dataset.index);
    },

    // Manejar arrastre sobre elemento
    handleDragOver(e) {
        if (e.preventDefault) {
            e.preventDefault();
        }
        e.dataTransfer.dropEffect = 'move';
        return false;
    },

    // Manejar entrada en zona de drop
    handleDragEnter(e) {
        if (e.target.classList.contains('player-item')) {
            e.target.classList.add('drag-over');
        }
    },

    // Manejar salida de zona de drop
    handleDragLeave(e) {
        if (e.target.classList.contains('player-item')) {
            e.target.classList.remove('drag-over');
        }
    },

    // Manejar drop
    handleDrop(e) {
        if (e.stopPropagation) {
            e.stopPropagation();
        }
        e.preventDefault();

        const draggedIndex = parseInt(e.dataTransfer.getData('text/plain'));
        const targetIndex = parseInt(e.target.closest('.player-item').dataset.index);

        if (draggedIndex !== targetIndex) {
            // Reordenar array de jugadores
            const draggedPlayer = this.jugadores[draggedIndex];
            this.jugadores.splice(draggedIndex, 1);
            this.jugadores.splice(targetIndex, 0, draggedPlayer);

            // Actualizar UI
            this.actualizarUI();
        }

        return false;
    },

    // Manejar fin de arrastre
    handleDragEnd(e) {
        const items = document.querySelectorAll('.player-item');
        items.forEach(item => {
            item.classList.remove('dragging', 'drag-over');
        });
    },

    // Actualizar estado del botón de inicio
    actualizarBotonInicio() {
        const boton = document.getElementById('btn-start-game');
        const puedeIniciar = this.cantidad() >= 3 && config.hayTemasSeleccionados();
        boton.disabled = !puedeIniciar;
    },

    // Limpiar todos los jugadores
    limpiar() {
        this.jugadores = [];
        this.actualizarUI();
    },

    // Resetear para nueva ronda
    resetearRonda() {
        this.jugadores.forEach(j => {
            j.esImpostor = false;
            j.eliminado = false;
        });
    },

    // Inicializar estadísticas de un jugador
    inicializarEstadisticas(nombre) {
        if (!this.estadisticas[nombre]) {
            this.estadisticas[nombre] = {
                victorias: 0,
                muertes: 0,
                partidasJugadas: 0
            };
        }
    },

    // Registrar victoria para un equipo
    registrarVictoria(ganador) {
        this.jugadores.forEach(jugador => {
            this.inicializarEstadisticas(jugador.nombre);
            this.estadisticas[jugador.nombre].partidasJugadas++;

            // Determinar si ganó
            const gano = (ganador === 'impostors' && jugador.esImpostor) ||
                         (ganador === 'civilians' && !jugador.esImpostor);

            if (gano) {
                this.estadisticas[jugador.nombre].victorias++;
            }

            // Registrar muerte si fue eliminado
            if (jugador.eliminado) {
                this.estadisticas[jugador.nombre].muertes++;
            }
        });

        // Guardar en localStorage
        this.guardarEstadisticas();
    },

    // Guardar estadísticas en localStorage
    guardarEstadisticas() {
        try {
            localStorage.setItem('impostor-estadisticas', JSON.stringify(this.estadisticas));
        } catch (e) {
            console.error('Error guardando estadísticas:', e);
        }
    },

    // Cargar estadísticas desde localStorage
    cargarEstadisticas() {
        try {
            const datos = localStorage.getItem('impostor-estadisticas');
            if (datos) {
                this.estadisticas = JSON.parse(datos);
            }
        } catch (e) {
            console.error('Error cargando estadísticas:', e);
            this.estadisticas = {};
        }
    },

    // Obtener ranking de jugadores
    obtenerRanking() {
        const jugadoresConEstadisticas = Object.keys(this.estadisticas)
            .map(nombre => {
                const stats = this.estadisticas[nombre];
                // Calcular puntuación: priorizar victorias, penalizar muertes
                // Fórmula: (victorias * 100) - (muertes * 20) + (partidasJugadas * 5)
                const puntuacion = (stats.victorias * 100) - (stats.muertes * 20) + (stats.partidasJugadas * 5);
                const ratioVictoria = stats.partidasJugadas > 0
                    ? ((stats.victorias / stats.partidasJugadas) * 100).toFixed(0)
                    : 0;

                return {
                    nombre: nombre,
                    victorias: stats.victorias,
                    muertes: stats.muertes,
                    partidasJugadas: stats.partidasJugadas,
                    puntuacion: puntuacion,
                    ratioVictoria: ratioVictoria
                };
            })
            .filter(j => j.partidasJugadas > 0) // Solo jugadores con partidas
            .sort((a, b) => b.puntuacion - a.puntuacion); // Ordenar por puntuación

        return jugadoresConEstadisticas;
    },

    // Actualizar UI del podio de estadísticas
    actualizarPodiEstadisticas() {
        const container = document.getElementById('stats-podium');
        if (!container) return;

        const ranking = this.obtenerRanking();

        if (ranking.length === 0) {
            container.innerHTML = `<p class="empty-state" data-i18n="noStatsYet">${config.t('noStatsYet')}</p>`;
            return;
        }

        container.innerHTML = '';

        // Crear lista de ranking
        const lista = document.createElement('div');
        lista.className = 'stats-ranking-list';

        ranking.forEach((jugador, index) => {
            const item = document.createElement('div');
            item.className = `stats-ranking-item ${index < 3 ? 'top-three' : ''}`;

            item.innerHTML = `
                <div class="ranking-position">${index + 1}º</div>
                <div class="ranking-player-info">
                    <div class="ranking-player-name">${jugador.nombre}</div>
                    <div class="ranking-stats-detail">
                        <span title="${config.t('wins')}">${config.t('wins')}: ${jugador.victorias}</span>
                        <span title="${config.t('deaths')}">${config.t('deaths')}: ${jugador.muertes}</span>
                        <span title="${config.t('winRate')}">${config.t('winRate')}: ${jugador.ratioVictoria}%</span>
                    </div>
                </div>
                <div class="ranking-score">${jugador.puntuacion} pts</div>
            `;

            lista.appendChild(item);
        });

        container.appendChild(lista);

        // Reinicializar iconos
        if (window.lucide) lucide.createIcons();
    }
};

// Inicialización de Jugadores
function initJugadores() {
    gestorJugadores.cargarHistorico();

    // Añadir jugador
    const inputNombre = document.getElementById('input-player-name');
    const btnAñadir = document.getElementById('btn-add-player');

    btnAñadir.addEventListener('click', () => {
        if (gestorJugadores.añadir(inputNombre.value)) {
            inputNombre.value = '';
            inputNombre.focus();
        }
    });

    // Añadir con Enter
    inputNombre.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            btnAñadir.click();
        }
    });

    // Selector de número de impostores
    const selectorImpostores = document.getElementById('impostor-count');
    selectorImpostores.addEventListener('change', (e) => {
        gestorJugadores.numeroImpostores = parseInt(e.target.value);
    });

    // Toggle número aleatorio
    const toggleAleatorio = document.getElementById('random-impostors');
    toggleAleatorio.addEventListener('change', (e) => {
        gestorJugadores.numeroAleatorio = e.target.checked;
    });

    // Botón iniciar juego
    const btnIniciar = document.getElementById('btn-start-game');
    btnIniciar.addEventListener('click', () => {
        if (gestorJugadores.cantidad() < 3) {
            alert(config.t('minPlayersError'));
            return;
        }

        if (!config.hayTemasSeleccionados()) {
            alert(config.t('selectThemeError'));
            return;
        }

        // Iniciar juego
        gestorJuego.iniciar();
    });

    // Listener para actualizar el botón de inicio cuando cambia la config
    document.addEventListener('configAplicada', () => {
        gestorJugadores.actualizarBotonInicio();
    });

    // Cargar estadísticas
    gestorJugadores.cargarEstadisticas();

    // Inicializar UI
    gestorJugadores.actualizarUI();
    gestorJugadores.actualizarPodiEstadisticas();
}

export { gestorJugadores, initJugadores };
