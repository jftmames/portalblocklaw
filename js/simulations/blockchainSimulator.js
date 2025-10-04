// Archivo: js/simulations/blockchainSimulator.js
// Asume que mockSHA256 está disponible en el scope (importado desde utils.js)

const BLOCK_WIDTH = 280;
const BLOCK_HEIGHT = 160;
const PADDING = 40;
const INITIAL_HASH = '0000000000000000'; 

let canvas, ctx;
let dataBlock1Input, recalculateBtn;
let block1, block2;

// Función para obtener mockSHA256 del scope global o de utils.js
// Usamos un import explícito en el HTML, por lo que mockSHA256 estará disponible en utils.js
// Asumimos que mockSHA256 se importa en el script type="module"
import { mockSHA256 } from '../utils.js';

// Inicializa las variables de bloque y sus posiciones
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
        prevHash: '' 
    };
    
    if(!dataBlock1Input.value) dataBlock1Input.value = block1.data;
}

function drawBlock(block, index, isValid, currentHash) {
    const HASH_COLOR = '#60a5fa'; // Blue-400
    const PREV_HASH_COLOR = '#fcd34d'; // Amber-300
    
    const BORDER_COLOR = isValid ? '#10b981' : '#ef4444'; // Emerald or Red
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
    ctx.fillStyle = '#e2e8f0'; // Slate-200
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
    
    // Re-initialize blocks based on current canvas size
    initializeBlocks(canvas.height);

    // --- Chain Logic ---
    
    const initialData = 'Transacción A: 50 BTC';
    block1.data = dataBlock1Input.value;
    
    // Check if data was tampered with (the core teaching moment)
    const isDataModified = block1.data.trim() !== initialData.trim();
    
    // Calculate Block 1's CURRENT hash
    const currentHash1 = mockSHA256(block1.data);
    
    // Block 2's integrity is broken if the hash of the data it contains does not match
    // what it was initialized with. We simplify: Block 2 is valid IF Block 1's data is original.
    const isBlock2Valid = !isDataModified; 
    
    // The Prev Hash of Block 2 must be the CURRENT hash of Block 1
    block2.prevHash = currentHash1; 
    
    // Calculate Block 2's hash
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

    dataBlock1Input.addEventListener('input', drawChain); 
    recalculateBtn.addEventListener('click', drawChain);
    window.addEventListener('resize', drawChain);
    
    // Initial draw
    drawChain(); 
}
