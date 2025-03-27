var db_url = 'https://api.jsonbin.io/v3/b/67e1b0a48561e97a50f20770'
var current_api_key = "$2a$10$SGS2twtc4XUUm71aKY0CRutJwxVY5n7TqpLLRtAol7sKiwFtB.otu"
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

async function write(data) {
    try{
        console.log('attemp to write')
        let req = new XMLHttpRequest();

        req.onreadystatechange = () => {
            if (req.readyState == XMLHttpRequest.DONE) {
              console.log(req.responseText);
            }
          };
          

        req.open("PUT", db_url, true);
        req.setRequestHeader("Content-Type", "application/json");
        req.setRequestHeader("X-Master-Key", current_api_key);
        req.send(data);
        console.log("sent data")
        
    }catch(error){
        console.log("Error when writing: " + error)
    }finally{
        console.log("Completed Attempt to write JSON")
    }
}

function user_already_exists(){
    console.log("the user already exists")
}

async function signup(input_name, input_pass){
    var new_data = await get_json()
    .then(result => {
        let users = result["user-data"]["users"];
        let found_user = false
        for (let i=0; i<users.length; i++){
            let user_info = users[i]
            let username = user_info['username']
            let password = user_info['password']

            if (input_name == username){
                found_user = true
            }
        }
        if (!found_user){
            let new_list = result["user-data"]["users"]
            let added = {
                "username": input_name,
                "password": input_pass,
                "farms": []
            }
            new_list.push(added)
            result["user-data"]["users"] = new_list
            document.cookie = "username=" + input_name
            document.cookie = "password=" + input_pass
            write(JSON.stringify(result))
        }else{
            user_already_exists()
        }
    })
}

async function log_in(input_name, input_pass){
    var arr = []
    var correct_user = false
    var correct_pass = false
    let data = null
    var returned = await get_json(db_url)
        .then(result => {
            let users = result["user-data"]["users"];
            for (let i=0; i<users.length; i++){
                let user_info = users[i]
                let username = user_info['username']
                let password = user_info['password']

                if (input_name == username){
                    correct_user = username
                    if (input_pass == password) {
                        document.cookie = "username=" + correct_user
                        document.cookie = "password=" + correct_pass
                        correct_pass = password
                        logged_user = username
                        data = result

                        window.location.href = "../myfarm/myfarms";
                    }
                }
            }
        })
    
    if (correct_user && correct_pass){
        document.body.setAttribute("data", JSON.stringify(data))
        document.body.setAttribute("user", correct_user)
    }else{
        console.log("Incorrect username or password")
    }
}

function on_start(){
    let wait_cookie = setInterval(() => {
        console.log('running')
        if (document.body.getAttribute("cookied_user")){
            log_in(document.body.getAttribute("cookied_user"), document.body.getAttribute("cookied_password"))
            clearInterval(wait_cookie)
        }
    }, 1000)
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

function on_form_entry(a, type){
    let data = return_form_data(a.target)
    let user = data[0][1]
    let pass = data[1][1]
    if (type == "login"){
        log_in(user, pass)
    }else if(type == "signup"){
        signup(user, pass)
    }

}

function add_listeners(){
    document.getElementById("login_form").addEventListener("submit", function(a){
        a.preventDefault()
        on_form_entry(a, "login")
    })
    document.getElementById("signin_form").addEventListener("submit", function(a){
        a.preventDefault()
        on_form_entry(a, "signup")
    })
}