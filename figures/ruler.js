let rulers = []
let actual_ruler_data = [] // [цвет, толщина, x1, y1, x2, y2]

// старт отрисовки линии
function drawRuler(e) {
    startX = e.offsetX / zoomLevel
    startY = e.offsetY / zoomLevel

    actual_ruler_data = []
    actual_ruler_data.push("yellow", 3)
    actual_ruler_data.push(startX, startY)

    ctx.moveTo(startX, startY)
}
// отрисовка всех предыдущих линий
function drawAllRulers() {
    rulers.forEach(ruler => {
        ctx.beginPath()
        ctx.moveTo(ruler[2], ruler[3])
        ctx.lineTo(ruler[4], ruler[5])
        ctx.strokeStyle = ruler[0]
        ctx.lineWidth = ruler[1]
        ctx.lineCap = 'round'
        ctx.stroke()
        // подписываем длину
        dx = ruler[4] - ruler[2]
        dy = ruler[5] - ruler[3]
        const length = Math.sqrt(dx*dx + dy*dy) * mmToPx_ratio;
        drawLengthText(ruler[2], ruler[3], ruler[4], ruler[5], length)
    })
}
// рисование линии
function drawingRuler(e) {
    if (!isDrawing) {
        return
    }

    const x = e.offsetX / zoomLevel
    const y = e.offsetY / zoomLevel
    
    // парамемтры рисования
    ctx.strokeStyle = "yellow"
    ctx.lineWidth = 3
    ctx.lineCap = 'round'
    // рисование линии
    ctx.beginPath()
    ctx.moveTo(startX, startY)
    ctx.lineTo(x, y)
    ctx.stroke()
}
// поиск точки на линии
function findPointInRuler(e) {
    counter = 0
    rulers.forEach(ruler => {
        const x = e.offsetX / zoomLevel
        const y = e.offsetY / zoomLevel

        k = ((ruler[3] - ruler[5]) / (ruler[2] - ruler[4]))
        b = ruler[3] - k * ruler[2]

        const left_to_right = ruler[2] < ruler[4] 
        if (left_to_right) {
            left_side = ruler[2]
            right_side = ruler[4]
        } else {
            left_side = ruler[4]
            right_side = ruler[2]
        }

        const bottom_to_top = ruler[3] < ruler[5] 
        if (bottom_to_top) {
            bottom_side = ruler[3]
            top_side = ruler[5]
        } else {
            bottom_side = ruler[5]
            top_side = ruler[3]
        }

        const horizontal_ruler_condotion = (y >= k * x + b - 7) && (y <= k * x + b + 7) && x >= left_side && x <= right_side
        const vertical_ruler_condition = (x >= (y-b)/k - 7) && (x <= (y-b)/k + 7) && y >= bottom_side && y <= top_side

        if (horizontal_ruler_condotion || vertical_ruler_condition) {
            // оп - нашли, подсветили
            ctx.beginPath()
            ctx.moveTo(ruler[2], ruler[3])
            ctx.lineTo(ruler[4], ruler[5])
            ctx.strokeStyle = "#fafafa"
            ctx.lineWidth = ruler[1]
            ctx.lineCap = 'round'
            ctx.stroke()
            // сказали, что мышь на элементе
            mouse_over_element = true
            // передаем массив без этой линии
            rulers_without_hovered_element = rulers.slice(0, counter).concat(rulers.slice(counter+1))
        }
        counter++
    })
}
// завершение линии
function rulerEnd(e) {
    const endX = e.offsetX / zoomLevel
    const endY = e.offsetY / zoomLevel
    actual_ruler_data.push(endX, endY)
    
    const dx = endX - startX;
    const dy = endY - startY;
    const length = Math.sqrt(dx * dx + dy * dy);
    if (length >= 5) {
        rulers.push((actual_ruler_data))
    } 
}

// отрисовка длины

function drawLengthText(x1, y1, x2, y2, length) {
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;
    
    ctx.font = "14px Arial";
    ctx.fillStyle = "yellow";
    ctx.strokeStyle = "black";
    ctx.lineWidth = 1;
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    
    const text = length.toFixed(2) + " мм";
    ctx.strokeText(text, midX, midY - 10);
    ctx.fillText(text, midX, midY - 10);
}
