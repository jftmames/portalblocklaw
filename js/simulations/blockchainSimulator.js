// Archivo: js/simulations/blockchainSimulator.js

// Import mockSHA256 from the utils module (assuming utils.js is updated)
import { mockSHA256 } from '../utils.js';

const BLOCK_WIDTH = 280;
const BLOCK_HEIGHT = 160;
const PADDING = 40;
const INITIAL_HASH = '0000000000000000'; // Simplified Prev Hash for Genesis Block

let canvas, ctx;
let dataBlock1Input, recalculateBtn;
let block1, block2;

function initializeBlocks(canvasHeight) {
    const centerY = (canvasHeight - BLOCK_HEIGHT) / 2;
    block1 = { 
        x: PADDING, 
        y: centerY, 
        data: 'Transacción A: 50 BTC', 
        prevHash: INITIAL_HASH 
    };
    block2 = { 
        x: 0, 
        y: centerY, 
        data: 'Transacción B: 10 BTC', 
        prevHash: '' 
    };
    // Initialize the textarea if empty
    if(dataBlock1Input && !dataBlock1Input.value) dataBlock1Input.value = block1.data;
}

function drawBlock(block, index, isValid, currentHash) {
    // Colors for modern, high-contrast aesthetic
    const HASH_COLOR = '#60a5fa'; // Blue-400
    const PREV_HASH_COLOR = '#fcd34d'; // Amber-300
    
    // Status colors
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
    
    initializeBlocks(canvas.height);

    block2.x = canvas.width - BLOCK_WIDTH - PADDING;

    // --- Chain Logic and Drawing ---
    
    block1.data = dataBlock1Input.value;
    const hash1 = mockSHA256(block1.data, 0); // Hash of Block 1's content + prevHash

    // The integrity is broken if the hash of Block 1's data (and prevHash) 
    // does not match the stored previous hash in Block 2.
    // Since we set block2.prevHash = hash1 immediately after calculating hash1,
    // the condition is always true unless the user manually changed block2's prevHash,
    // so we simulate the break by checking if the user *changed* the input data.
    
    const initialHash1 = mockSHA256(block1.data + block1.prevHash);
    const initialHash2 = mockSHA256(block2.data + hash1);
    
    // Calculate Block 1
    const currentHash1 = mockSHA256(block1.data, 0);
    
    // Check if the user modified the data input field
    const isDataModified = block1.data !== 'Transacción A: 50 BTC';

    // Block 2's integrity is broken if the current Block 1 hash (currentHash1) 
    // does not match what Block 2 was originally created with (hash1)
    const isBlock2Valid = !isDataModified; 
    
    block2.prevHash = currentHash1; // Update the Prev Hash of Block 2 with the *current* hash of Block 1

    // Draw Block 1
    drawBlock(block1, 1, true, currentHash1);

    // Draw Block 2 (Validity check based on linkage)
    const currentHash2 = mockSHA256(block2.data, 0);
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
         ctx.fillText('¡CADENA ROTA! (Hash Inválido)', canvas.width / 2, canvas.height - 30);
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
    
    drawChain(); 
}
