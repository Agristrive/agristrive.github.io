var height = 3
var width = 3
var current = []
var inputType
var mouseX
var mouseY

var heldX
var heldY

const button_distance = 35

var held = false
var holdType = null

function on_start(){
    size_change(null, 0, true)

    height = 3
    width = 3

    document.addEventListener('contextmenu', event => event.preventDefault());
}

function size_change(type, delta, createNew) {
    const width_div = document.getElementById("width_text")
    const height_div = document.getElementById("height_text")

    if (type == "width") {
        width = width + delta
    }else {
        height = height + delta 
    }

    if (height < 1) {
        height = 1
        delta = 0
    }else if (height > 32) {
        height = 32
        delta = 0
    }

    if (width < 1) {
        width = 1
        delta = 0
    }else if (width > 32) {
        width = 32
        delta = 0
    }


    width_div.innerText = width
    height_div.innerText = height

    if (type == "width") {
        update_plots(false, createNew, delta)
    }else {
        update_plots(true, createNew, delta)
    }
}

function update_locations(){
    const container = document.getElementById("plot_container")

    const lowest_point = (height * 36)

    if (lowest_point > 350) {
        document.getElementById("container_body").style.height = ((lowest_point - 350) + 500) + "px"
    }else {
        document.getElementById("container_body").style.height = 350 + "px"
    }


    for (let c=0; c<current.length; c++) {
        for (let r=0; r<current[c].length; r++){
            let arr = current[c]
            let self = arr[r]
            let row_pos = self.getAttribute("row")
            let column_pos = self.getAttribute("column")
            
            self.style.width = Math.ceil((container.offsetWidth / 34)) + "px"
            self.style.height = Math.ceil((container.offsetWidth / 34)) + "px"
            self.style.left = (column_pos * button_distance) + "px"
            self.style.top = (row_pos * button_distance) + "px"

        }
    }
}

function update_plots(heightChange, creatingNew, delta){
    let new_arr = []
    const container = document.getElementById("plot_container")

    if (creatingNew) {
        for (let c=0; c<current.length; c++) {
            for (let r=0; r<current[c].length; r++){
                current[c][r].remove()
            }
        }

        for (let c=0; c<height; c++) {
            var row = []

            for (let r=0; r<width; r++) {
                const new_instance = document.createElement("button")
                new_instance.ondragstart = function() { return false; };
                
                new_instance.setAttribute("row", c)
                new_instance.setAttribute("column", r)
                new_instance.setAttribute("storagecode", c + ";" + r + ";" + "plot")
                new_instance.className = "plots"
                container.appendChild(new_instance)
                row[r] = new_instance
            }

            new_arr[c] = row
        }
        current = new_arr
    }

    if (heightChange){
        if (delta > 0) {
            var row = []
            for (let r=0; r<width; r++){
                const new_instance = document.createElement("button")
                new_instance.ondragstart = function() { return false; };

                new_instance.setAttribute("row", height - 1)
                new_instance.setAttribute("column", r)
                new_instance.setAttribute("storagecode", (height - 1) + ";" + r + ";" + "plot")
                new_instance.className = "plots"
                container.appendChild(new_instance)
                row[r] = new_instance
            }
            current.push(row)
        }else if (delta < 0) {
            for (let r=0; r<current[height].length; r++){
                current[height][r].remove()
            }

            current.pop()
        }
    } else {
        if (delta > 0){
            for (let r=0; r<current.length; r++) {
                const new_instance = document.createElement("button")
                new_instance.ondragstart = function() {; return false; };

                new_instance.setAttribute("row", r)
                new_instance.setAttribute("column", width - 1)
                new_instance.setAttribute("storagecode", (width - 1) + ";" + r + ";" + "plot")
                new_instance.className = "plots"
                container.appendChild(new_instance)
                current[r].push(new_instance)
            }
        } else if (delta < 0){
            for (let r=0; r<current.length; r++) {
                current[r][width].remove()
                current[r].pop()
            }
        }
    }

    update_locations()
}

function update_buttons(){
    if (inputType == "add"){
        addButton.style.backgroundColor = "lightgray"
        removeButton.style.backgroundColor = "white"
    }else if (inputType == "remove"){
        addButton.style.backgroundColor = "white"
        removeButton.style.backgroundColor = "lightgray"
    }else{
        addButton.style.backgroundColor = "white"
        removeButton.style.backgroundColor = "white"
    }
}

function doRemove(){
    const packet = document.getElementById("packet")
    const trowel = document.getElementById("trowel")

    if (trowel.getAttribute("showing") == "true") {
        trowel.setAttribute("showing", "false")
        trowel.style.display = "none"
        inputType = null
    }else {
        trowel.setAttribute("showing", "true")
        trowel.style.display = "block"
        inputType = "remove"
        packet.setAttribute("showing", "false")
        packet.style.display = "none"
    }

    update_buttons()
}

function doAdd(){
    const packet = document.getElementById("packet")
    const trowel = document.getElementById("trowel")


    if (packet.getAttribute("showing") == "true") {
        packet.setAttribute("showing", "false")
        packet.style.display = "none"
        inputType = null
    }else {
        packet.setAttribute("showing", "true")
        packet.style.display = "block"
        inputType = "add"
        trowel.setAttribute("showing", "false")
        trowel.style.display = "none"
    }

    update_buttons()
}

