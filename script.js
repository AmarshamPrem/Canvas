const canvas = document.querySelector("canvas"),
    toolBtns = document.querySelectorAll(".tool"),
    fillColor = document.querySelector("#fill-color"),
    sizeSlider = document.querySelector("#size-slider"),
    colorBtns = document.querySelectorAll(".colors .option"),
    colorPicker = document.querySelector("#color-picker"),
    cleatCanvas = document.querySelector(".clear-canvas"),
    saveImage = document.querySelector(".save-img"),
    ctx = canvas.getContext("2d");

//global variabels with default values
let prevMouseX, prevMouseY, snapshot,
    isDrawing = false,
    selectedTool = "brush",
    brushWidth = 5,
    selectedColor = "#000";

// floating cursor indicator for brush size
const cursorIndicator = document.createElement('div');
cursorIndicator.style.position = 'fixed';
cursorIndicator.style.pointerEvents = 'none';
cursorIndicator.style.border = '2px dashed rgba(0,0,0,0.12)';
cursorIndicator.style.borderRadius = '50%';
cursorIndicator.style.transform = 'translate(-50%, -50%)';
cursorIndicator.style.transition = 'width .12s ease, height .12s ease, opacity .12s ease';
cursorIndicator.style.zIndex = 9999;
cursorIndicator.style.opacity = '0';
document.body.appendChild(cursorIndicator);

const setCanvasBackground = () => {
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = selectedColor;
}

// Resize canvas to match its CSS size while preserving content
function resizeCanvasPreserve() {
    // create temporary copy
    const tmpCanvas = document.createElement('canvas');
    tmpCanvas.width = canvas.width;
    tmpCanvas.height = canvas.height;
    const tmpCtx = tmpCanvas.getContext('2d');
    tmpCtx.drawImage(canvas, 0, 0);

    // resize to displayed size and account for devicePixelRatio
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const newWidth = Math.max(1, Math.floor(rect.width * dpr));
    const newHeight = Math.max(1, Math.floor(rect.height * dpr));

    canvas.width = newWidth;
    canvas.height = newHeight;
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';

    // draw back scaled
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // scale context so the tmp image fills the new high-DPI canvas
    ctx.scale(dpr, dpr);
    ctx.drawImage(tmpCanvas, 0, 0, tmpCanvas.width, tmpCanvas.height, 0, 0, rect.width, rect.height);
    ctx.restore();
}

window.addEventListener("load", () => {
    // initialize canvas with devicePixelRatio handling
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.max(1, Math.floor(rect.width * dpr));
    canvas.height = Math.max(1, Math.floor(rect.height * dpr));
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
    ctx.scale(dpr, dpr);
    // ensure a white background
    setCanvasBackground();
});

window.addEventListener('resize', () => {
    // small debounce
    clearTimeout(window._resizeTimeout);
    window._resizeTimeout = setTimeout(() => resizeCanvasPreserve(), 120);
});

const drawRect = (e) => {

    // If fillColor isn't checked draw a react wiht 
    // border else draw rect wiht backgorund
    if (!fillColor.checked) {
        const width = prevMouseX - e.offsetX;
        const height = prevMouseY - e.offsetY;
        return ctx.strokeRect(e.offsetX, e.offsetY,
            width, height);

    }
    const width = prevMouseX - e.offsetX;
    const height = prevMouseY - e.offsetY;
    ctx.fillRect(e.offsetX, e.offsetY, width, height);
}

const drawCircle = (e) => {
    ctx.beginPath();
    let radius = Math.sqrt(Math.pow((prevMouseX -
        e.offsetX), 2)
        + Math.pow((prevMouseY - e.offsetY), 2));
    ctx.arc(prevMouseX, prevMouseY, radius, 0, 2 * Math.PI);
    fillColor.checked ? ctx.fill() : ctx.stroke();
}

const drawTriangle = (e) => {
    ctx.beginPath();
    ctx.moveTo(prevMouseX, prevMouseY);
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.lineTo(prevMouseX * 2 - e.offsetX, e.offsetY);
    ctx.closePath();
    fillColor.checked ? ctx.fill() : ctx.stroke();
}

// Function to draw a square
const drawSquare = (e) => {
    const sideLength = Math.abs(prevMouseX - e.offsetX);
    ctx.beginPath();
    ctx.rect(e.offsetX, e.offsetY, sideLength, sideLength);
    fillColor.checked ? ctx.fill() : ctx.stroke();
}

