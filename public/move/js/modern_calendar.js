/**
 * MOVE MODERN — CALENDAR ENGINE
 * Features: Dynamic Forms, Leaflet Maps, Role Management
 */

// 1. CONSTANTS & CATEGORIES
const MOVE_CATEGORIES = {
    "RUTES": { color: "#156EF6", icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 18l5-5-5-5M6 13h12"/></svg>`, fields: ["Dificultat", "Distància (km)", "Desnivell (m)"] },
    "VIES-FERRADES": { color: "#F6156E", icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6h16M4 10h16M4 14h16M4 18h16"/></svg>`, fields: ["Dificultat (K1-K6)", "Equipament"] },
    "ESCALADA": { color: "#8E15F6", icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 11V7l5-5 5 5v4"/><path d="M12 12v10"/><path d="M8 16h8"/></svg>`, fields: ["Grau", "Llargades", "Sector"] },
    "BTT": { color: "#F68E15", icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18.5" cy="17.5" r="3.5"/><circle cx="5.5" cy="17.5" r="3.5"/><path d="M15 13.5H9l-3-6h12l-3 6z"/></svg>`, fields: ["Dificultat", "Terreny"] },
    "ESTADES-CURSOS": { color: "#15F6B4", icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>`, fields: ["Preu", "Places Restants"] },
    "ALPINISME": { color: "#E5E7EB", icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 20h18L12 4z"/></svg>`, fields: ["Altitud", "Material"] },
    "BARRANQUISME": { color: "#15F6F6", icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M5 12h14"/><path d="M22 12c0 6-10 10-10 10S2 18 2 12 12 2 12 2s10 4 10 10z"/></svg>`, fields: ["Ràpels", "Cabdal"] },
    "ESPELEOLOGIA": { color: "#F6C115", icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>`, fields: ["Recorregut", "Profunditat"] },
    "CAIACS": { color: "#158EF6", icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12h20M2 12a10 10 0 0 0 20 0M12 2v20"/></svg>`, fields: ["Zona", "Flota"] },
    "REPTES-EVENTS": { color: "#F6D215", icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 15l-2 5h4l-2-5zM22 9l-10 6L2 9l10-6 10 6z"/></svg>`, fields: ["Organitzador", "Data Límit"] },
    "XERRADES-CONFERENCIES": { color: "#F68E15", icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`, fields: ["Ponent", "Espai"] },
    "VOLUNTARIATS": { color: "#15F66E", icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`, fields: ["Tasques", "Hores"] },
    "FESTES": { color: "#F615C1", icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`, fields: ["Ticked", "Vestuari"] },
    "ALTRES": { color: "#9CA3AF", icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>`, fields: ["Notes"] }
};

const DIFFICULTY_DESC = {
    "Molt Fàcil": "Apte per a tothom. Terreny planer i distància curta.",
    "Fàcil": "Requereix una mica de forma física però sense dificultat tècnica.",
    "Moderat": "Terreny irregular i desnivells notables.",
    "Difícil": "Requereix bona forma i experiència en muntanya.",
    "Expert": "Pendent acusada, terreny tècnic o exposició."
};

// 2. STATE
let state = {
    currentDate: new Date(),
    view: "month", // month | week
    layout: "grid", // grid | list
    isAdmin: false,
    activities: [],
    selectedCategoryId: "ALL",
    map: null
};

// 3. INITIALIZATION
document.addEventListener("DOMContentLoaded", () => {
    initCalendar();
    initMap();
    initEventListeners();
    renderCategories();
    checkAdminKey(); // Master key check
});

function initCalendar() {
    renderMonthView();
    updateHeaderDate();
}

function initMap() {
    state.map = L.map('move-map').setView([41.3851, 2.1734], 9);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(state.map);
}

function checkAdminKey() {
    // Check master key in localStorage or via URL
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("key") === "MARC_ADMIN_2026") {
        state.isAdmin = true;
        localStorage.setItem("move_admin_key", "MARC_ADMIN_2026");
        document.body.classList.add("admin-mode");
        document.getElementById("admin-add-btn").style.display = "flex";
    } else if (localStorage.getItem("move_admin_key") === "MARC_ADMIN_2026") {
        state.isAdmin = true;
        document.body.classList.add("admin-mode");
        document.getElementById("admin-add-btn").style.display = "flex";
    }
}

// 4. RENDERING LOGIC
function renderMonthView() {
    const target = document.getElementById("calendar-render-target");
    target.innerHTML = "";
    
    const grid = document.createElement("div");
    grid.className = "monthly-grid";
    
    // Day Headers
    const days = ["Dl", "Dt", "Dc", "Dj", "Dv", "Ds", "Dg"];
    days.forEach(d => {
        const h = document.createElement("div");
        h.className = "calendar-day-header";
        h.innerText = d;
        grid.appendChild(h);
    });
    
    // Generate Cells
    const firstDay = new Date(state.currentDate.getFullYear(), state.currentDate.getMonth(), 1);
    const lastDay = new Date(state.currentDate.getFullYear(), state.currentDate.getMonth() + 1, 0);
    
    // Offset leading days
    let startOffset = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
    
    for (let i = 0; i < 42; i++) {
        const cellDate = new Date(firstDay);
        cellDate.setDate(firstDay.getDate() - startOffset + i);
        
        const cell = document.createElement("div");
        cell.className = "calendar-cell";
        if (cellDate.getMonth() !== state.currentDate.getMonth()) cell.classList.add("other-month");
        if (isToday(cellDate)) cell.classList.add("today");
        
        cell.innerHTML = `
            <div class="cell-header">
                <span class="day-number">${cellDate.getDate()}</span>
            </div>
            <div class="event-pills-container" id="events-${cellDate.getTime()} text-left"></div>
        `;
        
        // Admin click to add
        cell.onclick = (e) => {
            if (state.isAdmin) openAdminForm(cellDate);
            else openDayPlans(cellDate);
        };
        
        grid.appendChild(cell);
    }
    
    target.appendChild(grid);
}

function updateHeaderDate() {
    const months = ["Gener", "Febrer", "Març", "Abril", "Maig", "Juny", "Juliol", "Agost", "Setembre", "Octubre", "Novembre", "Desembre"];
    document.getElementById("display-month").innerText = months[state.currentDate.getMonth()];
    document.getElementById("display-year").innerText = state.currentDate.getFullYear();
    
    if (document.getElementById("display-date-mob")) {
        document.getElementById("display-date-mob").innerText = `${months[state.currentDate.getMonth()]} ${state.currentDate.getFullYear()}`;
    }
}

// 5. DYNAMIC FORMS LOGIC
const categorySelect = document.getElementById("form-category-select");
if (categorySelect) {
    categorySelect.onchange = (e) => updateDynamicFields(e.target.value);
}

function updateDynamicFields(catId) {
    const container = document.getElementById("dynamic-fields-row");
    container.innerHTML = "";
    
    const cat = MOVE_CATEGORIES[catId];
    if (!cat) return;
    
    cat.fields.forEach(field => {
        const group = document.createElement("div");
        group.className = "form-group animate-in fade-in";
        
        const label = document.createElement("label");
        label.innerText = field;
        
        let input;
        if (field === "Dificultat") {
            input = document.createElement("select");
            ["Molt Fàcil", "Fàcil", "Moderat", "Difícil", "Expert"].forEach(opt => {
                const o = document.createElement("option");
                o.value = opt;
                o.innerText = opt;
                input.appendChild(o);
            });
            
            // Special: Description text for difficulty
            const desc = document.createElement("p");
            desc.className = "text-[10px] text-[var(--color-muted)] mt-1 italic";
            desc.id = "difficulty-desc-text";
            desc.innerText = DIFFICULTY_DESC["Molt Fàcil"];
            
            input.onchange = (e) => {
                document.getElementById("difficulty-desc-text").innerText = DIFFICULTY_DESC[e.target.value];
            };
            
            group.appendChild(label);
            group.appendChild(input);
            group.appendChild(desc);
        } else {
            input = document.createElement("input");
            input.type = "text";
            input.placeholder = "...";
            group.appendChild(label);
            group.appendChild(input);
        }
        
        container.appendChild(group);
    });
}

// 6. UTILS
function isToday(date) {
    const today = new Date();
    return date.getDate() === today.getDate() && 
           date.getMonth() === today.getMonth() && 
           date.getFullYear() === today.getFullYear();
}

function renderCategories() {
    const container = document.getElementById("category-chips-container");
    const select = document.getElementById("form-category-select");
    
    Object.keys(MOVE_CATEGORIES).forEach(id => {
        const cat = MOVE_CATEGORIES[id];
        
        // Chip
        const chip = document.createElement("button");
        chip.className = "view-chip-sm";
        chip.style.setProperty("--chip-color", cat.color);
        chip.innerHTML = `${cat.icon} <span>${id}</span>`;
        container.appendChild(chip);
        
        // Option
        const opt = document.createElement("option");
        opt.value = id;
        opt.innerText = id;
        select.appendChild(opt);
    });
}

function initEventListeners() {
    document.getElementById("next-btn").onclick = () => {
        state.currentDate.setMonth(state.currentDate.getMonth() + 1);
        initCalendar();
    };
    
    document.getElementById("prev-btn").onclick = () => {
        state.currentDate.setMonth(state.currentDate.getMonth() - 1);
        initCalendar();
    };

    document.getElementById("today-btn").onclick = () => {
        state.currentDate = new Date();
        initCalendar();
    };

    // Mobile Layout Toggle
    const mobToggle = document.getElementById("mobile-layout-toggle");
    if (mobToggle) {
        mobToggle.onchange = (e) => {
            state.layout = e.target.checked ? "list" : "grid";
            document.body.classList.toggle("layout-list", e.target.checked);
        };
    }
}

// Modal management
window.openModal = (id) => document.getElementById(id).classList.add("active");
window.closeModal = (id) => document.getElementById(id).classList.remove("active");

function openAdminForm(date) {
    document.getElementById("form-date").value = date.toISOString().slice(0, 16);
    updateDynamicFields(categorySelect.value);
    openModal('admin-form-modal');
}

function openDayPlans(date) {
    const plansModal = document.getElementById("day-plans-modal");
    document.getElementById("plans-modal-date").innerText = date.toLocaleDateString("ca-ES", { weekday: 'long', day: 'numeric', month: 'long' });
    openModal('day-plans-modal');
}
