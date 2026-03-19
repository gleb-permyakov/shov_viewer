let measureEllipses = []
let actual_measureEllipse_data = [] // [цвет, толщина, x1, y1, x2, y2]

// старт рисования эллипса
function drawMeasureEllipse(e) {
    const coords = getCanvasCoords(e)
    const startX = coords.x
    const startY = coords.y

    actual_measureEllipse_data = []
    actual_measureEllipse_data.push("yellow", 1) // цвет и толщина
    actual_measureEllipse_data.push(startX, startY)
}

// отрисовка всех измерительных эллипсов
function drawAllMeasureEllipses() {
    measureEllipses.forEach(el => {
        const x1 = el[2], y1 = el[3]
        const x2 = el[4], y2 = el[5]
        const rx = Math.abs(x2 - x1)/2
        const ry = Math.abs(y2 - y1)/2
        const cx = (x1 + x2)/2
        const cy = (y1 + y2)/2

        ctx.strokeStyle = el[0]
        ctx.lineWidth = el[1]
        ctx.beginPath()
        ctx.ellipse(cx, cy, rx, ry, 0, 0, 2 * Math.PI)
        ctx.stroke()

        drawEllipseDimensions(x1, y1, x2, y2)
    })
}

// рисование во время движения мыши
function drawingMeasureEllipse(e) {
    if (!isDrawing) return
    const coords = getCanvasCoords(e)
    const x = coords.x
    const y = coords.y

    const x1 = actual_measureEllipse_data[2]
    const y1 = actual_measureEllipse_data[3]

    const rx = Math.abs(x - x1)/2
    const ry = Math.abs(y - y1)/2
    const cx = (x + x1)/2
    const cy = (y + y1)/2

    ctx.strokeStyle = "yellow"
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.ellipse(cx, cy, rx, ry, 0, 0, 2 * Math.PI)
    ctx.stroke()

    drawEllipseDimensions(x1, y1, x, y)
}

// завершение рисования
function measureEllipseEnd(e) {
    const coords = getCanvasCoords(e)
    const x2 = coords.x
    const y2 = coords.y

    actual_measureEllipse_data.push(x2, y2)
    measureEllipses.push(actual_measureEllipse_data)
}

// рисуем размеры эллипса (ширина и высота)
function drawEllipseDimensions(x1, y1, x2, y2) {
    const width = Math.abs(x2 - x1) * mmToPx_ratio
    const height = Math.abs(y2 - y1) * mmToPx_ratio

    ctx.font = "14px Arial"
    ctx.fillStyle = "yellow"
    ctx.strokeStyle = "black"
    ctx.lineWidth = 1
    ctx.textAlign = "center"
    ctx.textBaseline = "bottom"

    // ширина сверху
    ctx.strokeText(width.toFixed(2) + " мм", (x1 + x2)/2, Math.min(y1, y2) - 5)
    ctx.fillText(width.toFixed(2) + " мм", (x1 + x2)/2, Math.min(y1, y2) - 5)

    // высота слева
    ctx.save()
    ctx.translate(Math.min(x1, x2) - 5, (y1 + y2)/2)
    ctx.rotate(-Math.PI / 2)
    ctx.strokeText(height.toFixed(2) + " мм", 0, 0)
    ctx.fillText(height.toFixed(2) + " мм", 0, 0)
    ctx.restore()
}

// поиск точки на эллипсе для hover/удаления
function findPointInMeasureEllipse(e) {
    const coords = getCanvasCoords(e)
    const x = coords.x
    const y = coords.y
    const tol = 6

    let counter = 0
    measureEllipses.forEach(el => {
        const x1 = el[2], y1 = el[3], x2 = el[4], y2 = el[5]
        const rx = Math.abs(x2 - x1)/2
        const ry = Math.abs(y2 - y1)/2
        const cx = (x1 + x2)/2
        const cy = (y1 + y2)/2

        // проверка попадания по эллипсу (на линии)
        const value = ((x - cx)*(x - cx))/(rx*rx) + ((y - cy)*(y - cy))/(ry*ry)
        if(value >= 0.9 && value <= 1.1) {
            ctx.beginPath()
            ctx.ellipse(cx, cy, rx, ry, 0, 0, 2*Math.PI)
            ctx.strokeStyle = "#fafafa"
            ctx.lineWidth = el[1]
            ctx.stroke()

            mouse_over_element = true

            measureEllipses_without_hovered_element =
                measureEllipses.slice(0, counter)
                .concat(measureEllipses.slice(counter+1))
        }

        counter++
    })
}