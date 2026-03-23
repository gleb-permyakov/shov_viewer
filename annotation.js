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
