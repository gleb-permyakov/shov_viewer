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
measureRects_without_hovered_element = []
measureEllipses_without_hovered_element = []
measureEllipses3_without_hovered_element = []
mouse_over_element = false

// задаем параметры для работы со швом
mouse_down = false
moving_shov_angle = false
moving_shov_vertical = false
moving_shov_width = false
mouse_x = 0
mouse_y = 0

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

    // для управления швом
    mouse_down = true
    coords = getCanvasCoords(e)
    mouse_x = coords.x
    mouse_y = coords.y
});

// canvas.addEventListener("mousedown", startDraw)
// canvas.addEventListener("mousedown", deleteElement)
canvas.addEventListener("mousemove", continueDraw)
canvas.addEventListener("mousemove", findPointInFigures)
canvas.addEventListener("mousemove", move_shov)
canvas.addEventListener("mousemove", move_shov_width)
canvas.addEventListener("mousemove", update_mouse_coords) // обязательно в конце после всех других обработчиков мувов
canvas.addEventListener("mouseout", stopDraw)
canvas.addEventListener("mouseup", stopDraw)

// MOUSE_DOWN
// отрисовка элемента
function startDraw(e) {
    isDrawing = true
    let tool = window.currentTool
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
    } else if (tool == "measureRect") {
        drawMeasureRect(e)
    } else if (tool == "measureEllipse") {
        drawMeasureEllipse(e)
    } else if (tool == "measureEllipse3") {
        drawMeasureEllipse3(e)
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
            lines = lines_without_hovered_element
            rects = rects_without_hovered_element
            ellipses = ellipses_without_hovered_element
            ellipses3 = ellipses3_without_hovered_element
            measureRects = measureRects_without_hovered_element
            rulers = rulers_without_hovered_element
            lines_et = lines_et_without_hovered_element
            measureEllipses = measureEllipses_without_hovered_element
            measureEllipses3 = measureEllipses3_without_hovered_element
            // отрисовка шва
            drawAllShovLines()
            // остальные элементы
            drawAllLines()
            drawAllRects()
            drawAllEllipses()
            drawAllEllipses3()
            drawAllLinesEt()
            drawAllMeasureEllipses()
            drawAllMeasureEllipses3()
            drawAllMeasureRects()
            drawAllRulers()
            // если вдруг что-то подзалагало, не отрисовалось - отрисовываем с задержкой
            setTimeout(() => {
                console.log("TIMEOUT")
                drawAllLines()
                drawAllRects()
                drawAllEllipses()
                drawAllEllipses3()
                drawAllLinesEt()
                drawAllMeasureEllipses()
                drawAllMeasureEllipses3()
                drawAllMeasureRects()
                drawAllRulers()
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
    measureRects_without_hovered_element = measureRects
    measureEllipses_without_hovered_element = measureEllipses
    measureEllipses3_without_hovered_element = measureEllipses3
    rulers_without_hovered_element = rulers
    lines_et_without_hovered_element = lines_et
    
    
    // отрисовываем все время 
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    if (original_image) {
        ctx.drawImage(original_image, 0, 0)
    }   

    drawAllShovLines()
    drawAllLines()
    drawAllLinesEt()
    drawAllRulers()
    drawAllMeasureEllipses()
    drawAllRects()
    drawAllEllipses()
    drawAllEllipses3()
    drawAllMeasureEllipses3()
    drawAllMeasureRects()
    
    // Рисуем текущую фигуру только если процесс рисования активен
    let tool = window.currentTool
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
    } else if (tool == "measureRect") {
        drawingMeasureRect(e)
    } else if (tool == "measureEllipse") {
        drawingMeasureEllipse(e)
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
    findPointInMeasureRect(e)
    findPointInMeasureEllipse(e)
    findPointInMeasureEllipse3(e)
    findPointInShovMiddle(e)
    findPointInShovBottom(e)
}
// двигать угол шва
function move_shov(e) {
    side_of_shov = findPointInShovMiddle(e)
    const coords = getCanvasCoords(e)
    const x = coords.x;
    const y = coords.y;
    if (((mouse_down && side_of_shov == 1) || moving_shov_angle) && !moving_shov_width) { // трогали правую часть -> меняем угол
        moving_shov_angle = true // явно обозначаем, что занимаемся передвижением шва
        if (y < mouse_y) { // значит тянем мышью вверх
            shov_lines[0][3] += mouse_y - y
            shov_lines[0][5] -= mouse_y - y

            shov_lines[1][3] += mouse_y - y
            shov_lines[1][5] -= mouse_y - y

            shov_lines[2][3] += mouse_y - y
            shov_lines[2][5] -= mouse_y - y
        } else if (y > mouse_y) { // значит тянем мышью вниз
            shov_lines[0][3] -= y - mouse_y
            shov_lines[0][5] += y - mouse_y

            shov_lines[1][3] -= y - mouse_y
            shov_lines[1][5] += y - mouse_y

            shov_lines[2][3] -= y - mouse_y
            shov_lines[2][5] += y - mouse_y
        }
    } else if (((mouse_down && side_of_shov == 2) || moving_shov_vertical) && !moving_shov_width) { // трогали левую часть -> меняем вертикальное положение шва
        moving_shov_vertical = true // явно обозначаем, что занимаемся передвижением шва
        if (y < mouse_y) { // значит тянем мышью вверх
            shov_lines[0][3] -= mouse_y - y
            shov_lines[0][5] -= mouse_y - y

            shov_lines[1][3] -= mouse_y - y
            shov_lines[1][5] -= mouse_y - y

            shov_lines[2][3] -= mouse_y - y
            shov_lines[2][5] -= mouse_y - y
        } else if (y > mouse_y) { // значит тянем мышью вниз
            shov_lines[0][3] += y - mouse_y
            shov_lines[0][5] += y - mouse_y

            shov_lines[1][3] += y - mouse_y
            shov_lines[1][5] += y - mouse_y

            shov_lines[2][3] += y - mouse_y
            shov_lines[2][5] += y - mouse_y
        }
    }
}

// двигать шов по вертикали
function move_shov_width(e) {
    mouse_over_bottom = findPointInShovBottom(e)
    const coords = getCanvasCoords(e)
    const x = coords.x
    const y = coords.y
    if (((mouse_down == true && mouse_over_bottom == 1) || moving_shov_width) && !moving_shov_vertical && !moving_shov_angle) {
        moving_shov_width = true
        if (y < mouse_y) { // значит тянем мышью вверх
            shov_lines[1][3] += mouse_y - y
            shov_lines[1][5] += mouse_y - y

            shov_lines[2][3] -= mouse_y - y
            shov_lines[2][5] -= mouse_y - y
        } else if (y > mouse_y) { // значит тянем мышью вниз
            shov_lines[1][3] -= y - mouse_y
            shov_lines[1][5] -= y - mouse_y

            shov_lines[2][3] += y - mouse_y
            shov_lines[2][5] += y - mouse_y
        }
    }
}

// обновлять координаты мыши
function update_mouse_coords(e) {
    const coords = getCanvasCoords(e)
    const x = coords.x
    const y = coords.y
    mouse_x = x
    mouse_y = y
}

// MOUSE_UP, MOUSE_OUT
// конец отрисовки
function stopDraw(e) {
    if (isDrawing) {
        let tool = window.currentTool

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
        } else if (tool == "measureRect") {
            measureRectEnd(e)
        } else if (tool == "measureEllipse") {
            measureEllipseEnd(e)
        }
    }

    isDrawing = false

    // если двигали шов, то больше не двигаем
    mouse_down = false
    moving_shov_angle = false
    moving_shov_vertical = false
    moving_shov_width = false
}

