// для добавления дефекта в аннотацию
measure_id = 0
defects = [] // ["ellipse3", [длина, ширина], measure_id, "пора"], []...
element_to_add = [] // тут временно храним то, что подсветили и добавляем

fixed_element_data = [] // сюда мы фиксируем данные о том элементе, который был выбран, когда мы нажали ПКМ

// для сохранения аннтоации в json
const saveBtn = document.querySelector("#saveBtn")
const popup_save = document.querySelector(".popup_save")
saveBtn.addEventListener("click", () => {
    createJSFileWithArrays()
    createTableDefects()
    popup_save.classList.add("show_save_popup")
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
        new_inner += '<div class="defect" data-defect-id="' + element[2] + '" data-figure="' + element[0] + '"><p>' + element[3] + '</p><p>' + Math.max((element[1][0]).toFixed(2), (element[1][1]).toFixed(2)) + ' × ' + Math.min((element[1][0]).toFixed(2), (element[1][1]).toFixed(2)) + ' мм</p></div>'
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
    console.log("here 111") 
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



// ФОРМА СОХРАНЕНИЯ АННОТАЦИИ И ПРОТОКОЛА
const inputs = document.querySelectorAll(".popup_save_input")

inputs.forEach(input => {
    input.style.width = Math.max(input.value.length, input.placeholder.length) + 'ch';
    input.addEventListener('input', () => {
        input.style.width = Math.max(input.value.length, input.placeholder.length) + 'ch';
    });
});

const btn_save_annotation_json = document.querySelector("#btn_save_annotation_json")
const btn_save_protocol_docx = document.querySelector("#btn_save_protocol_docx")
const btn_close_popup_save = document.querySelector("#btn_close_popup_save")

btn_close_popup_save.addEventListener('click', () => {
    popup_save.classList.remove("show_save_popup")
})

btn_save_annotation_json.addEventListener('click', () => {
    // скачать документ с сервера
})

btn_save_protocol_docx.addEventListener('click', () => {
    // 
})

// генерация таблицы дефектов в попапе 
function createTableDefects() {
    arr_defects_add = []
    pora = {}
    shlak = {}
    defects.forEach(defect => {
        sizes = defect[1]
        name = defect[3]
        // правильно записываем все диаметры пор
        if (name == "Пора") {
            d = Math.max(sizes[0], sizes[1])
            d = normalize_mm(d)
            abbr = "" + d
            if (!pora[abbr]) {
                pora[abbr] = 1
            } else {
                pora[abbr] += 1
            }
        }
        // теперь шлаковые включения
        if (name == "Шлаковые включения") {
            d_len = normalize_mm(sizes[0])
            d_width = normalize_mm(sizes[1])
            abbr = "" + Math.max(d_len, d_width) + "×" + Math.min(d_len, d_width)
            if (!shlak[abbr]) {
                shlak[abbr] = 1
            } else {
                shlak[abbr] += 1
            }
        }
    });
    // фильтруем записи по порам
    for (let key of Object.keys(pora)) {
        arr_defects_add.push((pora[key] + "П" + key).replaceAll(".", ",").replace("1", ""))
    }
    // фильтруем записи по шлаковым включениям
    for (let key of Object.keys(shlak)) {
        arr_defects_add.push((shlak[key] + "ШК" + key).replaceAll(".", ",").replace("1", ""))
    }
    // генерация таблицы
    const table = document.getElementById("defectsTable")
    table.innerHTML = ""
    // заголовки
    const headers = ["Тип и номер стыка по сварочной схеме","№ и размеры снимка, мм",
        "Клеймо сварщика","Чувств. контроля по НТД, мм","Чувстви-тельность контроля, мм",
        "Обнаруженные дефекты","Процент от толщины стенки","Сумм. длина на 100,[300] мм снимка, стык {}, мм",
        "Оценка стыка","Объём контроля, %","Примечание"]
    function addHeader(table) {
        const tr = document.createElement("tr")
        headers.forEach(h => {
            const td = document.createElement("td")
            td.textContent = h
            tr.appendChild(td)
        })
        table.appendChild(tr)
    }
    addHeader(table)
    // сама таблица
    arr_defects_add.forEach(defect => {
        const tr = document.createElement("tr")
        for (i = 0; i < 11; i++) {
            const td = document.createElement("td")
            td.textContent = " "
            if (i == 5) {
                td.textContent = defect
            }
            tr.appendChild(td)
        }
        table.appendChild(tr)
    })
    console.log(arr_defects_add)
}

// 0,2; 0,3; 0,4; 0,5; 0,6; 0,8; 1,0; 1,2; 1,5; 2,0; 2,5; 3,0 мм
function normalize_mm(len_mm) {
    if (len_mm < 0.2) return 0.2 
    
    if (len_mm < 0.25) return 0.2
    
    if (len_mm < 0.35) return 0.3
    
    if (len_mm < 0.45) return 0.4
    
    if (len_mm < 0.55) return 0.5
    
    if (len_mm < 0.7) return 0.6
    
    if (len_mm < 0.9) return 0.8
    
    if (len_mm < 1.1) return 1.0
    
    if (len_mm < 1.35) return 1.2
    
    if (len_mm < 1.75) return 1.5
    
    if (len_mm < 2.25) return 2.0
    
    if (len_mm < 2.75) return 2.5
    
    if (len_mm < 3.5) return 3.0
    
    if (len_mm > 3.5) return Math.round(len_mm)
}