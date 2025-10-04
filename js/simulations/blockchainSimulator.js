// Archivo: js/simulations/blockchainSimulator.js (Corregido)

// Importamos la función mockSHA256 desde utils.js para asegurar que el scope sea correcto
import { mockSHA256 } from '../utils.js';

const BLOCK_WIDTH = 280;
const BLOCK_HEIGHT = 160;
const PADDING = 40;
const INITIAL_HASH = '0000000000000000'; 

let canvas, ctx;
let dataBlock1Input, recalculateBtn;
let block1, block2;
let initialDataValue = 'Transacción A: 50 BTC'; // Almacenar el valor inicial para la comprobación

function initializeBlocks(canvasHeight) {
    const centerY = canvasHeight / 2;
    
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
        prevHash: '' // Será el hash inicial de Block 1
    };
    
    // Asegurar que el input tenga el valor inicial al cargar
    if(!dataBlock1Input.value) dataBlock1Input.value = initialDataValue;
}

function drawBlock(block, index, isValid, currentHash) {
    const HASH_COLOR = '#60a5fa'; // Blue-400
    const PREV_HASH_COLOR = '#fcd34d'; // Amber-300
    const DATA_COLOR = '#e2e8f0'; 
    
    const BORDER_COLOR = isValid ? '#10b981' : '#ef4444'; // Emerald (OK) or Red (BROKEN)
    const BG_COLOR = '#1e293b'; // Slate-800

    // Draw Box
    ctx.strokeStyle = BORDER_COLOR;
    ctx.fillStyle = BG_COLOR;
    ctx.lineWidth = 4;
    ctx.fillRect(block.x, block.y, BLOCK_WIDTH, BLOCK_HEIGHT);
    ctx.strokeRect(block.x, block.y, BLOCK_WIDTH, BLOCK_HEIGHT);
    
    // Draw Title
    ctx.fillStyle = 'white';
    ctx.font = 'bold 18px Inter';
    ctx.textAlign = 'center';
    ctx.fillText(`BLOQUE ${index}`, block.x + BLOCK_WIDTH / 2, block.y + 30);
    
    ctx.font = '12px Fira Code';
    ctx.textAlign = 'left';
    
    // Data
    ctx.fillStyle = DATA_COLOR;
    ctx.fillText(`Data: ${block.data.substring(0, 30)}${block.data.length > 30 ? '...' : ''}`, block.x + 10, block.y + 60);
    
    // Prev Hash (Linkage Check)
    ctx.fillStyle = PREV_HASH_COLOR; 
    ctx.fillText(`Prev Hash: ${block.prevHash.substring(0, 16)}...`, block.x + 10, block.y + 95);
    
    // Current Hash (Proof)
    ctx.fillStyle = HASH_COLOR;
    ctx.fillText(`Hash: ${currentHash.substring(0, 16)}...`, block.x + 10, block.y + 125);
    
    return currentHash;
}

function drawChain() {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = 400;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Inicializar bloques con el tamaño actual del canvas
    initializeBlocks(canvas.height);

    // --- Chain Logic ---
    
    // 1. Obtener datos actuales del input
    block1.data = dataBlock1Input.value;
    
    // 2. Calcular el hash del Bloque 1
    const currentHash1 = mockSHA256(block1.data + block1.prevHash); 

    // 3. Determinar la validez de la cadena
    // En la inicialización, el hash del Bloque 1 se iguala al Prev Hash del Bloque 2.
    // Si el usuario modifica el input, currentHash1 cambia, rompiendo la igualdad.
    const isBlock2Valid = block2.prevHash === currentHash1;

    // Actualizar el Prev Hash de Block 2 con el hash actual de Block 1
    block2.prevHash = currentHash1; 
    
    // Calcular el hash del Bloque 2 (necesita el hash roto para el cálculo)
    const currentHash2 = mockSHA256(block2.data + block2.prevHash);


    // --- Drawing ---
    
    drawBlock(block1, 1, true, currentHash1);
    drawBlock(block2, 2, isBlock2Valid, currentHash2);

    // Draw Linkage Arrow
    const startX = block1.x + BLOCK_WIDTH;
    const startY = block1.y + BLOCK_HEIGHT / 2;
    const endX = block2.x;
    const endY = block2.y + BLOCK_HEIGHT / 2;
    
    ctx.strokeStyle = isBlock2Valid ? '#10b981' : '#ef4444'; // Emerald or Red
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();

    // Draw arrow head
    ctx.fillStyle = isBlock2Valid ? '#10b981' : '#ef4444';
    ctx.beginPath();
    ctx.moveTo(endX, endY);
    ctx.lineTo(endX - 12, endY - 6);
    ctx.lineTo(endX - 12, endY + 6);
    ctx.fill();
    
    // Add visual "tampered" indicator if invalid
    if (!isBlock2Valid) {
         ctx.fillStyle = '#fcd34d'; // Amber-300
         ctx.font = 'bold 24px Inter';
         ctx.textAlign = 'center';
         ctx.fillText('¡CADENA ROTA!', canvas.width / 2, canvas.height - 30);
    }
}

export function initBlockchainSimulator() {
    canvas = document.getElementById('blockchainCanvas');
    ctx = canvas.getContext('2d');
    dataBlock1Input = document.getElementById('data-block1');
    recalculateBtn = document.getElementById('recalculate-btn');

    // Inicializar los bloques para que Block 2 tenga el Prev Hash correcto al inicio
    initializeBlocks(canvas.height);
    const initialHash1 = mockSHA256(block1.data + block1.prevHash);
    block2.prevHash = initialHash1;
    
    dataBlock1Input.addEventListener('input', drawChain); 
    recalculateBtn.addEventListener('click', drawChain);
    window.addEventListener('resize', drawChain);
    
    drawChain(); 
}
