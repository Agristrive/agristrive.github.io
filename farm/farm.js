var db_url = 'https://api.jsonbin.io/v3/b/67e1b0a48561e97a50f20770'
var current_api_key = "$2a$10$SGS2twtc4XUUm71aKY0CRutJwxVY5n7TqpLLRtAol7sKiwFtB.otu"

var height = 1
var width = 1
var current = []
var plant_data = []

var inputType
var mouseX
var mouseY

var heldX
var heldY

const button_distance = 35

var held = false
var holdType = null

var chosen_user_data = null
var chosen_farm_data = null

var date = new Date()

var current_hover_plot = null

function start_farm(){
    populate_selection()
    document.addEventListener('contextmenu', event => event.preventDefault());
    let cookie_val = get_cookie()

    if (cookie_val){
        document.body.setAttribute('farm_id', cookie_val)

        let wait_for_attribute = setInterval(() => {
            if (document.body.getAttribute("data")){
                load_user_data(document.body.getAttribute("user"), document.body.getAttribute("data"), cookie_val)
                clearInterval(wait_for_attribute)
            }
        }, 100);
    }else{
        location.href = "../login/login"
    }
    size_change(null, 0, true)
}

setInterval(() => {
    update_plant_data()
}, 333)

async function update_plant_data(special, list){
    let remove_list = []

    for (let i=0; i<plant_data.length; i++){
        let data_row = Number(plant_data[i].split(";")[0].trim())
        let data_column = Number(plant_data[i].split(";")[1].trim())
        let crop = plant_data[i].split(";")[2].trim()
        let last_accessed = Number(plant_data[i].split(";")[3].trim())
        let ready_time = Number(plant_data[i].split(";")[4].trim())
        let next_water_time = Number(plant_data[i].split(";")[5].trim())

        last_accessed = Math.ceil(date.getTime() / (60 * 1000))


        await get_crop_info().then(data => {
            if (special && list){
                for (let sigma=0; sigma<list.length; sigma++){
                    if (list[sigma].getAttribute("row") == data_row && list[sigma].getAttribute("column") == data_column){
                        let plot = list[sigma]
                        
                        for (let h=0; h<data['crops'].length; h++){
                            let crop_data = data['crops'][h]
                            if (crop_data["id"] == plot.getAttribute("crop")){
                                if (special == "water"){
                                    next_water_time = last_accessed + (Number(crop_data['days_between_water']) * 24 * 60)
                                }else if(special == "harvest"){
                                    if (crop_data["can_reharvest"] == true){
                                        ready_time = last_accessed + (Number(crop_data["day_between_reharvest"] * 24 * 60))
                                    }else{
                                        remove_list.push(plot)
                                    }
                                }
                            }
                        }
                    }
                }
            }
        })

        plant_data[i] = data_row + ";" + data_column + ";" + crop + ";" + last_accessed + ";" + ready_time + ";" + next_water_time

        for (let r=0; r<current.length; r++){
            for (let c=0; c<current[r].length; c++){
                let plot = current[r][c]
                if ((plot.getAttribute('row') == data_row) && (plot.getAttribute("column") == data_column)){
                    let color;
                    await get_crop_info().then(data => {
                        for (let f=0; f<data['crops'].length; f++){
                            if (data['crops'][f]["id"] == crop){
                                let crop_arr = data['crops'][f]
                                color = crop_arr['plot_color']
                            }
                        }
                    })

                    plot.setAttribute('crop',crop)
                    plot.setAttribute('last_accessed',last_accessed)
                    plot.setAttribute("next_water_time", next_water_time)
                    plot.setAttribute("final", ready_time)
                    plot.setAttribute("base-color", color)
                    plot.style.backgroundColor = plot.getAttribute("base-color")
                    plot.style.backgroundImage = "url(../img/" + crop + ".png)"
                }
            }
        }
    }
    if (remove_list[0]){
        remove_plots(remove_list)
    }
}

function get_cookie(){
    let cookie_data = document.cookie

    var returned
    for (let i = 0; i < cookie_data.split(";").length; i++) {
        let index = cookie_data.split(";")[i].split("=")[0].trim();
        let value = cookie_data.split(";")[i].split("=")[1];

        if (index == "farm_id") {
            returned = value;
        }else if(index == "username"){
            document.body.setAttribute('user', value)
        }
    }
    return returned;
}

