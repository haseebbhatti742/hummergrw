let data = [];
let length, gate_pass_number, gate_pass_date, gate_pass_party_id, gate_pass_party_name, gate_pass_grand_total, gate_pass_type, gate_pass_contact;
let cash_voucher_type, cash_voucher_signature, cash_voucher_details

var partyNameArray = [];
var partyIdArray = [];
getParty();
function getParty() {
    var name = "";
    fetch("/gate_pass/getParty", {
        method: "POST",
        body: JSON.stringify({ name }),
        headers: new Headers({
            'Content-Type': 'application/json'
        }),
    }).then(data => data.json()).then(data => {
        if (data.status == "yes") {
            partyNameArray.length = 0;
            partyIdArray.length = 0;
            for (var i = 0; i < data.party.length; i++) {
                partyNameArray.push(data.party[i].party_name);
                partyIdArray.push(data.party[i].party_id);
            }
            //addSelectItems(partyNameArray, partyIdArray, $selectParty);
        }
    })
}

function getGatePass(searchId){
    document.getElementById("gatePassDiv").innerHTML = ""
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            document.getElementById("gatePassDiv").innerHTML = this.responseText;
            autocomplete(document.getElementById("gate_pass_party_id"), partyNameArray);
            document.getElementById('gate_pass_date').valueAsDate = new Date();
            addListener();
        }
    };
    xhttp.open("GET", "/gate_pass/getGatePass/"+searchId, true);
    xhttp.send();
}

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

$("#searchId").keyup(function(event) {
    if (event.keyCode === 13) {
        $("#btnSearch").click();
    }
});

function getCashVoucher(searchId){
    
}

function getContact(party_id){
    //party_id = document.getElementById("gate_pass_party_id").value
    fetch("/gate_pass/get-contact", {
        method: "POST",
        body: JSON.stringify({ party_id }),
        headers: new Headers({
            'Content-Type': 'application/json'
        }),
    }).then(data => data.json()).then(data => {
        if (data.status == "ok") {
            document.getElementById("gate_pass_contact").value = data.contact
        } else if(data.status == "error"){
            toastr.error("Error: "+data.errorMessage)
        }
    })
}

function submitForm(){
    length = document.getElementById("length").value
    if(add_cv_checkbox == false){
        editGatePassWithoutVoucher()
    } else if(add_cv_checkbox == true){
        editGatePassWithVoucher()
    }
}

function editGatePassWithoutVoucher(){
    if(addGatePass()){
        fetch("/gate_pass/edit-gate-pass", {
            method: "POST",
            body: JSON.stringify({ "gate_pass_type":gate_pass_type, 
                                    "gate_pass_number":gate_pass_number, 
                                    "gate_pass_date":gate_pass_date, 
                                    "gate_pass_party_id":gate_pass_party_id,
                                    "gate_pass_party_name": gate_pass_party_name,
                                    "gate_pass_grand_total":gate_pass_grand_total,
                                    "gate_pass_contact": gate_pass_contact,
                                    "gate_pass_payment_type": "Credit",
                                    "gp_entries":data,
                                    "cash_voucher": "false" }),
            headers: new Headers({
                'Content-Type': 'application/json'
            }),
        }).then(data => data.json()).then(data => {
            if (data.status == "ok") {
                toastr.success("Gate Pass Edited")
                window.location.replace("/home")
            } else if (data.status == "error") {
                toastr.error("Error: "+data.errorMessage)
            }
        })
    }
}

function editGatePassWithVoucher(){
    if(addGatePass() && getCashVoucher()){
        fetch("/gate_pass/edit-gate-pass", {
            method: "POST",
            body: JSON.stringify({ "gate_pass_type":gate_pass_type, 
                                    "gate_pass_number":gate_pass_number, 
                                    "gate_pass_date":gate_pass_date, 
                                    "gate_pass_party_id":gate_pass_party_id,
                                    "gate_pass_party_name": gate_pass_party_name,
                                    "gate_pass_grand_total":gate_pass_grand_total,
                                    "gate_pass_contact": gate_pass_contact,
                                    "gate_pass_payment_type": cash_voucher_type,
                                    "gp_entries":data,
                                    "cash_voucher": "true",
                                    "cash_voucher_type": cash_voucher_type,
                                    "cash_voucher_signature": cash_voucher_signature,
                                    "cash_voucher_details":cash_voucher_details  }),
            headers: new Headers({
                'Content-Type': 'application/json'
            }),
        }).then(data => data.json()).then(data => {
            if (data.status == "ok") {
                toastr.success("Gate Pass Edited")
                //window.location.replace("/gate_pass")
            } else if (data.status == "error") {
                toastr.error("Error: "+data.errorMessage)
            }
        })
    }
}

