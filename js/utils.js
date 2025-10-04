// ==========================================================
// Centralized Data Utilities
// ==========================================================

// Mock SHA-256 Hashing Function (Reused and centralized)
function mockSHA256(text, nonce = 0) {
    const combined = String(text) + String(nonce);
    if (!combined) return '0000000000000000000000000000000000000000000000000000000000000000';
    
    let hashValue = 0;
    for(let i=0; i < combined.length; i++) {
        hashValue = (hashValue << 5) - hashValue + combined.charCodeAt(i);
        hashValue |= 0; 
    }
    // Ensures a 64-character hash mock
    let mockHash = Math.abs(hashValue * 99991).toString(16).padEnd(64, 'f');
    return mockHash.substring(0, 64);
}

// ==========================================================
// Template Injection (for Nav)
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
            });
    }
}


// ==========================================================
// Progress Button Logic (Replaces Progreso.tsx)
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
            progresoBtn.textContent = 'Completada ✅';
            progresoBtn.className = 'text-sm border rounded px-3 py-1 font-medium transition-all bg-green-100 border-green-300 text-green-700 hover:bg-green-200 focus:ring-green-500';
        } else {
            progresoBtn.textContent = 'Marcar como completada';
            progresoBtn.className = 'text-sm border rounded px-3 py-1 font-medium transition-all bg-white border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-400';
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
