let lines_et = []
let actual_line_et_data = [] // [цвет, толщина, x1, y1, x2, y2]

// старт отрисовки линии
function drawLineEt(e) {
    startX = e.offsetX / zoomLevel
    startY = e.offsetY / zoomLevel

    actual_line_et_data = []
    actual_line_et_data.push("purple", 3)
    actual_line_et_data.push(startX, startY)

    ctx.moveTo(startX, startY)
}
// отрисовка всех предыдущих линий
function drawAllLinesEt() {
    lines_et.forEach(line => {
        ctx.beginPath()
        ctx.moveTo(line[2], line[3])
        ctx.lineTo(line[4], line[5])
        ctx.strokeStyle = line[0]
        ctx.lineWidth = line[1]
        ctx.lineCap = 'round'
        ctx.stroke()
    })
}
// рисование линии
function drawingLineEt(e) {
    if (!isDrawing) {
        return
    }

    lines_et = []

    const x = e.offsetX / zoomLevel
    const y = e.offsetY / zoomLevel
    
    // парамемтры рисования
    ctx.strokeStyle = "purple"
    ctx.lineWidth = 3
    ctx.lineCap = 'round'
    // рисование линии
    ctx.beginPath()
    ctx.moveTo(startX, startY)
    ctx.lineTo(x, y)
    ctx.stroke()
}
// поиск точки на линии
function findPointInLineEt(e) {
    counter = 0
    lines_et.forEach(line => {
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
            lines_et_without_hovered_element = lines_et.slice(0, counter).concat(lines_et.slice(counter+1))
        }
        counter++
    })
}
// завершение линии
function lineEtEnd(e) {
    const endX = e.offsetX / zoomLevel
    const endY = e.offsetY / zoomLevel
    actual_line_et_data.push(endX, endY)
    lines_et.push((actual_line_et_data))

    const dx = endX - startX;
    const dy = endY - startY;
    const length = Math.sqrt(dx * dx + dy * dy);
    len_etalon = length
    mmToPx(length)
}
// подсчет миллиметров в пикселях
function mmToPx(length) {
    const selectElement = document.getElementById('etalonValue');
    let line_mm = 0
    if (selectElement.value == 1) {
        line_mm = 30
    } else if (selectElement.value == 2) {
        line_mm = 45
    } else if (selectElement.value == 3) {
        line_mm = 60
    }
    mmToPx_ratio = line_mm / length
}