function check_selection(a){
    const trowel = document.getElementById("trowel")
    const packet = document.getElementById("packet")
    const addButton = document.getElementById("addButton")
    const removeButton = document.getElementById("removeButton")

    mouseX = a.clientX
    mouseY = a.clientY

    trowel.style.left = a.clientX - 10
    trowel.style.top = a.clientY - 10
    packet.style.left = a.clientX - 20
    packet.style.top = a.clientY - 20

    const selection = document.getElementById("selection")
    const container = document.getElementById("plot_container")
    const maxLeft = document.body.scrollWidth - window.innerWidth
    const scrollPercent = (window.pageXOffset / maxLeft) * 100

    var leftboundOffset = 0

    if (maxLeft > 0) {
        leftboundOffset = (maxLeft / 2) - ((maxLeft / 2) * ((scrollPercent) / 50))
    }

    if (holdType == "LMB") {
        if (held && (inputType == "add" || inputType == "remove")){
            if (true) {
                selection.style.display = "block"
                selection.style.width = Math.abs(mouseX - heldX)
                selection.style.height = Math.abs(mouseY - heldY)
    
                if ((mouseX - heldX) > 0) {
                    selection.style.left = heldX
                } else {
                    selection.style.left = heldX - Math.abs(mouseX - heldX)
                }
    
                if ((mouseY - heldY) > 0) {
                    selection.style.top = heldY
                } else {
                    selection.style.top = heldY - Math.abs(mouseY - heldY)
                }
            }
        }
    
        const main = document.getElementById("container_body")
    
        if (held && inputType != null) {
            const selectleftbound = selection.offsetLeft
            const selectrightbound = selectleftbound + selection.offsetWidth
            const selecttopbound = selection.offsetTop
            const selectbottombound = selecttopbound + selection.offsetHeight
    
        
            for (let a=0; a<current.length; a++) {
                for (let b=0; b<current[a].length; b++){
                    const button = current[a][b]
                    
                    const row = button.getAttribute("row")
                    const column = button.getAttribute("column")
                        
                    const leftbound = (column * button_distance) - (button.offsetWidth / 2) + ((window.innerWidth - container.offsetWidth) / 2) + 15 + leftboundOffset
                    const rightbound = (column * button_distance) + (button.offsetWidth / 2) + ((window.innerWidth - container.offsetWidth) / 2) + 15 + leftboundOffset
                    const topbound = (row * button_distance) - (button.offsetHeight / 2) + (container.offsetTop + main.offsetTop - window.pageYOffset) + 15 
                    const bottombound = (row * button_distance) + (button.offsetHeight / 2) + (container.offsetTop + main.offsetTop - window.pageYOffset) + 15
                    
                    if ((leftbound <= selectrightbound && selectleftbound <= rightbound) && (topbound <= selectbottombound && selecttopbound <= bottombound)) {
                        button.setAttribute("hover", "true")
                    }else{
                        button.setAttribute("hover", "false")
                    }
        
                    if (button.getAttribute("hover") == "true") {
                        button.style.backgroundColor = "rgb(177, 144, 103)"
                    } else {
                        button.style.backgroundColor = "rgb(233, 181, 118)"
                    }
    
                }
            }
        }
    }else{
        if (held && inputType != null) {
            const selectleftbound = selection.offsetLeft
            const selectrightbound = selectleftbound + selection.offsetWidth
            const selecttopbound = selection.offsetTop
            const selectbottombound = selecttopbound + selection.offsetHeight
    
            const main = document.getElementById("container_body")
    
            for (let a=0; a<current.length; a++) {
                for (let b=0; b<current[a].length; b++){
                    const button = current[a][b]
                    
                    const row = button.getAttribute("row")
                    const column = button.getAttribute("column")
                    const leftbound = (column * button_distance) - (button.offsetWidth / 2) + ((window.innerWidth - container.offsetWidth) / 2) + 15 + leftboundOffset
                    const rightbound = (column * button_distance) + (button.offsetWidth / 2) + ((window.innerWidth - container.offsetWidth) / 2) + 15 + leftboundOffset
                    const topbound = (row * button_distance) - (button.offsetHeight / 2) + (container.offsetTop + main.offsetTop - window.pageYOffset) + 15 
                    const bottombound = (row * button_distance) + (button.offsetHeight / 2) + (container.offsetTop + main.offsetTop - window.pageYOffset) + 15
                    
                    if ((leftbound <= mouseX && mouseX <= rightbound) && (topbound <= mouseY && mouseY <= bottombound)) {
                        button.setAttribute("hover", "true")
                    }
        
                    if (button.getAttribute("hover") == "true") {
                        button.style.backgroundColor = "rgb(177, 144, 103)"
                    } else {
                        button.style.backgroundColor = "rgb(233, 181, 118)"
                    }
    
                }
            }
        }
    }
    
}

document.onmousemove = check_selection

document.onmousedown = function(a){
    const selection = document.getElementById("selection")

    held = true
    heldX = mouseX
    heldY = mouseY

    if (a.button == 2) {
        holdType = "RMB"
    } else {
        holdType = "LMB"
    }

    check_selection(a)
}

document.onmouseup = function(a){
    held = false
    holdType = null
    selection.style.display = "none"
    var selected_plots = []
    for (let a=0; a<current.length; a++) {
        for (let b=0; b<current[a].length; b++){
            const button = current[a][b]
            if (button.getAttribute("hover") == "true") {
                selected_plots.push(button)
            }
            button.setAttribute("hover", false)

            button.style.backgroundColor = "rgb(233, 181, 118)"
        }
    }
}

