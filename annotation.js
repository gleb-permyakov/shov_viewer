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
function addDefect() {
    if (mouse_over_element) {
        const popup = document.querySelector(".popup")
        popup.classList.add("show")
        isPanning = false;
        canvas.style.cursor = 'crosshair';
    }
}

// функционал кнопок с попапа
function popup_btns() {
    const popup = document.querySelector(".popup")

    const cancel = document.querySelector(".btn_cancel")
    cancel.addEventListener("click", () => {
        popup.classList.remove("show")
        return
    })
    
    const ok = document.querySelector(".btn_ok")
    ok.addEventListener("click", () => {
        const selector_defect = document.querySelector("#defect_selector")
        element_to_add.push(selector_defect.value)
        popup.classList.remove("show")
        defects.push(element_to_add)
        redraw_defects()
    })
}
popup_btns()

// функция для отрисовки дефектов аннотации
function redraw_defects() {
    const defects_div = document.querySelector(".defects")
    defects_div.innerHTML = ""
    new_inner = ""
    console.log(defects)
    defects.forEach(element => {
        new_inner += '<div class="defect"><p>' + element[2] + '</p><p>' + (element[1][0]).toFixed(2) + ' x ' + (element[1][1]).toFixed(2) + ' мм</p></div>'
    });
    defects_div.innerHTML = new_inner
}