function load_user_data(user, data, id){
    data = JSON.parse(data)

    for (let i=0; i<data['user-data']['users'].length; i++){
        if (data['user-data']['users'][i]['username'] == user){
           chosen_user_data = data['user-data']['users'][i]
        }
    }

    if (chosen_user_data){
        for (let f=0; f<chosen_user_data['farms'].length; f++){
            if (chosen_user_data['farms'][f]['id'] == id) {
                chosen_farm_data = chosen_user_data['farms'][f]
            }
        }
    }

    if (chosen_farm_data){
        if (chosen_farm_data['rows']){
            height = chosen_farm_data['rows']
            width = chosen_farm_data['columns']
            plant_data = chosen_farm_data['plots']
            document.getElementById("farm_name_header").innerHTML = chosen_farm_data['name']
            size_change(null, 0, true)
        }
    }
    update_plant_data()
    document.getElementById("show_loading").style.display = "none"

}

async function get_crop_info(){
    var response = await fetch("https://agristrive.github.io/crop_db.json")
    var json = await response.json()
    return json
}

async function populate_selection(){
    const selection = document.getElementById("plant-select")
    
    await get_crop_info().then(data => {
        for (let i=0; i<data['crops'].length; i++){
            let crop_arr = data['crops'][i]
            let name = crop_arr['name']
            let id = crop_arr['id']

            let current = selection.innerHTML

            selection.innerHTML = current + "<option value='" + id + "'>" + name + "</option>"
        }
    })
}

async function get_json(url){
    console.log("Attemping to access JSON")
    var a = null
    try{
        var response =  await fetch(url, { headers: {
            "X-Master-Key": current_api_key,
            "Content-Type": "application/json"
          }})
        var json = await response.json().then(r => {(a = r.record)});
    }catch(err){
        console.error("Logging an Error in accessing JSON: " + err)
    }finally{
        console.log("Completed Attempt to access JSON")
        return a
    }
}

