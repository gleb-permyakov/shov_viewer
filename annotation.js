// для добавления дефекта в аннотацию
measure_id = 0
defects = [] // ["ellipse3", [длина, ширина], measure_id, "пора"], []...
element_to_add = [] // тут временно храним то, что подсветили и добавляем

fixed_element_data = [] // сюда мы фиксируем данные о том элементе, который был выбран, когда мы нажали ПКМ

// для сохранения аннтоации в json
const saveBtn = document.querySelector("#saveBtn")
saveBtn.addEventListener("click", () => {
    createJSFileWithArrays()
})

// Функция для создания JS файла с массивами
async function createJSFileWithArrays() {
    // Данные для заполнения массивов
    const data = {
        ellipses: ellipses,
        ellipses3: ellipses3,
        lines_et: lines_et,
        lines: lines,
        measureEllipses: measureEllipses,
        measureEllipses3: measureEllipses3,
        measureRects: measureRects,
        rects: rects,
        rulers: rulers,
        shov_lines: shov_lines
    };

    try {
        const response = await fetch('/save_annotation', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        console.log('Сохранено:', result);
        return result;
        
    } catch (error) {
        console.error('Ошибка:', error);
    }
}

// работа с кнопкой загрузки файла JSON
const loadBtn = document.querySelector("#loadBtn")
const annotationJSONInput = document.querySelector('#annotationJSONInput')
loadBtn.addEventListener("click", () => {
    annotationJSONInput.click()
})

// обработка уже загруженного файла
annotationJSONInput.addEventListener("change", (event) => {
    const file = event.target.files[0];
    
    if (!file) return;

    const reader = new FileReader();

    reader.onload = function(e) {
        const text = e.target.result;
        loadAnnotationFromLSON(text); // передача содержимого
    };

    annotationJSONInput.value = "";

    reader.readAsText(file); 
});

// функция для работы с контентом загруженного json
function loadAnnotationFromLSON(text) {
    try {
        const data = JSON.parse(text); // парсим JSON

        // загрузили все эллипсы
        (data["ellipses"]).forEach(element => {
            ellipses.push(element)
        });
        // загрузили все эллипсы3
        (data["ellipses3"]).forEach(element => {
            ellipses3.push(element)
        });
        // загрузили эталонную линию
        (data["lines_et"]).forEach(element => {
            lines_et.push(element)
        });
        // загрузили все линии
        (data["lines"]).forEach(element => {
            lines.push(element)
        });
        // загрузили все измерительные эллипсы
        (data["measureEllipses"]).forEach(element => {
            measureEllipses.push(element)
        });
        // загрузили все измерительные эллипсы 3
        (data["measureEllipses3"]).forEach(element => {
            measureEllipses3.push(element)
        });
        // загрузили все измерительные прямоугольники
        (data["measureRects"]).forEach(element => {
            measureRects.push(element)
        });
        // загрузили все прямоугольники
        (data["rects"]).forEach(element => {
            rects.push(element)
        });
        // загрузили все линейки
        (data["rulers"]).forEach(element => {
            rulers.push(element)
        });
        // загрузили шов
        (data["shov_lines"]).forEach(element => {
            shov_lines.push(element)
        });

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
        drawAllComments()
        

    } catch (error) {
        console.error("Ошибка парсинга JSON:", error);
    }
}

// функция для работы с добавлением дефектов в аннотацию
function defectWindow() {
    if (mouse_over_element && element_to_add.length > 1) {
        fixed_element_data = element_to_add
        const popup_add = document.querySelector(".popup_add_defect")
        const popup_delete = document.querySelector(".popup_delete_defect")
        if (search_defect_by_id(fixed_element_data[2]) == -1) {
            // этот дефект еще не был доавблен
            popup_add.classList.add("show")
        } else {
            // эффект уже был добавлен, редактируем его или удаляем
            popup_delete.classList.add("show")
        }
        
        isPanning = false;
        canvas.style.cursor = 'crosshair';
    }
}

// функционал кнопок с попапа 1
function popup_btns() {
    const popup = document.querySelector(".popup_add_defect")

    const cancel = document.querySelector(".btn_cancel")
    cancel.addEventListener("click", () => {
        popup.classList.remove("show")
        return
    })
    
    const ok = document.querySelector(".btn_ok")
    ok.addEventListener("click", () => {
        const selector_defect = document.querySelector("#defect_selector")
        fixed_element_data.push(selector_defect.value)
        popup.classList.remove("show")
        defects.push(fixed_element_data)
        redraw_defects()
    })
}
popup_btns()

// функционал кнопок с попапа 2
function popup_delete_btns() {
    const popup = document.querySelector(".popup_delete_defect")

    const cancel = document.querySelector(".btn_cancel2")
    cancel.addEventListener("click", () => {
        popup.classList.remove("show")
        return
    })
    
    const ok = document.querySelector(".btn_ok2")
    ok.addEventListener("click", () => {
        const selector_defect = document.querySelector("#defect_selector2")
        // заменяем название дефекта в плашке
        defects.forEach(element => {
            if (element[2] == fixed_element_data[2]) {
                element[3] = selector_defect.value
            }
        });
        popup.classList.remove("show")
        redraw_defects()
    })

    const delete_btn = document.querySelector(".btn_delete2")
    delete_btn.addEventListener("click", () => {
        defects = defects.filter(element => element[2] != fixed_element_data[2])
        popup.classList.remove("show")
        redraw_defects()
    })
}
popup_delete_btns()

// функция для отрисовки дефектов в аннотации
function redraw_defects() {
    const defects_div = document.querySelector(".defects")
    defects_div.innerHTML = ""
    new_inner = ""
    defects.forEach(element => {
        new_inner += '<div class="defect" data-defect-id="' + element[2] + '" data-figure="' + element[0] + '"><p>' + element[3] + '</p><p>' + (element[1][0]).toFixed(2) + ' x ' + (element[1][1]).toFixed(2) + ' мм</p></div>'
    });
    defects_div.innerHTML = new_inner
    // теперь выставляем обработчик на наведение мыши
    defects_annotation = document.querySelectorAll(".defect")
    defects_annotation.forEach(element => {
        element.addEventListener("mouseenter", () => {
            flash_measure(element)
        })
        element.addEventListener("mouseleave", () => {
            redraw()
        })
        element.addEventListener("contextmenu", (e) => {
            e.preventDefault()
            if (e.button === 2) { 
                const popup_delete = document.querySelector(".popup_delete_defect")
                // fixed_element_data = [element[0], [(element[1][0]).toFixed(2), (element[1][1]).toFixed(2)], element[2]]
                popup_delete.classList.add("show")
            }
        })
    });
}

// id дефекта по measure_id
function search_defect_by_id(m_id) {
    for (i = 0; i < defects.length; i++) {
        if (defects[i][2] == m_id) {
            return i
        }
    }
    return -1
}

// надо подсветить тот дефект, который связан с плашкой при наведении курсора на плашку
function flash_measure(defect_annotation) {
    if (defect_annotation.dataset.figure == "ellipse3") {
        measureEllipses3.forEach(el => {
            const xA = el[2], yA = el[3]
            const xB = el[4], yB = el[5]
            const xC = el[6], yC = el[7]

            const cx = (xA + xB)/2
            const cy = (yA + yB)/2

            const dx = xB - xA
            const dy = yB - yA
            const a = Math.sqrt(dx*dx + dy*dy)/2
            const angle = Math.atan2(dy, dx)

            const cxC = xC - cx
            const cyC = yC - cy
            const b = Math.sqrt(cxC*cxC + cyC*cyC)

            if (el[8] == defect_annotation.dataset.defectId) {
                ctx.beginPath()
                ctx.ellipse(cx, cy, a, b, angle, 0, 2*Math.PI)
                ctx.strokeStyle = "#fafafa"
                ctx.lineWidth = el[1] + 1
                ctx.stroke()
            }
        });
    } else if (defect_annotation.dataset.figure == "rect") {
        measureRects.forEach(rect => {
            const x1 = rect[2]
            const y1 = rect[3]
            const x2 = rect[4]
            const y2 = rect[5]

            const left = Math.min(x1, x2)
            const right = Math.max(x1, x2)
            const top = Math.min(y1, y2)
            const bottom = Math.max(y1, y2)

            ctx.beginPath()
            ctx.rect(left, top, right - left, bottom - top)
            ctx.strokeStyle = "#fafafa"
            ctx.lineWidth = rect[1] + 1
            ctx.stroke()
        })
    } else if (defect_annotation.dataset.figure == "ellipse") {
        measureEllipses.forEach(el => {
            const x1 = el[2], y1 = el[3], x2 = el[4], y2 = el[5]
            const rx = Math.abs(x2 - x1)/2
            const ry = Math.abs(y2 - y1)/2
            const cx = (x1 + x2)/2
            const cy = (y1 + y2)/2

            ctx.beginPath()
            ctx.ellipse(cx, cy, rx, ry, 0, 0, 2*Math.PI)
            ctx.strokeStyle = "#fafafa"
            ctx.lineWidth = el[1] + 1
            ctx.stroke()
        });
    }
}

// удалить дефект по айдишнику
function delete_defect_annotation(m_id) {
    for (i = 0; i < defects.length; i++) {
        if (defects[i][2] == m_id) {
            defects = defects.filter(element => element[2] != m_id)
        }
    }
}

// перерисовать без подсвечивания
function redraw() {
    // отрисовываем все время 
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    //применяем фильтр ТОЛЬКО к изображению
    ctx.filter = `brightness(${100 + brightness}%) contrast(${100 + contrast}%)`

    if (original_image) {
        ctx.drawImage(original_image, 0, 0)
    }

    //сбрасываем фильтр, чтобы фигуры не искажались
    ctx.filter = "none"  

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
}