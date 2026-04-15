// ==========================
// COMMENTS SYSTEM (FIXED)
// ==========================

let comments = [] 
// [x, y, text, id]

let comment_id = 0
const COMMENT_RADIUS = 5

let activeCommentInput = null
let activeCommentPos = null
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

        requestAnimationFrame(() => {
            continueDraw({ clientX: mouse_x, clientY: mouse_y })
        })
    })
}


// ==========================
// DRAW COMMENTS
// ==========================
function drawAllComments() {
    comments.forEach((c, index) => {
        const x = c[0]
        const y = c[1]

        // круг
        ctx.beginPath()
        ctx.arc(x, y, COMMENT_RADIUS, 0, Math.PI * 2)
        ctx.fillStyle = "orange"
        ctx.fill()

        // номер
        ctx.font = "12px Arial"
        ctx.textAlign = "left"
        ctx.textBaseline = "middle"
        ctx.fillStyle = "orange"

        ctx.fillText(
            index + 1,
            x + COMMENT_RADIUS + 4,
            y
        )
    })
}


// ==========================
// INPUT POSITION (FIXED SAFE)
// ==========================
function updateCommentInputPosition() {
    if (!activeCommentInput || !activeCommentPos) return

    const canvasRect = canvas.getBoundingClientRect()
    const containerRect = document.querySelector('.canvas-container').getBoundingClientRect()

    let left = canvasRect.left + activeCommentPos.x * zoomLevel
    let top  = canvasRect.top  + activeCommentPos.y * zoomLevel

    const w = activeCommentInput.offsetWidth || 120
    const h = activeCommentInput.offsetHeight || 24

    // только canvas bounds
    const minLeft = containerRect.left
    const maxLeft = containerRect.right - w

    const minTop = containerRect.top
    const maxTop = containerRect.bottom - h

    left = Math.max(minLeft, Math.min(left, maxLeft))
    top  = Math.max(minTop, Math.min(top, maxTop))

    activeCommentInput.style.left = left + "px"
    activeCommentInput.style.top = top + "px"
}
// ==========================
// INPUT UI (FIXED)
// ==========================
function showCommentInput(x, y, initialText, onSave) {

    if (activeCommentInput) {
        activeCommentInput.remove()
        activeCommentInput = null
        activeCommentPos = null
    }

    const input = document.createElement("input")
    input.type = "text"
    input.maxLength = 30
    input.value = initialText
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
        }, 80)
    })
}


// ==========================
// TOOLTIP (FIXED)
// ==========================
function showTooltip(text, x, y) {
    if (!commentTooltip) {
        commentTooltip = document.createElement("div")
        commentTooltip.className = "comment-tooltip"
        document.body.appendChild(commentTooltip)
    }

    commentTooltip.textContent = text

    const rect = canvas.getBoundingClientRect()

    commentTooltip.style.left = rect.left + x * zoomLevel + 10 + "px"
    commentTooltip.style.top  = rect.top  + y * zoomLevel + 10 + "px"

    commentTooltip.style.display = "block"
}

function hideTooltip() {
    if (commentTooltip) {
        commentTooltip.style.display = "none"
    }
}


// ==========================
// HOVER
// ==========================
function findCommentHover(e) {
    const coords = getCanvasCoords(e)
    const x = coords.x
    const y = coords.y

    for (let c of comments) {
        const dx = x - c[0]
        const dy = y - c[1]
        const dist = Math.sqrt(dx * dx + dy * dy)

        if (dist < COMMENT_RADIUS + 2) {
            showTooltip(c[2], c[0], c[1])
            return
        }
    }

    hideTooltip()
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

                requestAnimationFrame(() => {
                    continueDraw({ clientX: mouse_x, clientY: mouse_y })
                })
            })

            return true
        }
    }

    return false
}


// ==========================
// LIVE UPDATE INPUT POSITION
// ==========================
window.addEventListener("mousemove", () => {
    if (activeCommentInput) {
        updateCommentInputPosition()
    }
})

window.addEventListener("resize", () => {
    if (activeCommentInput) {
        updateCommentInputPosition()
    }
})