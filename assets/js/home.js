function searchById(){
    searchId = document.getElementById("searchId").value
    if(searchId == "" || searchId == null){
        document.getElementById("searchId_error").innerHTML = "Enter Id"
    } else{
        document.getElementById("searchId_error").innerHTML = ""
        searchType = document.getElementById("searchType").value
        if(searchType == "gate_pass"){
            getGatePass(searchId)
        } else if(searchType == "cash_voucher"){
            getCashVoucher(searchId)
        }
    }
}

function getGatePass(searchId){
    document.getElementById("gatePassDiv").innerHTML = ""
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            document.getElementById("gatePassDiv").innerHTML = this.responseText;
        }
    };
    xhttp.open("GET", "/gate_pass/getGatePass/"+searchId, true);
    xhttp.send();
}

// function getGatePass(searchId){
//     document.getElementById("gatePassDiv").innerHTML = ""
//     fetch("/home/getGatePass", {
//         method: "POST",
//         body: JSON.stringify({ searchId:searchId }),
//         headers: new Headers({
//             'Content-Type': 'application/json'
//         }),
//     }).then(data => data.json()).then(data => {
//         if (data.found == "error") {
//             toastr.error("Error: "+data.errorMessage)
//         } else if (data.found == "no") {
//             toastr.error("Gate Pass not found")
//         } else if (data.found == "yes") {
//             toastr.success("Gate Pass found")
//         }
//     })
// }

function getCashVoucher(searchId){
    
}

function submitForm(){
    length = document.getElementById("length").value
    for(let i=0; i<length; i++)
        alert(document.getElementById("gate_pass_quantity"+i).value)
}