/**
 * data.js - Base de datos completa de temas y palabras
 * Sistema mejorado con subtemas organizados y categoría +18 con control parental
 */

const temasPalabras = {
    es: {
        alimentacion: [
            // Frutas
            'Manzana', 'Plátano', 'Naranja', 'Fresa', 'Uva', 'Sandía', 'Melón', 'Piña', 'Mango', 'Papaya',
            'Kiwi', 'Pera', 'Melocotón', 'Cereza', 'Frambuesa', 'Arándano', 'Mora', 'Limón', 'Lima', 'Pomelo',
            'Mandarina', 'Coco', 'Higo', 'Dátil', 'Ciruela', 'Albaricoque', 'Granada', 'Guayaba', 'Maracuyá', 'Lichi',
            // Verduras
            'Tomate', 'Lechuga', 'Zanahoria', 'Cebolla', 'Pepino', 'Pimiento', 'Calabacín', 'Berenjena', 'Brócoli', 'Coliflor',
            'Espinaca', 'Acelga', 'Apio', 'Rábano', 'Espárrago', 'Alcachofa', 'Remolacha', 'Nabo', 'Puerro', 'Col',
            // Platos principales
            'Pizza', 'Paella', 'Sushi', 'Tacos', 'Hamburguesa', 'Pasta', 'Lasaña', 'Risotto', 'Cuscús', 'Tortilla',
            'Empanada', 'Burrito', 'Quesadilla', 'Fajitas', 'Enchiladas', 'Cocido', 'Fabada', 'Gazpacho', 'Salmorejo', 'Croquetas',
            'Canelones', 'Ravioli', 'Gnocchi', 'Fideuá', 'Arroz con pollo', 'Pollo asado', 'Milanesa', 'Escalope', 'Albóndigas', 'Ramen',
            // Bebidas
            'Agua', 'Café', 'Té', 'Leche', 'Zumo', 'Refresco', 'Batido', 'Chocolate caliente', 'Horchata', 'Sangría',
            'Limonada', 'Smoothie', 'Cerveza', 'Vino', 'Champán', 'Sidra', 'Mojito', 'Margarita', 'Piña colada', 'Cola',
            // Dulces y postres
            'Tarta', 'Helado', 'Galletas', 'Pastel', 'Flan', 'Natillas', 'Mousse', 'Brownie', 'Magdalena', 'Donut',
            'Churros', 'Crêpe', 'Gofre', 'Panqueque', 'Tiramisú', 'Profiteroles', 'Éclair', 'Macarons', 'Bombones', 'Turrón',
            'Polvorón', 'Mantecado', 'Rosquilla', 'Cupcake', 'Muffin', 'Cheesecake', 'Strudel', 'Baklava', 'Soufflé', 'Merengue',
            // Ingredientes
            'Harina', 'Azúcar', 'Sal', 'Aceite', 'Vinagre', 'Miel', 'Mantequilla', 'Huevo', 'Queso', 'Jamón',
            'Arroz', 'Lentejas', 'Garbanzos', 'Frijoles', 'Pan', 'Yogur', 'Nata', 'Canela', 'Vainilla', 'Chocolate',
            // Comida rápida
            'Hot dog', 'Sándwich', 'Bocadillo', 'Nuggets', 'Patatas fritas', 'Kebab', 'Shawarma', 'Wrap', 'Panini', 'Pretzel'
        ],

        animales: [
            // Domésticos
            'Perro', 'Gato', 'Hamster', 'Conejo', 'Cobaya', 'Loro', 'Canario', 'Pez dorado', 'Tortuga', 'Iguana',
            'Caballo', 'Vaca', 'Cerdo', 'Oveja', 'Cabra', 'Gallina', 'Pato', 'Ganso', 'Pavo', 'Burro',
            // Salvajes
            'León', 'Tigre', 'Leopardo', 'Guepardo', 'Jaguar', 'Pantera', 'Puma', 'Lince', 'Lobo', 'Zorro',
            'Oso', 'Oso polar', 'Panda', 'Koala', 'Elefante', 'Rinoceronte', 'Hipopótamo', 'Jirafa', 'Cebra', 'Búfalo',
            'Gorila', 'Chimpancé', 'Orangután', 'Mono', 'Canguro', 'Koala', 'Camello', 'Dromedario', 'Llama', 'Alpaca',
            'Ciervo', 'Reno', 'Alce', 'Antílope', 'Gacela', 'Jabalí', 'Mapache', 'Tejón', 'Comadreja', 'Hurón',
            // Marinos
            'Delfín', 'Ballena', 'Orca', 'Tiburón', 'Mantarraya', 'Pez espada', 'Atún', 'Salmón', 'Trucha', 'Sardina',
            'Pulpo', 'Calamar', 'Sepia', 'Medusa', 'Estrella de mar', 'Erizo de mar', 'Cangrejo', 'Langosta', 'Gamba', 'Almeja',
            'Mejillón', 'Ostra', 'Caracol marino', 'Foca', 'León marino', 'Morsa', 'Manatí', 'Dugongo', 'Caballito de mar', 'Anguila',
            // Aves
            'Águila', 'Halcón', 'Búho', 'Lechuza', 'Gaviota', 'Pelícano', 'Flamenco', 'Cisne', 'Pingüino', 'Avestruz',
            'Pavo real', 'Tucán', 'Papagayo', 'Guacamayo', 'Colibrí', 'Gorrión', 'Paloma', 'Cuervo', 'Urraca', 'Petirrojo',
            'Golondrina', 'Vencejo', 'Ruiseñor', 'Jilguero', 'Mirlo', 'Pájaro carpintero', 'Cotorra', 'Cacatúa', 'Albatros', 'Cóndor',
            // Insectos
            'Abeja', 'Avispa', 'Hormiga', 'Mariposa', 'Polilla', 'Escarabajo', 'Mariquita', 'Libélula', 'Saltamontes', 'Grillo',
            'Cigarra', 'Mosca', 'Mosquito', 'Luciérnaga', 'Mantis religiosa', 'Cucaracha', 'Chinche', 'Pulga', 'Piojo', 'Garrapata',
            // Reptiles
            'Cocodrilo', 'Caimán', 'Serpiente', 'Víbora', 'Cobra', 'Pitón', 'Boa', 'Lagarto', 'Camaleón', 'Iguana',
            'Salamanquesa', 'Dragón de Komodo', 'Gecko', 'Tortuga', 'Galápago', 'Varano'
        ],

        lugares: [
            // Países
            'España', 'Francia', 'Italia', 'Alemania', 'Portugal', 'Grecia', 'Reino Unido', 'Irlanda', 'Suiza', 'Austria',
            'Holanda', 'Bélgica', 'Dinamarca', 'Suecia', 'Noruega', 'Finlandia', 'Rusia', 'Polonia', 'Chequia', 'Hungría',
            'Estados Unidos', 'Canadá', 'México', 'Brasil', 'Argentina', 'Chile', 'Perú', 'Colombia', 'Venezuela', 'Ecuador',
            'Japón', 'China', 'India', 'Tailandia', 'Vietnam', 'Corea', 'Australia', 'Nueva Zelanda', 'Egipto', 'Marruecos',
            // Ciudades famosas
            'Madrid', 'Barcelona', 'París', 'Londres', 'Roma', 'Berlín', 'Ámsterdam', 'Viena', 'Praga', 'Budapest',
            'Nueva York', 'Los Ángeles', 'Chicago', 'Miami', 'San Francisco', 'Toronto', 'Vancouver', 'Tokio', 'Pekín', 'Shanghái',
            'Dubái', 'Estambul', 'Moscú', 'San Petersburgo', 'Sídney', 'Melbourne', 'El Cairo', 'Marrakech', 'Río de Janeiro', 'Buenos Aires',
            // Regiones
            'Andalucía', 'Cataluña', 'Galicia', 'País Vasco', 'Valencia', 'Castilla', 'Asturias', 'Cantabria', 'Navarra', 'Aragón',
            'Toscana', 'Provenza', 'Baviera', 'Escocia', 'Gales', 'Normandía', 'Bretaña', 'Laponia', 'Siberia', 'Patagonia',
            // Ríos
            'Amazonas', 'Nilo', 'Misisipi', 'Yangtsé', 'Ganges', 'Danubio', 'Rin', 'Sena', 'Támesis', 'Tajo',
            'Ebro', 'Guadalquivir', 'Duero', 'Turia', 'Volga', 'Jordán', 'Colorado', 'Paraná', 'Congo', 'Mekong',
            // Montañas
            'Everest', 'K2', 'Kilimanjaro', 'Mont Blanc', 'Cervino', 'Aconcagua', 'Mulhacén', 'Aneto', 'Teide', 'Olimpo',
            'Fuji', 'Vesubio', 'Etna', 'Matterhorn', 'Denali', 'Elbrus', 'Monte Rosa', 'Jungfrau', 'Matterhorn', 'Cervino',
            // Islas
            'Cuba', 'Jamaica', 'Puerto Rico', 'Bahamas', 'Barbados', 'Mallorca', 'Ibiza', 'Menorca', 'Formentera', 'Canarias',
            'Tenerife', 'Gran Canaria', 'Lanzarote', 'Fuerteventura', 'Sicilia', 'Cerdeña', 'Creta', 'Chipre', 'Malta', 'Islandia',
            'Hawái', 'Fiji', 'Maldivas', 'Seychelles', 'Bali', 'Madagascar', 'Mauricio', 'Tahití', 'Bora Bora', 'Santorini',
            // Monumentos
            'Torre Eiffel', 'Coliseo', 'Taj Mahal', 'Sagrada Familia', 'Torre de Pisa', 'Big Ben', 'Estatua de la Libertad', 'Cristo Redentor', 'Alhambra', 'Acrópolis',
            'Partenón', 'Pirámides', 'Gran Muralla', 'Machu Picchu', 'Petra', 'Stonehenge', 'Arco de Triunfo', 'Puente Golden Gate', 'Ópera de Sídney', 'Burj Khalifa'
        ],

        objetos: [
            // Hogar
            'Mesa', 'Silla', 'Sofá', 'Cama', 'Armario', 'Estantería', 'Lámpara', 'Espejo', 'Cuadro', 'Reloj',
            'Televisor', 'Nevera', 'Lavadora', 'Horno', 'Microondas', 'Tostadora', 'Cafetera', 'Batidora', 'Aspiradora', 'Plancha',
            'Almohada', 'Manta', 'Sábana', 'Colchón', 'Cortina', 'Alfombra', 'Cojín', 'Jarrón', 'Maceta', 'Vela',
            'Cenicero', 'Percha', 'Cesta', 'Cubo', 'Escoba', 'Fregona', 'Recogedor', 'Bayeta', 'Estropajo', 'Detergente',
            // Tecnología
            'Ordenador', 'Portátil', 'Tablet', 'Móvil', 'Ratón', 'Teclado', 'Pantalla', 'Altavoz', 'Auriculares', 'Micrófono',
            'Cámara', 'Impresora', 'Escáner', 'Router', 'USB', 'Disco duro', 'Cable', 'Cargador', 'Batería', 'Webcam',
            'Smartwatch', 'Ebook', 'Consola', 'Mando', 'Cascos VR', 'Dron', 'Powerbank', 'Adaptador', 'Hub USB', 'Pendrive',
            // Escuela
            'Mochila', 'Lápiz', 'Bolígrafo', 'Rotulador', 'Goma', 'Sacapuntas', 'Regla', 'Compás', 'Tijeras', 'Pegamento',
            'Cuaderno', 'Libro', 'Carpeta', 'Archivador', 'Estuche', 'Pizarra', 'Tiza', 'Borrador', 'Calculadora', 'Diccionario',
            'Atlas', 'Globo terráqueo', 'Mapa', 'Plastilina', 'Pintura', 'Pincel', 'Acuarela', 'Ceras', 'Tippex', 'Clips',
            // Trabajo
            'Ordenador', 'Teléfono', 'Agenda', 'Calendario', 'Notas adhesivas', 'Grapadora', 'Perforadora', 'Sello', 'Bandeja', 'Papelera',
            'Archivador', 'Carpeta', 'Portafolios', 'Maletín', 'Escritorio', 'Silla ergonómica', 'Lámpara de mesa', 'Monitor', 'Proyector', 'Puntero láser',
            // Herramientas
            'Martillo', 'Destornillador', 'Alicates', 'Llave inglesa', 'Sierra', 'Taladro', 'Nivel', 'Metro', 'Tornillo', 'Clavo',
            'Lija', 'Brocha', 'Rodillo', 'Espátula', 'Cincel', 'Lima', 'Berbiquí', 'Tenazas', 'Soldador', 'Pistola de silicona'
        ],

        personas: [
            // Profesiones
            'Médico', 'Enfermero', 'Dentista', 'Cirujano', 'Veterinario', 'Farmacéutico', 'Fisioterapeuta', 'Psicólogo', 'Psiquiatra', 'Pediatra',
            'Profesor', 'Maestro', 'Director', 'Orientador', 'Pedagogo', 'Educador', 'Tutor', 'Catedrático', 'Rector', 'Decano',
            'Ingeniero', 'Arquitecto', 'Programador', 'Diseñador', 'Electricista', 'Fontanero', 'Carpintero', 'Albañil', 'Pintor', 'Mecánico',
            'Abogado', 'Juez', 'Fiscal', 'Notario', 'Secretario', 'Registrador', 'Procurador', 'Letrado', 'Magistrado', 'Defensor',
            'Policía', 'Bombero', 'Guardia', 'Militar', 'Soldado', 'Capitán', 'Teniente', 'Sargento', 'Cabo', 'General',
            'Chef', 'Cocinero', 'Camarero', 'Barman', 'Sommelier', 'Repostero', 'Pastelero', 'Panadero', 'Carnicero', 'Pescadero',
            'Actor', 'Cantante', 'Músico', 'Bailarín', 'Compositor', 'Director de cine', 'Productor', 'Guionista', 'Fotógrafo', 'Cámara',
            'Periodista', 'Reportero', 'Presentador', 'Locutor', 'Editor', 'Redactor', 'Columnista', 'Crítico', 'Corresponsal', 'Cronista',
            'Piloto', 'Azafata', 'Controlador aéreo', 'Taxista', 'Conductor', 'Camionero', 'Capitán de barco', 'Marinero', 'Maquinista', 'Revisor',
            'Agricultor', 'Ganadero', 'Pastor', 'Jardinero', 'Florista', 'Veterinario', 'Apicultor', 'Viticultor', 'Pescador', 'Granjero',
            // Roles sociales
            'Padre', 'Madre', 'Hijo', 'Hija', 'Hermano', 'Hermana', 'Abuelo', 'Abuela', 'Nieto', 'Nieta',
            'Tío', 'Tía', 'Primo', 'Prima', 'Sobrino', 'Sobrina', 'Suegro', 'Suegra', 'Yerno', 'Nuera',
            'Marido', 'Esposa', 'Novio', 'Novia', 'Prometido', 'Pareja', 'Amigo', 'Amiga', 'Compañero', 'Vecino',
            'Jefe', 'Empleado', 'Socio', 'Cliente', 'Proveedor', 'Competidor', 'Colaborador', 'Asesor', 'Consultor', 'Mentor',
            // Tipos de personas
            'Bebé', 'Niño', 'Adolescente', 'Joven', 'Adulto', 'Anciano', 'Centenario', 'Gemelo', 'Trillizo', 'Huérfano',
            'Viudo', 'Divorciado', 'Soltero', 'Casado', 'Estudiante', 'Jubilado', 'Desempleado', 'Emprendedor', 'Voluntario', 'Activista'
        ],

        ocio: [
            // Películas famosas
            'Titanic', 'Avatar', 'Star Wars', 'Harry Potter', 'El Señor de los Anillos', 'Matrix', 'Inception', 'Gladiador', 'Forrest Gump', 'Pulp Fiction',
            'El Padrino', 'Casablanca', 'Ciudadano Kane', 'Lo que el viento se llevó', 'Psicosis', 'Tiburón', 'Alien', 'Blade Runner', 'Rocky', 'Rambo',
            'Indiana Jones', 'Regreso al Futuro', 'Jurassic Park', 'Terminator', 'Depredador', 'RoboCop', 'Die Hard', 'Lethal Weapon', 'Los Cazafantasmas', 'Gremlins',
            'E.T.', 'Superman', 'Batman', 'Spider-Man', 'Iron Man', 'Los Vengadores', 'Capitán América', 'Thor', 'Hulk', 'X-Men',
            // Series
            'Friends', 'Breaking Bad', 'Game of Thrones', 'The Office', 'Stranger Things', 'The Crown', 'Lost', 'Prison Break', 'Dexter', 'House',
            'Sherlock', 'Doctor Who', 'Black Mirror', 'The Mandalorian', 'The Witcher', 'Vikings', 'Peaky Blinders', 'Narcos', 'La Casa de Papel', 'Élite',
            // Géneros musicales
            'Rock', 'Pop', 'Jazz', 'Blues', 'Reggae', 'Salsa', 'Merengue', 'Bachata', 'Tango', 'Flamenco',
            'Hip Hop', 'Rap', 'Trap', 'Reggaeton', 'Electrónica', 'Techno', 'House', 'Dubstep', 'Drum and Bass', 'Trance',
            'Metal', 'Heavy Metal', 'Death Metal', 'Black Metal', 'Punk', 'Grunge', 'Indie', 'Folk', 'Country', 'Soul',
            // Videojuegos
            'Minecraft', 'Fortnite', 'Call of Duty', 'FIFA', 'GTA', 'Mario', 'Zelda', 'Pokémon', 'Sonic', 'Pac-Man',
            'Tetris', 'Counter-Strike', 'League of Legends', 'Dota', 'Overwatch', 'Valorant', 'Among Us', 'Fall Guys', 'Roblox', 'Clash Royale',
            'Candy Crush', 'Angry Birds', 'Temple Run', 'Subway Surfers', 'The Sims', 'Age of Empires', 'StarCraft', 'Warcraft', 'Diablo', 'Final Fantasy',
            // Juegos de mesa
            'Monopoly', 'Parchís', 'Oca', 'Ajedrez', 'Damas', 'Dominó', 'Scrabble', 'Trivial', 'Cluedo', 'Risk',
            'Catan', 'Carcassonne', 'Ticket to Ride', 'Pandemic', 'Dixit', 'Dobble', 'Uno', 'Jungle Speed', 'Jenga', 'Mikado',
            // Actividades de ocio
            'Leer', 'Pintar', 'Dibujar', 'Escribir', 'Bailar', 'Cantar', 'Tocar música', 'Cocinar', 'Jardinería', 'Fotografía',
            'Videojuegos', 'Ver series', 'Ir al cine', 'Teatro', 'Conciertos', 'Viajar', 'Senderismo', 'Camping', 'Pesca', 'Caza'
        ],

        deportes: [
            // Deportes de equipo
            'Fútbol', 'Baloncesto', 'Voleibol', 'Balonmano', 'Rugby', 'Hockey', 'Béisbol', 'Waterpolo', 'Fútbol americano', 'Cricket',
            'Polo', 'Lacrosse', 'Softball', 'Fútbol sala', 'Baloncesto 3x3', 'Voleibol playa', 'Hockey hierba', 'Hockey hielo', 'Curling', 'Balonkorf',
            // Deportes individuales
            'Tenis', 'Golf', 'Atletismo', 'Natación', 'Ciclismo', 'Gimnasia', 'Boxeo', 'Judo', 'Karate', 'Taekwondo',
            'Esgrima', 'Tiro con arco', 'Tiro', 'Equitación', 'Pentatlón', 'Triatlón', 'Decatlón', 'Halterofilia', 'Lucha', 'Escalada',
            'Esquí', 'Snowboard', 'Patinaje', 'Skateboard', 'BMX', 'Parkour', 'CrossFit', 'Calistenia', 'Culturismo', 'Fitness',
            // Deportes acuáticos
            'Natación', 'Waterpolo', 'Natación sincronizada', 'Saltos', 'Surf', 'Windsurf', 'Kitesurf', 'Paddle surf', 'Vela', 'Remo',
            'Piragüismo', 'Kayak', 'Rafting', 'Buceo', 'Apnea', 'Esquí acuático', 'Wakeboard', 'Bodyboard', 'Motonáutica', 'Pesca deportiva',
            // Ejercicios
            'Flexiones', 'Abdominales', 'Sentadillas', 'Dominadas', 'Fondos', 'Burpees', 'Zancadas', 'Plancha', 'Jumping jacks', 'Mountain climbers',
            'Yoga', 'Pilates', 'Stretching', 'Cardio', 'Running', 'Footing', 'Sprint', 'Maratón', 'Spinning', 'Aeróbic'
        ],

        emociones: [
            // Emociones básicas
            'Alegría', 'Tristeza', 'Miedo', 'Ira', 'Sorpresa', 'Asco', 'Amor', 'Odio', 'Envidia', 'Celos',
            'Vergüenza', 'Culpa', 'Orgullo', 'Gratitud', 'Admiración', 'Desprecio', 'Satisfacción', 'Decepción', 'Frustración', 'Ansiedad',
            // Estados de ánimo
            'Feliz', 'Triste', 'Enfadado', 'Asustado', 'Nervioso', 'Tranquilo', 'Relajado', 'Estresado', 'Cansado', 'Animado',
            'Deprimido', 'Eufórico', 'Melancólico', 'Nostálgico', 'Optimista', 'Pesimista', 'Confuso', 'Seguro', 'Inseguro', 'Motivado',
            'Aburrido', 'Entusiasmado', 'Apático', 'Esperanzado', 'Desesperado', 'Sereno', 'Agitado', 'Impaciente', 'Paciente', 'Curioso',
            // Sensaciones físicas
            'Hambre', 'Sed', 'Sueño', 'Dolor', 'Picor', 'Cosquillas', 'Frío', 'Calor', 'Mareo', 'Náusea',
            'Debilidad', 'Fuerza', 'Cansancio', 'Energía', 'Pesadez', 'Ligereza', 'Tensión', 'Relajación', 'Hormigueo', 'Entumecimiento'
        ],

        acciones: [
            // Acciones cotidianas
            'Comer', 'Beber', 'Dormir', 'Despertar', 'Ducharse', 'Vestirse', 'Peinarse', 'Lavarse', 'Cepillarse', 'Afeitarse',
            'Cocinar', 'Limpiar', 'Ordenar', 'Barrer', 'Fregar', 'Planchar', 'Lavar', 'Tender', 'Doblar', 'Guardar',
            'Comprar', 'Vender', 'Pagar', 'Cobrar', 'Regalar', 'Recibir', 'Dar', 'Tomar', 'Dejar', 'Poner',
            'Abrir', 'Cerrar', 'Encender', 'Apagar', 'Subir', 'Bajar', 'Entrar', 'Salir', 'Llegar', 'Irse',
            // Acciones de comunicación
            'Hablar', 'Escuchar', 'Gritar', 'Susurrar', 'Callar', 'Preguntar', 'Responder', 'Contar', 'Explicar', 'Describir',
            'Narrar', 'Relatar', 'Comentar', 'Opinar', 'Discutir', 'Debatir', 'Argumentar', 'Convencer', 'Persuadir', 'Negociar',
            'Llamar', 'Contestar', 'Colgar', 'Enviar', 'Recibir', 'Leer', 'Escribir', 'Firmar', 'Publicar', 'Compartir',
            // Acciones de movimiento
            'Caminar', 'Correr', 'Saltar', 'Brincar', 'Trepar', 'Escalar', 'Nadar', 'Bucear', 'Volar', 'Planear',
            'Arrastrarse', 'Gatear', 'Rodar', 'Girar', 'Dar vueltas', 'Balancearse', 'Tambalearse', 'Tropezar', 'Caerse', 'Levantarse',
            'Sentarse', 'Acostarse', 'Tumbarse', 'Agacharse', 'Inclinarse', 'Estirarse', 'Encogerse', 'Doblarse', 'Retorcerse', 'Contorsionarse'
        ],

        caracteristicas: [
            // Cualidades positivas
            'Amable', 'Generoso', 'Honesto', 'Leal', 'Sincero', 'Valiente', 'Inteligente', 'Creativo', 'Divertido', 'Simpático',
            'Cariñoso', 'Afectuoso', 'Comprensivo', 'Paciente', 'Tolerante', 'Respetuoso', 'Educado', 'Cortés', 'Atento', 'Servicial',
            'Trabajador', 'Responsable', 'Puntual', 'Organizado', 'Eficiente', 'Productivo', 'Ambicioso', 'Perseverante', 'Constante', 'Tenaz',
            'Optimista', 'Alegre', 'Positivo', 'Entusiasta', 'Apasionado', 'Motivado', 'Inspirador', 'Carismático', 'Encantador', 'Elegante',
            // Cualidades negativas
            'Egoísta', 'Avaro', 'Mezquino', 'Tacaño', 'Envidioso', 'Celoso', 'Rencoroso', 'Vengativo', 'Cruel', 'Malvado',
            'Mentiroso', 'Tramposo', 'Deshonesto', 'Falso', 'Hipócrita', 'Traidor', 'Cobarde', 'Miedoso', 'Tímido', 'Inseguro',
            'Arrogante', 'Soberbio', 'Orgulloso', 'Vanidoso', 'Presumido', 'Prepotente', 'Autoritario', 'Mandón', 'Dominante', 'Controlador',
            'Perezoso', 'Vago', 'Holgazán', 'Irresponsable', 'Descuidado', 'Desordenado', 'Caótico', 'Impuntual', 'Lento', 'Torpe',
            // Formas físicas
            'Alto', 'Bajo', 'Grande', 'Pequeño', 'Gordo', 'Delgado', 'Fuerte', 'Débil', 'Musculoso', 'Atlético',
            'Redondo', 'Cuadrado', 'Triangular', 'Rectangular', 'Ovalado', 'Alargado', 'Ancho', 'Estrecho', 'Grueso', 'Fino',
            // Estados temporales
            'Mojado', 'Seco', 'Limpio', 'Sucio', 'Nuevo', 'Viejo', 'Roto', 'Entero', 'Lleno', 'Vacío',
            'Caliente', 'Frío', 'Templado', 'Helado', 'Congelado', 'Descongelado', 'Cocido', 'Crudo', 'Quemado', 'Tostado'
        ],

        adultos: [
            // Temas adultos - REQUIERE ACTIVACIÓN +18
            'Kamasutra', 'Lencería', 'Striptease', 'Pole dance', 'Lapdance', 'Masaje erótico', 'Tantra', 'Fetiche', 'BDSM', 'Dominación',
            'Sumisión', 'Voyeur', 'Exhibicionismo', 'Swing', 'Trío', 'Orgía', 'Club liberal', 'Role play', 'Fantasía sexual', 'Juguete erótico',
            // Humor picante
            'Preliminares', 'Caricias', 'Besos apasionados', 'Susurros', 'Gemidos', 'Seducción', 'Coqueteo', 'Insinuación', 'Provocación', 'Tentación',
            'Deseo', 'Pasión', 'Lujuria', 'Atracción', 'Química', 'Tensión sexual', 'Miradas', 'Roce', 'Excitación', 'Placer',
            // Referencias sugerentes
            'One night stand', 'Amigos con derecho', 'Ligue', 'Rollo', 'Aventura', 'Affaire', 'Romance', 'Cita romántica', 'Noche loca', 'Escapada',
            'Hotel', 'Jacuzzi', 'Champán', 'Jacuzzi', 'Luna de miel', 'Segunda base', 'Tercera base', 'Home run', 'Momento íntimo', 'Encuentro pasional',
            // Sexo
            'Orgasmo', 'Clímax', 'Éxtasis', 'Lubricante', 'Condón', 'Anticonceptivo', 'Viagra', 'Afrodisíaco', 'Zona erógena', 'Punto G',
            'Masturbación', 'Sexo oral', 'Cunnilingus', 'Felación', 'Penetración', 'Postura', 'Misionero', 'Perrito', 'Vaquera', 'Cucharita',
            'Sexo anal', 'Sexo tántrico', 'Sexo salvaje', 'Sexo suave', 'Quickie', 'Maratón sexual', 'Sexting', 'Nudes', 'Dick pic', 'Video llamada caliente',
            // Categorías porno
            'Amateur', 'Profesional', 'Casero', 'POV', 'Gonzo', 'Softcore', 'Hardcore', 'Lesbianas', 'Gay', 'Bisexual',
            'Transexual', 'Interracial', 'BBW', 'Maduras', 'MILF', 'Teen', 'Asiáticas', 'Latinas', 'Rubias', 'Morenas',
            'Pelirrojas', 'Tatuadas', 'Piercings', 'Natural', 'Silicona', 'Squirt', 'Creampie', 'Facial', 'Bukkake', 'Gangbang',
            'DP', 'Anal', 'Garganta profunda', 'Corrida', 'Casting', 'Público', 'Cámara oculta', 'Vintage', 'Retro', 'Parodia',
            'Cosplay', 'Uniforme', 'Enfermera', 'Secretaria', 'Profesora', 'Policía', 'Azafata', 'Cheerleader', 'Criada', 'Ninja'
        ]
    },

    // INGLÉS - Misma estructura
    en: {
        alimentacion: [
            // Fruits
            'Apple', 'Banana', 'Orange', 'Strawberry', 'Grape', 'Watermelon', 'Melon', 'Pineapple', 'Mango', 'Papaya',
            'Kiwi', 'Pear', 'Peach', 'Cherry', 'Raspberry', 'Blueberry', 'Blackberry', 'Lemon', 'Lime', 'Grapefruit',
            'Tangerine', 'Coconut', 'Fig', 'Date', 'Plum', 'Apricot', 'Pomegranate', 'Guava', 'Passion fruit', 'Lychee',
            // Vegetables
            'Tomato', 'Lettuce', 'Carrot', 'Onion', 'Cucumber', 'Pepper', 'Zucchini', 'Eggplant', 'Broccoli', 'Cauliflower',
            'Spinach', 'Chard', 'Celery', 'Radish', 'Asparagus', 'Artichoke', 'Beet', 'Turnip', 'Leek', 'Cabbage',
            // Main dishes
            'Pizza', 'Paella', 'Sushi', 'Tacos', 'Burger', 'Pasta', 'Lasagna', 'Risotto', 'Couscous', 'Omelette',
            'Empanada', 'Burrito', 'Quesadilla', 'Fajitas', 'Enchiladas', 'Stew', 'Soup', 'Gazpacho', 'Salmorejo', 'Croquettes',
            'Cannelloni', 'Ravioli', 'Gnocchi', 'Fideuá', 'Chicken rice', 'Roast chicken', 'Schnitzel', 'Escalope', 'Meatballs', 'Ramen',
            // Drinks
            'Water', 'Coffee', 'Tea', 'Milk', 'Juice', 'Soda', 'Smoothie', 'Hot chocolate', 'Horchata', 'Sangria',
            'Lemonade', 'Shake', 'Beer', 'Wine', 'Champagne', 'Cider', 'Mojito', 'Margarita', 'Pina colada', 'Cola',
            // Sweets and desserts
            'Cake', 'Ice cream', 'Cookies', 'Pie', 'Flan', 'Custard', 'Mousse', 'Brownie', 'Muffin', 'Donut',
            'Churros', 'Crêpe', 'Waffle', 'Pancake', 'Tiramisu', 'Profiteroles', 'Éclair', 'Macarons', 'Bonbons', 'Nougat',
            'Shortbread', 'Candy', 'Doughnut', 'Cupcake', 'Muffin', 'Cheesecake', 'Strudel', 'Baklava', 'Soufflé', 'Meringue',
            // Ingredients
            'Flour', 'Sugar', 'Salt', 'Oil', 'Vinegar', 'Honey', 'Butter', 'Egg', 'Cheese', 'Ham',
            'Rice', 'Lentils', 'Chickpeas', 'Beans', 'Bread', 'Yogurt', 'Cream', 'Cinnamon', 'Vanilla', 'Chocolate',
            // Fast food
            'Hot dog', 'Sandwich', 'Baguette', 'Nuggets', 'French fries', 'Kebab', 'Shawarma', 'Wrap', 'Panini', 'Pretzel'
        ],

        animales: [
            // Domestic
            'Dog', 'Cat', 'Hamster', 'Rabbit', 'Guinea pig', 'Parrot', 'Canary', 'Goldfish', 'Turtle', 'Iguana',
            'Horse', 'Cow', 'Pig', 'Sheep', 'Goat', 'Chicken', 'Duck', 'Goose', 'Turkey', 'Donkey',
            // Wild
            'Lion', 'Tiger', 'Leopard', 'Cheetah', 'Jaguar', 'Panther', 'Puma', 'Lynx', 'Wolf', 'Fox',
            'Bear', 'Polar bear', 'Panda', 'Koala', 'Elephant', 'Rhino', 'Hippo', 'Giraffe', 'Zebra', 'Buffalo',
            'Gorilla', 'Chimpanzee', 'Orangutan', 'Monkey', 'Kangaroo', 'Koala', 'Camel', 'Dromedary', 'Llama', 'Alpaca',
            'Deer', 'Reindeer', 'Moose', 'Antelope', 'Gazelle', 'Boar', 'Raccoon', 'Badger', 'Weasel', 'Ferret',
            // Marine
            'Dolphin', 'Whale', 'Orca', 'Shark', 'Manta ray', 'Swordfish', 'Tuna', 'Salmon', 'Trout', 'Sardine',
            'Octopus', 'Squid', 'Cuttlefish', 'Jellyfish', 'Starfish', 'Sea urchin', 'Crab', 'Lobster', 'Shrimp', 'Clam',
            'Mussel', 'Oyster', 'Sea snail', 'Seal', 'Sea lion', 'Walrus', 'Manatee', 'Dugong', 'Seahorse', 'Eel',
            // Birds
            'Eagle', 'Falcon', 'Owl', 'Barn owl', 'Seagull', 'Pelican', 'Flamingo', 'Swan', 'Penguin', 'Ostrich',
            'Peacock', 'Toucan', 'Parrot', 'Macaw', 'Hummingbird', 'Sparrow', 'Pigeon', 'Raven', 'Magpie', 'Robin',
            'Swallow', 'Swift', 'Nightingale', 'Goldfinch', 'Blackbird', 'Woodpecker', 'Parakeet', 'Cockatoo', 'Albatross', 'Condor',
            // Insects
            'Bee', 'Wasp', 'Ant', 'Butterfly', 'Moth', 'Beetle', 'Ladybug', 'Dragonfly', 'Grasshopper', 'Cricket',
            'Cicada', 'Fly', 'Mosquito', 'Firefly', 'Mantis', 'Cockroach', 'Bedbug', 'Flea', 'Louse', 'Tick',
            // Reptiles
            'Crocodile', 'Alligator', 'Snake', 'Viper', 'Cobra', 'Python', 'Boa', 'Lizard', 'Chameleon', 'Iguana',
            'Gecko', 'Komodo dragon', 'Gecko', 'Turtle', 'Tortoise', 'Monitor lizard'
        ],

        lugares: [
            // Countries (same as Spanish - proper nouns)
            'Spain', 'France', 'Italy', 'Germany', 'Portugal', 'Greece', 'United Kingdom', 'Ireland', 'Switzerland', 'Austria',
            'Netherlands', 'Belgium', 'Denmark', 'Sweden', 'Norway', 'Finland', 'Russia', 'Poland', 'Czech Republic', 'Hungary',
            'United States', 'Canada', 'Mexico', 'Brazil', 'Argentina', 'Chile', 'Peru', 'Colombia', 'Venezuela', 'Ecuador',
            'Japan', 'China', 'India', 'Thailand', 'Vietnam', 'Korea', 'Australia', 'New Zealand', 'Egypt', 'Morocco',
            // Famous cities
            'Madrid', 'Barcelona', 'Paris', 'London', 'Rome', 'Berlin', 'Amsterdam', 'Vienna', 'Prague', 'Budapest',
            'New York', 'Los Angeles', 'Chicago', 'Miami', 'San Francisco', 'Toronto', 'Vancouver', 'Tokyo', 'Beijing', 'Shanghai',
            'Dubai', 'Istanbul', 'Moscow', 'Saint Petersburg', 'Sydney', 'Melbourne', 'Cairo', 'Marrakech', 'Rio de Janeiro', 'Buenos Aires',
            // Regions
            'Andalusia', 'Catalonia', 'Galicia', 'Basque Country', 'Valencia', 'Castile', 'Asturias', 'Cantabria', 'Navarre', 'Aragon',
            'Tuscany', 'Provence', 'Bavaria', 'Scotland', 'Wales', 'Normandy', 'Brittany', 'Lapland', 'Siberia', 'Patagonia',
            // Rivers
            'Amazon', 'Nile', 'Mississippi', 'Yangtze', 'Ganges', 'Danube', 'Rhine', 'Seine', 'Thames', 'Tagus',
            'Ebro', 'Guadalquivir', 'Duero', 'Turia', 'Volga', 'Jordan', 'Colorado', 'Paraná', 'Congo', 'Mekong',
            // Mountains
            'Everest', 'K2', 'Kilimanjaro', 'Mont Blanc', 'Matterhorn', 'Aconcagua', 'Mulhacén', 'Aneto', 'Teide', 'Olympus',
            'Fuji', 'Vesuvius', 'Etna', 'Matterhorn', 'Denali', 'Elbrus', 'Monte Rosa', 'Jungfrau', 'Matterhorn', 'Matterhorn',
            // Islands
            'Cuba', 'Jamaica', 'Puerto Rico', 'Bahamas', 'Barbados', 'Mallorca', 'Ibiza', 'Menorca', 'Formentera', 'Canary Islands',
            'Tenerife', 'Gran Canaria', 'Lanzarote', 'Fuerteventura', 'Sicily', 'Sardinia', 'Crete', 'Cyprus', 'Malta', 'Iceland',
            'Hawaii', 'Fiji', 'Maldives', 'Seychelles', 'Bali', 'Madagascar', 'Mauritius', 'Tahiti', 'Bora Bora', 'Santorini',
            // Monuments
            'Eiffel Tower', 'Colosseum', 'Taj Mahal', 'Sagrada Familia', 'Leaning Tower', 'Big Ben', 'Statue of Liberty', 'Christ Redeemer', 'Alhambra', 'Acropolis',
            'Parthenon', 'Pyramids', 'Great Wall', 'Machu Picchu', 'Petra', 'Stonehenge', 'Arc de Triomphe', 'Golden Gate', 'Sydney Opera', 'Burj Khalifa'
        ],

        objetos: [
            // Home (traducido igual que español)
            'Table', 'Chair', 'Sofa', 'Bed', 'Wardrobe', 'Shelf', 'Lamp', 'Mirror', 'Picture', 'Clock',
            'TV', 'Fridge', 'Washing machine', 'Oven', 'Microwave', 'Toaster', 'Coffee maker', 'Blender', 'Vacuum', 'Iron',
            'Pillow', 'Blanket', 'Sheet', 'Mattress', 'Curtain', 'Carpet', 'Cushion', 'Vase', 'Pot', 'Candle',
            'Ashtray', 'Hanger', 'Basket', 'Bucket', 'Broom', 'Mop', 'Dustpan', 'Cloth', 'Scourer', 'Detergent',
            // Technology
            'Computer', 'Laptop', 'Tablet', 'Mobile', 'Mouse', 'Keyboard', 'Screen', 'Speaker', 'Headphones', 'Microphone',
            'Camera', 'Printer', 'Scanner', 'Router', 'USB', 'Hard drive', 'Cable', 'Charger', 'Battery', 'Webcam',
            'Smartwatch', 'Ebook', 'Console', 'Controller', 'VR headset', 'Drone', 'Powerbank', 'Adapter', 'USB hub', 'Flash drive',
            // School
            'Backpack', 'Pencil', 'Pen', 'Marker', 'Eraser', 'Sharpener', 'Ruler', 'Compass', 'Scissors', 'Glue',
            'Notebook', 'Book', 'Folder', 'Binder', 'Pencil case', 'Whiteboard', 'Chalk', 'Board eraser', 'Calculator', 'Dictionary',
            'Atlas', 'Globe', 'Map', 'Plasticine', 'Paint', 'Brush', 'Watercolor', 'Crayons', 'Whiteout', 'Clips',
            // Work
            'Computer', 'Phone', 'Agenda', 'Calendar', 'Post-its', 'Stapler', 'Hole punch', 'Stamp', 'Tray', 'Trash can',
            'Binder', 'Folder', 'Portfolio', 'Briefcase', 'Desk', 'Ergonomic chair', 'Desk lamp', 'Monitor', 'Projector', 'Laser pointer',
            // Tools
            'Hammer', 'Screwdriver', 'Pliers', 'Wrench', 'Saw', 'Drill', 'Level', 'Tape measure', 'Screw', 'Nail',
            'Sandpaper', 'Brush', 'Roller', 'Spatula', 'Chisel', 'File', 'Brace', 'Tongs', 'Soldering iron', 'Glue gun'
        ],

        personas: [
            // Professions (igual que español, simplificado por espacio)
            'Doctor', 'Nurse', 'Dentist', 'Surgeon', 'Vet', 'Pharmacist', 'Physiotherapist', 'Psychologist', 'Psychiatrist', 'Pediatrician',
            'Teacher', 'Professor', 'Principal', 'Counselor', 'Pedagogue', 'Educator', 'Tutor', 'Dean', 'Rector', 'Dean',
            'Engineer', 'Architect', 'Programmer', 'Designer', 'Electrician', 'Plumber', 'Carpenter', 'Builder', 'Painter', 'Mechanic',
            'Lawyer', 'Judge', 'Prosecutor', 'Notary', 'Secretary', 'Registrar', 'Attorney', 'Counsel', 'Magistrate', 'Defender',
            'Police', 'Firefighter', 'Guard', 'Military', 'Soldier', 'Captain', 'Lieutenant', 'Sergeant', 'Corporal', 'General',
            'Chef', 'Cook', 'Waiter', 'Barman', 'Sommelier', 'Pastry chef', 'Baker', 'Butcher', 'Fishmonger', 'Greengrocer',
            'Actor', 'Singer', 'Musician', 'Dancer', 'Composer', 'Film director', 'Producer', 'Screenwriter', 'Photographer', 'Cameraman',
            'Journalist', 'Reporter', 'Presenter', 'Announcer', 'Editor', 'Writer', 'Columnist', 'Critic', 'Correspondent', 'Chronicler',
            'Pilot', 'Flight attendant', 'Air traffic controller', 'Taxi driver', 'Driver', 'Trucker', 'Ship captain', 'Sailor', 'Train driver', 'Conductor',
            'Farmer', 'Rancher', 'Shepherd', 'Gardener', 'Florist', 'Veterinarian', 'Beekeeper', 'Winemaker', 'Fisherman', 'Farmer',
            // Social roles
            'Father', 'Mother', 'Son', 'Daughter', 'Brother', 'Sister', 'Grandfather', 'Grandmother', 'Grandson', 'Granddaughter',
            'Uncle', 'Aunt', 'Cousin male', 'Cousin female', 'Nephew', 'Niece', 'Father-in-law', 'Mother-in-law', 'Son-in-law', 'Daughter-in-law',
            'Husband', 'Wife', 'Boyfriend', 'Girlfriend', 'Fiancé', 'Partner', 'Friend male', 'Friend female', 'Colleague', 'Neighbor',
            'Boss', 'Employee', 'Partner', 'Client', 'Supplier', 'Competitor', 'Collaborator', 'Advisor', 'Consultant', 'Mentor',
            // Types of people
            'Baby', 'Child', 'Teenager', 'Youth', 'Adult', 'Elderly', 'Centenarian', 'Twin', 'Triplet', 'Orphan',
            'Widower', 'Divorced', 'Single', 'Married', 'Student', 'Retired', 'Unemployed', 'Entrepreneur', 'Volunteer', 'Activist'
        ],

        ocio: [
            // Famous movies (igual nombres)
            'Titanic', 'Avatar', 'Star Wars', 'Harry Potter', 'Lord of the Rings', 'Matrix', 'Inception', 'Gladiator', 'Forrest Gump', 'Pulp Fiction',
            'Godfather', 'Casablanca', 'Citizen Kane', 'Gone with Wind', 'Psycho', 'Jaws', 'Alien', 'Blade Runner', 'Rocky', 'Rambo',
            'Indiana Jones', 'Back to Future', 'Jurassic Park', 'Terminator', 'Predator', 'RoboCop', 'Die Hard', 'Lethal Weapon', 'Ghostbusters', 'Gremlins',
            'E.T.', 'Superman', 'Batman', 'Spider-Man', 'Iron Man', 'Avengers', 'Captain America', 'Thor', 'Hulk', 'X-Men',
            // Series
            'Friends', 'Breaking Bad', 'Game of Thrones', 'The Office', 'Stranger Things', 'The Crown', 'Lost', 'Prison Break', 'Dexter', 'House',
            'Sherlock', 'Doctor Who', 'Black Mirror', 'Mandalorian', 'Witcher', 'Vikings', 'Peaky Blinders', 'Narcos', 'Money Heist', 'Elite',
            // Music genres (igual)
            'Rock', 'Pop', 'Jazz', 'Blues', 'Reggae', 'Salsa', 'Merengue', 'Bachata', 'Tango', 'Flamenco',
            'Hip Hop', 'Rap', 'Trap', 'Reggaeton', 'Electronic', 'Techno', 'House', 'Dubstep', 'Drum and Bass', 'Trance',
            'Metal', 'Heavy Metal', 'Death Metal', 'Black Metal', 'Punk', 'Grunge', 'Indie', 'Folk', 'Country', 'Soul',
            // Video games (igual nombres)
            'Minecraft', 'Fortnite', 'Call of Duty', 'FIFA', 'GTA', 'Mario', 'Zelda', 'Pokémon', 'Sonic', 'Pac-Man',
            'Tetris', 'Counter-Strike', 'League of Legends', 'Dota', 'Overwatch', 'Valorant', 'Among Us', 'Fall Guys', 'Roblox', 'Clash Royale',
            'Candy Crush', 'Angry Birds', 'Temple Run', 'Subway Surfers', 'The Sims', 'Age of Empires', 'StarCraft', 'Warcraft', 'Diablo', 'Final Fantasy',
            // Board games
            'Monopoly', 'Parcheesi', 'Goose game', 'Chess', 'Checkers', 'Domino', 'Scrabble', 'Trivial', 'Clue', 'Risk',
            'Catan', 'Carcassonne', 'Ticket to Ride', 'Pandemic', 'Dixit', 'Dobble', 'Uno', 'Jungle Speed', 'Jenga', 'Mikado',
            // Leisure activities
            'Reading', 'Painting', 'Drawing', 'Writing', 'Dancing', 'Singing', 'Playing music', 'Cooking', 'Gardening', 'Photography',
            'Video games', 'Watching series', 'Cinema', 'Theater', 'Concerts', 'Traveling', 'Hiking', 'Camping', 'Fishing', 'Hunting'
        ],

        deportes: [
            // Team sports
            'Football', 'Basketball', 'Volleyball', 'Handball', 'Rugby', 'Hockey', 'Baseball', 'Water polo', 'American football', 'Cricket',
            'Polo', 'Lacrosse', 'Softball', 'Futsal', '3x3 Basketball', 'Beach volleyball', 'Field hockey', 'Ice hockey', 'Curling', 'Korfball',
            // Individual sports
            'Tennis', 'Golf', 'Athletics', 'Swimming', 'Cycling', 'Gymnastics', 'Boxing', 'Judo', 'Karate', 'Taekwondo',
            'Fencing', 'Archery', 'Shooting', 'Equestrian', 'Pentathlon', 'Triathlon', 'Decathlon', 'Weightlifting', 'Wrestling', 'Climbing',
            'Skiing', 'Snowboarding', 'Skating', 'Skateboarding', 'BMX', 'Parkour', 'CrossFit', 'Calisthenics', 'Bodybuilding', 'Fitness',
            // Water sports
            'Swimming', 'Water polo', 'Synchronized swimming', 'Diving', 'Surfing', 'Windsurfing', 'Kitesurfing', 'Paddle surfing', 'Sailing', 'Rowing',
            'Canoeing', 'Kayaking', 'Rafting', 'Scuba diving', 'Freediving', 'Water skiing', 'Wakeboarding', 'Bodyboarding', 'Powerboating', 'Sport fishing',
            // Exercises
            'Push-ups', 'Sit-ups', 'Squats', 'Pull-ups', 'Dips', 'Burpees', 'Lunges', 'Plank', 'Jumping jacks', 'Mountain climbers',
            'Yoga', 'Pilates', 'Stretching', 'Cardio', 'Running', 'Jogging', 'Sprinting', 'Marathon', 'Spinning', 'Aerobics'
        ],

        emociones: [
            // Basic emotions
            'Joy', 'Sadness', 'Fear', 'Anger', 'Surprise', 'Disgust', 'Love', 'Hate', 'Envy', 'Jealousy',
            'Shame', 'Guilt', 'Pride', 'Gratitude', 'Admiration', 'Contempt', 'Satisfaction', 'Disappointment', 'Frustration', 'Anxiety',
            // Moods
            'Happy', 'Sad', 'Angry', 'Scared', 'Nervous', 'Calm', 'Relaxed', 'Stressed', 'Tired', 'Energized',
            'Depressed', 'Euphoric', 'Melancholic', 'Nostalgic', 'Optimistic', 'Pessimistic', 'Confused', 'Confident', 'Insecure', 'Motivated',
            'Bored', 'Enthusiastic', 'Apathetic', 'Hopeful', 'Desperate', 'Serene', 'Agitated', 'Impatient', 'Patient', 'Curious',
            // Physical sensations
            'Hunger', 'Thirst', 'Sleepiness', 'Pain', 'Itch', 'Tickle', 'Cold', 'Heat', 'Dizziness', 'Nausea',
            'Weakness', 'Strength', 'Fatigue', 'Energy', 'Heaviness', 'Lightness', 'Tension', 'Relaxation', 'Tingling', 'Numbness'
        ],

        acciones: [
            // Daily actions
            'Eat', 'Drink', 'Sleep', 'Wake up', 'Shower', 'Dress', 'Comb', 'Wash', 'Brush', 'Shave',
            'Cook', 'Clean', 'Tidy', 'Sweep', 'Mop', 'Iron', 'Wash', 'Hang', 'Fold', 'Store',
            'Buy', 'Sell', 'Pay', 'Charge', 'Give gift', 'Receive', 'Give', 'Take', 'Leave', 'Put',
            'Open', 'Close', 'Turn on', 'Turn off', 'Go up', 'Go down', 'Enter', 'Exit', 'Arrive', 'Leave',
            // Communication actions
            'Speak', 'Listen', 'Shout', 'Whisper', 'Silence', 'Ask', 'Answer', 'Tell', 'Explain', 'Describe',
            'Narrate', 'Relate', 'Comment', 'Opine', 'Discuss', 'Debate', 'Argue', 'Convince', 'Persuade', 'Negotiate',
            'Call', 'Answer phone', 'Hang up', 'Send', 'Receive', 'Read', 'Write', 'Sign', 'Publish', 'Share',
            // Movement actions
            'Walk', 'Run', 'Jump', 'Hop', 'Climb', 'Scale', 'Swim', 'Dive', 'Fly', 'Glide',
            'Crawl', 'Creep', 'Roll', 'Turn', 'Spin', 'Swing', 'Stagger', 'Stumble', 'Fall', 'Get up',
            'Sit', 'Lie down', 'Recline', 'Crouch', 'Bend', 'Stretch', 'Shrink', 'Fold', 'Twist', 'Contort'
        ],

        caracteristicas: [
            // Positive qualities
            'Kind', 'Generous', 'Honest', 'Loyal', 'Sincere', 'Brave', 'Intelligent', 'Creative', 'Funny', 'Nice',
            'Affectionate', 'Loving', 'Understanding', 'Patient', 'Tolerant', 'Respectful', 'Polite', 'Courteous', 'Attentive', 'Helpful',
            'Hardworking', 'Responsible', 'Punctual', 'Organized', 'Efficient', 'Productive', 'Ambitious', 'Perseverant', 'Constant', 'Tenacious',
            'Optimistic', 'Cheerful', 'Positive', 'Enthusiastic', 'Passionate', 'Motivated', 'Inspiring', 'Charismatic', 'Charming', 'Elegant',
            // Negative qualities
            'Selfish', 'Greedy', 'Mean', 'Stingy', 'Envious', 'Jealous', 'Resentful', 'Vengeful', 'Cruel', 'Evil',
            'Liar', 'Cheater', 'Dishonest', 'Fake', 'Hypocrite', 'Traitor', 'Coward', 'Fearful', 'Shy', 'Insecure',
            'Arrogant', 'Proud', 'Vain', 'Conceited', 'Boastful', 'Domineering', 'Authoritarian', 'Bossy', 'Dominant', 'Controlling',
            'Lazy', 'Idle', 'Slothful', 'Irresponsible', 'Careless', 'Messy', 'Chaotic', 'Unpunctual', 'Slow', 'Clumsy',
            // Physical shapes
            'Tall', 'Short', 'Big', 'Small', 'Fat', 'Thin', 'Strong', 'Weak', 'Muscular', 'Athletic',
            'Round', 'Square', 'Triangular', 'Rectangular', 'Oval', 'Elongated', 'Wide', 'Narrow', 'Thick', 'Thin',
            // Temporary states
            'Wet', 'Dry', 'Clean', 'Dirty', 'New', 'Old', 'Broken', 'Whole', 'Full', 'Empty',
            'Hot', 'Cold', 'Warm', 'Frozen', 'Icy', 'Thawed', 'Cooked', 'Raw', 'Burnt', 'Toasted'
        ],

        adultos: [
            // Adult themes - REQUIRES +18 ACTIVATION
            'Kamasutra', 'Lingerie', 'Striptease', 'Pole dance', 'Lapdance', 'Erotic massage', 'Tantra', 'Fetish', 'BDSM', 'Domination',
            'Submission', 'Voyeur', 'Exhibitionism', 'Swing', 'Threesome', 'Orgy', 'Swingers club', 'Role play', 'Sexual fantasy', 'Sex toy',
            // Spicy humor
            'Foreplay', 'Caresses', 'Passionate kisses', 'Whispers', 'Moans', 'Seduction', 'Flirting', 'Insinuation', 'Provocation', 'Temptation',
            'Desire', 'Passion', 'Lust', 'Attraction', 'Chemistry', 'Sexual tension', 'Looks', 'Touch', 'Arousal', 'Pleasure',
            // Suggestive references
            'One night stand', 'Friends with benefits', 'Hook up', 'Fling', 'Adventure', 'Affair', 'Romance', 'Date', 'Wild night', 'Getaway',
            'Hotel', 'Jacuzzi', 'Champagne', 'Jacuzzi', 'Honeymoon', 'Second base', 'Third base', 'Home run', 'Intimate moment', 'Passionate encounter',
            // Sex
            'Orgasm', 'Climax', 'Ecstasy', 'Lubricant', 'Condom', 'Contraceptive', 'Viagra', 'Aphrodisiac', 'Erogenous zone', 'G-spot',
            'Masturbation', 'Oral sex', 'Cunnilingus', 'Fellatio', 'Penetration', 'Position', 'Missionary', 'Doggy', 'Cowgirl', 'Spooning',
            'Anal sex', 'Tantric sex', 'Wild sex', 'Gentle sex', 'Quickie', 'Sex marathon', 'Sexting', 'Nudes', 'Dick pic', 'Hot video call',
            // Porn categories
            'Amateur', 'Professional', 'Homemade', 'POV', 'Gonzo', 'Softcore', 'Hardcore', 'Lesbian', 'Gay', 'Bisexual',
            'Transsexual', 'Interracial', 'BBW', 'Mature', 'MILF', 'Teen', 'Asian', 'Latina', 'Blonde', 'Brunette',
            'Redhead', 'Tattooed', 'Piercings', 'Natural', 'Silicone', 'Squirt', 'Creampie', 'Facial', 'Bukkake', 'Gangbang',
            'DP', 'Anal', 'Deep throat', 'Cumshot', 'Casting', 'Public', 'Hidden camera', 'Vintage', 'Retro', 'Parody',
            'Cosplay', 'Uniform', 'Nurse', 'Secretary', 'Teacher', 'Police', 'Flight attendant', 'Cheerleader', 'Maid', 'Ninja'
        ]
    },

    // CATALÁN - Estructura completa (resumen por espacio, misma lógica)
    ca: {
        alimentacion: [
            // Fruites
            'Poma', 'Plàtan', 'Taronja', 'Maduixa', 'Raïm', 'Síndria', 'Meló', 'Pinya', 'Mango', 'Papaia',
            'Kiwi', 'Pera', 'Préssec', 'Cirera', 'Gerd', 'Nabiu', 'Móra', 'Llimona', 'Lima', 'Aranja',
            'Mandarina', 'Coco', 'Figa', 'Dàtil', 'Pruna', 'Albercoc', 'Magrana', 'Guaiaba', 'Maracujà', 'Litxi',
            // Verdures
            'Tomàquet', 'Enciam', 'Pastanaga', 'Ceba', 'Cogombre', 'Pebrot', 'Carbassó', 'Albergínia', 'Bròquil', 'Coliflor',
            'Espinacs', 'Bleda', 'Api', 'Rave', 'Espàrrec', 'Carxofa', 'Remolatxa', 'Nap', 'Porro', 'Col',
            // Plats principals
            'Pizza', 'Paella', 'Sushi', 'Tacs', 'Hamburguesa', 'Pasta', 'Lasanya', 'Risotto', 'Cuscús', 'Truita',
            'Empanada', 'Burrito', 'Quesadilla', 'Fajites', 'Enchilades', 'Escudella', 'Fabada', 'Gaspatxo', 'Salmorejo', 'Croquetes',
            'Canelons', 'Ravioli', 'Gnocchi', 'Fideuà', 'Arròs amb pollastre', 'Pollastre rostit', 'Milanesa', 'Escalopa', 'Mandonguilles', 'Ramen',
            // Begudes
            'Aigua', 'Cafè', 'Té', 'Llet', 'Suc', 'Refresc', 'Batut', 'Xocolata calenta', 'Orxata', 'Sangria',
            'Llimonada', 'Smoothie', 'Cervesa', 'Vi', 'Xampany', 'Sidra', 'Mojito', 'Margarita', 'Pinya colada', 'Cola',
            // Dolços i postres (añadir más aquí siguiendo patrón...)
            'Pastís', 'Gelat', 'Galetes', 'Flam', 'Natilles', 'Mousse', 'Brownie', 'Magdalena', 'Donut',
            'Xurros', 'Crep', 'Gofre', 'Crep', 'Tiramisú', 'Profiteroles', 'Éclair', 'Macarons', 'Bombons', 'Torró',
            // ... continuar con resto de categorías igual que ES/EN
            'Farina', 'Sucre', 'Sal', 'Oli', 'Vinagre', 'Mel', 'Mantega', 'Ou', 'Formatge', 'Pernil',
            'Hot dog', 'Entrepà', 'Nuggets', 'Patates fregides', 'Kebab', 'Shawarma', 'Wrap', 'Panini', 'Pretzel'
        ],

        animales: [
            'Gos', 'Gat', 'Hàmster', 'Conill', 'Cobaia', 'Lloro', 'Canari', 'Peix daurat', 'Tortuga', 'Iguana',
            'Cavall', 'Vaca', 'Porc', 'Ovella', 'Cabra', 'Gallina', 'Ànec', 'Oca', 'Gall dindi', 'Ase',
            'Lleó', 'Tigre', 'Lleopard', 'Guepard', 'Jaguar', 'Pantera', 'Puma', 'Linx', 'Llop', 'Guineu',
            'Ós', 'Ós polar', 'Panda', 'Koala', 'Elefant', 'Rinoceront', 'Hipopòtam', 'Girafa', 'Zebra', 'Búfal',
            'Goril·la', 'Ximpanzé', 'Orangutan', 'Mico', 'Cangur', 'Koala', 'Camell', 'Dromedari', 'Llama', 'Alpaca',
            'Cérvol', 'Ren', 'Ant', 'Antílop', 'Gasela', 'Senglar', 'Ós rentador', 'Teixó', 'Mostela', 'Fura',
            'Dofí', 'Balena', 'Orca', 'Tauró', 'Rajada', 'Peix espasa', 'Tonyina', 'Salmó', 'Truita', 'Sardina',
            'Pop', 'Calamar', 'Sípia', 'Medusa', 'Estrella de mar', 'Eriçó de mar', 'Cranc', 'Llagosta', 'Gamba', 'Cloïssa',
            'Musclo', 'Ostra', 'Cargol marí', 'Foca', 'Lleó marí', 'Morsa', 'Manatí', 'Dugong', 'Cavallet de mar', 'Anguila',
            'Àguila', 'Falcó', 'Mussol', 'Òliba', 'Gavina', 'Pelicà', 'Flamenc', 'Cigne', 'Pingüí', 'Estruç',
            'Paó', 'Tucà', 'Papagai', 'Guacamai', 'Colibrí', 'Pardal', 'Colom', 'Corb', 'Garsa', 'Pit-roig',
            'Oreneta', 'Falciot', 'Rossinyol', 'Cadernera', 'Merla', 'Picot', 'Cotorra', 'Cacatua', 'Albatros', 'Còndor',
            'Abella', 'Vespa', 'Formiga', 'Papallona', 'Arna', 'Escarabat', 'Marieta', 'Libèl·lula', 'Llagosta', 'Grill',
            'Cigala', 'Mosca', 'Mosquit', 'Cuca de llum', 'Manti religiosa', 'Escarabat', 'Xinxa', 'Puça', 'Poll', 'Papararra',
            'Cocodril', 'Caiman', 'Serp', 'Víbora', 'Cobra', 'Pitó', 'Boa', 'Sargantana', 'Camaleó', 'Iguana',
            'Dragó', 'Dragó de Komodo', 'Gecko', 'Tortuga', 'Galàpag', 'Varà'
        ],

        lugares: [
            'Espanya', 'França', 'Itàlia', 'Alemanya', 'Portugal', 'Grècia', 'Regne Unit', 'Irlanda', 'Suïssa', 'Àustria',
            'Holanda', 'Bèlgica', 'Dinamarca', 'Suècia', 'Noruega', 'Finlàndia', 'Rússia', 'Polònia', 'Txèquia', 'Hongria',
            'Estats Units', 'Canadà', 'Mèxic', 'Brasil', 'Argentina', 'Xile', 'Perú', 'Colòmbia', 'Veneçuela', 'Equador',
            'Japó', 'Xina', 'Índia', 'Tailàndia', 'Vietnam', 'Corea', 'Austràlia', 'Nova Zelanda', 'Egipte', 'Marroc',
            'Madrid', 'Barcelona', 'París', 'Londres', 'Roma', 'Berlín', 'Amsterdam', 'Viena', 'Praga', 'Budapest',
            'Nova York', 'Los Angeles', 'Chicago', 'Miami', 'San Francisco', 'Toronto', 'Vancouver', 'Tòquio', 'Pequín', 'Xangai',
            'Dubai', 'Istanbul', 'Moscou', 'Sant Petersburg', 'Sydney', 'Melbourne', 'El Caire', 'Marràqueix', 'Rio de Janeiro', 'Buenos Aires',
            'Andalusia', 'Catalunya', 'Galícia', 'País Basc', 'València', 'Castella', 'Astúries', 'Cantàbria', 'Navarra', 'Aragó',
            'Amazones', 'Nil', 'Mississipí', 'Iang-Tsé', 'Ganges', 'Danubi', 'Rin', 'Sena', 'Tàmesi', 'Tajo',
            'Ebre', 'Guadalquivir', 'Duero', 'Túria', 'Volga', 'Jordà', 'Colorado', 'Paranà', 'Congo', 'Mekong',
            'Everest', 'K2', 'Kilimanjaro', 'Mont Blanc', 'Matterhorn', 'Aconcagua', 'Mulhacén', 'Aneto', 'Teide', 'Olimp',
            'Cuba', 'Jamaica', 'Puerto Rico', 'Bahames', 'Barbados', 'Mallorca', 'Eivissa', 'Menorca', 'Formentera', 'Canàries',
            'Torre Eiffel', 'Coliseu', 'Taj Mahal', 'Sagrada Família', 'Torre de Pisa', 'Big Ben', 'Estàtua Llibertat', 'Crist Redemptor', 'Alhambra', 'Acròpolis'
        ],

        objetos: [
            'Taula', 'Cadira', 'Sofà', 'Llit', 'Armari', 'Prestatge', 'Llum', 'Mirall', 'Quadre', 'Rellotge',
            'Televisor', 'Nevera', 'Rentadora', 'Forn', 'Microones', 'Torradora', 'Cafetera', 'Batedora', 'Aspiradora', 'Planxa',
            'Coixí', 'Manta', 'Llençol', 'Matalàs', 'Cortina', 'Catifa', 'Coixí', 'Gerro', 'Test', 'Espelma',
            'Penjador', 'Cistella', 'Cubell', 'Escombra', 'Fregona', 'Recollidor', 'Drap', 'Estropall', 'Detergent',
            'Ordenador', 'Portàtil', 'Tablet', 'Mòbil', 'Ratolí', 'Teclat', 'Pantalla', 'Altaveu', 'Auriculars', 'Micròfon',
            'Càmera', 'Impressora', 'Escàner', 'Router', 'USB', 'Disc dur', 'Cable', 'Carregador', 'Bateria', 'Webcam',
            'Motxilla', 'Llapis', 'Bolígraf', 'Retolador', 'Goma', 'Trempador', 'Regle', 'Compàs', 'Tisores', 'Cola',
            'Quadern', 'Llibre', 'Carpeta', 'Arxivador', 'Estoig', 'Pissarra', 'Guix', 'Esborrall', 'Calculadora', 'Diccionari',
            'Martell', 'Tornavís', 'Alicates', 'Clau anglesa', 'Serra', 'Trepant', 'Nivell', 'Metre', 'Cargol', 'Clau'
        ],

        personas: [
            'Metge', 'Infermer', 'Dentista', 'Cirurgià', 'Veterinari', 'Farmacèutic', 'Fisioterapeuta', 'Psicòleg', 'Psiquiatra', 'Pediatra',
            'Professor', 'Mestre', 'Director', 'Orientador', 'Pedagog', 'Educador', 'Tutor', 'Catedràtic', 'Rector', 'Degà',
            'Enginyer', 'Arquitecte', 'Programador', 'Dissenyador', 'Electricista', 'Lampista', 'Fuster', 'Paleta', 'Pintor', 'Mecànic',
            'Advocat', 'Jutge', 'Fiscal', 'Notari', 'Secretari', 'Registrador', 'Procurador', 'Lletrat', 'Magistrat', 'Defensor',
            'Policia', 'Bomber', 'Guàrdia', 'Militar', 'Soldat', 'Capità', 'Tinent', 'Sergent', 'Cap', 'General',
            'Xef', 'Cuiner', 'Cambrer', 'Barman', 'Sumiller', 'Reboster', 'Pastisser', 'Forner', 'Carnisser', 'Peixater',
            'Actor', 'Cantant', 'Músic', 'Ballarí', 'Compositor', 'Director cinema', 'Productor', 'Guionista', 'Fotògraf', 'Càmera',
            'Periodista', 'Reporter', 'Presentador', 'Locutor', 'Editor', 'Redactor', 'Columnista', 'Crític', 'Corresponsal', 'Cronista',
            'Pilot', 'Hostessa', 'Controlador aeri', 'Taxista', 'Conductor', 'Camioner', 'Capità vaixell', 'Mariner', 'Maquinista', 'Revisor',
            'Agricultor', 'Ramader', 'Pastor', 'Jardiner', 'Florista', 'Veterinari', 'Apicultor', 'Viticultor', 'Pescador', 'Granger',
            'Pare', 'Mare', 'Fill', 'Filla', 'Germà', 'Germana', 'Avi', 'Àvia', 'Nét', 'Néta',
            'Oncle', 'Tia', 'Cosí', 'Cosina', 'Nebot', 'Neboda', 'Sogre', 'Sogra', 'Gendre', 'Nora',
            'Marit', 'Esposa', 'Nóvio', 'Nòvia', 'Promès', 'Parella', 'Amic', 'Amiga', 'Company', 'Veí',
            'Bebè', 'Nen', 'Adolescent', 'Jove', 'Adult', 'Ancià', 'Centenari', 'Bessó', 'Bessons', 'Orfe'
        ],

        ocio: [
            'Titanic', 'Avatar', 'Star Wars', 'Harry Potter', 'Senyor Anells', 'Matrix', 'Inception', 'Gladiador', 'Forrest Gump', 'Pulp Fiction',
            'Friends', 'Breaking Bad', 'Joc de Trons', 'The Office', 'Stranger Things', 'The Crown', 'Lost', 'Prison Break', 'Dexter', 'House',
            'Rock', 'Pop', 'Jazz', 'Blues', 'Reggae', 'Salsa', 'Merengue', 'Bachata', 'Tango', 'Flamenc',
            'Minecraft', 'Fortnite', 'Call of Duty', 'FIFA', 'GTA', 'Mario', 'Zelda', 'Pokémon', 'Sonic', 'Pac-Man',
            'Monopoly', 'Parxís', 'Oca', 'Escacs', 'Dames', 'Dòmino', 'Scrabble', 'Trivial', 'Cluedo', 'Risk',
            'Llegir', 'Pintar', 'Dibuixar', 'Escriure', 'Ballar', 'Cantar', 'Tocar música', 'Cuinar', 'Jardineria', 'Fotografia'
        ],

        deportes: [
            'Futbol', 'Bàsquet', 'Tenis', 'Voleibol', 'Beisbol', 'Golf', 'Natació', 'Ciclisme', 'Boxa', 'Atletisme',
            'Gimnàstica', 'Esgrima', 'Judo', 'Karate', 'Taekwondo', 'Hoquei', 'Rugbi', 'Criquet', 'Surf', 'Esquí',
            'Snowboard', 'Patinatge', 'Escalada', 'Busseig', 'Vela', 'Rem', 'Equitació', 'Tir', 'Bàdminton', 'Ping Pong',
            'Flexions', 'Abdominals', 'Sentadilles', 'Dominades', 'Fons', 'Burpees', 'Estocades', 'Planxa', 'Jumping jacks', 'Mountain climbers',
            'Ioga', 'Pilates', 'Estiraments', 'Cardio', 'Running', 'Footing', 'Sprint', 'Marató', 'Spinning', 'Aeròbic'
        ],

        emociones: [
            'Alegria', 'Tristesa', 'Por', 'Ira', 'Sorpresa', 'Fàstic', 'Amor', 'Odi', 'Enveja', 'Gelosia',
            'Vergonya', 'Culpa', 'Orgull', 'Gratitud', 'Admiració', 'Menyspreu', 'Satisfacció', 'Decepció', 'Frustració', 'Ansietat',
            'Feliç', 'Trist', 'Enfadat', 'Espantat', 'Nerviós', 'Tranquil', 'Relaxat', 'Estressat', 'Cansat', 'Animat',
            'Fam', 'Set', 'Son', 'Dolor', 'Picor', 'Pessigolles', 'Fred', 'Calor', 'Mareig', 'Nàusea'
        ],

        acciones: [
            'Menjar', 'Beure', 'Dormir', 'Despertar', 'Dutxar-se', 'Vestir-se', 'Pentinar-se', 'Rentar-se', 'Raspallar-se', 'Afaitar-se',
            'Cuinar', 'Netejar', 'Ordenar', 'Escombrar', 'Fregar', 'Planxar', 'Rentar', 'Estendre', 'Doblegar', 'Guardar',
            'Comprar', 'Vendre', 'Pagar', 'Cobrar', 'Regalar', 'Rebre', 'Donar', 'Prendre', 'Deixar', 'Posar',
            'Parlar', 'Escoltar', 'Cridar', 'Xiuxiuejar', 'Callar', 'Preguntar', 'Respondre', 'Explicar', 'Descriure', 'Narrar',
            'Caminar', 'Córrer', 'Saltar', 'Grimpar', 'Escalar', 'Nedar', 'Bussejar', 'Volar', 'Planejar', 'Arrossegar-se'
        ],

        caracteristicas: [
            'Amable', 'Generós', 'Honest', 'Lleial', 'Sincer', 'Valent', 'Intel·ligent', 'Creatiu', 'Divertit', 'Simpàtic',
            'Egoista', 'Avar', 'Mesquí', 'Envejós', 'Gelós', 'Rancorós', 'Venjatiu', 'Cruel', 'Malvat', 'Mentider',
            'Alt', 'Baix', 'Gran', 'Petit', 'Gros', 'Prim', 'Fort', 'Feble', 'Musculós', 'Atlètic',
            'Mullat', 'Sec', 'Net', 'Brut', 'Nou', 'Vell', 'Trencat', 'Sencer', 'Ple', 'Buit'
        ],

        adultos: [
            // +18 content - Igual que ES/EN con traducciones catalanas
            'Kamasutra', 'Llenceria', 'Striptease', 'Pole dance', 'Lapdance', 'Massatge eròtic', 'Tantra', 'Fetitxe', 'BDSM', 'Dominació',
            'Submissió', 'Voyeur', 'Exhibicionisme', 'Swing', 'Trio', 'Orgia', 'Club liberal', 'Joc de rols', 'Fantasia sexual', 'Joguina eròtica',
            'Preliminars', 'Carícias', 'Petons apassionats', 'Xiuxiuejos', 'Gemecs', 'Seducció', 'Coqueteig', 'Insinuació', 'Provocació', 'Temptació',
            'One night stand', 'Amics amb dret', 'Lligoteo', 'Rotllo', 'Aventura', 'Affaire', 'Romance', 'Cita romàntica', 'Nit boja', 'Escapada',
            'Orgasme', 'Clímax', 'Èxtasi', 'Lubricant', 'Condó', 'Anticonceptiu', 'Viagra', 'Afrodisíac', 'Zona erògena', 'Punt G',
            'Amateur', 'Professional', 'Casolà', 'POV', 'Gonzo', 'Softcore', 'Hardcore', 'Lesbianes', 'Gay', 'Bisexual',
            'DP', 'Anal', 'Gola profunda', 'Ejaculació', 'Càsting', 'Públic', 'Càmera oculta', 'Vintage', 'Retro', 'Paròdia'
        ]
    }
};

