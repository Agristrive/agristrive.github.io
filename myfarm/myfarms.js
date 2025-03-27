
var db_url = 'https://api.jsonbin.io/v3/b/67e1b0a48561e97a50f20770'
var current_api_key = "$2a$10$SGS2twtc4XUUm71aKY0CRutJwxVY5n7TqpLLRtAol7sKiwFtB.otu"

let amount_farm_buttons = 0
const base_top = 120
const base_left = 20

const base_container_height = 800

const base_width = 220
const base_height = 220

const base_top_increase = 20
const base_left_increase = 20

let row_length = 5

let current_elements = []

let current_selected_button = null

function get_pos_value(order_num) {
    var column = 0
    var row = order_num
    var return_val = []
    if ((order_num + 1) > row_length) {
        column = Math.floor(order_num / row_length)
    }

    if (column > 0) {
        row = row - (column * row_length)
    }

    return_val.push(column)
    return_val.push(row)

    return return_val
}

function change_element_pos() {
    var body = document.body
    var html = document.documentElement

    document.getElementById("rename_body").style.height = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight )+ "px"
    document.getElementById("settings_body").style.height = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight )+ "px"

    var button_container_width = document.getElementById("button_container").offsetWidth
    row_length = Math.floor((button_container_width) / (base_width + base_left_increase))

    for (let i = 0; i < current_elements.length; i++) {

        const button_element = document.getElementById(current_elements[i]);
        const order_num = button_element.getAttribute("order_num")

        const data_return = get_pos_value(order_num)

        const column = data_return[0]
        const row = data_return[1]

        button_element.style.top = (base_top + ((base_height + base_top_increase) * column))+"px"
        button_element.style.left = (base_left + (row * (base_width + base_left_increase)))+"px"
    }
    const data_return = get_pos_value(amount_farm_buttons)
    const column = data_return[0]
    const row = data_return[1]
    const add_button = document.getElementById("new_button")

    add_button.style.top = (base_top + ((base_height + base_top_increase) * column))+"px"
    add_button.style.left = (base_left + (row * (base_width + base_left_increase)))+"px"

    const lowest_point = Number(add_button.style.top.split("p")[0]) + base_height

    if (lowest_point > base_container_height) {
        document.getElementById("container_body").style.height = lowest_point + base_top_increase + "px"
    }

}


window.onresize = change_element_pos
setInterval(change_element_pos, 1000)

function add_inner(parent_body, element_type, element_pos, text, true_parent) {
    let new_button = document.createElement("button")

    new_button.innerHTML = text
    new_button.className = "inner_button base_font"
    new_button.id = element_type + amount_farm_buttons
    new_button.style.top = element_pos
    parent_body.appendChild(new_button)

    if (element_type == "rename_button") {
        new_button.addEventListener("click", function(){
            on_rename(true_parent)
        })
    }
    if (element_type == "settings_button") {
        new_button.addEventListener("click", function(){
            on_settings(true_parent)
        })
    }

    if (element_type == "delete_button") {
        new_button.addEventListener("click", function(){
            on_delete(true_parent)
        })
    }

    new_button.addEventListener("mouseover", function() {
        on_hover(true, new_button.id);
    });

    new_button.addEventListener("mouseout", function() {
        on_hover(false, new_button.id);
    });
}

function show_contents(is_showing, container, type) {
    if (is_showing) {
        container.style.display = type;
    }
    else {
        container.style.display  = "none";
    }
}

function set_name(button) {
    const hover_container = document.getElementById(button.id + "hover_container")
    const top_container = document.getElementById(button.id + "top_container")
    const hc_name = document.getElementById(hover_container.id + "hover_container_name")

    top_container.className = "top_container_class base_font"
    top_container.innerText = button.getAttribute("name")
    hc_name.innerText = button.getAttribute("name")
};


