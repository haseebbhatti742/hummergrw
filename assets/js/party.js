function addNewParty(){
    party_name = document.getElementById("new_party_name").value;
    party_contact = document.getElementById("new_party_contact").value;
    if(party_name == ""){
        document.getElementById("new_party_name_error").innerHTML = "Enter Party"
    } else if(party_contact == ""){
        document.getElementById("new_party_name_error").innerHTML = ""
        document.getElementById("new_party_contact_error").innerHTML = "Enter Contact"
    }else {
        document.getElementById("new_party_name_error").innerHTML = ""
        document.getElementById("new_party_contact_error").innerHTML = ""
        
        fetch("/party/add", {
            method: "POST",
            body: JSON.stringify({ party_name, party_contact }),
            headers: new Headers({
                'Content-Type': 'application/json'
            }),
        }).then(data => data.json()).then(data => {
            if (data.status == "ok") {
                toastr.success("Party Added...!")
                document.getElementById("new_party_name").value = "";
                document.getElementById("gate_pass_party_id").innerHTML = "";
                getParty();
                document.getElementById("new_party_contact_error").innerHTML = ""
            } else if(data.status == "error"){
                toastr.error("Error: "+data.errorMessage)
            } else if(data.status == "no"){
                document.getElementById("new_party_contact_error").innerHTML = data.errorMessage
            }
        })
    }
}