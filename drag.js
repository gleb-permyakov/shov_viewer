let dragState = null
let activeFigure = null
let activeHandle = null
let isDragging = false

const HANDLE_RADIUS = 3
const CLICK_THRESHOLD = 6

let lastMouse = { x: 0, y: 0 }

// ============================
// START DRAG
// ============================
function startDrag(e) {
    const coords = getCanvasCoords(e)

    activeFigure = null
    activeHandle = null
    dragState = null

    lastMouse.x = coords.x
    lastMouse.y = coords.y

    // ============================
    // RULER
    // ============================
    const handleHit = findRulerHandle(coords)
    if (handleHit) {
        isDragging = true
        activeFigure = handleHit.index
        activeHandle = handleHit.handle
        dragState = "ruler-handle"
        return
    }

    const bodyHit = findRulerBody(coords)
    if (bodyHit !== null) {
        isDragging = true
        activeFigure = bodyHit
        dragState = "ruler-move"
        return
    }

    // ============================
    // MEASURE RECT
    // ============================
    const rectHandle = findMeasureRectHandle(coords)
    if (rectHandle) {
        isDragging = true
        activeFigure = rectHandle.index
        activeHandle = rectHandle.handle
        dragState = "measureRect-handle"
        return
    }

    const rectBody = findMeasureRectBody(coords)
    if (rectBody !== null) {
        isDragging = true
        activeFigure = rectBody
        dragState = "measureRect-move"
    }
}

// ============================
// DRAG MOVE
// ============================
function onDrag(e) {
    if (!isDragging) return

    const coords = getCanvasCoords(e)

    const dx = coords.x - lastMouse.x
    const dy = coords.y - lastMouse.y

    // ============================
    // RULER
    // ============================
    if (dragState === "ruler-handle") {
        moveRulerHandle(activeFigure, activeHandle, coords.x, coords.y)
    }

    if (dragState === "ruler-move") {
        moveRuler(activeFigure, coords.x, coords.y)
    }

    // ============================
    // MEASURE RECT
    // ============================
    if (dragState === "measureRect-handle") {
        moveMeasureRectHandle(activeFigure, activeHandle, coords.x, coords.y)
    }

    if (dragState === "measureRect-move") {

        const r = measureRects[activeFigure]

        r[2] += dx
        r[3] += dy
        r[4] += dx
        r[5] += dy
    }

    // 🔥 ВАЖНО: обновляем lastMouse ВСЕГДА
    lastMouse.x = coords.x
    lastMouse.y = coords.y

    redrawAll()
}

// ============================
// END DRAG
// ============================
function endDrag() {
    isDragging = false
    dragState = null
    activeFigure = null
    activeHandle = null
}

// ============================
// HELPERS
// ============================
function distance(x1, y1, x2, y2) {
    return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2)
}