function create_button(name, special_settings, true_id) {
    const button = document.createElement("button")
    const hover_container = document.createElement("div")

    hover_container.style.height = "100%"
    hover_container.style.width = "100%"
    hover_container.style.margin = "none"
    hover_container.style.padding = "none"
    hover_container.style.display = "none"

    const top_container = hover_container.cloneNode()


    button.className = "farm_button"
    button.id = "farm_button_" + amount_farm_buttons
    
    top_container.id = button.id + "top_container"
    hover_container.id = button.id + "hover_container"

    if (name) {
        button.setAttribute("name", name)
    }else{
        button.setAttribute("name", "New Farm")
    }

    if (true_id) {
        button.setAttribute("true_id", true_id)
    }else{
        button.setAttribute("true_id", Date.now())
    }

    button.setAttribute("order_num", amount_farm_buttons)
    current_elements.push(button.id)

    show_contents(true, top_container, "flex")
    show_contents(false, hover_container)

    button.addEventListener("mouseover", function() {
        on_hover(true, button.id);
        show_contents(true, hover_container, "block")
        show_contents(false, top_container)
        button.style.backgroundColor = "rgb(203, 151, 98)"
    });

    button.addEventListener("mouseout", function() {
        on_hover(false, button.id);
        show_contents(true, top_container, "flex")
        show_contents(false, hover_container)
        button.style.backgroundColor = "rgb(233, 181, 118)"
    });

    amount_farm_buttons = amount_farm_buttons + 1
    button.appendChild(hover_container)
    button.appendChild(top_container)

    document.getElementById("button_container").appendChild(button)
    
    const farm_title = document.createElement("div")
    farm_title.className = "farm_title_container base_font"
    farm_title.id = hover_container.id + "hover_container_name"
    hover_container.appendChild(farm_title)

    set_name(button)

    add_inner(hover_container, "open_button", "60px", "Open",button)
    add_inner(hover_container, "rename_button", "67px", "Rename",button)
    add_inner(hover_container, "settings_button", "74px", "Settings", button)
    add_inner(hover_container, "delete_button", "81px", "Delete", button)

    change_element_pos()
}

