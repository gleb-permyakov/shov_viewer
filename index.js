// получаем элементы
const viewer = document.querySelector('.viewer')
const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')
const fileInput = document.getElementById('fileInput')
const deleteBtn = document.querySelector('#deleteBtn')

let original_image
let isDrawing = false

// для построения линий
let lines = []
let actual_line_data = [] // [цвет, толщина, x1, y1, x2, y2]

// для построения прямоугольников
let rects = []
let actual_rect_data = [] // [цвет, толщина, координаты прямоугольника...]

// для построения эллипсов
let ellipses = []
let actual_ellipse_data = [] // [цвет, толщина, xo, y0, middleX, middleY, radiusX, radiusY]

// для удаления элементов
lines_without_hovered_element = []
rects_without_hovered_element = []
ellipses_without_hovered_element = []
mouse_over_element = false

// устанавливаем базовый размер canvas
canvas.width = 800
canvas.height = 500

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

canvas.addEventListener("mousedown", startDraw)
canvas.addEventListener("mousedown", deleteElement)
canvas.addEventListener("mousemove", continueDraw)
canvas.addEventListener("mousemove", findPointInLine)
canvas.addEventListener("mousemove", findPointInRect)
canvas.addEventListener("mousemove", findPointInEllipse)
canvas.addEventListener("mouseout", stopDraw)
canvas.addEventListener("mouseup", stopDraw)


// MOUSE_DOWN
function startDraw(e) {
    isDrawing = true
    let tool = document.querySelector(".active").dataset.tool
    if (tool == "line") {
        drawLine(e)
    } else if (tool == "rectangle") {
        drawRect(e)
    } else if (tool == "ellipse") {
        drawEllipse(e)
    }
}
// старт отрисовки линии
function drawLine(e) {
    startX = e.offsetX / zoomLevel
    startY = e.offsetY / zoomLevel

    actual_line_data = []
    actual_line_data.push(colorPicker.value, sizeSlider.value)
    actual_line_data.push(startX, startY)

    ctx.moveTo(startX, startY)
}
// отрисовка всех предыдущих линий
function drawAllLines() {
    lines.forEach(line => {
        ctx.beginPath()
        ctx.moveTo(line[2], line[3])
        ctx.lineTo(line[4], line[5])
        ctx.strokeStyle = line[0]
        ctx.lineWidth = line[1]
        ctx.lineCap = 'round'
        ctx.stroke()
    })
}
// старт отрисовки прямоугольника
function drawRect(e) {
    startX = e.offsetX / zoomLevel
    startY = e.offsetY / zoomLevel

    actual_rect_data = []
    actual_rect_data.push(colorPicker.value, sizeSlider.value)
    actual_rect_data.push(startX, startY)

    ctx.moveTo(startX, startY)
}
// отрисовка всех предыдущих прямоугольников
function drawAllRects() {
    rects.forEach(rect => {
        drawAnyRect(rect)
    })
}
// старт отрисовки эллипса
function drawEllipse(e) {
    startX = e.offsetX / zoomLevel
    startY = e.offsetY / zoomLevel

    actual_ellipse_data = []
    actual_ellipse_data.push(colorPicker.value, sizeSlider.value)
    actual_ellipse_data.push(startX, startY)

    ctx.moveTo(startX, startY)
}
// отрисовка всех предыдущих эллипсов
function drawAllEllipses() {
    ellipses.forEach(ellipse => {
        drawAnyEllipse(ellipse)
    })
}
// удалить элемент
function deleteElement(e) {
    if (mouse_over_element == true) {
        if (deleteBtn.classList.contains("active")) {
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            ctx.drawImage(original_image, 0, 0)
            lines = lines_without_hovered_element
            rects = rects_without_hovered_element
            ellipses = ellipses_without_hovered_element
            drawAllLines()
            drawAllRects()
            drawAllEllipses()
            // если вдруг что-то подзалагало, не отрисовалось - отрисовываем с задержкой
            setTimeout(() => {
                console.log("TIMEOUT")
                drawAllLines()
                drawAllRects()
                drawAllEllipses()
            }, 100)
        }
    }
}


