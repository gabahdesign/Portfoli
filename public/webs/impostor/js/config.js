/**
 * config.js - Configuración y traducciones
 * Gestiona idiomas, modo oscuro y configuración persistente
 */

// Traducciones
const traducciones = {
    es: {
        // Navegación
        navHome: 'Inicio',
        navPlayers: 'Jugadores',
        navConfig: 'Config',
        navGame: 'Juego',
        navVoting: 'Votación',
        navHistory: 'Resultados',
        navHelp: 'Ayuda',

        // Home
        homeTitle: 'EL JUEGO DEL IMPOSTOR',
        homeSubtitle: '¿Quién es el impostor?',
        newGame: 'Nueva Partida',
        onlineGame: 'Partida En Línea',
        enjoyingGame: '¿Te está gustando el juego?',
        inviteCoffee: 'Invítame a un café',
        supportDescription: 'El dinero se destinará exclusivamente a mantener los servidores y hacer que el juego siga siendo gratis',
        suggestion: '¿Alguna sugerencia?',
        talkToUs: '¡Hablemos!',
        support: 'Apoya este proyecto',

        // Jugadores
        playersTitle: 'Jugadores',
        playerNamePlaceholder: 'Nombre del jugador',
        addPlayer: 'Añadir',
        noPlayers: 'No hay jugadores aún',
        impostorCount: 'Número de impostores:',
        randomImpostors: 'Número aleatorio',
        startGame: 'Comenzar Juego',
        removePlayer: 'Eliminar',

        // Configuración
        configTitle: 'Ajustes',
        themesTitle: 'Temas',
        languageTitle: 'Idioma',
        appearanceTitle: 'Apariencia',
        darkMode: 'Modo Oscuro',
        gameSettingsTitle: 'Configuración del Juego',
        impostorSettingsTitle: 'Configuración de Impostor',
        hideThemeFromImpostor: 'Impostor sin pistas (no ve el tema)',
        legalTitle: 'Legal',
        privacyPolicy: 'Política de Privacidad',
        cookiesPolicy: 'Política de Cookies',
        legalNotice: 'Aviso Legal',

        // Ayuda
        helpTitle: 'Cómo Jugar',
        helpObjective: 'Objetivo del Juego',
        helpObjectiveText: 'Los civiles deben descubrir quién es el impostor mediante preguntas y deducciones. El impostor debe pasar desapercibido sin revelar que no conoce la palabra secreta.',
        helpSetup: 'Preparación',
        helpSetupStep1: 'Añade al menos 3 jugadores',
        helpSetupStep2: 'Selecciona el número de impostores (o activa aleatorio)',
        helpSetupStep3: 'Elige uno o más temas',
        helpSetupStep4: 'Pulsa "Comenzar Juego"',
        helpRevelation: 'Revelación de Roles',
        helpRevelationText: 'Cada jugador verá su rol en privado. Los civiles recibirán una palabra secreta y el tema. Los impostores solo verán que son impostores (y opcionalmente el tema).',
        helpGameplay: 'Desarrollo del Juego',
        helpGameplayText: 'Los jugadores hacen preguntas por turnos sobre la palabra. Los civiles intentan confirmar que otros conocen la palabra sin revelarla. Los impostores intentan deducir la palabra escuchando las respuestas.',
        helpVoting: 'Votación',
        helpVotingText: 'Cuando sospechen de alguien, pueden votar para eliminarlo. Se revela si era impostor o civil.',
        helpVictory: 'Victoria',
        helpVictoryImpostors: 'Impostores ganan: Si quedan igual o más impostores que civiles',
        helpVictoryCivilians: 'Civiles ganan: Si eliminan a todos los impostores',
        helpTips: 'Consejos',
        helpTip1: 'Como civil: Haz preguntas específicas sin revelar la palabra',
        helpTip2: 'Como impostor: Escucha atentamente y sé vago en tus respuestas',
        helpTip3: 'No reveles tu rol directamente, mantén el misterio',

        // Temas
        alimentacion: 'Alimentación',
        animales: 'Animales',
        lugares: 'Lugares del Mundo',
        objetos: 'Objetos Cotidianos',
        personas: 'Personas y Roles',
        ocio: 'Ocio y Cultura',
        deportes: 'Deportes',
        emociones: 'Emociones y Estados',
        acciones: 'Acciones',
        caracteristicas: 'Características',
        adultos: 'Adultos (+18)',

        // Juego
        gameSetupMessage: 'Configura los jugadores y presiona "Comenzar Juego"',
        turnOf: 'Turno de:',
        revealRole: 'Ver mi Rol',
        nextPlayer: 'Siguiente Jugador',
        discussPhase: '¡Fase de Discusión!',
        discussMessage: 'Todos conocen su rol. Discutan y descubran al impostor.',
        totalPlayers: 'Jugadores totales:',
        impostorsCount: 'Impostores:',
        newRound: 'Nueva Ronda',

        // Roles
        youAreCivilian: 'Eres CIVIL',
        youAreImpostor: '¡Eres IMPOSTOR!',
        theme: 'Tema:',
        word: 'Palabra:',
        noWordForImpostor: '¡Descubre la palabra secreta!',

        // Votación
        votingTitle: 'Votación',
        votingInstructions: 'Vota por quien creas que es el impostor',
        vote: 'Votar',
        eliminated: 'Eliminado',
        impostorsRemaining: 'Impostores restantes:',

        // Resultados
        wasImpostor: 'era IMPOSTOR',
        wasCivilian: 'era CIVIL',
        impostorsWin: '¡IMPOSTORES GANAN!',
        civilsWin: '¡CIVILES GANAN!',
        gameOver: 'Juego Terminado',

        // Historial/Resultados
        historyTitle: 'Resultados',
        currentRound: 'Ronda Actual',
        noGameActive: 'No hay partida activa',
        eliminatedPlayers: 'Jugadores Eliminados',
        eliminatedPlayer: 'Jugador Eliminado',
        wasRole: 'Era',
        noEliminated: 'Nadie ha sido eliminado aún',
        endGame: 'Acabar Partida',
        totalStats: 'Estadísticas Totales',
        resetStats: 'Reiniciar',
        wins: 'Victorias',
        deaths: 'Muertes',
        winRate: 'Ratio Victoria',
        noStatsYet: 'No hay estadísticas aún',

        // Resultados Finales
        finalResultsTitle: 'Resultados Finales',
        podium: 'Podio',
        position: 'Posición',
        backToHome: 'Volver al Inicio',

        // Validaciones
        minPlayersError: 'Se necesitan al menos 3 jugadores',
        selectThemeError: 'Selecciona al menos un tema',
        noImpostorsConfigError: 'Debes seleccionar un número de impostores o activar la opción de número aleatorio',
        allImpostorsError: 'No pueden ser todos impostores. Debe haber al menos un civil',
        allCiviliansError: 'No puede haber solo civiles. Debe haber al menos un impostor',
        playerNameEmpty: 'Introduce un nombre',
        playerExists: 'Este jugador ya existe',
        errorTitle: 'Error',
        successTitle: 'Éxito',
        okButton: 'Entendido',
        confirmTitle: 'Esta página dice',
        acceptButton: 'Aceptar',
        cancelButton: 'Cancelar',
        resetStatsConfirm: '¿Estás seguro de que quieres reiniciar todas las estadísticas? Esta acción no se puede deshacer.',
        resetStatsSuccess: 'Estadísticas reiniciadas correctamente.',

        // Revelación de roles
        swipeToReveal: 'Destapa tu rol',
        yourRole: 'Tu Rol',
        secretWord: 'La palabra es secreta',
        giveCluesWithout: 'Da pistas sin revelar ni la palabra ni el tema',
        cannotSayWord: 'No puedes decir la palabra que tienes como pista',

        // Mensajes
        preparing: 'Preparando partida...',
        shuffling: 'Mezclando jugadores...',
        assigningRoles: 'Asignando roles...',
        ready: '¡Listos para jugar!',

        // Control Parental +18
        adultContentTitle: 'Contenido para Adultos (+18)',
        adultContentWarning: 'Esta categoría contiene contenido explícito y sugerente para mayores de 18 años.',
        adultContentConfirm: '¿Confirmas que eres mayor de 18 años y deseas activar este contenido?',
        adultContentYes: 'Sí, soy mayor de 18',
        adultContentNo: 'No, cancelar',
        adultContentEnabled: 'Categoría +18 activada',
        adultContentDisabled: 'Categoría +18 desactivada',

        // Edit Player
        editPlayer: 'Editar',
        editPlayerPrompt: 'Introduce el nuevo nombre para el jugador:',

        // Custom Themes
        mios: 'Míos',
        addCustomWord: 'Añadir palabra',
        customThemesTitle: 'Mis Temas',
        noCustomWords: 'Aún no has añadido palabras personalizadas.',
        customWordPlaceholder: 'Nueva palabra...',

        // Legal Details (Privacy)
        legalPrivacy1: '1. Información General',
        legalPrivacy1Text: 'Esta aplicación web ("Juego del Impostor") respeta tu privacidad y se compromete a proteger cualquier información personal que puedas proporcionar.',
        legalPrivacy2: '2. Datos Recopilados',
        legalPrivacy2Text: 'Esta aplicación NO recopila, almacena ni transmite datos personales a servidores externos. Toda la información se almacena localmente en tu dispositivo mediante LocalStorage.',
        legalPrivacy3: '3. Almacenamiento Local',
        legalPrivacy3Text: 'La aplicación utiliza LocalStorage del navegador para guardar preferencias, temas y configuraciones. Estos datos permanecen en tu dispositivo.',
        legalPrivacy4: '4. Cookies',
        legalPrivacy4Text: 'Esta aplicación NO utiliza cookies de terceros ni de seguimiento. Solo almacenamiento local.',
        legalPrivacyUpdate: 'Última actualización: Diciembre 2024',

        // Legal Details (Cookies)
        legalCookies1: '1. ¿Qué son las cookies?',
        legalCookies1Text: 'Las cookies son pequeños archivos de texto que los sitios web almacenan en tu dispositivo para recordar información sobre tu visita.',
        legalCookies2: '2. Uso en esta Aplicación',
        legalCookies2Text: 'Esta aplicación NO utiliza cookies tradicionales, sino LocalStorage, una tecnología similar.',
        legalCookies3: '3. LocalStorage vs Cookies',
        legalCookies3Text: 'LocalStorage es diferente porque los datos nunca se envían al servidor y no tienen fecha de expiración.',

        // Legal Details (Notice)
        legalNotice1: '1. Información General',
        legalNotice1Text: 'Esta aplicación web es un proyecto de portfolio desarrollado con fines educativos y de entretenimiento.',
        legalNotice2: '2. Titularidad',
        legalNotice2Text: 'Esta aplicación es propiedad de su desarrollador.',
    },
    en: {
        // Navigation
        navHome: 'Home',
        navPlayers: 'Players',
        navConfig: 'Config',
        navGame: 'Game',
        navVoting: 'Voting',
        navHistory: 'Results',
        navHelp: 'Help',

        // Home
        homeTitle: 'THE IMPOSTOR GAME',
        homeSubtitle: 'Who is the impostor?',
        newGame: 'New Game',
        onlineGame: 'Online Game',
        enjoyingGame: 'Are you enjoying the game?',
        inviteCoffee: 'Buy me a coffee',
        supportDescription: 'The money will be used exclusively to maintain the servers and keep the game free',
        suggestion: 'Any suggestions?',
        talkToUs: 'Let\'s talk!',
        support: 'Support this project',

        // Players
        playersTitle: 'Players',
        playerNamePlaceholder: 'Player name',
        addPlayer: 'Add',
        noPlayers: 'No players yet',
        impostorCount: 'Number of impostors:',
        randomImpostors: 'Random number',
        startGame: 'Start Game',
        removePlayer: 'Remove',

        // Config
        configTitle: 'Settings',
        themesTitle: 'Themes',
        languageTitle: 'Language',
        appearanceTitle: 'Appearance',
        darkMode: 'Dark Mode',
        gameSettingsTitle: 'Game Settings',
        impostorSettingsTitle: 'Impostor Settings',
        hideThemeFromImpostor: 'Impostor without clues (doesn\'t see theme)',
        legalTitle: 'Legal',
        privacyPolicy: 'Privacy Policy',
        cookiesPolicy: 'Cookies Policy',
        legalNotice: 'Legal Notice',

        // Help
        helpTitle: 'How to Play',
        helpObjective: 'Game Objective',
        helpObjectiveText: 'Civilians must discover who the impostor is through questions and deductions. The impostor must go unnoticed without revealing they don\'t know the secret word.',
        helpSetup: 'Setup',
        helpSetupStep1: 'Add at least 3 players',
        helpSetupStep2: 'Select the number of impostors (or activate random)',
        helpSetupStep3: 'Choose one or more themes',
        helpSetupStep4: 'Press "Start Game"',
        helpRevelation: 'Role Revelation',
        helpRevelationText: 'Each player will see their role privately. Civilians will receive a secret word and theme. Impostors will only see they are impostors (and optionally the theme).',
        helpGameplay: 'Gameplay',
        helpGameplayText: 'Players take turns asking questions about the word. Civilians try to confirm others know the word without revealing it. Impostors try to deduce the word by listening to answers.',
        helpVoting: 'Voting',
        helpVotingText: 'When they suspect someone, they can vote to eliminate them. It reveals if they were impostor or civilian.',
        helpVictory: 'Victory',
        helpVictoryImpostors: 'Impostors win: If there are equal or more impostors than civilians',
        helpVictoryCivilians: 'Civilians win: If they eliminate all impostors',
        helpTips: 'Tips',
        helpTip1: 'As civilian: Ask specific questions without revealing the word',
        helpTip2: 'As impostor: Listen carefully and be vague in your answers',
        helpTip3: 'Don\'t reveal your role directly, keep the mystery',

        // Themes
        alimentacion: 'Food & Drinks',
        animales: 'Animals',
        lugares: 'World Places',
        objetos: 'Everyday Objects',
        personas: 'People & Roles',
        ocio: 'Leisure & Culture',
        deportes: 'Sports',
        emociones: 'Emotions & States',
        acciones: 'Actions',
        caracteristicas: 'Characteristics',
        adultos: 'Adults (+18)',

        // Game
        gameSetupMessage: 'Set up players and press "Start Game"',
        turnOf: 'Turn of:',
        revealRole: 'Reveal Role',
        nextPlayer: 'Next Player',
        discussPhase: 'Discussion Phase!',
        discussMessage: 'Everyone knows their role. Discuss and find the impostor.',
        totalPlayers: 'Total players:',
        impostorsCount: 'Impostors:',
        newRound: 'New Round',

        // Roles
        youAreCivilian: 'You are CIVILIAN',
        youAreImpostor: 'You are IMPOSTOR!',
        theme: 'Theme:',
        word: 'Word:',
        noWordForImpostor: 'Discover the secret word!',

        // Voting
        votingTitle: 'Voting',
        votingInstructions: 'Vote for who you think is the impostor',
        vote: 'Vote',
        eliminated: 'Eliminated',
        impostorsRemaining: 'Impostors remaining:',

        // Results
        wasImpostor: 'was IMPOSTOR',
        wasCivilian: 'was CIVILIAN',
        impostorsWin: 'IMPOSTORS WIN!',
        civilsWin: 'CIVILIANS WIN!',
        gameOver: 'Game Over',

        // History/Results
        historyTitle: 'Results',
        currentRound: 'Current Round',
        noGameActive: 'No active game',
        eliminatedPlayers: 'Eliminated Players',
        eliminatedPlayer: 'Eliminated Player',
        wasRole: 'Was',
        noEliminated: 'Nobody eliminated yet',
        endGame: 'End Game',
        totalStats: 'Total Statistics',
        resetStats: 'Reset',
        wins: 'Wins',
        deaths: 'Deaths',
        winRate: 'Win Rate',
        noStatsYet: 'No statistics yet',

        // Final Results
        finalResultsTitle: 'Final Results',
        podium: 'Podium',
        position: 'Position',
        backToHome: 'Back to Home',

        // Validations
        minPlayersError: 'At least 3 players needed',
        selectThemeError: 'Select at least one theme',
        noImpostorsConfigError: 'You must select a number of impostors or enable random number option',
        allImpostorsError: 'Not all players can be impostors. There must be at least one civilian',
        allCiviliansError: 'There cannot be only civilians. There must be at least one impostor',
        playerNameEmpty: 'Enter a name',
        playerExists: 'This player already exists',
        errorTitle: 'Error',
        successTitle: 'Success',
        okButton: 'Got it',
        confirmTitle: 'This page says',
        acceptButton: 'Accept',
        cancelButton: 'Cancel',
        resetStatsConfirm: 'Are you sure you want to reset all statistics? This action cannot be undone.',
        resetStatsSuccess: 'Statistics reset successfully.',

        // Role Revelation
        swipeToReveal: 'Reveal your role',
        yourRole: 'Your Role',
        secretWord: 'The word is secret',
        giveCluesWithout: 'Give clues without revealing the word or theme',
        cannotSayWord: 'You cannot say the word you have as a clue',

        // Messages
        preparing: 'Preparing game...',
        shuffling: 'Shuffling players...',
        assigningRoles: 'Assigning roles...',
        ready: 'Ready to play!',

        // Adult Content Control +18
        adultContentTitle: 'Adult Content (+18)',
        adultContentWarning: 'This category contains explicit and suggestive content for ages 18+.',
        adultContentConfirm: 'Do you confirm you are 18+ and wish to enable this content?',
        adultContentYes: 'Yes, I am 18+',
        adultContentNo: 'No, cancel',
        adultContentEnabled: '+18 Category enabled',
        adultContentDisabled: '+18 Category disabled',

        // Edit Player
        editPlayer: 'Edit',
        editPlayerPrompt: 'Enter the new name for the player:',

        // Custom Themes
        mios: 'My Words',
        addCustomWord: 'Add word',
        customThemesTitle: 'My Themes',
        noCustomWords: 'You haven\'t added any custom words yet.',
        customWordPlaceholder: 'New word...',

        // Legal Details (Privacy)
        legalPrivacy1: '1. General Information',
        legalPrivacy1Text: 'This web application ("Impostor Game") respects your privacy and is committed to protecting any personal information you may provide.',
        legalPrivacy2: '2. Data Collected',
        legalPrivacy2Text: 'This application DOES NOT collect, store or transmit personal data to external servers. All information is stored locally on your device via LocalStorage.',
        legalPrivacy3: '3. Local Storage',
        legalPrivacy3Text: 'The application uses browser LocalStorage to save preferences, themes and settings. This data remains on your device.',
        legalPrivacy4: '4. Cookies',
        legalPrivacy4Text: 'This application DOES NOT use third-party or tracking cookies. Only local storage.',
        legalPrivacyUpdate: 'Last update: December 2024',

        // Legal Details (Cookies)
        legalCookies1: '1. What are cookies?',
        legalCookies1Text: 'Cookies are small text files that websites store on your device to remember information about your visit.',
        legalCookies2: '2. Use in this Application',
        legalCookies2Text: 'This application DOES NOT use traditional cookies, but LocalStorage, a similar technology.',
        legalCookies3: '3. LocalStorage vs Cookies',
        legalCookies3Text: 'LocalStorage is different because data is never sent to the server and has no expiration date.',

        // Legal Details (Notice)
        legalNotice1: '1. General Information',
        legalNotice1Text: 'This web application is a portfolio project developed for educational and entertainment purposes.',
        legalNotice2: '2. Ownership',
        legalNotice2Text: 'This application is owned by its developer.',
    },
    ca: {
        // Navegació
        navHome: 'Inici',
        navPlayers: 'Jugadors',
        navConfig: 'Config',
        navGame: 'Joc',
        navVoting: 'Votació',
        navHistory: 'Resultats',
        navHelp: 'Ajuda',

        // Inici
        homeTitle: 'EL JOC DE L\'IMPOSTOR',
        homeSubtitle: 'Qui és l\'impostor?',
        newGame: 'Nova Partida',
        onlineGame: 'Partida En Línia',
        enjoyingGame: 'T\'està agradant el joc?',
        inviteCoffee: 'Convida\'m a un cafè',
        supportDescription: 'Els diners es destinaran exclusivament a mantenir els servidors i fer que el joc continuï sent gratis',
        suggestion: 'Alguna suggerència?',
        talkToUs: 'Parlem!',
        support: 'Recolza aquest projecte',

        // Jugadors
        playersTitle: 'Jugadors',
        playerNamePlaceholder: 'Nom del jugador',
        addPlayer: 'Afegir',
        noPlayers: 'Encara no hi ha jugadors',
        impostorCount: 'Nombre d\'impostors:',
        randomImpostors: 'Nombre aleatori',
        startGame: 'Començar Joc',
        removePlayer: 'Eliminar',

        // Configuració
        configTitle: 'Ajustos',
        themesTitle: 'Temes',
        languageTitle: 'Idioma',
        appearanceTitle: 'Aparença',
        darkMode: 'Mode Fosc',
        gameSettingsTitle: 'Configuració del Joc',
        impostorSettingsTitle: 'Configuració d\'Impostor',
        hideThemeFromImpostor: 'Impostor sense pistes (no veu el tema)',
        legalTitle: 'Legal',
        privacyPolicy: 'Política de Privacitat',
        cookiesPolicy: 'Política de Cookies',
        legalNotice: 'Avís Legal',

        // Ajuda
        helpTitle: 'Com Jugar',
        helpObjective: 'Objectiu del Joc',
        helpObjectiveText: 'Els civils han de descobrir qui és l\'impostor mitjançant preguntes i deduccions. L\'impostor ha de passar desapercebut sense revelar que no coneix la paraula secreta.',
        helpSetup: 'Preparació',
        helpSetupStep1: 'Afegeix almenys 3 jugadors',
        helpSetupStep2: 'Selecciona el nombre d\'impostors (o activa aleatori)',
        helpSetupStep3: 'Tria un o més temes',
        helpSetupStep4: 'Prem "Començar Joc"',
        helpRevelation: 'Revelació de Rols',
        helpRevelationText: 'Cada jugador veurà el seu rol en privat. Els civils rebran una paraula secreta i el tema. Els impostors només veuran que són impostors (i opcionalment el tema).',
        helpGameplay: 'Desenvolupament del Joc',
        helpGameplayText: 'Els jugadors fan preguntes per torns sobre la paraula. Els civils intenten confirmar que altres coneixen la paraula sense revelar-la. Els impostors intenten deduir la paraula escoltant les respostes.',
        helpVoting: 'Votació',
        helpVotingText: 'Quan sospiten d\'algú, poden votar per eliminar-lo. Es revela si era impostor o civil.',
        helpVictory: 'Victòria',
        helpVictoryImpostors: 'Impostors guanyen: Si queden igual o més impostors que civils',
        helpVictoryCivilians: 'Civils guanyen: Si eliminen tots els impostors',
        helpTips: 'Consells',
        helpTip1: 'Com a civil: Fes preguntes específiques sense revelar la paraula',
        helpTip2: 'Com a impostor: Escolta atentament i sigues vague en les teves respostes',
        helpTip3: 'No revelis el teu rol directament, mantén el misteri',

        // Temes
        alimentacion: 'Alimentació',
        animales: 'Animals',
        lugares: 'Llocs del Món',
        objetos: 'Objectes Quotidians',
        personas: 'Persones i Rols',
        ocio: 'Oci i Cultura',
        deportes: 'Esports',
        emociones: 'Emocions i Estats',
        acciones: 'Accions',
        caracteristicas: 'Característiques',
        adultos: 'Adults (+18)',

        // Joc
        gameSetupMessage: 'Configura els jugadors i prem "Començar Joc"',
        turnOf: 'Torn de:',
        revealRole: 'Veure el meu Rol',
        nextPlayer: 'Següent Jugador',
        discussPhase: 'Fase de Discussió!',
        discussMessage: 'Tothom coneix el seu rol. Discutiu i descobriu l\'impostor.',
        totalPlayers: 'Jugadors totals:',
        impostorsCount: 'Impostors:',
        newRound: 'Nova Ronda',

        // Rols
        youAreCivilian: 'Ets CIVIL',
        youAreImpostor: 'Ets IMPOSTOR!',
        theme: 'Tema:',
        word: 'Paraula:',
        noWordForImpostor: 'Descobreix la paraula secreta!',

        // Votació
        votingTitle: 'Votació',
        votingInstructions: 'Vota per qui creus que és l\'impostor',
        vote: 'Votar',
        eliminated: 'Eliminat',
        impostorsRemaining: 'Impostors restants:',

        // Resultats
        wasImpostor: 'era IMPOSTOR',
        wasCivilian: 'era CIVIL',
        impostorsWin: 'ELS IMPOSTORS GUANYEN!',
        civilsWin: 'ELS CIVILS GUANYEN!',
        gameOver: 'Joc Acabat',

        // Historial/Resultats
        historyTitle: 'Resultats',
        currentRound: 'Ronda Actual',
        noGameActive: 'No hi ha partida activa',
        eliminatedPlayers: 'Jugadors Eliminats',
        eliminatedPlayer: 'Jugador Eliminat',
        wasRole: 'Era',
        noEliminated: 'Ningú ha estat eliminat encara',
        endGame: 'Acabar Partida',
        totalStats: 'Estadístiques Totals',
        resetStats: 'Reiniciar',
        wins: 'Victòries',
        deaths: 'Morts',
        winRate: 'Ràtio Victòria',
        noStatsYet: 'No hi ha estadístiques encara',

        // Resultats Finals
        finalResultsTitle: 'Resultats Finals',
        podium: 'Podi',
        position: 'Posició',
        backToHome: 'Tornar a l\'Inici',

        // Validacions
        minPlayersError: 'Es necessiten almenys 3 jugadors',
        selectThemeError: 'Selecciona almenys un tema',
        noImpostorsConfigError: 'Has de seleccionar un nombre d\'impostors o activar l\'opció de nombre aleatori',
        allImpostorsError: 'No poden ser tots impostors. Ha d\'haver-hi almenys un civil',
        allCiviliansError: 'No pot haver-hi només civils. Ha d\'haver-hi almenys un impostor',
        playerNameEmpty: 'Introdueix un nom',
        playerExists: 'Aquest jugador ja existeix',
        errorTitle: 'Error',
        successTitle: 'Èxit',
        okButton: 'Entès',
        confirmTitle: 'Aquesta pàgina diu',
        acceptButton: 'Acceptar',
        cancelButton: 'Cancel·lar',
        resetStatsConfirm: 'Estàs segur que vols reiniciar totes les estadístiques? Aquesta acció no es pot desfer.',
        resetStatsSuccess: 'Estadístiques reiniciades correctament.',

        // Revelació de rols
        swipeToReveal: 'Destapa el teu rol',
        yourRole: 'El Teu Rol',
        secretWord: 'La paraula és secreta',
        giveCluesWithout: 'Dóna pistes sense revelar ni la paraula ni el tema',
        cannotSayWord: 'No pots dir la paraula que tens com a pista',

        // Missatges
        preparing: 'Preparant partida...',
        shuffling: 'Barrejant jugadors...',
        assigningRoles: 'Assignant rols...',
        ready: 'Llestos per jugar!',

        // Control Parental +18
        adultContentTitle: 'Contingut per a Adults (+18)',
        adultContentWarning: 'Aquesta categoria conté contingut explícit i suggerent per a majors de 18 anys.',
        adultContentConfirm: 'Confirmes que ets major de 18 anys i vols activar aquest contingut?',
        adultContentYes: 'Sí, sóc major de 18',
        adultContentNo: 'No, cancel·lar',
        adultContentEnabled: 'Categoria +18 activada',
        adultContentDisabled: 'Categoria +18 desactivada',

        // Edit Player
        editPlayer: 'Editar',
        editPlayerPrompt: 'Introdueix el nou nom per al jugador:',

        // Custom Themes
        mios: 'Meus',
        addCustomWord: 'Afegir paraula',
        customThemesTitle: 'Els meus Temes',
        noCustomWords: 'Encara no has afegit paraules personalitzades.',
        customWordPlaceholder: 'Nova paraula...',

        // Legal Details (Privacy)
        legalPrivacy1: '1. Informació General',
        legalPrivacy1Text: 'Aquesta aplicació web ("Joc de l\'Impostor") respecta la teva privacitat i es compromet a protegir qualsevol informació personal que puguis proporcionar.',
        legalPrivacy2: '2. Dades Recollides',
        legalPrivacy2Text: 'Aquesta aplicació NO recull, emmagatzema ni transmet dades personals a servidors externs. Tota la informació s\'emmagatzema localment al teu dispositiu mitjançant LocalStorage.',
        legalPrivacy3: '3. Emmagatzematge Local',
        legalPrivacy3Text: 'L\'aplicació utilitza LocalStorage del navegador per desar preferències, temes i configuracions. Aquestes dades romanen al teu dispositiu.',
        legalPrivacy4: '4. Cookies',
        legalPrivacy4Text: 'Aquesta aplicació NO utilitza cookies de tercers ni de seguiment. Només emmagatzematge local.',
        legalPrivacyUpdate: 'Última actualització: Desembre 2024',

        // Legal Details (Cookies)
        legalCookies1: '1. Què són les cookies?',
        legalCookies1Text: 'Les cookies són petits fitxers de text que els llocs web emmagatzemen al teu dispositiu per recordar informació sobre la teva visita.',
        legalCookies2: '2. Ús en aquesta Aplicació',
        legalCookies2Text: 'Aquesta aplicació NO utilitza cookies tradicionals, sinó LocalStorage, una tecnologia similar.',
        legalCookies3: '3. LocalStorage vs Cookies',
        legalCookies3Text: 'LocalStorage és diferent perquè les dades mai s\'envien al servidor i no tenen data d\'expiració.',

        // Legal Details (Notice)
        legalNotice1: '1. Informació General',
        legalNotice1Text: 'Aquesta aplicació web és un projecte de portfolio desenvolupat amb fins educatius i d\'entreteniment.',
        legalNotice2: '2. Titularitat',
        legalNotice2Text: 'Aquesta aplicació és propietat del seu desenvolupador.',
    }
};