/**
 * Obtiene las palabras de un tema, incluyendo palabras personalizadas si es el caso
 * @param {string} tema - Nombre del tema
 * @param {string} idioma - Código de idioma
 * @returns {Array} Array de palabras
 */
function obtenerPalabrasTema(tema, idioma = 'es') {
    if (tema === 'mios') {
        const guardadas = localStorage.getItem('impostor-custom-words');
        if (!guardadas) return [];
        
        try {
            const data = JSON.parse(guardadas);
            // Formato nuevo: { folders: [...] }
            if (data && typeof data === 'object' && data.folders) {
                let todas = [];
                data.folders.forEach(f => {
                    if (f.selected !== false) {
                        todas = [...todas, ...f.words];
                    }
                });
                return todas;
            }
            // Formato viejo: [...]
            if (Array.isArray(data)) {
                return data;
            }
        } catch (e) {
            console.error('Error parseando palabras propias:', e);
            return [];
        }
    }
    return temasPalabras[idioma][tema] || [];
}

/**
 * Obtiene una palabra aleatoria del tema seleccionado
 * @param {string} tema - Nombre del tema
 * @param {string} idioma - Código de idioma ('es', 'en', 'ca')
 * @returns {string} Palabra aleatoria
 */
function obtenerPalabraAleatoria(tema, idioma = 'es') {
    const palabras = obtenerPalabrasTema(tema, idioma);
    if (!palabras || palabras.length === 0) {
        return null;
    }
    const indiceAleatorio = Math.floor(Math.random() * palabras.length);
    return palabras[indiceAleatorio];
}