function addGatePass(){
    gate_pass_number = document.getElementById('gate_pass_number').value;
    gate_pass_date = document.getElementById('gate_pass_date').value;
    gate_pass_party_id = document.getElementById('gp_party_id').value;
    gate_pass_party_name = document.getElementById("gate_pass_party_id").value
    gate_pass_grand_total = document.getElementById('gate_pass_grand_total').value;
    gate_pass_type = document.querySelector('input[name="gate_pass_type_in_out"]:checked').value;
    gate_pass_contact = document.getElementById("gate_pass_contact").value;

    // if(gate_pass_party_id == ""){
    //     document.getElementById("gate_pass_name_error").innerHTML = "Enter Party Name";
    //     return false;
    // } 
    // else {
        document.getElementById("gate_pass_name_error").innerHTML = "";
        // let gate_entry_id,gate_pass_commodity, gate_pass_unit, gate_pass_unit_amount, gate_pass_details;
        for(let i=0; i<=length; i++){
            if(i==length){
                console.log("breaking")
                break;
            }
                
            gate_entry_id = document.getElementById('gate_entry_id'+i).value;
            gate_pass_commodity = document.getElementById('gate_pass_commodity'+i).value;
            gate_pass_quantity = document.getElementById('gate_pass_quantity'+i).value;
            gate_pass_buyer_weight = document.getElementById('gate_pass_buyer_weight'+i).value;
            //gate_pass_tare_weight = document.getElementById('gate_pass_tare_weight'+i).value;
            gate_pass_unit = document.getElementById('gate_pass_unit'+i).value;
            gate_pass_unit_amount = document.getElementById('gate_pass_unit_amount'+i).value;
            gate_pass_total_amount = document.getElementById('gate_pass_total_amount'+i).value;
            gate_pass_details = document.getElementById('gate_pass_details'+i).value;

            let row = {};
            row.entry_id = gate_entry_id;
            row.commodity = gate_pass_commodity;
            row.quantity = gate_pass_quantity;
            row.buyer_weight = gate_pass_buyer_weight;
            //row.tare_weight = gate_pass_tare_weight;
            row.unit = gate_pass_unit;
            row.unit_amount = gate_pass_unit_amount;
            row.total_amount = gate_pass_total_amount;
            row.details = gate_pass_details;
                
            data[i] = row
        }
        return true;
    // }
}

function getCashVoucher(){
    cash_voucher_type = document.getElementById('cash_voucher_type').value;
    cash_voucher_signature = document.getElementById("cash_voucher_signature").value;
    cash_voucher_details = document.getElementById("cash_voucher_details").value;

    if(cash_voucher_type == ""){
        document.getElementById("cash_voucher_type_error").innerHTML = "Select Type";
        return false;
    } else if (cash_voucher_signature == ""){
        document.getElementById("cash_voucher_signature_error").innerHTML = "Enter Signature";
        return false;
    }  else if (cash_voucher_details == ""){
        document.getElementById("cash_voucher_details_error").innerHTML = "Enter Details";
        return false;
    } else {
        document.getElementById("cash_voucher_type_error").innerHTML = "";
        document.getElementById("cash_voucher_signature_error").innerHTML = "";
        document.getElementById("cash_voucher_details_error").innerHTML = "";

        if(cash_voucher_type == "Pay"){ cash_voucher_type = "Credit" }
        else if(cash_voucher_type == "Receive"){ cash_voucher_type = "Debit" }

        return true;
    }
}

function addListener(){
    length = document.getElementById("length").value
    for(var i=0; i<length; i++){
        
        let sellerWeightAmount = document.getElementById("gate_pass_quantity"+i)
        let buyerWeightAmount = document.getElementById("gate_pass_buyer_weight"+i)
        let inputUnitAmount = document.getElementById("gate_pass_unit_amount"+i)
        let inputTotalAmount = document.getElementById("gate_pass_total_amount"+i)

        sellerWeightAmount.addEventListener('input', (event) => {
            if(buyerWeightAmount.value == 0 || buyerWeightAmount.value == ""){
                inputTotalAmount.value = sellerWeightAmount.value * inputUnitAmount.value
                getGrandTotal(length)
            }
        })

        buyerWeightAmount.addEventListener('input', (event) => {
            inputTotalAmount.value = buyerWeightAmount.value * inputUnitAmount.value
            getGrandTotal(length)
        })

        inputUnitAmount.addEventListener('input', (event) => {
            if(buyerWeightAmount.value == 0 || buyerWeightAmount.value == ""){
                inputTotalAmount.value = sellerWeightAmount.value * inputUnitAmount.value
                getGrandTotal(length)
            } else {
                inputTotalAmount.value = buyerWeightAmount.value * inputUnitAmount.value
                getGrandTotal(length)
            }
        })
    }
}