async function get_json(){
    console.log("Attemping to access JSON")
    var a = null
    try{
        var response =  await fetch(db_url, { headers: {
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


async function write_new_farms(){
    let current_user = document.body.getAttribute("user")
    let req = new XMLHttpRequest();
    document.getElementById("show_loading").style.display = "block"
    document.getElementById("show_loading").innerText = "UPDATING SERVERS..."
    req.open("PUT", db_url, true);
    req.setRequestHeader("Content-Type", "application/json");
    req.setRequestHeader("X-Master-Key", current_api_key);

    await get_json().then(old_data => {
        let new_data = old_data
        for (let i=0; i<new_data['user-data']['users'].length; i++){
            if (current_user == new_data['user-data']['users'][i]['username']){
                let index_user = i
                let user_data = new_data['user-data']['users'][i]
                let farms_data = user_data['farms']
                let new_farms_data = []
                let current_loaded_farms = document.getElementById("button_container").children
                let temp = []
                for (const current_farm of current_loaded_farms) {
                    temp[Number(current_farm.getAttribute("order_num"))] = current_farm
                }

                for (let f=0; f<temp.length; f++){
                    let new_thing = {}
                    let farm = temp[f]
                    let name = farm.getAttribute('name')
                    let true_id = farm.getAttribute('true_id')
                    
                    new_thing['name'] = name
                    new_thing['id'] = true_id
                    let found_plots_data = null
                    for (let j=0; j<farms_data.length; j++){
                        if (farms_data[j]['id'] == true_id){
                            found_plots_data = farms_data[j]['plots']
                            break
                        }
                    }

                    if (found_plots_data){
                        new_thing['plots'] = found_plots_data
                    }
                    new_farms_data.push(new_thing)
                }
                new_data['user-data']['users'][i]['farms'] = new_farms_data
            }
        }
        req.onreadystatechange = function(){
            document.getElementById("show_loading").style.display = "none"
        }
        req.send(JSON.stringify(new_data));
        console.log(JSON.stringify(new_data), current_user)
    })
}


function add_new_slot() {
    create_button()
    write_new_farms()
}

function log_current(){
    console.log("-----------------------------------------------------")
    for (let i=0; i<current_elements.length; i++){
        const a = document.getElementById(current_elements[i])
        console.log("[" + i + "] " + current_elements[i] + ": " + a.getAttribute("order_num"))
    }
    console.log("-----------------------------------------------------")
}


function on_hover(is_entering, string, specific_color) {
    let click_button = document.getElementById(string)
    click_button.setAttribute('is_hovered', is_entering)

    if (click_button.id.split[0] == "farm") {
        click_button.style.backgroundColor = "orange"
    }
    if (is_entering) {
        click_button.style.borderColor = "rgb(90, 64, 32)"
    }
    else {
        if (specific_color){
            click_button.style.borderColor = specific_color
        }else{
            click_button.style.borderColor = "transparent"
        }
    };
}
function on_open(button){
    console.log(button)
}
function on_rename(button){
    current_selected_button = button
    document.getElementById("rename_text").innerHTML = 'Change Name of Farm Plot<br>' + '"' + button.getAttribute("name") + '"'
    document.getElementById("rename_body").style.display = "flex"

    document.getElementById("rename_form_input").value = button.getAttribute("name")
}

function change_farm_name(farm_button, new_name){
    farm_button.setAttribute("name", new_name)
    set_name(farm_button)
}

function on_settings(button){
    current_selected_button = button
    document.getElementById("settings_body").style.display = "flex"
    document.getElementById("settings_name").value = button.getAttribute("name")
}

function on_delete(button){
    current_selected_button = button
    document.getElementById("delete_body").style.display = "flex"
}

function return_form_data(form){
    var formData = new FormData(form);
    var returned_arr = []

    for (var pair of formData.entries()) {
        var new_arr = []
        new_arr[0] = pair[0]
        new_arr[1] = pair[1]
        returned_arr.push(new_arr)
    }
  
    return (returned_arr)
}

function on_rename_submission(a, submission_type) {
    const data = return_form_data(a.target)

    if (submission_type == "Confirm") {
        const new_name = data[0][1]
        if (new_name != "" && current_selected_button != null) {
            current_selected_button.setAttribute("name", new_name)
            set_name(current_selected_button)
            document.getElementById("rename_body").style.display = "none"
            write_new_farms()
        }
    }
    document.getElementById("rename_form").reset()
    document.getElementById("rename_body").style.display = "none"
}

function on_setting_submission(a, submission_type) {
    const data = return_form_data(a.target)

    if (submission_type == "Save") {
        for (var i=0; i<data.length; i++) {
            const data_name = data[i][0]
            const data_value = data[i][1]

            if (data_name == "name" && data_value != "") {
                current_selected_button.setAttribute("name", data_value)
                set_name(current_selected_button)
            }
        }
        write_new_farms()
    }
    document.getElementById("settings_form").reset()
    document.getElementById("settings_body").style.display = "none"
}

function on_delete_submission(submission_type) {
    if (submission_type == "delete") {
        const order = current_selected_button.getAttribute("order_num");

        for (let i = 0; i < current_elements.length; i++) {
            if (current_elements[i] == current_selected_button.id) {
                current_elements.splice(i, 1); 
            }
        }

        current_selected_button.remove();
        amount_farm_buttons = Number(amount_farm_buttons - 1);

        current_selected_button = null;

        for (let i = 0; i < current_elements.length; i++) {
            const current_b = document.getElementById(current_elements[i]);
            const currentOrder = Number(current_b.getAttribute("order_num"));
            const current_hovercon = document.getElementById(current_elements[i]+"hover_container")
            const name_hovercon = document.getElementById(current_hovercon.id + "hover_container_name")
            const base_con = document.getElementById(current_elements[i] + "top_container")
            if (currentOrder > order) {
                const newOrder = currentOrder - 1;
                current_b.setAttribute("order_num", newOrder);
                current_b.id = "farm_button_" + newOrder;
                current_hovercon.id = current_b.id + "hover_container"
                name_hovercon.id = current_hovercon.id + "hover_container_name"
                base_con.id = current_b.id + "top_container"
                current_elements[i] = current_b.id;
                
            }
        }
        write_new_farms() 
        change_element_pos();
    }
    log_current()
    document.getElementById("delete_body").style.display = "none";
}

function load_account(data, user){
    let used_data = {}
    for (let i=0; i<data['user-data']['users'].length; i++){
        if (data['user-data']['users'][i]['username'] == user) {
            used_data = data['user-data']['users'][i]
        }
    }
    for (let i=0; i<used_data['farms'].length; i++){
        create_button(used_data['farms'][i]["name"], null, used_data['farms'][i]["id"])
    }
    document.getElementById("show_loading").style.display = "none"
}

function check_account(){
    let check_info_interval = setInterval(() => {
        if (document.body.getAttribute("data") && document.body.getAttribute("user")){
            load_account(JSON.parse(document.body.getAttribute("data")), document.body.getAttribute("user"))
            console.log("loading account")
            clearInterval(check_info_interval)
        }
    }
    ,500)
}

function check_cookie(){
    let cookie_data = document.cookie
    let returned = null
    
    for (let i=0; i<cookie_data.split(";").length; i++){
        let index = cookie_data.split(";")[i].split("=")[0]
        let value = cookie_data.split(";")[i].split("=")[1]
        
        if (index == "username"){
            if (returned == null){
                returned = []
            }
            returned[0] = value
        }else if(index == "password"){
            if (returned == null){
                returned = []
            }
            returned[1] = value
        }
        console.log(index, value, returned)
    }
    console.log(returned[0], returned[1])
    return returned
}

function on_page_start(){
    console.log("smegma")
    console.log(document.cookie)
    let returned = check_cookie()
    check_account()

    if (returned){
        document.body.setAttribute("cookied_user", returned[0])
        document.body.setAttribute("cookied_password", returned[1])

        document.getElementById("rename_form").addEventListener("submit", function(a){
            a.preventDefault()
            on_rename_submission(a, a.submitter.value)
        })

        document.getElementById("settings_form").addEventListener("submit", function(a){
            a.preventDefault()
            on_setting_submission(a, a.submitter.value)
        })
    }else{

    }
}
