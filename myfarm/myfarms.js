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


function create_button() {
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

    button.setAttribute("order_num", amount_farm_buttons)
    button.setAttribute("name", "New Farm")
    current_elements.push(button.id)

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

    log_current()

}

function add_new_slot() {
    create_button()
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
}

function change_farm_name(farm_button, new_name){
    farm_button.setAttribute("name", new_name)
    set_name(farm_button)
}

function on_settings(button){
    current_selected_button = button
    document.getElementById("settings_body").style.display = "flex"
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

            console.log(current_b.getAttribute("order_num"), current_b.id, current_elements[i])
        }

        change_element_pos();
    }
    log_current()
    document.getElementById("delete_body").style.display = "none";
}

function on_page_start(){
    document.cookie = "username=grah;"
    console.log(document.cookie)
    
    document.getElementById("rename_form").addEventListener("submit", function(a){
        a.preventDefault()
        on_rename_submission(a, a.submitter.value)
    })

    document.getElementById("settings_form").addEventListener("submit", function(a){
        a.preventDefault()
        on_setting_submission(a, a.submitter.value)
    })
}