const STORAGE_VERSION = 1;

// Configuración global
const config = {
    idioma: 'es',
    modoOscuro: false,
    temasSeleccionados: ['alimentacion', 'animales', 'lugares'],
    adultosBloqueado: true,
    sonidosActivos: true,
    ocultarTemaImpostor: false,
    pantallaActual: 'home',

    // Cargar configuración desde localStorage
    cargar() {
        const guardado = localStorage.getItem('impostor-config');
        if (guardado) {
            try {
                const datos = JSON.parse(guardado);
                if (datos.version !== STORAGE_VERSION) {
                    console.warn('Versión antigua de config. Actualizando a versión ' + STORAGE_VERSION);
                    this.guardar();
                } else {
                    this.idioma = datos.idioma || 'es';
                    this.modoOscuro = datos.modoOscuro || false;
                    this.temasSeleccionados = datos.temasSeleccionados || ['alimentacion', 'animales', 'lugares'];
                    this.adultosBloqueado = datos.adultosBloqueado !== false;
                    this.sonidosActivos = datos.sonidosActivos !== false;
                    this.ocultarTemaImpostor = datos.ocultarTemaImpostor || false;
                }
            } catch (error) {
                console.error('Error al cargar configuración:', error);
            }
        }
        this.aplicar();
    },

    // Guardar configuración en localStorage
    guardar() {
        const datos = {
            version: STORAGE_VERSION,
            idioma: this.idioma,
            modoOscuro: this.modoOscuro,
            temasSeleccionados: this.temasSeleccionados,
            adultosBloqueado: this.adultosBloqueado,
            sonidosActivos: this.sonidosActivos,
            ocultarTemaImpostor: this.ocultarTemaImpostor
        };
        localStorage.setItem('impostor-config', JSON.stringify(datos));
    },

    // Aplicar configuración actual
    aplicar() {
        // Aplicar modo oscuro (nuestra app es dark por defecto)
        if (this.modoOscuro) {
            document.body.classList.remove('light-mode');
        } else {
            document.body.classList.add('light-mode');
        }

        // Emitir un evento para que gestorJugadores actualice el botón si es necesario
        document.dispatchEvent(new CustomEvent('configAplicada'));
        
        // Reinicializar iconos de Lucide (para botones de borrar etc)
        if (window.lucide) lucide.createIcons();

        // Actualizar traducciones
        this.actualizarTraducciones();
    },

    // Cambiar idioma
    cambiarIdioma(nuevoIdioma) {
        if (traducciones[nuevoIdioma]) {
            this.idioma = nuevoIdioma;
            this.actualizarTraducciones();
            this.guardar();
            // Reinicializar iconos si es necesario tras cambio dinámico
            if (window.lucide) lucide.createIcons();
        }
    },

    // Alternar modo oscuro
    toggleModoOscuro() {
        this.modoOscuro = !this.modoOscuro;
        this.aplicar();
        this.guardar();
    },

    // Desbloquear contenido adulto (requiere confirmación)
    desbloquearAdultos() {
        return new Promise((resolve) => {
            // Mostrar modal de confirmación
            const modal = document.getElementById('adult-content-modal');
            const overlay = document.getElementById('modal-overlay');

            modal.classList.add('active');
            overlay.classList.add('active');

            // Actualizar textos del modal
            document.getElementById('adult-modal-title').textContent = this.t('adultContentTitle');
            document.getElementById('adult-modal-warning').textContent = this.t('adultContentWarning');
            document.getElementById('adult-modal-confirm').textContent = this.t('adultContentConfirm');
            document.getElementById('adult-modal-yes').textContent = this.t('adultContentYes');
            document.getElementById('adult-modal-no').textContent = this.t('adultContentNo');

            // Manejar respuesta
            const handleYes = () => {
                this.adultosBloqueado = false;
                this.guardar();
                cerrarModal();
                resolve(true);
            };

            const handleNo = () => {
                cerrarModal();
                resolve(false);
            };

            const cerrarModal = () => {
                modal.classList.remove('active');
                overlay.classList.remove('active');
                document.getElementById('adult-modal-yes').removeEventListener('click', handleYes);
                document.getElementById('adult-modal-no').removeEventListener('click', handleNo);
                overlay.removeEventListener('click', handleNo);
            };

            // Agregar listeners
            document.getElementById('adult-modal-yes').addEventListener('click', handleYes);
            document.getElementById('adult-modal-no').addEventListener('click', handleNo);
            overlay.addEventListener('click', handleNo);
        });
    },

    // Bloquear contenido adulto
    bloquearAdultos() {
        this.adultosBloqueado = true;
        // Remover tema adultos de seleccionados si está
        this.temasSeleccionados = this.temasSeleccionados.filter(t => t !== 'adultos');
        this.guardar();
    },

    // Actualizar temas seleccionados
    actualizarTemas(temas) {
        this.temasSeleccionados = temas;
        this.guardar();
    },

    // Obtener traducción
    t(clave) {
        return traducciones[this.idioma][clave] || clave;
    },

    // Actualizar todas las traducciones en el DOM
    actualizarTraducciones() {
        // Actualizar elementos con data-i18n
        document.querySelectorAll('[data-i18n]').forEach(elemento => {
            const clave = elemento.getAttribute('data-i18n');
            const traduccion = this.t(clave);
            elemento.textContent = traduccion;
        });

        // Actualizar placeholders
        document.querySelectorAll('[data-i18n-placeholder]').forEach(elemento => {
            const clave = elemento.getAttribute('data-i18n-placeholder');
            const traduccion = this.t(clave);
            elemento.placeholder = traduccion;
        });

        // Actualizar título (deshabilitado - elemento removido del header)
        // const titulos = {
        //     es: 'Juego del Impostor',
        //     en: 'Impostor Game',
        //     ca: 'Joc de l\'Impostor'
        // };
        // document.getElementById('app-title').textContent = titulos[this.idioma] || titulos.es;
    },

    // Obtener tema aleatorio de los seleccionados
    obtenerTemaAleatorio() {
        if (this.temasSeleccionados.length === 0) {
            return null;
        }
        const indice = Math.floor(Math.random() * this.temasSeleccionados.length);
        return this.temasSeleccionados[indice];
    },

    hayTemasSeleccionados() {
        return this.temasSeleccionados.length > 0;
    }
};

export { config, traducciones };
