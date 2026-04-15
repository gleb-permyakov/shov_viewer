// ==========================
// COMMENTS SYSTEM
// ==========================

let comments = [] 
// [x, y, text, id]

let comment_id = 0

const COMMENT_RADIUS = 5

// активный input (для зума)
let activeCommentInput = null
let activeCommentPos = null

// кастомный tooltip
let commentTooltip = null


// ==========================
// CREATE COMMENT
// ==========================
function createComment(e) {
    const coords = getCanvasCoords(e)
    const x = coords.x
    const y = coords.y

    showCommentInput(x, y, "", (text) => {
        if (!text) return

        comments.push([x, y, text, comment_id])
        comment_id++

        // сразу отрисовать
        requestAnimationFrame(() => {
            continueDraw({ clientX: mouse_x, clientY: mouse_y })
        })
    })
}


// ==========================
// DRAW COMMENTS
// ==========================
function drawAllComments() {
    comments.forEach(c => {
        const x = c[0]
        const y = c[1]

        ctx.beginPath()
        ctx.arc(x, y, COMMENT_RADIUS, 0, Math.PI * 2)
        ctx.fillStyle = "orange"
        ctx.fill()
    })
}


// ==========================
// UPDATE INPUT POSITION
// ==========================
function updateCommentInputPosition() {
    if (!activeCommentInput || !activeCommentPos) return

    const canvasRect = canvas.getBoundingClientRect()
    const container = document.querySelector('.canvas-container')
    const containerRect = container.getBoundingClientRect()

    // позиция относительно canvas
    let left = activeCommentPos.x * zoomLevel + canvasRect.left
    let top = activeCommentPos.y * zoomLevel + canvasRect.top

    // размеры input
    const inputWidth = activeCommentInput.offsetWidth || 100
    const inputHeight = activeCommentInput.offsetHeight || 24

    // 🔥 ЖЕСТКО ограничиваем внутри container (а не canvas)
    const minLeft = containerRect.left
    const maxLeft = containerRect.right - inputWidth

    const minTop = containerRect.top
    const maxTop = containerRect.bottom - inputHeight

    left = Math.max(minLeft, Math.min(left, maxLeft))
    top = Math.max(minTop, Math.min(top, maxTop))

    activeCommentInput.style.left = left + "px"
    activeCommentInput.style.top = top + "px"
}

// ==========================
// INPUT UI
// ==========================
function showCommentInput(x, y, initialText, onSave) {

    if (activeCommentInput) {
        activeCommentInput.remove()
    }

    const input = document.createElement("input")

    input.type = "text"
    input.maxLength = 30
    input.value = initialText

    // ✅ теперь через CSS
    input.className = "comment-input"

    document.body.appendChild(input)

    activeCommentInput = input
    activeCommentPos = { x, y }

    updateCommentInputPosition()

    setTimeout(() => input.focus(), 0)

    let saved = false

    function save() {
        if (saved) return
        saved = true

        const value = input.value.trim()

        input.remove()
        activeCommentInput = null
        activeCommentPos = null

        onSave(value)
    }

    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") save()

        if (e.key === "Escape") {
            input.remove()
            activeCommentInput = null
            activeCommentPos = null
            onSave("")
        }
    })

    input.addEventListener("blur", () => {
        setTimeout(() => {
            if (document.activeElement !== input) {
                save()
            }
        }, 100)
    })
}


// ==========================
// TOOLTIP
// ==========================
function showTooltip(text, x, y) {
    if (!commentTooltip) {
        commentTooltip = document.createElement("div")
        commentTooltip.className = "comment-tooltip"
        document.body.appendChild(commentTooltip)
    }

    commentTooltip.textContent = text

    const rect = canvas.getBoundingClientRect()

    commentTooltip.style.left =
        (x * zoomLevel + rect.left + 10) + "px"

    commentTooltip.style.top =
        (y * zoomLevel + rect.top + 10) + "px"

    commentTooltip.style.display = "block"
}

function hideTooltip() {
    if (commentTooltip) {
        commentTooltip.style.display = "none"
    }
}


// ==========================
// HOVER (мгновенный)
// ==========================
function findCommentHover(e) {
    const coords = getCanvasCoords(e)
    const x = coords.x
    const y = coords.y

    let found = false

    for (let c of comments) {
        const dx = x - c[0]
        const dy = y - c[1]
        const dist = Math.sqrt(dx * dx + dy * dy)

        if (dist < COMMENT_RADIUS + 2) {
            showTooltip(c[2], c[0], c[1])
            found = true
            break
        }
    }

    if (!found) {
        hideTooltip()
    }
}


// ==========================
// EDIT COMMENT
// ==========================
function editComment(e) {
    const coords = getCanvasCoords(e)
    const x = coords.x
    const y = coords.y

    for (let i = 0; i < comments.length; i++) {
        const c = comments[i]

        const dx = x - c[0]
        const dy = y - c[1]
        const dist = Math.sqrt(dx * dx + dy * dy)

        if (dist < COMMENT_RADIUS + 2) {

            showCommentInput(c[0], c[1], c[2], (newText) => {
                if (newText) {
                    comments[i][2] = newText
                }

                // сразу перерисовка
                requestAnimationFrame(() => {
                    continueDraw({ clientX: mouse_x, clientY: mouse_y })
                })
            })

            return true
        }
    }

    return false
}