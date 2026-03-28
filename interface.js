// active tool-btn переключатель
window.currentTool = "line";
const tools = document.querySelectorAll(".tool-btn")

tools.forEach(tool => {
    tool.addEventListener("click", (e) => {

        // если это dropdown — не ломаем его
        if (tool.closest(".dropdown")) return;

        clearAllActive()
        tool.classList.add("active")
        currentTool = tool.dataset.tool
    })
})

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
const canvasContainer = document.querySelector('.canvas-container');

// Функция применения масштаба
// function applyZoom() {
//     if (!currentImage) return;
    
//     const container = document.querySelector('.canvas-container');
//     const maxWidth = container.clientWidth - 20; // отступы
//     const maxHeight = container.clientHeight - 20;
    
//     let displayWidth = currentImage.width;
//     let displayHeight = currentImage.height;
    
//     // Рассчитываем базовый размер с сохранением пропорций
//     if (displayWidth > maxWidth) {
//         displayHeight = (maxWidth / displayWidth) * displayHeight;
//         displayWidth = maxWidth;
//     }
//     if (displayHeight > maxHeight) {
//         displayWidth = (maxHeight / displayHeight) * displayWidth;
//         displayHeight = maxHeight;
//     }
    
//     // Применяем zoom
//     canvas.style.width = (displayWidth * zoomLevel) + 'px';
//     canvas.style.height = (displayHeight * zoomLevel) + 'px';
    
//     // Обновляем статус
//     document.getElementById('status').textContent = `Масштаб: ${Math.round(zoomLevel * 100)}%`;
// }
// Приблизить
// zoomInBtn.addEventListener('click', function() {
//     if (zoomLevel < MAX_ZOOM) {
//         zoomLevel = Math.min(zoomLevel + ZOOM_STEP, MAX_ZOOM);
//         applyZoom();
//     }
// });
// // Отдалить
// zoomOutBtn.addEventListener('click', function() {
//     if (zoomLevel > MIN_ZOOM) {
//         zoomLevel = Math.max(zoomLevel - ZOOM_STEP, MIN_ZOOM);
//         applyZoom();
//     }
// });
// // Сбросить масштаб
// resetZoomBtn.addEventListener('click', function() {
//     zoomLevel = 1;
//     applyZoom();
// });

// Очистка канваса
// Функция для очистки canvas
function clearCanvas() {
    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    lines = []       
    rects = []
    ellipses = []
    ellipses3 = []
    lines_et = []
    rulers = []
    measureRects = []
    measureEllipses = []
    measureEllipses3 = []
    shov_lines = []
}
// очистка по кнопке
document.querySelector('#clearBtn').addEventListener('click', function() {
    clearCanvas()
    if (original_image) {
        ctx.drawImage(original_image, 0, 0)
    }
})

// ========== МАСШТАБИРОВАНИЕ КОЛЕСИКОМ С ЗУМОМ В КУРСОР ==========
if (canvasContainer) {
    canvasContainer.addEventListener('wheel', function(e) {
        e.preventDefault();
        
        if (!original_image && !currentImage) return;
        
        // Получаем позицию мыши относительно canvas
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        // Вычисляем точку на canvas в процентах
        const pointX = (mouseX / rect.width) * 100;
        const pointY = (mouseY / rect.height) * 100;
        
        // Сохраняем старый зум
        const oldZoom = zoomLevel;
        
        // Изменяем зум
        if (e.deltaY < 0) {
            zoomLevel = Math.min(zoomLevel + ZOOM_STEP, MAX_ZOOM);
        } else {
            zoomLevel = Math.max(zoomLevel - ZOOM_STEP, MIN_ZOOM);
        }
        
        if (oldZoom !== zoomLevel) {
            // Сохраняем точку трансформации в data-атрибут
            canvas.dataset.transformOrigin = `${pointX}% ${pointY}%`;
            
            // Применяем трансформацию
            canvas.style.transformOrigin = `${pointX}% ${pointY}%`;
            canvas.style.transform = `scale(${zoomLevel})`;
            
            // Обновляем статус
            document.getElementById('status').textContent = `Масштаб: ${Math.round(zoomLevel * 100)}%`;
        }
    }, { passive: false });
}

let isPanning = false;
let lastX, lastY;

canvas.addEventListener('mousedown', (e) => {
    if (e.button === 2) {
        isPanning = true;
        lastX = e.clientX;
        lastY = e.clientY;
        canvas.style.cursor = 'grabbing';
        e.preventDefault();
    }
});

window.addEventListener('mousemove', (e) => {
    if (isPanning) {
        const dx = e.clientX - lastX;
        const dy = e.clientY - lastY;
        
        // Получаем текущее смещение
        let currentX = 0, currentY = 0;
        if (canvas.style.transform) {
            const match = canvas.style.transform.match(/translate\(([-\d.]+)px, ([-\d.]+)px/);
            if (match) {
                currentX = parseFloat(match[1]) || 0;
                currentY = parseFloat(match[2]) || 0;
            }
        }
        
        // Обновляем смещение
        canvas.style.transform = `translate(${currentX + dx}px, ${currentY + dy}px) scale(${zoomLevel})`;
        
        lastX = e.clientX;
        lastY = e.clientY;
    }
});

window.addEventListener('mouseup', (e) => {
    if (e.button === 2) {
        isPanning = false;
        canvas.style.cursor = 'crosshair';
    }
});

canvas.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});