/**
 * Obtiene todos los temas disponibles (excluyendo adultos si está bloqueado)
 * @param {string} idioma - Código de idioma ('es', 'en', 'ca')
 * @param {boolean} incluirAdultos - Si incluir categoría +18
 * @returns {Array} Array de nombres de temas
 */
function obtenerTemas(idioma = 'es', incluirAdultos = false) {
    let temas = Object.keys(temasPalabras[idioma]);
    
    // Añadir 'mios' si hay palabras
    const palabrasMias = obtenerPalabrasTema('mios');
    if (palabrasMias.length > 0) {
        // Insertar al principio para que sea visible
        if (!temas.includes('mios')) {
            temas = ['mios', ...temas];
        }
    } else {
        // Si no hay palabras, asegurar que 'mios' esté al final o disponible para configurar
        if (!temas.includes('mios')) {
            temas.push('mios');
        }
    }

    if (!incluirAdultos) {
        return temas.filter(t => t !== 'adultos');
    }
    return temas;
}

/**
 * Valida si un tema existe
 * @param {string} tema - Nombre del tema
 * @param {string} idioma - Código de idioma
 * @returns {boolean} true si existe
 */
function temaExiste(tema, idioma = 'es') {
    if (tema === 'mios') return true;
    return temasPalabras[idioma].hasOwnProperty(tema);
}

export { temasPalabras, obtenerPalabraAleatoria, obtenerTemas, temaExiste, obtenerPalabrasTema };
