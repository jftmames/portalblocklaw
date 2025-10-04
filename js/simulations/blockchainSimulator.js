// Archivo: js/simulations/blockchainSimulator.js (Versión Final Corregida)

// Importamos la función mockSHA256 desde utils.js
import { mockSHA256 } from '../utils.js';

const BLOCK_WIDTH = 280;
const BLOCK_HEIGHT = 160;
const PADDING = 40;
const INITIAL_HASH = '00000000000000000000000000000000'; // Full length for consistency

let canvas, ctx;
let dataBlock1Input, recalculateBtn;
let block1, block2;
let initialHash1Value; // Almacenará el hash del Bloque 1 en el estado inicial (para la validez)

// Inicializa las variables de bloque y sus posiciones
function initializeBlocks(canvasHeight) {
    const centerY = canvasHeight / 2;
    
    // Si los bloques no han sido creados o el canvas no está disponible, salimos
    if (!canvas) return; 

    // Estado inicial de los bloques (datos fijos)
    const initialData = dataBlock1Input ? dataBlock1Input.value : 'Transacción A: 50 BTC';
    
    block1 = { 
        x: PADDING, 
        y: centerY - BLOCK_HEIGHT / 2, 
        data: initialData, 
        prevHash: INITIAL_HASH 
    };
    block2 = { 
        x: canvas.width - BLOCK_WIDTH - PADDING, 
        y: centerY - BLOCK_HEIGHT / 2, 
        data: 'Transacción B: 10 BTC', 
        prevHash: '' // Se llenará con initialHash1Value
    };
    
    // 1. Calcular el hash de Block 1 en estado GENESIS
    initialHash1Value = mockSHA256(block1.data + block1.prevHash);
    
    // 2. Establecer el Prev Hash del Bloque 2 a este valor fijo inicial
    block2.prevHash = initialHash1Value;
}

function drawBlock(block, index, isValid, currentHash) {
    // Colores para estética moderna y de alto contraste
    const HASH_COLOR = '#60a5fa'; // Blue-400
    const PREV_HASH_COLOR = '#fcd34d'; // Amber-300
    const DATA_COLOR = '#e2e8f0'; // Slate-200
    
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
    
    // 🛑 ATENCIÓN: Se ajustan las coordenadas Y para texto para visibilidad 🛑
    
    // Data
    ctx.fillStyle = DATA_COLOR;
    ctx.fillText(`Data: ${block.data.substring(0, 30)}${block.data.length > 30 ? '...' : ''}`, block.x + 10, block.y + 65); // Ajustado a 65
    
    // Prev Hash (Linkage Check)
    ctx.fillStyle = PREV_HASH_COLOR; 
    // Usamos el hash que el bloque "espera" tener, que es el hash de B1.
    ctx.fillText(`Prev Hash: ${block.prevHash.substring(0, 16)}...`, block.x + 10, block.y + 100); // Ajustado a 100
    
    // Current Hash (Proof)
    ctx.fillStyle = HASH_COLOR;
    ctx.fillText(`Hash: ${currentHash.substring(0, 16)}...`, block.x + 10, block.y + 135); // Ajustado a 135
    
    return currentHash;
}

function drawChain() {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = 400;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Inicializar bloques con el tamaño actual del canvas
    initializeBlocks(canvas.height);

    // 1. Obtener datos actuales del input
    block1.data = dataBlock1Input.value;
    
    // 2. Calcular el hash actual de Block 1
    const currentHash1 = mockSHA256(block1.data + block1.prevHash); 

    // 3. Determinar la validez de la cadena
    // La cadena está rota si el hash actual del Bloque 1 NO coincide con el Prev Hash fijo de Block 2.
    const isBlock2Valid = (currentHash1 === initialHash1Value); 

    // 4. Actualizar la visualización de Prev Hash del Bloque 2 
    // Siempre muestra el hash que espera si la cadena está rota,
    // o el hash actual si la cadena es válida.
    block2.prevHash = initialHash1Value; // El hash que Block 2 *espera*

    // 5. Calcular el hash del Bloque 2 (usa el Prev Hash esperado para el cálculo)
    const currentHash2 = mockSHA256(block2.data + block2.prevHash);


    // --- Drawing ---
    
    drawBlock(block1, 1, true, currentHash1); // Block 1 siempre es válido
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

    // Inicializar bloques y el valor inicial del hash de Block 1
    initializeBlocks(canvas.height);
    
    dataBlock1Input.addEventListener('input', drawChain); 
    recalculateBtn.addEventListener('click', drawChain);
    window.addEventListener('resize', drawChain);
    
    // Llamada inicial para dibujar
    drawChain(); 
}