function getGrandTotal(length){
    gate_pass_grand_total = document.getElementById("gate_pass_grand_total")
    sum=0;
    for(var i=0; i<length; i++){
        let inputTotalAmount = document.getElementById("gate_pass_total_amount"+i).value
        sum += parseFloat(inputTotalAmount)
        gate_pass_grand_total.value = sum
    }
}

var add_cv_checkbox = false;
function add_cv(){
    document.getElementById("divAddVoucher").style.display = "none";
    document.getElementById("divRemoveVoucher").style.display = "block";
    show_cv_form();
    add_cv_checkbox = true;
}

function remove_cv(){
    document.getElementById("divAddVoucher").style.display = "block";
    document.getElementById("divRemoveVoucher").style.display = "none";
    document.getElementById("cv_form").innerHTML = "";
    add_cv_checkbox = false;
}

function show_cv_form() {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            document.getElementById("cv_form").innerHTML = this.responseText;
        }
    };
    xhttp.open("GET", "/gate_pass/cv_form", true);
    xhttp.send();
}

//autocomplete start
function autocomplete(inp, arr) {
    /*the autocomplete function takes two arguments,
    the text field element and an array of possible autocompleted values:*/
    var currentFocus;
    /*execute a function when someone writes in the text field:*/
    inp.addEventListener("input", function(e) {
        var a, b, i, val = this.value;
        /*close any already open lists of autocompleted values*/
        closeAllLists();
        if (!val) { return false;}
        currentFocus = -1;
        /*create a DIV element that will contain the items (values):*/
        a = document.createElement("DIV");
        a.setAttribute("id", this.id + "autocomplete-list");
        a.setAttribute("class", "autocomplete-items");
        /*append the DIV element as a child of the autocomplete container:*/
        this.parentNode.appendChild(a);
        /*for each item in the array...*/
        for (i = 0; i < arr.length; i++) {
          /*check if the item starts with the same letters as the text field value:*/
          if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
            /*create a DIV element for each matching element:*/
            b = document.createElement("DIV");
            /*make the matching letters bold:*/
            b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
            b.innerHTML += arr[i].substr(val.length);
            /*insert a input field that will hold the current array item's value:*/
            b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
            /*execute a function when someone clicks on the item value (DIV element):*/
            b.addEventListener("click", function(e) {
                /*insert the value for the autocomplete text field:*/
                inp.value = this.getElementsByTagName("input")[0].value;
                index = partyNameArray.indexOf(inp.value)
                document.getElementById("gp_party_id").value = partyIdArray[index];
                getContact(partyIdArray[index]);
                /*close the list of autocompleted values,
                (or any other open lists of autocompleted values:*/
                closeAllLists();
            });
            a.appendChild(b);
          }
        }
    });
    
    /*execute a function presses a key on the keyboard:*/
    inp.addEventListener("keydown", function(e) {
        var x = document.getElementById(this.id + "autocomplete-list");
        if (x) x = x.getElementsByTagName("div");
        if (e.keyCode == 40) {
          /*If the arrow DOWN key is pressed,
          increase the currentFocus variable:*/
          currentFocus++;
          /*and and make the current item more visible:*/
          addActive(x);
        } else if (e.keyCode == 38) { //up
          /*If the arrow UP key is pressed,
          decrease the currentFocus variable:*/
          currentFocus--;
          /*and and make the current item more visible:*/
          addActive(x);
        } else if (e.keyCode == 13) {
          /*If the ENTER key is pressed, prevent the form from being submitted,*/
          e.preventDefault();
          if (currentFocus > -1) {
            /*and simulate a click on the "active" item:*/
            if (x) x[currentFocus].click();
          }
        }
    });
    
    function addActive(x) {
      /*a function to classify an item as "active":*/
      if (!x) return false;
      /*start by removing the "active" class on all items:*/
      removeActive(x);
      if (currentFocus >= x.length) currentFocus = 0;
      if (currentFocus < 0) currentFocus = (x.length - 1);
      /*add class "autocomplete-active":*/
      x[currentFocus].classList.add("autocomplete-active");
    }
    
    function removeActive(x) {
      /*a function to remove the "active" class from all autocomplete items:*/
      for (var i = 0; i < x.length; i++) {
        x[i].classList.remove("autocomplete-active");
      }
    }
    
    function closeAllLists(elmnt) {
      /*close all autocomplete lists in the document,
      except the one passed as an argument:*/
      var x = document.getElementsByClassName("autocomplete-items");
      for (var i = 0; i < x.length; i++) {
        if (elmnt != x[i] && elmnt != inp) {
          x[i].parentNode.removeChild(x[i]);
        }
      }
    }
    /*execute a function when someone clicks in the document:*/
    document.addEventListener("click", function (e) {
        closeAllLists(e.target);
    });
  }
  /*initiate the autocomplete function on the "myInput" element, and pass along the countries array as possible autocomplete values:*/
//autocomplete end