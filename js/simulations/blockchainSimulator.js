// Archivo: js/simulations/blockchainSimulator.js (Versión Final Robusta)

import { mockSHA256 } from '../utils.js';

const BLOCK_WIDTH = 280;
const BLOCK_HEIGHT = 160;
const PADDING = 40;
const INITIAL_HASH = '00000000000000000000000000000000'; 

let canvas, ctx;
let dataBlock1Input, recalculateBtn;
let initialHash1Value; 
const initialDataValue = 'Transacción A: 50 BTC'; 

let block1, block2; 


function initializeGlobalElements() {
    canvas = document.getElementById('blockchainCanvas');
    dataBlock1Input = document.getElementById('data-block1');
    recalculateBtn = document.getElementById('recalculate-btn');
    
    if (!canvas || !dataBlock1Input || !recalculateBtn) {
        console.error("Error crítico: Falta un elemento DOM necesario para la simulación.");
        return false;
    }
    
    ctx = canvas.getContext('2d');
    if (!ctx) {
         console.error("Failed to get 2D context.");
         return false;
    }
    
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = 400;

    const centerY = canvas.height / 2;
    
    block1 = { 
        x: PADDING, 
        y: centerY - BLOCK_HEIGHT / 2, 
        data: dataBlock1Input.value, 
        prevHash: INITIAL_HASH 
    };
    block2 = { 
        x: canvas.width - BLOCK_WIDTH - PADDING, 
        y: centerY - BLOCK_HEIGHT / 2, 
        data: 'Transacción B: 10 BTC', 
        prevHash: '' 
    };
    
    initialHash1Value = mockSHA256(initialDataValue + INITIAL_HASH);
    
    if (dataBlock1Input.value.trim() === '' || dataBlock1Input.value.trim() === 'mn') {
        dataBlock1Input.value = initialDataValue;
    }

    return true;
}

function drawBlock(block, index, isValid, currentHash) {
    const HASH_COLOR = '#60a5fa'; 
    const PREV_HASH_COLOR = '#fcd34d'; 
    const DATA_COLOR = '#e2e8f0'; 
    const BORDER_COLOR = isValid ? '#10b981' : '#ef4444'; 
    const BG_COLOR = '#1e293b'; 

    ctx.strokeStyle = BORDER_COLOR;
    ctx.fillStyle = BG_COLOR;
    ctx.lineWidth = 4;
    ctx.fillRect(block.x, block.y, BLOCK_WIDTH, BLOCK_HEIGHT);
    ctx.strokeRect(block.x, block.y, BLOCK_WIDTH, BLOCK_HEIGHT);
    
    ctx.fillStyle = 'white';
    ctx.font = 'bold 18px Inter';
    ctx.textAlign = 'center';
    ctx.fillText(`BLOQUE ${index}`, block.x + BLOCK_WIDTH / 2, block.y + 30);
    
    ctx.font = '12px Fira Code';
    ctx.textAlign = 'left';
    
    ctx.fillStyle = DATA_COLOR;
    ctx.fillText(`Data: ${block.data.substring(0, 30)}${block.data.length > 30 ? '...' : ''}`, block.x + 10, block.y + 65); 
    
    ctx.fillStyle = PREV_HASH_COLOR; 
    ctx.fillText(`Prev Hash: ${block.prevHash.substring(0, 16)}...`, block.x + 10, block.y + 100); 
    
    ctx.fillStyle = HASH_COLOR;
    ctx.fillText(`Hash: ${currentHash.substring(0, 16)}...`, block.x + 10, block.y + 135); 
    
    return currentHash;
}


export function drawChain() {
    if (!ctx) return; 

    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = 400;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Re-inicializamos para asegurar que las coordenadas y valores iniciales sean correctos
    initializeGlobalElements();

    block1.data = dataBlock1Input.value;
    const currentHash1 = mockSHA256(block1.data + block1.prevHash); 

    const isBlock2Valid = (currentHash1 === initialHash1Value); 

    block2.prevHash = initialHash1Value; 
    
    const currentHash2 = mockSHA256(block2.data + block2.prevHash);


    // --- Drawing ---
    
    drawBlock(block1, 1, true, currentHash1); 
    drawBlock(block2, 2, isBlock2Valid, currentHash2);

    // Draw Linkage Arrow
    const startX = block1.x + BLOCK_WIDTH;
    const startY = block1.y + BLOCK_HEIGHT / 2;
    const endX = block2.x;
    const endY = block2.y + BLOCK_HEIGHT / 2;
    
    ctx.strokeStyle = isBlock2Valid ? '#10b981' : '#ef4444'; 
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();

    // Draw arrow head and Tampered Indicator
    ctx.fillStyle = isBlock2Valid ? '#10b981' : '#ef4444';
    ctx.beginPath();
    ctx.moveTo(endX, endY);
    ctx.lineTo(endX - 12, endY - 6);
    ctx.lineTo(endX - 12, endY + 6);
    ctx.fill();
    
    if (!isBlock2Valid) {
         ctx.fillStyle = '#fcd34d'; 
         ctx.font = 'bold 24px Inter';
         ctx.textAlign = 'center';
         ctx.fillText('¡CADENA ROTA!', canvas.width / 2, canvas.height - 30);
    }
}

export function initBlockchainSimulator() {
    if (!initializeGlobalElements()) return;
    
    dataBlock1Input.addEventListener('input', drawChain); 
    
    // 🛑 VINCULACIÓN FINAL: El listener del botón está garantizado para llamar a drawChain 🛑
    recalculateBtn.addEventListener('click', (e) => {
        drawChain(); 
    });
    
    window.addEventListener('resize', drawChain);
    
    drawChain(); 
}
