// для добавления дефекта в аннотацию
measure_id = 0
defects = [] // ["ellipse3", [длина, ширина], measure_id, "пора"], []...
element_to_add = [] // тут временно храним то, что подсветили и добавляем

fixed_element_data = [] // сюда мы фиксируем данные о том элементе, который был выбран, когда мы нажали ПКМ

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

// функция для работы с добавлением дефектов в аннотацию
function defectWindow() {
    if (mouse_over_element) {
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
            if (element[2] == search_defect_by_id(fixed_element_data[2])) {
                element[3] = selector_defect.value
            }
        });
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
    console.log(defects)
    defects.forEach(element => {
        new_inner += '<div class="defect" data-defect-id="' + element[2] + '"><p>' + element[3] + '</p><p>' + (element[1][0]).toFixed(2) + ' x ' + (element[1][1]).toFixed(2) + ' мм</p></div>'
    });
    defects_div.innerHTML = new_inner
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