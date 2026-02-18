// эллипс по 3 точкам
let ellipses3 = []
let ellipse3_status = 1
let actual_ellipse3_data = [] // [цвет, толщина, xo, y0, x1, y1, x2, y2]

// рисуем эллипс по 3 точкам
function drawEllipse3(e) {
    startX = e.offsetX / zoomLevel
    startY = e.offsetY / zoomLevel

    if (ellipse3_status == 1) {
        actual_ellipse3_data = []
        actual_ellipse3_data.push(colorPicker.value, sizeSlider.value)
        actual_ellipse3_data.push(startX, startY)
        ellipse3_status = 2
    } else if (ellipse3_status == 2) {
        actual_ellipse3_data.push(startX, startY)
        ellipse3_status = 3
    } else if (ellipse3_status == 3) {
        actual_ellipse3_data.push(startX, startY)
        // надо нарисовать теперь
        
        // находим центр (середина AB)
        const O = {
            x: (actual_ellipse3_data[2] + actual_ellipse3_data[4]) / 2,
            y: (actual_ellipse3_data[3] + actual_ellipse3_data[5]) / 2
        };
        // большая полуось (половина расстояния AB)
        const dx = actual_ellipse3_data[4] - actual_ellipse3_data[2];
        const dy = actual_ellipse3_data[5] - actual_ellipse3_data[3];
        const a = Math.sqrt(dx*dx + dy*dy) / 2;
        // угол поворота (направление большой оси)
        const angle = Math.atan2(dy, dx);
        // малая полуось (расстояние от центра до точки C)
        const cx = actual_ellipse3_data[6] - O.x;
        const cy = actual_ellipse3_data[7] - O.y;
        const b = Math.sqrt(cx*cx + cy*cy);

        // парамемтры рисования
        ctx.strokeStyle = colorPicker.value
        ctx.lineWidth = sizeSlider.value
        ctx.lineCap = 'round'
        // рисуем эллипс
        ctx.beginPath();
        ctx.ellipse(O.x, O.y, a, b, angle, 0, 2 * Math.PI);
        ctx.stroke();
        // возвращаем статус рисования на 1
        ellipse3_status = 1
        // и надо запомнить этот эллипс
        ellipses3.push([colorPicker.value, sizeSlider.value, O.x, O.y, a, b, angle])
    } 
}

// отрисовка всех предыдущих эллипсов
function drawAllEllipses3() {
    console.log(ellipses3)
    ellipses3.forEach(ellipse => {
        // парамемтры рисования
        ctx.strokeStyle = ellipse[0]
        ctx.lineWidth = ellipse[1]
        ctx.lineCap = 'round'
        ctx.beginPath();
        ctx.ellipse(ellipse[2], ellipse[3], ellipse[4], ellipse[5], ellipse[6], 0, 2 * Math.PI);
        ctx.stroke();
    })  
}

// поиск точки на эллипсе
// надо написать