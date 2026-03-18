// получаем элементы
const viewer = document.querySelector('.viewer')
const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')
const fileInput = document.getElementById('fileInput')
const deleteBtn = document.querySelector('#deleteBtn')

let original_image
let isDrawing = false
let len_etalon = 0
let mmToPx_ratio = 1


// для удаления элементов
lines_without_hovered_element = []
rects_without_hovered_element = []
rulers_without_hovered_element = []
lines_et_without_hovered_element = []
ellipses3_without_hovered_element = []
ellipses_without_hovered_element = []
mouse_over_element = false

// устанавливаем базовый размер canvas
canvas.width = 800
canvas.height = 500

function getCanvasCoords(e) {
    const rect = canvas.getBoundingClientRect();
    
    // Координаты мыши относительно canvas на экране
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Пересчитываем в координаты canvas с учетом масштаба
    const canvasX = mouseX / zoomLevel;
    const canvasY = mouseY / zoomLevel;
    
    return { x: canvasX, y: canvasY };
}

// Обработчик загрузки файла
// Загрузка изображения
fileInput.addEventListener('change', function(e) {
    const file = e.target.files[0]
    if (!file) return
    
    const reader = new FileReader()
    reader.onload = function(event) {
        const img = new Image()
        img.onload = function() {
            // 1. Сохраняем оригинальное изображение
            currentImage = img
            
            // 2. Получаем реальные размеры контейнера
            const maxWidth = viewer.width
            const maxHeight = viewer.width
            
            let displayWidth = img.width
            let displayHeight = img.height
            
            // 3. Рассчитываем размеры для ОТОБРАЖЕНИЯ (не для canvas!)
            if (displayWidth > maxWidth) {
                displayHeight = (maxWidth / displayWidth) * displayHeight
                displayWidth = maxWidth
            }
            if (displayHeight > maxHeight) {
                displayWidth = (maxHeight / displayHeight) * displayWidth
                displayHeight = maxHeight
            }
            
            // 4. Устанавливаем РЕАЛЬНЫЙ размер canvas = размеру изображения
            canvas.width = img.width  // Оригинальная ширина
            canvas.height = img.height // Оригинальная высота
            
            // 5. Рисуем изображение в полном качестве
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            ctx.drawImage(img, 0, 0)
            
            // 6. Масштабируем ОТОБРАЖЕНИЕ через CSS
            canvas.style.width = displayWidth + 'px'
            canvas.style.height = displayHeight + 'px'

            // подсохраняем оригинальную картинку
            original_image = img
        }
        img.src = event.target.result
    }
    reader.readAsDataURL(file)
})

canvas.addEventListener("mousedown", (e) => {
    if (e.button === 2) { // правая кнопка - только панорамирование
        return; // не запускаем рисование
    }
    
    // левая кнопка - рисование
    startDraw(e);
    deleteElement(e);
});

// canvas.addEventListener("mousedown", startDraw)
// canvas.addEventListener("mousedown", deleteElement)
canvas.addEventListener("mousemove", continueDraw)
canvas.addEventListener("mousemove", findPointInFigures)
canvas.addEventListener("mouseout", stopDraw)
canvas.addEventListener("mouseup", stopDraw)

// MOUSE_DOWN
// отрисовка элемента
function startDraw(e) {
    isDrawing = true
    let tool = document.querySelector(".active").dataset.tool
    if (tool == "line") {
        drawLine(e)
    } else if (tool == "rectangle") {
        drawRect(e)
    } else if (tool == "ellipse") {
        drawEllipse(e)
    } else if (tool == "line_etalon") {
        drawLineEt(e)
    } else if (tool == "ruler") {
        drawRuler(e)
    } else if (tool == "ellipse3") {
        drawEllipse3(e)
    }
}
// удалить элемент
function deleteElement(e) {
    if (mouse_over_element == true) {
        if (deleteBtn.classList.contains("active")) {
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            if (original_image) {
                ctx.drawImage(original_image, 0, 0)
            }  
            rects = rects_without_hovered_element
            ellipses = ellipses_without_hovered_element
            ellipses3 = ellipses3_without_hovered_element
            drawAllLines()
            drawAllRects()
            drawAllEllipses()
            drawAllEllipses3()
            // если вдруг что-то подзалагало, не отрисовалось - отрисовываем с задержкой
            setTimeout(() => {
                console.log("TIMEOUT")
                drawAllLines()
                drawAllRects()
                drawAllEllipses()
                drawAllEllipses3()
            }, 100)
        }
    }
}

// MOUSE_MOVE
// процесс рисования и постоянной перерисовки канваса
function continueDraw(e) {
    // надо, чтобы по дефолту мышь не перекрывала объекты и не было выбранных объектов
    mouse_over_element = false
    lines_without_hovered_element = lines
    rects_without_hovered_element = rects
    ellipses_without_hovered_element = ellipses
    ellipses3_without_hovered_element = ellipses3
    
    // отрисовываем все время 
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    if (original_image) {
        ctx.drawImage(original_image, 0, 0)
    }   

    drawAllLines()
    drawAllLinesEt()
    drawAllRulers()
    drawAllRects()
    drawAllEllipses()
    drawAllEllipses3()

    // Рисуем текущую фигуру только если процесс рисования активен
    let tool = document.querySelector(".active")?.dataset.tool
    if (tool == "line") {
        drawingLine(e)
    } else if (tool == "rectangle") {
        drawingRect(e)
    } else if (tool == "ellipse") {
        drawingEllipse(e)
    } else if (tool == "line_etalon") {
        drawingLineEt(e)
    } else if (tool == "ruler") {
        drawingRuler(e)
    }
}
// поиск точки в фигурах
function findPointInFigures(e) {
    findPointInLine(e)
    findPointInRect(e)
    findPointInEllipse(e)
    findPointInEllipse3(e)
    findPointInRuler(e)
    findPointInLineEt(e)
}
// MOUSE_UP, MOUSE_OUT
// конец отрисовки
function stopDraw(e) {
    if (isDrawing) {
        let tool = document.querySelector(".active").dataset.tool

        if (tool == "line") {
            lineEnd(e)
        } else if (tool == "rectangle") {
            rectEnd(e)
        } else if (tool == "ellipse") {
            ellipseEnd(e)
        } else if (tool == "line_etalon") {
            lineEtEnd(e)
        } else if (tool == "ruler") {
            rulerEnd(e)
        }
    }

    isDrawing = false
}

