// active tool-btn переключатель
const tools = document.querySelectorAll(".tool-btn")
tools.forEach(tool => {
    tool.addEventListener("click", () => {
        clearAllActive()
        tool.classList.add("active")
    })
});

function clearAllActive() {
    tools.forEach(tool => {
        tool.classList.remove("active")
    });
}

// толщина элемента рисования
const sizeSlider = document.querySelector("#sizeSlider")
const sizeValue = document.querySelector("#sizeValue")
sizeSlider.addEventListener("change", () => {
    sizeValue.textContent = sizeSlider.value + "px"
})

// МАСШТАБИРОВАНИЕ
// Переменные для масштабирования
let zoomLevel = 1;
const ZOOM_STEP = 0.25;
const MAX_ZOOM = 6;
const MIN_ZOOM = 1;
// Получаем элементы управления масштабом
const zoomInBtn = document.getElementById('zoomIn');
const zoomOutBtn = document.getElementById('zoomOut');
const resetZoomBtn = document.getElementById('resetZoom');
// Функция применения масштаба
function applyZoom() {
    if (!currentImage) return;
    
    const container = document.querySelector('.canvas-container');
    const maxWidth = container.clientWidth - 20; // отступы
    const maxHeight = container.clientHeight - 20;
    
    let displayWidth = currentImage.width;
    let displayHeight = currentImage.height;
    
    // Рассчитываем базовый размер с сохранением пропорций
    if (displayWidth > maxWidth) {
        displayHeight = (maxWidth / displayWidth) * displayHeight;
        displayWidth = maxWidth;
    }
    if (displayHeight > maxHeight) {
        displayWidth = (maxHeight / displayHeight) * displayWidth;
        displayHeight = maxHeight;
    }
    
    // Применяем zoom
    canvas.style.width = (displayWidth * zoomLevel) + 'px';
    canvas.style.height = (displayHeight * zoomLevel) + 'px';
    
    // Обновляем статус
    document.getElementById('status').textContent = `Масштаб: ${Math.round(zoomLevel * 100)}%`;
}
// Приблизить
zoomInBtn.addEventListener('click', function() {
    if (zoomLevel < MAX_ZOOM) {
        zoomLevel = Math.min(zoomLevel + ZOOM_STEP, MAX_ZOOM);
        applyZoom();
    }
});
// Отдалить
zoomOutBtn.addEventListener('click', function() {
    if (zoomLevel > MIN_ZOOM) {
        zoomLevel = Math.max(zoomLevel - ZOOM_STEP, MIN_ZOOM);
        applyZoom();
    }
});
// Сбросить масштаб
resetZoomBtn.addEventListener('click', function() {
    zoomLevel = 1;
    applyZoom();
});

// Очистка канваса
// Функция для очистки canvas
function clearCanvas() {
    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    lines = []
    rects = []
    ellipses = []
}
// очистка по кнопке
document.querySelector('#clearBtn').addEventListener('click', function() {
    clearCanvas()
    ctx.drawImage(original_image, 0, 0)
})