// Function to draw a hexagon
const drawHexagon = (e) => {
    const sideLength =
        Math.abs(prevMouseX - e.offsetX);
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
        const angle = (2 * Math.PI / 6) * i;
        const x = e.offsetX + sideLength
            * Math.cos(angle);
        const y = e.offsetY + sideLength
            * Math.sin(angle);
        ctx.lineTo(x, y);
    }
    ctx.closePath();
    fillColor.checked ? ctx.fill() : ctx.stroke();
}

// Function to draw a pentagon
const drawPentagon = (e) => {
    const sideLength =
        Math.abs(prevMouseX - e.offsetX);
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
        const angle = (2 * Math.PI / 5) *
            i - Math.PI / 2;
        const x = e.offsetX + sideLength
            * Math.cos(angle);
        const y = e.offsetY + sideLength
            * Math.sin(angle);
        ctx.lineTo(x, y);
    }
    ctx.closePath();
    fillColor.checked ? ctx.fill() : ctx.stroke();
}

const drawLine = (e) => {
    ctx.beginPath();
    ctx.moveTo(prevMouseX, prevMouseY);
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
}

// simple curve drawer (quadratic) helper
const drawCurve = (e) => {
    ctx.beginPath();
    ctx.moveTo(prevMouseX, prevMouseY);
    const cx = (prevMouseX + e.offsetX) / 2;
    const cy = Math.min(prevMouseY, e.offsetY) - Math.abs(e.offsetX - prevMouseX) / 3;
    ctx.quadraticCurveTo(cx, cy, e.offsetX, e.offsetY);
    ctx.stroke();
}

const drawArrow = (e) => {
    const headLength = 10;
    const angle = Math.atan2(e.offsetY - prevMouseY,
        e.offsetX - prevMouseX);
    ctx.beginPath();
    ctx.moveTo(prevMouseX, prevMouseY);
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();

    // Draw arrowhead
    ctx.beginPath();
    ctx.moveTo(e.offsetX - headLength *
        Math.cos(angle - Math.PI / 6),
        e.offsetY - headLength *
        Math.sin(angle - Math.PI / 6));
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.lineTo(e.offsetX - headLength *
        Math.cos(angle + Math.PI / 6),
        e.offsetY - headLength *
        Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fill();
}


const startDraw = (e) => {
    isDrawing = true;
    prevMouseX = e.offsetX;
    prevMouseY = e.offsetY;
    ctx.beginPath();
    ctx.lineWidth = brushWidth;
    ctx.strokeStyle = selectedColor;
    ctx.fillStyle = selectedColor;
    snapshot = ctx.getImageData(0, 0, canvas.width,
        canvas.height);
}


const drawPencil = (e) => {
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
}


const drawing = (e) => {
    if (!isDrawing) return;
    ctx.putImageData(snapshot, 0, 0);
    // smooth stroke settings
    ctx.lineWidth = brushWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (selectedTool === "brush" || selectedTool === "pencil" || selectedTool === "eraser") {
        ctx.strokeStyle = selectedTool === "eraser" ? "#fff" : selectedColor;
        ctx.globalCompositeOperation = selectedTool === 'eraser' ? 'destination-out' : 'source-over';
        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.stroke();
    } else if (selectedTool === "rectangle") {
        drawRect(e);

    }
    else if (selectedTool === "circle") {
        drawCircle(e);

    } else if (selectedTool === "triangle") {
        drawTriangle(e);

    } else if (selectedTool === "square") {
        drawSquare(e);
    } else if (selectedTool === "hexagon") {
        drawHexagon(e);
    } else if (selectedTool === "pentagon") {
        drawPentagon(e);
    } else if (selectedTool === "line") {
        drawLine(e);
    } else if (selectedTool === "arrow") {
        drawArrow(e);
    } else if (selectedTool === "curve") {
        drawCurve(e);
    }
    else {
        drawPencil(e);

    }
}


toolBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        const prev = document.querySelector(".options .active");
        if (prev) prev.classList.remove("active");
        btn.classList.add("active");
        selectedTool = btn.id;
        // show indicator briefly
        cursorIndicator.style.opacity = '1';
        setTimeout(() => cursorIndicator.style.opacity = '0', 600);
    });

});

sizeSlider.addEventListener("input", () => {
    brushWidth = Number(sizeSlider.value);
    const size = Math.max(6, brushWidth * 2);
    cursorIndicator.style.width = `${size}px`;
    cursorIndicator.style.height = `${size}px`;
});

colorBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        const prev = document.querySelector(".options .selected");
        if (prev) prev.classList.remove("selected");
        btn.classList.add("selected");
        // if it's the color-picker parent, the background will be set by picker
        const bg = window.getComputedStyle(btn).getPropertyValue("background-color");
        selectedColor = bg || selectedColor;
    });
});


