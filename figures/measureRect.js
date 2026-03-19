let measureRects = []
let actual_measureRect_data = [] // [цвет, толщина, x1, y1, x2, y2]

// старт рисования прямоугольника
function drawMeasureRect(e) {
    const coords = getCanvasCoords(e);
    const startX = coords.x;
    const startY = coords.y;

    actual_measureRect_data = []
    actual_measureRect_data.push("yellow", 1) // фиксированный цвет и толщина
    actual_measureRect_data.push(startX, startY)
}

// отрисовка всех измерительных прямоугольников
function drawAllMeasureRects() {
    measureRects.forEach(rect => {
        const x1 = rect[2]
        const y1 = rect[3]
        const x2 = rect[4]
        const y2 = rect[5]
        const width = Math.abs(x2 - x1)
        const height = Math.abs(y2 - y1)
        const left = Math.min(x1, x2)
        const top = Math.min(y1, y2)

        // рисуем сам прямоугольник
        ctx.strokeStyle = rect[0]
        ctx.lineWidth = rect[1]
        ctx.beginPath()
        ctx.rect(left, top, width, height)
        ctx.stroke()

        // рисуем размеры
        drawRectDimensions(left, top, width, height)
    })
}

// во время рисования
function drawingMeasureRect(e) {
    if (!isDrawing) return

    const coords = getCanvasCoords(e);
    const x = coords.x;
    const y = coords.y;

    const startX = actual_measureRect_data[2]
    const startY = actual_measureRect_data[3]

    const width = x - startX
    const height = y - startY
    const left = Math.min(startX, x)
    const top = Math.min(startY, y)

    // рисуем прямоугольник
    ctx.strokeStyle = "yellow"
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.rect(left, top, width, height)
    ctx.stroke()

    // рисуем размеры
    drawRectDimensions(left, top, width, height)
}

// завершение рисования прямоугольника
function measureRectEnd(e) {
    const coords = getCanvasCoords(e)
    const endX = coords.x
    const endY = coords.y

    actual_measureRect_data.push(endX, endY)
    measureRects.push(actual_measureRect_data)
}

// функция рисования размеров
function drawRectDimensions(x, y, widthPx, heightPx) {

    const width = Math.abs(widthPx) * mmToPx_ratio
    const height = Math.abs(heightPx) * mmToPx_ratio

    ctx.font = "14px Arial"
    ctx.fillStyle = "yellow"
    ctx.strokeStyle = "black"
    ctx.lineWidth = 1
    ctx.textAlign = "center"
    ctx.textBaseline = "bottom"

    // ширина
    const textW = width.toFixed(2) + " мм"

    ctx.strokeText(textW, x + widthPx / 2, y - 5)
    ctx.fillText(textW, x + widthPx / 2, y - 5)

    // высота
    const textH = height.toFixed(2) + " мм"

    ctx.save()
    ctx.translate(x - 5, y + heightPx / 2)
    ctx.rotate(-Math.PI / 2)

    ctx.strokeText(textH, 0, 0)
    ctx.fillText(textH, 0, 0)

    ctx.restore()
}

function findPointInMeasureRect(e) {

    const coords = getCanvasCoords(e);
    const x = coords.x;
    const y = coords.y;

    let counter = 0

    measureRects.forEach(rect => {

        const x1 = rect[2]
        const y1 = rect[3]
        const x2 = rect[4]
        const y2 = rect[5]

        const left = Math.min(x1, x2)
        const right = Math.max(x1, x2)
        const top = Math.min(y1, y2)
        const bottom = Math.max(y1, y2)

        const tol = 6 // допуск

        const nearTop =
            y >= top - tol && y <= top + tol &&
            x >= left && x <= right

        const nearBottom =
            y >= bottom - tol && y <= bottom + tol &&
            x >= left && x <= right

        const nearLeft =
            x >= left - tol && x <= left + tol &&
            y >= top && y <= bottom

        const nearRight =
            x >= right - tol && x <= right + tol &&
            y >= top && y <= bottom

        if (nearTop || nearBottom || nearLeft || nearRight) {

            // подсветка
            ctx.beginPath()
            ctx.rect(left, top, right - left, bottom - top)
            ctx.strokeStyle = "#fafafa"
            ctx.lineWidth = rect[1]
            ctx.stroke()

            mouse_over_element = true

            measureRects_without_hovered_element =
                measureRects.slice(0, counter)
                .concat(measureRects.slice(counter + 1))
        }

        counter++

    })
}