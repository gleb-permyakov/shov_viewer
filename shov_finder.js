const find_shov = document.querySelector(".find_shov")
find_shov.addEventListener("click", () => {
    save_img_to_server()
})

function save_img_to_server() {
    canvas.toBlob(blob => {
        const formData = new FormData();
        formData.append('image', blob, 'shov.png');
        fetch('/find_shov', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success' && data.coordinates) {
                const [y1_middle, y2_middle, y1_top, y2_top, y1_bottom, y2_bottom, width, height] = data.coordinates;
                
                // Добавляем три новые линии
                lines.push(['#0000ff', 2, 0, y1_middle, width, y2_middle]);
                
                // Перерисовываем всё
                // ctx.clearRect(0, 0, canvas.width, canvas.height);
                // if (original_image) ctx.drawImage(original_image, 0, 0);
                // drawAllLines();
                // drawAllRects();
                // drawAllEllipses();
                // drawAllEllipses3();
                // drawAllLinesEt();
                // drawAllMeasureEllipses();
                // drawAllMeasureEllipses3();
                // drawAllMeasureRects();
                // drawAllRulers();
            }
        })
        .catch(error => console.error('Ошибка:', error));
    });
}