colorPicker.addEventListener("change", () => {
    colorPicker.parentElement.style.background =
        colorPicker.value;
    selectedColor = colorPicker.value;
    colorPicker.parentElement.classList.add('selected');
    const prev = document.querySelector('.colors .option.selected');
    if (prev && prev !== colorPicker.parentElement) prev.classList.remove('selected');
});

cleatCanvas.addEventListener("click", () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setCanvasBackground();
})

saveImage.addEventListener("click", () => {
    const link = document.createElement("a");
    link.download = `${Date.now()}.jpg`;
    link.href = canvas.toDataURL('image/jpeg', 0.95);
    link.click();
})

// Pointer helpers (support mouse + touch)
function getPointerPos(e) {
    const rect = canvas.getBoundingClientRect();
    if (e.touches && e.touches[0]) {
        return { offsetX: e.touches[0].clientX - rect.left, offsetY: e.touches[0].clientY - rect.top, clientX: e.touches[0].clientX, clientY: e.touches[0].clientY };
    }
    // mouse events: use clientX/Y to compute offset relative to canvas rect to avoid issues when CSS scales canvas
    if (typeof e.clientX === 'number' && typeof e.clientY === 'number') {
        return { offsetX: e.clientX - rect.left, offsetY: e.clientY - rect.top, clientX: e.clientX, clientY: e.clientY };
    }
    // fallback
    return { offsetX: e.offsetX || 0, offsetY: e.offsetY || 0, clientX: rect.left + (e.offsetX || 0), clientY: rect.top + (e.offsetY || 0) };
}

// --- Canvas size controls wiring ---
const ratioSelect = document.getElementById('ratio-select');
const presetSelect = document.getElementById('preset-select');
const widthInput = document.getElementById('canvas-width');
const heightInput = document.getElementById('canvas-height');
const scaleCheckbox = document.getElementById('scale-content');
const applyBtn = document.getElementById('apply-canvas-size');

const containerEl = document.querySelector('.container');
const toolsBoardEl = document.querySelector('.tools-board');
const canvasCardEl = document.querySelector('.canvas-card');
// store original container inline style to restore
const originalContainerStyle = { width: containerEl.style.width || '', height: containerEl.style.height || '' };

// initialize inputs from current canvas size (CSS pixels)
function initCanvasSizeInputs() {
    const rect = canvas.getBoundingClientRect();
    widthInput.value = Math.round(rect.width);
    heightInput.value = Math.round(rect.height);
}

initCanvasSizeInputs();

presetSelect.addEventListener('change', () => {
    const v = presetSelect.value;
    if (v === 'fit') {
        initCanvasSizeInputs();
    } else if (v === 'custom') {
        // keep current inputs
    } else {
        const [w, h] = v.split('x').map(Number);
        widthInput.value = w;
        heightInput.value = h;
    }
});

ratioSelect.addEventListener('change', () => {
    const val = ratioSelect.value;
    if (val === 'auto') {
        initCanvasSizeInputs();
        return;
    }
    const [w, h] = val.split(':').map(Number);
    const rect = canvas.getBoundingClientRect();
    // keep width and adjust height to ratio
    const newHeight = Math.round((rect.width * h) / w);
    widthInput.value = Math.round(rect.width);
    heightInput.value = newHeight;
    presetSelect.value = 'custom';
});

function applyCanvasSize(widthPx, heightPx, scaleContent = true) {
    // widthPx and heightPx are CSS pixels for display size
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    // create tmp image of current visual content
    const tmp = document.createElement('canvas');
    tmp.width = Math.max(1, Math.floor(rect.width * dpr));
    tmp.height = Math.max(1, Math.floor(rect.height * dpr));
    const tmpCtx = tmp.getContext('2d');
    // draw current (actual) canvas into tmp at 1:1 pixel scale
    tmpCtx.drawImage(canvas, 0, 0, tmp.width, tmp.height);

    // set new internal size
    const newW = Math.max(1, Math.floor(widthPx * dpr));
    const newH = Math.max(1, Math.floor(heightPx * dpr));

    // resize canvas
    canvas.width = newW;
    canvas.height = newH;
    canvas.style.width = widthPx + 'px';
    canvas.style.height = heightPx + 'px';

    // clear and set transform to match DPR
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.scale(dpr, dpr);

    if (scaleContent) {
        // draw tmp scaled into the new canvas (scale to fit new CSS size)
        ctx.drawImage(tmp, 0, 0, tmp.width, tmp.height, 0, 0, widthPx, heightPx);
    } else {
        // draw at top-left without scaling (pixel-perfect copy until space allows)
        // compute target pixel area in destination
        const drawW = Math.min(tmp.width, canvas.width);
        const drawH = Math.min(tmp.height, canvas.height);
        ctx.drawImage(tmp, 0, 0, drawW, drawH, 0, 0, drawW / dpr, drawH / dpr);
    }
}

