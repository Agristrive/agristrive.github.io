var db_url = 'https://agristrive.github.io/db.json'

async function get_json(url){
    console.log("Attemping to access JSON")
    var a = null
    try{
        var response =  await fetch(url)
        var json = await response.json().then(r => (a = r));
    }catch(err){
        console.error("Logging an Error in accessing JSON: " + err)
    }finally{
        console.log("Completed Attempt to access JSON")
        return a
    }
}

function get_userpass_arr(){
    var arr = []

    get_json(db_url).then(result => {
        users = result["user-data"]["users"]
        for (var i in result){
            
        }
    })

    return arr
}


function on_start(){
    console.log(get_userpass_arr())
}