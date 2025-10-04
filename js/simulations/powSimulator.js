// Archivo: js/simulations/powSimulator.js

// Función de Hashing Específica para PoW (Encapsulada)
// NOTA: Usa el nonce para simular el comportamiento de prueba y error.
function powMockSHA256(data, nonce) {
    const combined = String(data) + String(nonce);
    if (!combined) return '0000000000000000000000000000000000000000000000000000000000000000';
    
    let hashValue = 0;
    for(let i=0; i < combined.length; i++) {
        hashValue = (hashValue << 5) - hashValue + combined.charCodeAt(i);
        hashValue |= 0; 
    }
    // Simula un hash hex de 64 caracteres, dependiente del nonce
    return Math.abs(hashValue * 99991).toString(16).padEnd(64, 'a').substring(0, 64);
}


export function initPowSimulator() {
    const nonceDisplay = document.getElementById('nonce-display');
    const hashDisplay = document.getElementById('hash-display');
    const mineBtn = document.getElementById('mine-btn');
    
    if (!nonceDisplay || !hashDisplay || !mineBtn) return;
    
    const DATA = "Transacciones Merkle Root";
    const DIFFICULTY = '0000'; 

    let nonce = 0;
    let isMining = false;
    let miningInterval;

    function updateHashDisplay(hash, isFound) {
        hashDisplay.textContent = hash;
        if (isFound) {
            hashDisplay.classList.add('hash-valid');
            nonceDisplay.classList.add('hash-valid');
        } else {
            hashDisplay.classList.remove('hash-valid');
            nonceDisplay.classList.remove('hash-valid');
        }
    }

    function mineStep() {
        nonce++;
        nonceDisplay.textContent = nonce;
        
        const currentHash = powMockSHA256(DATA, nonce);
        updateHashDisplay(currentHash, false);

        if (currentHash.startsWith(DIFFICULTY)) {
            stopMining(true);
        }
        
        if (nonce > 100000) {
            stopMining(false);
        }
    }

    function startMining() {
        if (isMining) return;
        isMining = true;
        mineBtn.disabled = true;
        mineBtn.textContent = 'Minando...';

        if (hashDisplay.classList.contains('hash-valid')) {
            nonce = 0;
        }

        miningInterval = setInterval(mineStep, 10);
    }

    function stopMining(found) {
        clearInterval(miningInterval);
        isMining = false;
        mineBtn.disabled = false;
        
        if (found) {
            mineBtn.textContent = `¡BLOQUE MINADO! (Nonce: ${nonce})`;
            updateHashDisplay(powMockSHA256(DATA, nonce), true);
        } else {
            mineBtn.textContent = '▶ Minar Bloque';
            updateHashDisplay(powMockSHA256(DATA, nonce), false);
        }
    }

    mineBtn.addEventListener('click', startMining);
    
    // Inicialización
    updateHashDisplay(powMockSHA256(DATA, nonce), false);
}
