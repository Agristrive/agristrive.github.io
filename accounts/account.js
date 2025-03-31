var db_url = 'https://api.jsonbin.io/v3/b/67e1b0a48561e97a50f20770'
var current_api_key = "$2a$10$SGS2twtc4XUUm71aKY0CRutJwxVY5n7TqpLLRtAol7sKiwFtB.otu"

function page_open(){
    let check_account = setInterval(() => {
        if (document.body.getAttribute("data")){
            let data = document.body.getAttribute("data")
            let user = document.body.getAttribute("user")

            document.getElementById("username_label").innerText = "USERNAME: " + user
            document.getElementById("show_loading").style.display = "none"
            clearInterval(check_account)
        }
    }, 200)

    let returned = check_cookie()
    console.log(returned[0], returned[1])
    if (returned[0] || returned[1]){
        document.body.setAttribute("cookied_user", returned[0])
        document.body.setAttribute("cookied_password", returned[1])
    }else{
        location.href = "agristrive.github.io/login/login"
    }

    document.getElementById("rename_form").addEventListener("submit", function(a){
        let b = on_rename_submit(a, a.submitter.value)
        if (b){
            b.then(z => {
                if (z == 0 || z == 1){
                    document.getElementById("warning_rename").style.display = "block"
                }
            })
        }
    })
    document.getElementById("delete_form").addEventListener("submit", function(a){
        delete_account(a, a.submitter.value)
    })
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

async function on_rename_submit(a, type){
    let valid_user = false
    let new_user = return_form_data(a.target)[0][1]

    if (new_user.length >= 8){
        valid_user = true
    }else{
        if (type == "Cancel"){
            document.getElementById("rename_body").style.display = "none"
        }
        return 0
    }
    if (type == "Confirm" && valid_user){
        await get_json()
            .then(old_data => {
                let new_data = old_data

                console.log(new_data['user-data']['users'])
                let user_name_already_exists = false
                for (let i=0;new_data['user-data']['users'].length; i++){
                    if (new_data['user-data']['users'][i]['username'] == new_user){
                        valid_user = false;
                        return
                    }
                }

                for (let i=0; new_data['user-data']['users'].length; i++){
                    if (new_data['user-data']['users'][i]['username'] == document.body.getAttribute('user')){
                        new_data['user-data']['users'][i]['username'] = new_user
                        break
                    }
                }

                let req = new XMLHttpRequest();

                req.open("PUT", db_url, true);
                req.setRequestHeader("Content-Type", "application/json");
                req.setRequestHeader("X-Master-Key", current_api_key);

                req.send(JSON.stringify(new_data))
                
                document.body.setAttribute("user", new_user)

                document.getElementById("username_label").innerText = document.body.getAttribute("user")
                document.getElementById("rename_body").style.display = "none"
                document.cookie = "username=" + new_user + ";domain=agristrive.github.io; path=/"
                document.getElementById('warning_rename').style.display = 'none'
            })

         } else{
        document.getElementById("rename_body").style.display = "none"
        document.getElementById('warning_rename').style.display = 'none'
    }
    if (type == "Cancel"){
        document.getElementById("rename_body").style.display = "none"
        document.getElementById('warning_rename').style.display = 'none'
    }

    if (!valid_user){
        return 1
    }
    
}

function check_cookie(){
    let cookie_data = document.cookie;
    cookie_data = "username=poteto; password=CdT29922; farm_id=1743026845010"
    let returned = [];

    for (let i = 0; i < cookie_data.split(";").length; i++) {
        let index = cookie_data.split(";")[i].split("=")[0].trim();
        let value = cookie_data.split(";")[i].split("=")[1];

        if (index == "username") {
            returned[0] = value;
        } else if (index == "password") {
            returned[1] = value;
        }
    }
    console.log(returned[0], returned[1]);
    return returned;
}

function log_out(){
    document.cookie = "username=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;domain=agristrive.github.io";
    document.cookie = "password=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;domain=agristrive.github.io";
    document.cookie = "farm_id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;domain=agristrive.github.io";

    location.href = "agristrive.github.io/login/login"
}

async function delete_account(a, type){
    let input_user = return_form_data(a.target)[0][1]
    
    if (type == "Delete" && input_user == document.body.getAttribute("user")){
        await get_json()
            .then(old_data => {
                let new_data = old_data

                for (let i=0; new_data['user-data']['users'].length; i++){
                    if (new_data['user-data']['users'][i]['username'] == document.body.getAttribute('user')){

                        delete new_data['user-data']['users'][i]
                        let req = new XMLHttpRequest();

                        req.open("PUT", db_url, true);
                        req.setRequestHeader("Content-Type", "application/json");
                        req.setRequestHeader("X-Master-Key", current_api_key);

                        req.send(JSON.stringify(new_data))
                    
                        req.onreadystatechange = () => {
                            if (req.readyState == XMLHttpRequest.DONE) {
                              log_out()
                            }
                          };
                    }
                }
            })
    }else if(type == "Cancel"){
        document.getElementById('delete_body').style.display = 'none'
    }
}