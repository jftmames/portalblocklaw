// ==========================================================
// MÓDULO: Hashing y Utilitarios de Datos
// ==========================================================

// Mock SHA-256 Hashing Function (Centralizada y reutilizada)
function mockSHA256(text, nonce = 0) {
    const combined = String(text) + String(nonce);
    if (!combined) return '0000000000000000000000000000000000000000000000000000000000000000';
    
    let hashValue = 0;
    for(let i=0; i < combined.length; i++) {
        hashValue = (hashValue << 5) - hashValue + combined.charCodeAt(i);
        hashValue |= 0; 
    }
    let mockHash = Math.abs(hashValue * 99991).toString(16).padEnd(64, 'f');
    return mockHash.substring(0, 64);
}

// Función para cargar datos de forma robusta
async function fetchSesionesData(url = 'data/sesiones.json') {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Error al cargar los datos: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('FALLO DE ROBUSTEZ: Error al cargar sesiones.json', error);
        // Retorna un array vacío para evitar que el script falle
        return [];
    }
}


// ==========================================================
// MÓDULO: Plantillas y Navegación
// ==========================================================

function injectNavigation(selector = '#nav-placeholder') {
    const navPlaceholder = document.querySelector(selector);
    if (navPlaceholder) {
        fetch('templates/header.html')
            .then(response => response.text())
            .then(html => {
                navPlaceholder.innerHTML = html;
            })
            .catch(error => {
                console.error('Error loading navigation template:', error);
                navPlaceholder.innerHTML = '<p class="text-red-500">Error al cargar la navegación.</p>';
            });
    }
}

// ==========================================================
// MÓDULO: Lógica de Progreso (Estado y Estilo Moderno)
// ==========================================================
function initProgresoButton(slug) {
    const progresoBtn = document.getElementById('progreso-btn');
    if (!progresoBtn) return;
    
    const key = `prog:${slug}`;

    function getInitialStatus() {
        if (typeof window !== 'undefined') {
            return localStorage.getItem(key) === '1';
        }
        return false;
    }

    let done = getInitialStatus();

    function updateProgresoUI() {
        if (done) {
            // Estilo Moderno: Verde Esmeralda para completado
            progresoBtn.textContent = 'Completada ✅';
            progresoBtn.className = 'text-sm border rounded px-3 py-1 font-medium transition-all bg-emerald-700 border-emerald-500 text-white hover:bg-emerald-600 focus:ring-emerald-500';
        } else {
            // Estilo Moderno: Gris/Neutro para pendiente
            progresoBtn.textContent = 'Marcar como completada';
            progresoBtn.className = 'text-sm border rounded px-3 py-1 font-medium transition-all bg-slate-700 border-slate-600 text-gray-300 hover:bg-slate-600 focus:ring-slate-500';
        }
    }

    progresoBtn.addEventListener('click', () => {
        if (typeof window !== 'undefined') {
            done = !done;
            const v = done ? '1' : '0'; 
            localStorage.setItem(key, v); 
            updateProgresoUI();
        }
    });

    updateProgresoUI();
}