// ========== КНОПКИ ЗУМА (ПРОСТЫЕ) ==========
zoomInBtn.addEventListener('click', function() {
    if (zoomLevel < MAX_ZOOM) {
        zoomLevel = Math.min(zoomLevel + ZOOM_STEP, MAX_ZOOM);
        
        const transform = canvas.style.transform;
        const match = transform.match(/translate\(([-\d.]+)px, ([-\d.]+)px/);
        const currentX = match ? parseFloat(match[1]) : 0;
        const currentY = match ? parseFloat(match[2]) : 0;
        
        canvas.style.transform = `translate(${currentX}px, ${currentY}px) scale(${zoomLevel})`;
        document.getElementById('status').textContent = `Масштаб: ${Math.round(zoomLevel * 100)}%`;
    }
});

zoomOutBtn.addEventListener('click', function() {
    if (zoomLevel > MIN_ZOOM) {
        zoomLevel = Math.max(zoomLevel - ZOOM_STEP, MIN_ZOOM);
        
        const transform = canvas.style.transform;
        const match = transform.match(/translate\(([-\d.]+)px, ([-\d.]+)px/);
        const currentX = match ? parseFloat(match[1]) : 0;
        const currentY = match ? parseFloat(match[2]) : 0;
        
        canvas.style.transform = `translate(${currentX}px, ${currentY}px) scale(${zoomLevel})`;
        document.getElementById('status').textContent = `Масштаб: ${Math.round(zoomLevel * 100)}%`;
    }
});

resetZoomBtn.addEventListener('click', function() {
    zoomLevel = 1;
    canvas.style.transform = `translate(0px, 0px) scale(1)`;
    document.getElementById('status').textContent = `Масштаб: 100%`;
});

selectorEtalon = document.getElementById('etalonValue');
selectorEtalon.addEventListener("change", function() {
    mmToPx(len_etalon)
    continueDraw()
})

// ====== DROPDOWN MANAGER ======
class DropdownManager {
    constructor() {
        this.dropdowns = Array.from(document.querySelectorAll('.dropdown'));
        this.activeDropdown = null;

        this.init();
    }

    init() {
        // Клик по кнопке dropdown
        this.dropdowns.forEach(dropdown => {
            const btn = dropdown.querySelector('.dropdown-btn');
            const content = dropdown.querySelector('.dropdown-content');

            btn.addEventListener('click', (e) => {
                e.stopPropagation(); // чтобы не сработал глобальный клик

                // Если уже открыт другой dropdown — закрываем его
                if (this.activeDropdown && this.activeDropdown !== dropdown) {
                    this.closeDropdown(this.activeDropdown);
                }

                // Переключаем текущий dropdown
                if (dropdown.classList.contains('open')) {
                    this.closeDropdown(dropdown);
                } else {
                    this.openDropdown(dropdown);
                }
            });

            // Клик по элементу dropdown
            content.querySelectorAll('.dropdown-item').forEach(item => {
                item.addEventListener('click', (e) => {
                    e.stopPropagation();

                    // Подсветка выбранного элемента
                    content.querySelectorAll('.dropdown-item').forEach(i => i.classList.remove('active'));
                    item.classList.add('active');

                    // Обновляем текст кнопки
                    btn.textContent = item.textContent + ' ↓';

                    // Закрываем dropdown
                    this.closeDropdown(dropdown);

                    // Вызов кастомного callback для действия (например, выбор инструмента)
                    if (item.dataset.tool) {
                        window.currentTool = item.dataset.tool;
                        updateToolStatus(item.textContent);
                    }
                });
            });
        });

        // Закрыть при клике вне
        document.addEventListener('click', () => this.closeAllDropdowns());

        // Закрыть при ESC
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.closeAllDropdowns();
        });
    }

    openDropdown(dropdown) {
        dropdown.classList.add('open');
        this.activeDropdown = dropdown;
    }

    closeDropdown(dropdown) {
        dropdown.classList.remove('open');
        if (this.activeDropdown === dropdown) this.activeDropdown = null;
    }

    closeAllDropdowns() {
        this.dropdowns.forEach(d => d.classList.remove('open'));
        this.activeDropdown = null;
    }
}

// ====== HELPER FUNCTION ======
function updateToolStatus(name) {
    // Убираем активность со всех обычных кнопок
    const tools = document.querySelectorAll(".tool-btn");
    tools.forEach(tool => tool.classList.remove('active'));

    // Обновляем статус (если есть блок статуса)
    const status = document.getElementById('status');
    if (status) status.textContent = `Выбран инструмент: ${name}`;
}

// ====== ИНИЦИАЛИЗАЦИЯ ======
document.addEventListener('DOMContentLoaded', () => {
    new DropdownManager();
});