/**
 * game.js - Lógica del juego
 * Gestiona estados, revelación de roles, votación y victoria
 */

import { config } from './config.js';
import { gestorJugadores } from './players.js';
import { modalManager } from './modal.js';
import { obtenerPalabraAleatoria } from './data.js';
import { router } from './router.js';

const gestorJuego = {
    estado: 'setup', // setup, revealing, playing, voting, ended
    indiceJugadorActual: 0,
    temaActual: null,
    palabraActual: null,
    jugadoresEliminados: [],

    // Iniciar nueva partida
    iniciar() {
        // Validaciones
        if (gestorJugadores.cantidad() < 3) {
            modalManager.showError(config.t('minPlayersError'));
            return;
        }

        if (!config.hayTemasSeleccionados()) {
            modalManager.showError(config.t('selectThemeError'));
            return;
        }

        // Validar configuración de impostores
        if (!gestorJugadores.numeroAleatorio && !gestorJugadores.numeroImpostores) {
            modalManager.showError(config.t('noImpostorsConfigError'));
            return;
        }

        // Validar que no todos sean impostores o civiles
        const totalJugadores = gestorJugadores.cantidad();
        const numImpostoresConfig = gestorJugadores.numeroAleatorio
            ? gestorJugadores.calcularMaxImpostores()
            : gestorJugadores.numeroImpostores;

        if (numImpostoresConfig >= totalJugadores) {
            modalManager.showError(config.t('allImpostorsError'));
            return;
        }

        if (numImpostoresConfig === 0) {
            modalManager.showError(config.t('allCiviliansError'));
            return;
        }

        // Preparar juego
        this.resetear();
        // NO barajamos los jugadores para mantener el orden de entrada
        const numImpostores = gestorJugadores.asignarRoles();

        // Seleccionar tema y palabra
        this.temaActual = config.obtenerTemaAleatorio();
        this.palabraActual = obtenerPalabraAleatoria(this.temaActual, config.idioma);

        // Cambiar a pantalla de juego y comenzar revelación
        router.cambiarPantalla('game');
        const navGame = document.querySelector('[data-screen="game"]');
        if (navGame) {
            router.actualizarNavActiva(navGame);
        }
        this.cambiarEstado('revealing');

        console.log('Juego iniciado:', {
            jugadores: gestorJugadores.cantidad(),
            impostores: numImpostores,
            tema: this.temaActual,
            palabra: this.palabraActual
        });
    },

    // Cambiar estado del juego
    cambiarEstado(nuevoEstado) {
        this.estado = nuevoEstado;
        this.actualizarUIEstado();
    },

    // Actualizar UI según estado
    actualizarUIEstado() {
        // Ocultar todos los estados
        document.getElementById('game-setup').style.display = 'none';
        document.getElementById('game-revealing').style.display = 'none';
        document.getElementById('game-playing').style.display = 'none';
        document.getElementById('game-ended').style.display = 'none';

        // Mostrar estado actual
        switch (this.estado) {
            case 'setup':
                document.getElementById('game-setup').style.display = 'block';
                break;
            case 'revealing':
                document.getElementById('game-revealing').style.display = 'block';
                this.mostrarTurnoJugador();
                break;
            case 'playing':
                document.getElementById('game-playing').style.display = 'block';
                this.actualizarInfoJuego();
                break;
            case 'ended':
                document.getElementById('game-ended').style.display = 'block';
                break;
        }
    },

    // Mostrar turno del jugador actual
    mostrarTurnoJugador() {
        const jugador = gestorJugadores.jugadores[this.indiceJugadorActual];

        const playerNameEl = document.getElementById('current-player-name');
        if (!playerNameEl) {
            console.error('current-player-name element not found');
            return;
        }
        playerNameEl.textContent = jugador.nombre;

        // Resetear estado de la tarjeta
        const swipeCard = document.getElementById('swipe-card');
        if (swipeCard) {
            swipeCard.style.transform = 'translateY(0)';
            swipeCard.classList.remove('grabbing', 'returning');
        } else {
            console.error('swipe-card not found in mostrarTurnoJugador');
        }

        // Ocultar botón de siguiente jugador - debe volver a deslizar
        const btnNextPlayer = document.getElementById('btn-next-player');
        if (btnNextPlayer) {
            btnNextPlayer.style.display = 'none';
        }

        // Preparar contenido del rol en la tarjeta de fondo
        this.prepararContenidoRol(jugador);

        // Configurar interacción táctil
        this.setupSwipeInteraction();
    },

    // Preparar el contenido del rol
    prepararContenidoRol(jugador) {
        const roleBg = document.getElementById('role-card-bg');
        const roleTypeDisplay = document.getElementById('role-type-display');
        const roleThemeDisplay = document.getElementById('role-theme-display');
        const roleWordDisplay = document.getElementById('role-word-display');

        if (jugador.esImpostor) {
            // IMPOSTOR
            roleBg.className = 'role-card-background impostor';
            roleTypeDisplay.textContent = config.t('youAreImpostor');

            if (config.ocultarTemaImpostor) {
                // Sin pista - solo mostrar que es impostor
                roleThemeDisplay.textContent = config.t('noWordForImpostor');
                roleWordDisplay.textContent = '';
                roleWordDisplay.style.display = 'none';
            } else {
                // Con pista - mostrar tema en el recuadro
                roleThemeDisplay.textContent = config.t('noWordForImpostor');
                roleWordDisplay.textContent = config.t(this.temaActual);
                roleWordDisplay.style.display = 'block';
            }
        } else {
            // CIVIL
            roleBg.className = 'role-card-background civilian';
            roleTypeDisplay.textContent = config.t('youAreCivilian');
            roleThemeDisplay.textContent = config.t(this.temaActual);
            roleWordDisplay.textContent = this.palabraActual;
            roleWordDisplay.style.display = 'block';
        }
    },

    // Configurar interacción de deslizamiento
    setupSwipeInteraction() {
        const swipeCard = document.getElementById('swipe-card');
        if (!swipeCard) {
            console.error('swipe-card element not found');
            return;
        }

        let startY = 0;
        let currentY = 0;
        let isDragging = false;
        let hasSwipedOnce = false;
        const MAX_SWIPE = -400; // Límite máximo de deslizamiento hacia arriba (aumentado)
        const SWIPE_THRESHOLD = -150; // Umbral para considerar que ha visto el rol

        const handleStart = (e) => {
            const card = document.getElementById('swipe-card');
            if (!card) return;

            isDragging = true;
            startY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;
            currentY = startY;
            card.classList.add('grabbing');
            card.classList.remove('returning');
        };

        const handleMove = (e) => {
            if (!isDragging) return;

            const card = document.getElementById('swipe-card');
            if (!card) return;

            e.preventDefault();
            currentY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;
            let deltaY = currentY - startY;

            // Solo permitir deslizar hacia arriba y limitar el máximo
            if (deltaY < 0) {
                deltaY = Math.max(deltaY, MAX_SWIPE);
                card.style.transform = `translateY(${deltaY}px)`;
            }
        };

        const handleEnd = () => {
            if (!isDragging) return;

            const card = document.getElementById('swipe-card');
            if (!card) return;

            isDragging = false;
            card.classList.remove('grabbing');
            card.classList.add('returning');

            const deltaY = currentY - startY;

            // Si deslizó lo suficiente, mostrar el botón de siguiente jugador
            if (!hasSwipedOnce && deltaY < SWIPE_THRESHOLD) {
                hasSwipedOnce = true;
                const btnNextPlayer = document.getElementById('btn-next-player');
                if (btnNextPlayer) {
                    btnNextPlayer.style.display = 'block';
                }
            }

            // SIEMPRE volver a la posición inicial con animación spring
            card.style.transform = 'translateY(0)';
        };

        // Remover event listeners previos si existen
        const clone = swipeCard.cloneNode(true);
        swipeCard.parentNode.replaceChild(clone, swipeCard);

        const newSwipeCard = document.getElementById('swipe-card');
        if (!newSwipeCard) {
            console.error('Could not get swipe-card after clone');
            return;
        }

        // Touch events
        newSwipeCard.addEventListener('touchstart', handleStart, { passive: false });
        newSwipeCard.addEventListener('touchmove', handleMove, { passive: false });
        newSwipeCard.addEventListener('touchend', handleEnd);

        // Mouse events
        newSwipeCard.addEventListener('mousedown', handleStart);

        // Usar una función nombrada para poder removerla después
        const mouseMoveHandler = (e) => handleMove(e);
        const mouseUpHandler = () => handleEnd();

        document.addEventListener('mousemove', mouseMoveHandler);
        document.addEventListener('mouseup', mouseUpHandler);

        // Guardar referencias para limpiar después
        newSwipeCard._mouseMoveHandler = mouseMoveHandler;
        newSwipeCard._mouseUpHandler = mouseUpHandler;
    },

    // Siguiente jugador
    siguienteJugador() {
        this.indiceJugadorActual++;

        if (this.indiceJugadorActual >= gestorJugadores.cantidad()) {
            // Todos los jugadores vieron su rol
            this.cambiarEstado('playing');
        } else {
            // Mostrar siguiente jugador
            this.mostrarTurnoJugador();
        }
    },

    // Actualizar información del juego
    actualizarInfoJuego() {
        const totalJugadores = gestorJugadores.obtenerActivos().length;
        const totalImpostores = gestorJugadores.obtenerImpostoresActivos().length;

        // Actualizar contador de impostores en la pantalla de juego
        const contadorGameElement = document.getElementById('impostors-remaining-count-game');
        if (contadorGameElement) {
            contadorGameElement.textContent = totalImpostores;
        }

        // Actualizar lista de votación en la pantalla de juego
        this.actualizarListaVotacion();
    },

    // Votar jugador
    votar(nombreJugador) {
        const jugador = gestorJugadores.jugadores.find(j => j.nombre === nombreJugador);

        if (!jugador || jugador.eliminado) {
            return;
        }

        // Eliminar jugador
        const eraImpostor = gestorJugadores.eliminarDelJuego(nombreJugador);

        // Añadir a historial
        this.jugadoresEliminados.push({
            nombre: nombreJugador,
            eraImpostor: eraImpostor
        });

        // Mostrar resultado de votación
        this.mostrarResultadoVoto(nombreJugador, eraImpostor);

        // Actualizar lista de votación inmediatamente
        this.actualizarListaVotacion();
        this.actualizarHistorial();

        // Después de 3 segundos, ocultar modal y verificar victoria
        setTimeout(() => {
            this.ocultarResultadoVoto();
            const victoria = gestorJugadores.verificarVictoria();

            if (victoria) {
                this.terminarJuego(victoria);
            }
        }, 3000);
    },

    // Mostrar resultado de voto
    mostrarResultadoVoto(nombre, eraImpostor) {
        const modal = document.getElementById('vote-result-modal');
        const card = document.getElementById('vote-result-card');
        const title = document.getElementById('vote-result-title');
        const message = document.getElementById('vote-result-message');

        // Actualizar nombre del jugador
        title.textContent = nombre;

        // Configurar según el rol
        if (eraImpostor) {
            message.textContent = config.t('wasImpostor');
            message.className = 'role-type impostor';
        } else {
            message.textContent = config.t('wasCivilian');
            message.className = 'role-type civilian';
        }

        // Mostrar modal con animación
        modal.style.display = 'flex';

        // Configurar swipe to dismiss
        this.setupVoteResultSwipe(card);

        // Auto-cerrar después de 3 segundos
        if (this._voteResultTimeout) {
            clearTimeout(this._voteResultTimeout);
        }
        this._voteResultTimeout = setTimeout(() => {
            this.ocultarResultadoVoto();
        }, 3000);
    },

    // Configurar swipe para cerrar modal de resultado
    setupVoteResultSwipe(card) {
        let startX = 0;
        let startY = 0;
        let currentX = 0;
        let currentY = 0;
        let isDragging = false;

        const handleStart = (e) => {
            isDragging = true;
            const touch = e.type === 'touchstart' ? e.touches[0] : e;
            startX = touch.clientX;
            startY = touch.clientY;
            currentX = startX;
            currentY = startY;
            card.style.transition = 'none';
        };

        const handleMove = (e) => {
            if (!isDragging) return;
            e.preventDefault();
            const touch = e.type === 'touchmove' ? e.touches[0] : e;
            currentX = touch.clientX;
            currentY = touch.clientY;

            const deltaX = currentX - startX;
            const deltaY = currentY - startY;

            card.style.transform = `translate(${deltaX}px, ${deltaY}px) rotate(${deltaX * 0.1}deg)`;
        };

        const handleEnd = () => {
            if (!isDragging) return;
            isDragging = false;

            const deltaX = currentX - startX;
            const deltaY = currentY - startY;
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

            // Si se deslizó más de 100px, cerrar
            if (distance > 100) {
                card.style.transition = 'transform 0.3s ease-out';
                card.style.transform = `translate(${deltaX * 3}px, ${deltaY * 3}px) rotate(${deltaX * 0.3}deg)`;
                setTimeout(() => {
                    this.ocultarResultadoVoto();
                    card.style.transform = '';
                }, 300);
            } else {
                // Volver a la posición original
                card.style.transition = 'transform 0.3s ease-out';
                card.style.transform = '';
            }
        };

        // Limpiar eventos anteriores clonando el elemento
        const newCard = card.cloneNode(true);
        card.parentNode.replaceChild(newCard, card);
        const finalCard = document.getElementById('vote-result-card');

        // Añadir eventos al nuevo elemento
        finalCard.addEventListener('touchstart', handleStart, { passive: false });
        finalCard.addEventListener('touchmove', handleMove, { passive: false });
        finalCard.addEventListener('touchend', handleEnd);
        finalCard.addEventListener('mousedown', handleStart);

        const mouseMoveHandler = (e) => handleMove(e);
        const mouseUpHandler = () => handleEnd();
        document.addEventListener('mousemove', mouseMoveHandler);
        document.addEventListener('mouseup', mouseUpHandler);
    },

    // Crear partículas decorativas
    crearParticulasVoto(color1, color2) {
        const container = document.getElementById('vote-particles');
        if (!container) return;

        // Limpiar partículas anteriores
        container.innerHTML = '';

        const colors = [color1, color2, '#6366f1', '#8b5cf6'];
        const particleCount = 30;

        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'vote-particle';

            // Posición aleatoria inicial
            const startX = Math.random() * 100;
            const startY = Math.random() * 100;

            // Dirección aleatoria
            const angle = Math.random() * Math.PI * 2;
            const distance = 100 + Math.random() * 200;
            const tx = Math.cos(angle) * distance;
            const ty = Math.sin(angle) * distance;

            particle.style.left = startX + '%';
            particle.style.top = startY + '%';
            particle.style.background = colors[Math.floor(Math.random() * colors.length)];
            particle.style.setProperty('--tx', tx + 'px');
            particle.style.setProperty('--ty', ty + 'px');
            particle.style.animationDelay = (Math.random() * 0.5) + 's';

            container.appendChild(particle);
        }
    },

    // Ocultar resultado de voto
    ocultarResultadoVoto() {
        document.getElementById('vote-result-modal').style.display = 'none';
    },

    // Actualizar lista de votación
    actualizarListaVotacion() {
        // Usar la lista de votación en la pantalla de juego
        const lista = document.getElementById('voting-list-game');
        if (!lista) return;

        const jugadoresActivos = gestorJugadores.obtenerActivos();

        // Actualizar contador de impostores restantes
        const impostoresRestantes = gestorJugadores.obtenerImpostoresActivos().length;
        const contadorElement = document.getElementById('impostors-remaining-count-game');
        if (contadorElement) {
            contadorElement.textContent = impostoresRestantes;
        }

        if (jugadoresActivos.length === 0) {
            lista.innerHTML = `<p class="empty-state">${config.t('noPlayers')}</p>`;
            return;
        }

        lista.innerHTML = '';
        gestorJugadores.jugadores.forEach(jugador => {
            const item = document.createElement('div');
            item.className = `vote-item ${jugador.eliminado ? 'eliminated' : ''}`;

            if (jugador.eliminado) {
                item.innerHTML = `
                    <div class="player-info">
                        <span class="player-name">${jugador.nombre}</span>
                    </div>
                    <span class="eliminated-badge">${config.t('eliminated')}</span>
                `;
            } else {
                item.innerHTML = `
                    <div class="player-info">
                        <span class="player-name">${jugador.nombre}</span>
                    </div>
                    <button class="btn btn-danger" onclick="gestorJuego.votar('${jugador.nombre}')">
                        ${config.t('vote')}
                    </button>
                `;
            }

            lista.appendChild(item);
        });

        // Reinicializar iconos
        if (window.lucide) lucide.createIcons();
    },

    // Terminar juego
    terminarJuego(ganador) {
        this.cambiarEstado('ended');

        const title = document.getElementById('victory-title');
        const icon = document.getElementById('victory-icon');
        const themeDisplay = document.getElementById('victory-theme');
        const wordDisplay = document.getElementById('victory-word');
        const playersLabel = document.getElementById('victory-players-label');
        const playersDisplay = document.getElementById('victory-players');

        // Obtener lista de impostores
        const impostores = gestorJugadores.jugadores
            .filter(j => j.esImpostor)
            .map(j => j.nombre)
            .join(', ');

        // Configurar título e icono según el ganador
        if (ganador === 'impostors') {
            title.textContent = config.t('impostorsWin');
            title.className = 'victory-title impostors-win';
            icon.style.color = 'var(--danger-color)';
            playersLabel.textContent = config.t('impostorsCount');
            playersDisplay.textContent = impostores;
        } else {
            title.textContent = config.t('civilsWin');
            title.className = 'victory-title civilians-win';
            icon.style.color = 'var(--success-color)';
            playersLabel.textContent = config.t('eliminatedPlayers');
            playersDisplay.textContent = impostores;
        }

        // Mostrar tema y palabra
        themeDisplay.textContent = config.t(this.temaActual);
        wordDisplay.textContent = this.palabraActual;

        // Registrar estadísticas de la partida
        gestorJugadores.registrarVictoria(ganador);
        gestorJugadores.actualizarPodiEstadisticas();

        // Cambiar a pantalla de juego para mostrar el mensaje de victoria
        router.cambiarPantalla('game');
        this.actualizarHistorial();

        // Activar efecto de confetti
        this.lanzarConfetti();
    },

    // Efecto de confetti
    lanzarConfetti() {
        const container = document.getElementById('confetti-container');
        if (!container) return;

        // Limpiar confetti anterior
        container.innerHTML = '';

        const colors = ['#ef4444', '#10b981', '#6366f1', '#f59e0b', '#ec4899', '#8b5cf6'];
        const confettiCount = 50;

        for (let i = 0; i < confettiCount; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.className = 'confetti';
                confetti.style.left = Math.random() * 100 + '%';
                confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
                confetti.style.animationDuration = (Math.random() * 3 + 2) + 's';
                confetti.style.animationDelay = '0s';

                // Formas aleatorias
                const shapes = ['square', 'circle', 'triangle'];
                const shape = shapes[Math.floor(Math.random() * shapes.length)];
                if (shape === 'circle') {
                    confetti.style.borderRadius = '50%';
                } else if (shape === 'triangle') {
                    confetti.style.width = '0';
                    confetti.style.height = '0';
                    confetti.style.borderLeft = '5px solid transparent';
                    confetti.style.borderRight = '5px solid transparent';
                    confetti.style.borderBottom = `10px solid ${confetti.style.background}`;
                    confetti.style.background = 'transparent';
                }

                container.appendChild(confetti);

                // Eliminar después de la animación
                setTimeout(() => {
                    confetti.remove();
                }, 5000);
            }, i * 100);
        }
    },

    // Actualizar historial
    actualizarHistorial() {
        const currentRoundData = document.getElementById('current-round-data');
        const eliminatedList = document.getElementById('eliminated-list');

        // Información de ronda actual
        if (this.estado === 'setup') {
            currentRoundData.innerHTML = `<p class="empty-state" data-i18n="noGameActive">${config.t('noGameActive')}</p>`;
        } else {
            const impostores = gestorJugadores.jugadores
                .filter(j => j.esImpostor)
                .map(j => j.nombre)
                .join(', ');

            currentRoundData.innerHTML = `
                <p><strong>${config.t('theme')}:</strong> ${config.t(this.temaActual)}</p>
                <p><strong>${config.t('word')}:</strong> ${this.palabraActual}</p>
                <p><strong>${config.t('totalPlayers')}:</strong> ${gestorJugadores.cantidad()}</p>
                <p><strong>${config.t('impostorsCount')}:</strong> ${impostores}</p>
            `;
        }

        // Jugadores eliminados
        if (this.jugadoresEliminados.length === 0) {
            eliminatedList.innerHTML = `<p class="empty-state" data-i18n="noEliminated">${config.t('noEliminated')}</p>`;
        } else {
            eliminatedList.innerHTML = '';
            this.jugadoresEliminados.forEach(eliminado => {
                const item = document.createElement('div');
                item.className = 'eliminated-item';
                const rol = eliminado.eraImpostor ? config.t('wasImpostor') : config.t('wasCivilian');
                item.innerHTML = `
                    <strong>${eliminado.nombre}</strong> - ${rol}
                `;
                eliminatedList.appendChild(item);
            });
        }
    },

    // Nueva ronda
    nuevaRonda() {
        // Resetear estado pero mantener jugadores
        this.estado = 'setup';
        this.indiceJugadorActual = 0;
        this.temaActual = null;
        this.palabraActual = null;
        this.jugadoresEliminados = [];

        // Resetear ronda de jugadores (mantiene la lista pero resetea estados)
        gestorJugadores.resetearRonda();

        // Iniciar directamente una nueva partida
        this.iniciar();
    },

    // Resetear juego
    resetear() {
        this.estado = 'setup';
        this.indiceJugadorActual = 0;
        this.temaActual = null;
        this.palabraActual = null;
        this.jugadoresEliminados = [];
        gestorJugadores.resetearRonda();
        this.actualizarUIEstado();
        this.actualizarHistorial();
    }
};

// Inicialización del juego
function initGame() {
    // Botón siguiente jugador
    document.getElementById('btn-next-player').addEventListener('click', () => {
        gestorJuego.siguienteJugador();
    });

    // Botón nueva ronda
    document.getElementById('btn-new-round').addEventListener('click', () => {
        gestorJuego.nuevaRonda();
    });

    // Inicializar historial
    gestorJuego.actualizarHistorial();
}

export { gestorJuego, initGame };
