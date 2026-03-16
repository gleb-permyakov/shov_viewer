// эллипс по 3 точкам
let ellipses3 = []
let ellipse3_status = 1 // порядковый номер точки, которую сейчас пытаемся нарисовать
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

// поиск точки на эллипсе
function findPointInEllipse3(e) {
    let counter = 0 
    ellipses3.forEach(ellipse => {
        const x = e.offsetX / zoomLevel
        const y = e.offsetY / zoomLevel

        // [color, width, O.x, O.y, a, b, angle]
        const centerX = ellipse[2]  // O.x
        const centerY = ellipse[3]  // O.y
        const a = ellipse[4]        // большая полуось
        const b = ellipse[5]        // малая полуось
        const angle = ellipse[6]    // угол поворота

        // погрешность в пикселях
        const accuracy = 5 // / zoomLevel

        // преобразуем координаты точки в систему координат эллипса
        // сначала перенос в центр эллипса
        const dx = x - centerX
        const dy = y - centerY
        
        // затем поворот на угол -angle (обратное преобразование)
        const cos = Math.cos(-angle)
        const sin = Math.sin(-angle)
        const xRotated = dx * cos - dy * sin
        const yRotated = dx * sin + dy * cos

        // уравнение эллипса: (x/a)^2 + (y/b)^2 = 1
        // вычисляем значение левой части уравнения
        const value = (xRotated * xRotated) / (a * a) + (yRotated * yRotated) / (b * b)

        // проверяем попадание в эллипс с учетом погрешности
        // value должно быть близко к 1 (для контура эллипса)
        // или <= 1 (для заливки, если нужно)
        if (Math.abs(value - 1) <= accuracy / Math.min(a, b)) {
            // подсвечиваем эллипс
            ctx.strokeStyle = "#fafafa"
            ctx.lineWidth = ellipse[1] 
            ctx.beginPath()
            ctx.ellipse(centerX, centerY, a, b, angle, 0, Math.PI * 2)
            ctx.stroke()
            
            // сказали, что мышь на элементе
            mouse_over_element = true
            
            // передаем массив без этого эллипса
            ellipses3_without_hovered_element = ellipses3.slice(0, counter).concat(ellipses3.slice(counter+1))
        }
        counter++
    })
}

// отрисовка всех предыдущих эллипсов
function drawAllEllipses3() {
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