applyBtn.addEventListener('click', () => {
    const w = Number(widthInput.value) || canvas.getBoundingClientRect().width;
    const h = Number(heightInput.value) || canvas.getBoundingClientRect().height;
    const scale = !!scaleCheckbox.checked;
    applyCanvasSize(w, h, scale);
    // adjust outer container to fit the new canvas (but clamp to viewport)
    if (presetSelect.value === 'fit') {
        // restore defaults
        containerEl.style.width = originalContainerStyle.width;
        containerEl.style.height = originalContainerStyle.height;
    } else {
        updateContainerSize(w, h);
    }
});

function updateContainerSize(widthPx, heightPx) {
    // Compute extra vertical space from paddings and card paddings
    const cStyle = getComputedStyle(containerEl);
    const cardStyle = getComputedStyle(canvasCardEl);
    const gap = parseFloat(cStyle.gap) || 20;
    const cPadTop = parseFloat(cStyle.paddingTop) || 0;
    const cPadBottom = parseFloat(cStyle.paddingBottom) || 0;
    const cardPadTop = parseFloat(cardStyle.paddingTop) || 0;
    const cardPadBottom = parseFloat(cardStyle.paddingBottom) || 0;
    const extras = cPadTop + cPadBottom + cardPadTop + cardPadBottom + 40; // extra room for headers/margins

    // desired container height
    let desiredHeight = Math.round(heightPx + extras);
    // clamp to viewport minus small margin
    const maxAllowed = Math.round(window.innerHeight - 48);
    if (desiredHeight > maxAllowed) desiredHeight = maxAllowed;
    containerEl.style.height = desiredHeight + 'px';

    // compute desired container width: tools width + gap + canvas width + paddings
    const toolsW = toolsBoardEl.getBoundingClientRect().width || 260;
    const desiredWidth = Math.round(toolsW + gap + widthPx + cPadTop + cPadBottom + 40);
    const maxAllowedW = Math.round(window.innerWidth - 48);
    const finalWidth = Math.min(desiredWidth, maxAllowedW);
    containerEl.style.width = finalWidth + 'px';
}


function handlePointerDown(e) {
    e.preventDefault();
    const pos = getPointerPos(e);
    isDrawing = true;
    prevMouseX = pos.offsetX;
    prevMouseY = pos.offsetY;
    ctx.beginPath();
    ctx.moveTo(prevMouseX, prevMouseY);
    ctx.lineWidth = brushWidth;
    ctx.strokeStyle = selectedTool === 'eraser' ? '#fff' : selectedColor;
    ctx.fillStyle = selectedColor;
    snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
    cursorIndicator.style.opacity = '0.9';
}

function handlePointerMove(e) {
    const pos = getPointerPos(e);
    // move cursor indicator
    const cX = pos.clientX || (pos.offsetX + canvas.getBoundingClientRect().left);
    const cY = pos.clientY || (pos.offsetY + canvas.getBoundingClientRect().top);
    cursorIndicator.style.left = `${cX}px`;
    cursorIndicator.style.top = `${cY}px`;
    if (!isDrawing) return;
    drawing({ offsetX: pos.offsetX, offsetY: pos.offsetY });
}

function handlePointerUp(e) {
    isDrawing = false;
    ctx.beginPath();
    cursorIndicator.style.opacity = '0';
    // reset composite operation
    ctx.globalCompositeOperation = 'source-over';
}

canvas.addEventListener("mousedown", handlePointerDown);
canvas.addEventListener("mousemove", handlePointerMove);
canvas.addEventListener("mouseup", handlePointerUp);
canvas.addEventListener('mouseleave', handlePointerUp);

canvas.addEventListener('touchstart', handlePointerDown, { passive: false });
canvas.addEventListener('touchmove', handlePointerMove, { passive: false });
canvas.addEventListener('touchend', handlePointerUp);

// keyboard shortcuts
window.addEventListener('keydown', (ev) => {
    if (ev.key === 'e') document.getElementById('eraser')?.click();
    if (ev.key === 'b') document.getElementById('brush')?.click();
    if (ev.key === 'p') document.getElementById('pencil')?.click();
    if (ev.key === 's') saveImage.click();
    if (ev.key === 'c') clearCanvas.click();
});
