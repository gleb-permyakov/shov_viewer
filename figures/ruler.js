let rulers = []
let actual_ruler_data = [] // [цвет, толщина, x1, y1, x2, y2]
let linewidth = 1

// старт отрисовки линии
function drawRuler(e) {
    const coords = getCanvasCoords(e);
    const startX = coords.x;
    const startY = coords.y;

    actual_ruler_data = []
    actual_ruler_data.push("yellow", linewidth)
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

    const coords = getCanvasCoords(e);
    const x = coords.x;
    const y = coords.y;

    const startX = actual_ruler_data[2];
    const startY = actual_ruler_data[3];
    
    // парамемтры рисования
    ctx.strokeStyle = "yellow"
    ctx.lineWidth = linewidth
    ctx.lineCap = 'round'
    // рисование линии
    ctx.beginPath()
    ctx.moveTo(startX, startY)
    ctx.lineTo(x, y)
    ctx.stroke()

    const dx = x - startX;
    const dy = y - startY;
    const length = Math.sqrt(dx*dx + dy*dy) * mmToPx_ratio;

    drawLengthText(startX, startY, x, y, length)
}
// поиск точки на линии
// 

function findPointInRuler(e){

    const coords = getCanvasCoords(e)
    const x = coords.x
    const y = coords.y

    let counter = 0

    rulers.forEach(ruler=>{

        const x1 = ruler[2]
        const y1 = ruler[3]
        const x2 = ruler[4]
        const y2 = ruler[5]

        const A = y2 - y1
        const B = x1 - x2
        const C = x2*y1 - x1*y2

        const dist = Math.abs(A*x + B*y + C) / Math.sqrt(A*A + B*B)

        if(dist < 6){

            ctx.beginPath()
            ctx.moveTo(x1,y1)
            ctx.lineTo(x2,y2)
            ctx.strokeStyle = "#fafafa"
            ctx.lineWidth = ruler[1]
            ctx.stroke()

            mouse_over_element = true

            rulers_without_hovered_element =
                rulers.slice(0,counter)
                .concat(rulers.slice(counter+1))
        }

        counter++

    })
}
// завершение линии
function rulerEnd(e) {
    const coords = getCanvasCoords(e);
    const endX = coords.x;
    const endY = coords.y;
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
    ctx.lineWidth = linewidth;
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    
    const text = length.toFixed(2) + " мм";
    ctx.strokeText(text, midX, midY - 10);
    ctx.fillText(text, midX, midY - 10);
}