// MOUSE_MOVE
function continueDraw(e) {
    // надо, чтобы по дефолту мышь не перекрывала объекты и не было выбранных объектов
    mouse_over_element = false
    lines_without_hovered_element = lines
    rects_without_hovered_element = rects
    ellipses_without_hovered_element = ellipses
    // отрисовываем все время 
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(original_image, 0, 0)
    drawAllLines()
    drawAllRects()
    drawAllEllipses()

    let tool = document.querySelector(".active").dataset.tool
    if (tool == "line") {
        drawingLine(e)
    } else if (tool == "rectangle") {
        drawingRect(e)
    } else if (tool == "ellipse") {
        drawingEllipse(e)
    }
}
// рисование линии
function drawingLine(e) {
    if (!isDrawing) {
        return
    }

    const x = e.offsetX / zoomLevel
    const y = e.offsetY / zoomLevel
    
    // парамемтры рисования
    ctx.strokeStyle = colorPicker.value
    ctx.lineWidth = sizeSlider.value
    ctx.lineCap = 'round'
    // рисование линии
    ctx.beginPath()
    ctx.moveTo(startX, startY)
    ctx.lineTo(x, y)
    ctx.stroke()
}
// рисование прямоугольника
function drawingRect(e) {
    if (!isDrawing) {
        return
    }

    actual_rect_data = actual_rect_data.slice(0,4)

    const x3 = e.offsetX / zoomLevel
    const y3 = e.offsetY / zoomLevel

    const x0 = actual_rect_data[2]
    const y0 = actual_rect_data[3]

    // параметры рисования
    // ТУТ НЕЛЬЗЯ ИСПОЛЬЗОВАТЬ ФУНКЦИЮ   drawAnyRect   ПОЧЕМУ-ТО ОНО НЕ УСПЕВАЕТ ПЕРЕРИСОВЫВАТЬ ПРЯМОУГОЛЬНИК
    // ЕСЛИ ЗАПИХНУТЬ ЭТУ ЛОГИКУ В ФУНКЦИЮ И ВЫЗЫВАТЬ ФУНКЦИЮ
    ctx.strokeStyle = actual_rect_data[0]
    ctx.lineWidth = actual_rect_data[1]
    ctx.lineCap = 'round'
    // начало
    ctx.beginPath()
    ctx.moveTo(x0, y0)
    // 1 линия
    ctx.lineTo(x3, y0)
    // 2 линия
    ctx.lineTo(x3, y3)
    // 3 линия
    ctx.lineTo(x0, y3)
    // 4 линия
    ctx.lineTo(x0, y0)
    ctx.closePath()
    ctx.stroke()
    
    // заполнение массива прямоугольнкиа
    actual_rect_data.push(x3, y0, x3, y3, x0, y3, x0, y0)
}
// рисование эллипса
function drawingEllipse(e) {
    if (!isDrawing) {
        return
    }

    actual_ellipse_data = actual_ellipse_data.slice(0,4)

    const x = e.offsetX / zoomLevel
    const y = e.offsetY / zoomLevel

    // параметры рисования
    ctx.strokeStyle = colorPicker.value
    ctx.lineWidth = sizeSlider.value
    // подсчет значений
    const x0 = actual_ellipse_data[2]
    const y0 = actual_ellipse_data[3]
    let radiusX = 0
    let radiusY = 0
    let middleX = 0
    let middleY = 0
    if (x > x0 && y > y0) { 
        radiusX = (x-x0)/2
        radiusY = (y-y0)/2
        middleX = x0+radiusX
        middleY = y0+radiusY
    } else if (x > x0 && y < y0) {
        radiusX = (x-x0)/2
        radiusY = (y0-y)/2
        middleX = x0+radiusX
        middleY = y+radiusY
    } else if (x < x0 && y < y0) {
        radiusX = (x0-x)/2
        radiusY = (y0-y)/2
        middleX = x+radiusX
        middleY = y+radiusY
    } else if (x < x0 && y > y0) { 
        radiusX = (x0-x)/2
        radiusY = (y-y0)/2
        middleX = x+radiusX
        middleY = y0+radiusY
    }
    // рисование эллипса
    ctx.beginPath()
    ctx.ellipse(middleX, middleY, radiusX, radiusY, 0, 0, Math.PI * 2);
    ctx.stroke()

    // заполнение массива эллипса
    actual_ellipse_data.push(middleX, middleY, radiusX, radiusY)
}
// рисуем прямоугольник по точкам
function drawAnyRect(rect) {
    // параметры рисования
    ctx.strokeStyle = rect[0]
    ctx.lineWidth = rect[1]
    ctx.lineCap = 'round'
    // начало
    ctx.beginPath()
    ctx.moveTo(rect[2], rect[3])
    // 1 линия
    ctx.lineTo(rect[4], rect[5])
    // 2 линия
    ctx.lineTo(rect[6], rect[7])
    // 3 линия
    ctx.lineTo(rect[8], rect[9])
    // 4 линия
    ctx.lineTo(rect[2], rect[3])
    ctx.closePath()
    ctx.stroke()
}
// рисуем любой эллипс
function drawAnyEllipse(ellipse) {
    // параметры рисования
    ctx.strokeStyle = ellipse[0]
    ctx.lineWidth = ellipse[1]
    // рисование эллипса
    ctx.beginPath()
    ctx.ellipse(ellipse[4], ellipse[5], ellipse[6], ellipse[7], 0, 0, Math.PI * 2);
    ctx.stroke()
}
// поиск точки на линии
function findPointInLine(e) {
    counter = 0
    lines.forEach(line => {
        const x = e.offsetX / zoomLevel
        const y = e.offsetY / zoomLevel

        k = ((line[3] - line[5]) / (line[2] - line[4]))
        b = line[3] - k * line[2]

        const left_to_right = line[2] < line[4] 
        if (left_to_right) {
            left_side = line[2]
            right_side = line[4]
        } else {
            left_side = line[4]
            right_side = line[2]
        }

        const bottom_to_top = line[3] < line[5] 
        if (bottom_to_top) {
            bottom_side = line[3]
            top_side = line[5]
        } else {
            bottom_side = line[5]
            top_side = line[3]
        }

        const horizontal_line_condotion = (y >= k * x + b - 7) && (y <= k * x + b + 7) && x >= left_side && x <= right_side
        const vertical_line_condition = (x >= (y-b)/k - 7) && (x <= (y-b)/k + 7) && y >= bottom_side && y <= top_side

        if (horizontal_line_condotion || vertical_line_condition) {
            // оп - нашли, подсветили
            ctx.beginPath()
            ctx.moveTo(line[2], line[3])
            ctx.lineTo(line[4], line[5])
            ctx.strokeStyle = "#fafafa"
            ctx.lineWidth = line[1]
            ctx.lineCap = 'round'
            ctx.stroke()
            // сказали, что мышь на элементе
            mouse_over_element = true
            // передаем массив без этой линии
            lines_without_hovered_element = lines.slice(0, counter).concat(lines.slice(counter+1))
        }
        counter++
    })
}
// поиск точки на прямоугольнике
function findPointInRect(e) {
    let counter = 0 
    rects.forEach(rect => {
        const x = e.offsetX / zoomLevel
        const y = e.offsetY / zoomLevel

        const x0 = rect[2]
        const y0 = rect[3]
        const x3 = rect[6]
        const y3 = rect[7]

        if (x0 < x3 && y0 > y3) {
            // сектор 1
            if ((x >= x0 && x <= x3 && y >= y3 - 7 && y <= y3 + 7) || (x >= x0 && x <= x3 && y >= y0 - 7 && y <= y0 + 7) 
                || (y <= y0 && y >= y3 && x >= x0 - 7 && x <= x0 + 7) || (y <= y0 && y >= y3 && x >= x3 - 7 && x <= x3 + 7))  {
                drawThisRect()
            }
        } else if (x0 > x3 && y0 > y3) {
            // сектор 2
            if ((x >= x3 && x <= x0 && y >= y3 - 7 && y <= y3 + 7) || (x >= x3 && x <= x0 && y >= y0 - 7 && y <= y0 + 7) 
                || (y <= y0 && y >= y3 && x >= x3 - 7 && x <= x3 + 7) || (y <= y0 && y >= y3 && x >= x0 - 7 && x <= x0 + 7))  {
                drawThisRect()
            }
        } else if (x0 > x3 && y0 < y3) {
            // сектор 3
            if ((x >= x3 && x <= x0 && y >= y3 - 7 && y <= y3 + 7) || (x >= x3 && x <= x0 && y >= y0 - 7 && y <= y0 + 7) 
                || (y >= y0 && y <= y3 && x >= x3 - 7 && x <= x3 + 7) || (y >= y0 && y <= y3 && x >= x0 - 7 && x <= x0 + 7))  {
                drawThisRect()
            } 
        } else if (x0 < x3 && y0 < y3) {
            // сектор 4
            if ((x <= x3 && x >= x0 && y >= y3 - 7 && y <= y3 + 7) || (x <= x3 && x >= x0 && y >= y0 - 7 && y <= y0 + 7) 
                || (y >= y0 && y <= y3 && x >= x3 - 7 && x <= x3 + 7) || (y >= y0 && y <= y3 && x >= x0 - 7 && x <= x0 + 7))  {
                drawThisRect()
            }
        }

        function drawThisRect() {
            // параметры рисования
            ctx.strokeStyle = "#fafafa"
            ctx.lineWidth = rect[1]
            ctx.lineCap = 'round'
            // начало
            ctx.beginPath()
            ctx.moveTo(rect[2], rect[3])
            // 1 линия
            ctx.lineTo(rect[4], rect[5])
            // 2 линия
            ctx.lineTo(rect[6], rect[7])
            // 3 линия
            ctx.lineTo(rect[8], rect[9])
            // 4 линия
            ctx.lineTo(rect[2], rect[3])
            ctx.closePath()
            ctx.stroke()

            // сказали, что мышь на элементе
            mouse_over_element = true
            // передаем массив без этой линии
            rects_without_hovered_element = rects.slice(0, counter).concat(rects.slice(counter+1))
        }   
        counter++
    })
}
// поиск точки на эллипсе
function findPointInEllipse(e) {
    let counter = 0 
    ellipses.forEach(ellipse => {
        const x = e.offsetX / zoomLevel
        const y = e.offsetY / zoomLevel

        const h = ellipse[4]
        const k = ellipse[5]
        const a = ellipse[6]
        const b = ellipse[7]

        // погрешность в пикселях
        const accuracy = 5

        // // считаем предполагаемую координату x на эллипсе
        // const x_ellipse = h + a * Math.sqrt(1 - Math.pow((y-k), 2) / Math.pow(b, 2))
        // if (x_ellipse < 0) {
        //     x_ellipse = h - a * Math.sqrt(1 - Math.pow((y-k), 2) / Math.pow(b, 2))
        // }
        // // считаем предполагаемую координату y на эллипсе
        // const y_ellipse = k + a * Math.sqrt(1 - Math.pow((y-k), 2) / Math.pow(b, 2))
        // if (x_ellipse < 0) {
        //     x_ellipse = h - a * Math.sqrt(1 - Math.pow((y-k), 2) / Math.pow(b, 2))
        // }

        // условие >= 1
        const condition_1 = (x - h)**2 / (a - accuracy)**2 + (y - k)**2 / (b - accuracy)**2 >= 1

        // условие <= 1
        const condition_2 = (x - h)**2 / (a + accuracy)**2 + (y - k)**2 / (b + accuracy)**2 <= 1

        if (condition_1 && condition_2) {
            // подсвечиваем
            // параметры рисования
            ctx.strokeStyle = "#fafafa"
            ctx.lineWidth = ellipse[1]
            // рисование эллипса
            ctx.beginPath()
            ctx.ellipse(ellipse[4], ellipse[5], ellipse[6], ellipse[7], 0, 0, Math.PI * 2);
            ctx.stroke()
            // сказали, что мышь на элементе
            mouse_over_element = true
            // передаем массив без этой линии
            ellipses_without_hovered_element = ellipses.slice(0, counter).concat(ellipses.slice(counter+1))
        }
        counter++
    })
}

// MOUSE_UP
function stopDraw(e) {
    if (isDrawing) {
        let tool = document.querySelector(".active").dataset.tool
        if (tool == "line") {
            lineEnd(e)
        } else if (tool == "rectangle") {
            rectEnd(e)
        } else if (tool == "ellipse") {
            ellipseEnd(e)
        }
    }
    isDrawing = false
}
// завершение линии
function lineEnd(e) {
    const endX = e.offsetX / zoomLevel
    const endY = e.offsetY / zoomLevel
    actual_line_data.push(endX, endY)
    lines.push((actual_line_data))
}
// завершение прямоугольника
function rectEnd(e) {
    rects.push((actual_rect_data))
}
// завершение эллипса
function ellipseEnd(e) {
    ellipses.push((actual_ellipse_data))
}


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