async function write_new_plots() {
    let b = document.getElementById("saveButton")
    if (b.getAttribute("debounce") == "true"){
    }else{
        b.setAttribute("debounce", "true")
        b.innerText = "SAVING..."
        update_plant_data()
        let req = new XMLHttpRequest();
        req.open("PUT", db_url, true);
        req.setRequestHeader("Content-Type", "application/json");
        req.setRequestHeader("X-Master-Key", current_api_key);

        
        await get_json(db_url)
            .then(old_data => {
                let new_data = old_data
                let chosen_us = null
                let c_farm_data = null
                for (let i=0; i<new_data['user-data']["users"].length; i++){
                    if (new_data['user-data']["users"][i]['username'] == document.body.getAttribute("user")){
                        chosen_us = i
                    }
                }
                
                for (let f=0; f<new_data['user-data']["users"][chosen_us]['farms'].length; f++){
                    if (new_data['user-data']["users"][chosen_us]['farms'][f]['id'] == document.body.getAttribute("farm_id")){
                        c_farm_data = f
                    }
                }

                new_data['user-data']['users'][chosen_us]['farms'][c_farm_data]['plots'] = plant_data
                new_data['user-data']['users'][chosen_us]['farms'][c_farm_data]["rows"] = height
                new_data['user-data']['users'][chosen_us]['farms'][c_farm_data]['columns'] = width
                req.onreadystatechange = () => {
                    if (req.readyState == XMLHttpRequest.DONE) {
                    b.innerText = "PLOT SAVED"
                    setTimeout(() => {
                        b.innerText = "SAVE PLOT"
                        b.setAttribute("debounce", "false")
                    }, 3000)
                    }
                };

                req.send(JSON.stringify(new_data))
                document.body.setAttribute("data", JSON.stringify(new_data))
            })
    }
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
                new_instance.setAttribute("base-color", "rgb(233, 181, 118)")
                new_instance.className = "plots"
                container.appendChild(new_instance)
                new_instance.style.backgroundSize = "cover"
                row[r] = new_instance
            }

            new_arr[c] = row
        }
        current = new_arr
    }
    let remove_list = []
    if (heightChange){
        if (delta > 0) {
            var row = []
            for (let r=0; r<width; r++){
                const new_instance = document.createElement("button")
                new_instance.ondragstart = function() { return false; };
                new_instance.setAttribute("base-color", "rgb(233, 181, 118)")

                new_instance.setAttribute("row", height - 1)
                new_instance.setAttribute("column", r)
                new_instance.setAttribute("storagecode", (height - 1) + ";" + r + ";" + "plot")
                new_instance.className = "plots"
                new_instance.style.backgroundSize = "cover"
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
                new_instance.setAttribute("base-color", "rgb(233, 181, 118)")

                new_instance.setAttribute("row", r)
                new_instance.setAttribute("column", width - 1)
                new_instance.setAttribute("storagecode", (width - 1) + ";" + r + ";" + "plot")
                new_instance.className = "plots"
                new_instance.style.backgroundSize = "cover"
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
    toggle_cursor(inputType)
}

function toggle_cursor(special){
    const packet = document.getElementById("addIcon")
    const trowel = document.getElementById("removeIcon")
    const glove = document.getElementById("harvestIcon")
    const watering = document.getElementById("waterIcon")

    const addButton = document.getElementById("addButton")
    const removeButton = document.getElementById("removeButton")
    const waterButton = document.getElementById("waterButton")
    const harvestButton = document.getElementById("harvestButton")

    let icon_arr = [packet, trowel, glove, watering]
    let button_arr = [addButton, removeButton, harvestButton, waterButton]

    if (special){
        for (let i=0; i<icon_arr.length; i++){
            let icon = icon_arr[i]
            let button = button_arr[i]

            if (icon.id == (special + "Icon")){
                icon.style.display = "block"
                icon.setAttribute("showing", "true")
            }else{
                icon.style.display = "none"
                icon.setAttribute("showing", "false")

            }

            if (button.id == (special + "Button")){
                button.style.backgroundColor = "gray"
            }else{
                button.style.backgroundColor = "white"
            }
        }
    }else{
        for (let i=0; i<icon_arr.length; i++){
            let icon = icon_arr[i]
            let button = button_arr[i]

            icon.style.display = "none"
            button.style.backgroundColor = "white"

            icon.setAttribute("showing", "false")
        }
    }
}

function doRemove(){
    const a = document.getElementById("removeIcon")

    if (a.getAttribute("showing") == "true") {
        inputType = null
    }else {
        inputType = "remove"
    }

    update_buttons()
}

function doAdd(){
    const a = document.getElementById("addIcon")

    if (a.getAttribute("showing") == "true") {
        inputType = null

    }else {
        inputType = "add"
    }

    update_buttons()
}

function doHarvest(){
    const a = document.getElementById("harvestIcon")

    if (a.getAttribute("showing") == "true") {
        inputType = null

    }else {
        inputType = "harvest"
    }

    update_buttons()
}

function doWater(){
    const a = document.getElementById("waterIcon")

    if (a.getAttribute("showing") == "true") {
        inputType = null

    }else {
        inputType = "water"
    }

    update_buttons()
}

async function update_info(plot){
    const info_container = document.getElementById("plot_info")
    const info_name = document.getElementById("crop_name")
    const info_main = document.getElementById("crop_info")

    if (plot.getAttribute("crop")){
        let time_remaining = "20 days"
        let water_time_remaining = "2 days"
        let watering_amount = 5000
        let can_reharvest = "Yes"
        let additional = "The berry is usually ready to harvest when it is bright red. <br> Make sure the berry is firm, but not hard."
        let spacing_info = 3
        let depth_info = 1
        await get_crop_info().then(data => {
            for (let i=0; i<plant_data.length; i++){
                let data_row = Number(plant_data[i].split(";")[0].trim())
                let data_column = Number(plant_data[i].split(";")[1].trim())
                let crop = plant_data[i].split(";")[2].trim()
                let last_accessed = Number(plant_data[i].split(";")[3].trim())
                let ready_time = Number(plant_data[i].split(";")[4].trim())
                let next_water_time = Number(plant_data[i].split(";")[5].trim())
                for (let c=0; c<data['crops'].length; c++){
                    if (data['crops'][c]['id'] == crop){
                        let crop_data = data['crops'][c]
                        if (data_row == plot.getAttribute("row") && data_column == plot.getAttribute("column")){
                            time_remaining = Math.floor((ready_time - last_accessed) / (60 * 24)) + " Days (" + (ready_time - last_accessed) + " Minutes)"
                            water_time_remaining = Math.floor((next_water_time - last_accessed) / (60 * 24)) + " Days (" + (next_water_time - last_accessed) + " Minutes)"

                            if (last_accessed > next_water_time){
                                water_time_remaining = "READY TO WATER"
                            }
                            if (last_accessed > ready_time){
                                water_time_remaining = "READY TO HARVEST"
                            }

                            if (crop_data['can_reharvest'] == true){
                                can_reharvest = "Yes"
                            }else{
                                can_reharvest = "No"
                            }

                            additional = crop_data["special_info"]
                            depth_info = crop_data["soil_depth"]
                            spacing_info = crop_data['spacing']
                            watering_amount = crop_data['water_amount']
                        }
                    }
                }
            }
        })

        info_name.innerText = current_hover_plot.getAttribute('crop').charAt(0).toUpperCase() + current_hover_plot.getAttribute('crop').slice(1);

        info_main.innerHTML = (
            "Estimated Time Left: " + time_remaining + "<br>" + 
            "Time Until Next Watering: " + water_time_remaining + "<br>" +
            "Water Amount: " + watering_amount + " mL" + "<br>" +
            "Can Reharvest: " + can_reharvest + "<br>" +
            "Other Info: " + additional + "<br>" +
            "Recommended Soil Depth: " + depth_info +  " Inches <br>" +
            "Recommended Spacing: " + spacing_info + " Inches <br>" +
            "Recommended Spacing (Rows): 12-14 Inches <br>"

        )
    }else{
        info_name.innerText = "No Crop Planted"
        info_main.innerHTML = "Plant a crop by using the ADD button"
    }
}

function darkenRGBColor(rgb, factor) {
    const values = rgb.substring(4, rgb.length - 1).split(',').map(Number);
    const [r, g, b] = values;
  
    const newR = Math.max(0, Math.min(255, Math.floor(r * (1 - factor))));
    const newG = Math.max(0, Math.min(255, Math.floor(g * (1 - factor))));
    const newB = Math.max(0, Math .min(255, Math.floor(b * (1 - factor))));
  
    return `rgb(${newR}, ${newG}, ${newB})`;
}

function check_selection(a){
    const trowel = document.getElementById("removeIcon")
    const packet = document.getElementById("addIcon")
    const water = document.getElementById("waterIcon")
    const glove = document.getElementById("harvestIcon")
    const description = document.getElementById("plot_info")

    mouseX = a.clientX
    mouseY = a.clientY

    trowel.style.left = a.clientX - 10
    trowel.style.top = a.clientY - 10
    packet.style.left = a.clientX - 20
    packet.style.top = a.clientY - 20
    water.style.left = a.clientX - 30
    water.style.top = a.clientY - 20
    glove.style.left = a.clientX - 20
    glove.style.top = a.clientY - 20

    description.style.left = a.clientX
    description.style.top = a.clientY

    if (current_hover_plot){
        description.style.display = "block"
        update_info(current_hover_plot)
    }else {
        description.style.display = 'none'
    }

    const selection = document.getElementById("selection")
    const container = document.getElementById("plot_container")
    const maxLeft = document.body.scrollWidth - window.innerWidth
    const scrollPercent = (window.pageXOffset / maxLeft) * 100
    const main = document.getElementById("container_body")

    var leftboundOffset = 0
    current_hover_plot = null
    for (let a=0; a<current.length; a++) {
        for (let b=0; b<current[a].length; b++){
            const button = current[a][b]
            button.style
            
            const row = button.getAttribute("row")
            const column = button.getAttribute("column")
            const leftbound = (column * button_distance) - (button.offsetWidth / 2) + ((window.innerWidth - container.offsetWidth) / 2) + 15 + leftboundOffset
            const rightbound = (column * button_distance) + (button.offsetWidth / 2) + ((window.innerWidth - container.offsetWidth) / 2) + 15 + leftboundOffset
            const topbound = (row * button_distance) - (button.offsetHeight / 2) + (container.offsetTop + main.offsetTop - window.pageYOffset) + 15 
            const bottombound = (row * button_distance) + (button.offsetHeight / 2) + (container.offsetTop + main.offsetTop - window.pageYOffset) + 15
            
            if ((leftbound <= mouseX && mouseX <= rightbound) && (topbound <= mouseY && mouseY <= bottombound)) {
                current_hover_plot = button
            }
        }
    }

    if (maxLeft > 0) {
        leftboundOffset = (maxLeft / 2) - ((maxLeft / 2) * ((scrollPercent) / 50))
    }

    if (holdType == "LMB") {
        if (held && (inputType)){
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
                        button.style.backgroundColor = darkenRGBColor(button.getAttribute("base-color"), 0.25)
                    } else {
                        button.style.backgroundColor = button.getAttribute("base-color")
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
                        current_hover_plot = button
                    }
        
                    if (button.getAttribute("hover") == "true") {
                        button.style.backgroundColor = darkenRGBColor(button.getAttribute("base-color"), 0.25)
                    } else {
                        button.style.backgroundColor = button.getAttribute("base-color")
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

function remove_plots(selected_plots){
    let new_crop_data = plant_data;

    for (let i=0; i<selected_plots.length; i++){
        let row = selected_plots[i].getAttribute("row")
        let column = selected_plots[i].getAttribute("column")
        selected_plots[i].setAttribute("base-color", "rgb(233, 181, 118)")
        for (let c=0; c<plant_data.length; c++){
            let data_row = Number(plant_data[c].split(";")[0].trim())
            let data_column = Number(plant_data[c].split(";")[1].trim())

            if (data_row == row && data_column == column){
                for (let f=0; f<new_crop_data.length; f++){
                    let dr = Number(new_crop_data[f].split(";")[0].trim())
                    let dc = Number(new_crop_data[f].split(";")[1].trim())
                    if (dr == row && dc == column){
                        new_crop_data.splice(f,1)
                        break
                    }
                }
            }
        }

        selected_plots[i].removeAttribute("crop")
        selected_plots[i].removeAttribute("last_accessed")
        selected_plots[i].removeAttribute("final")
        selected_plots[i].style.backgroundImage = ""
        selected_plots[i].style.backgroundColor = selected_plots[i].getAttribute("base-color")
    }

    plant_data = new_crop_data
}

document.onmouseup = async function(a){
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

            button.style.backgroundColor = button.getAttribute("base-color")
        }
    }

    let current_time = Math.ceil(date.getTime() / (60 * 1000))
    let selected_crop_value = document.getElementById("plant-select").value
    let minutes_needed = 108000
    let water_minutes = 1440
    let crop_value_color = "rgb(255, 68, 91)"

    await get_crop_info().then(data => {
        for (let f=0; f<data['crops'].length; f++){
            if (data['crops'][f]["id"] == selected_crop_value){
                let crop_arr = data['crops'][f]
                crop_value_color = crop_arr['plot_color']
                minutes_needed = crop_arr['time_needed']
                water_minutes = Math.ceil(Number(crop_arr['days_between_water']) * (24 * 60))
            }
        }
    })

    let next_water_time = current_time + water_minutes
    let final_time = current_time + (minutes_needed)

    if (inputType == "add"){
        for (let i=0; i<selected_plots.length; i++){
            let plot = selected_plots[i]
            let row = plot.getAttribute("row")
            let column = plot.getAttribute("column")
            plot.setAttribute("base-color", crop_value_color)
            plot.setAttribute("crop", selected_crop_value)
            plot.setAttribute("last_accessed", current_time)
            plot.setAttribute("final", final_time)
            plot.setAttribute("next_water_time", next_water_time)
            let found_in_data = false

            for (let c=0; c<plant_data.length; c++){
                let data_row = Number(plant_data[c].split(";")[0].trim())
                let data_column = Number(plant_data[c].split(";")[1].trim())


                if (data_row == row && data_column == column){
                    found_in_data = true
                    plant_data[c] = data_row + ";" + data_column + ";" + selected_crop_value + ";" + current_time + ";" + final_time + ";" + next_water_time
                }
            }

            if (!found_in_data){
                let new_val = row + ";" + column + ";" + selected_crop_value + ";" + current_time + ";" + final_time + ";" + next_water_time
                plant_data.push(new_val)
            }
            plot.style.backgroundImage = "url(../img/" + selected_crop_value + ".png)"
            plot.style.backgroundColor = plot.getAttribute("base-color")
        }
    }else if (inputType == "remove"){
        remove_plots(selected_plots)
    }else if(inputType == "water"){
        update_plant_data("water", selected_plots)
    }else if(inputType == "harvest"){
        update_plant_data("harvest", selected_plots)
    }
}
