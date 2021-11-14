document.getElementById('gate_pass_date').valueAsDate = new Date();
idCounter = 0;
idList = [idCounter];
let data = [];
let gp_number_manual, gate_pass_date, gate_pass_party_id, gate_pass_party_name, gate_pass_type, gate_pass_grand_total, gate_pass_contact = "";
let cash_voucher_type, cash_voucher_signature, cash_voucher_details
var add_cv_checkbox = false;

//party select start
var $selectParty = $('#gate_pass_party_id');
var partyNameArray = [];
var partyIdArray = [];
getParty();
autocomplete(document.getElementById("gate_pass_party_id"), partyNameArray);
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

function addSelectItems(arrayNames, arrayId, $select) {
    $select.append($("<option></option>").attr("value", "").text("Select Party").attr("disabled", true).attr("selected", true));
    for (var i = 0; i < arrayNames.length; i++) {
        $select.append($("<option></option>").attr("value", arrayId[i]).text(arrayNames[i]));
    }
}

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
        
        fetch("/gate_pass/add-party", {
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

//party select end
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

function submitForm(){
    if(add_cv_checkbox == false){
        submitWithoutVoucher()
    } else if(add_cv_checkbox == true){
        submitWithVoucher()
    }
}

inputQuantity = document.getElementById("gate_pass_quantity0");
inputUnitAmount = document.getElementById("gate_pass_unit_amount0");
inputTotalAmount = document.getElementById("gate_pass_total_amount0");
inputQuantity.addEventListener('input', (event) => {
    if(inputQuantity.value == ""){
        inputTotalAmount.value = inputUnitAmount.value
        getGrandTotal()
    }
    else{
        inputTotalAmount.value = inputQuantity.value * inputUnitAmount.value
        getGrandTotal()
    }
})
inputUnitAmount.addEventListener('input', (event) => {
    if(inputQuantity.value == ""){
        inputTotalAmount.value = inputUnitAmount.value
        getGrandTotal()
    }
    else{
        inputTotalAmount.value = inputQuantity.value * inputUnitAmount.value
        getGrandTotal()
    }
})

function submitWithoutVoucher(){
    if(getGatePass()){
        document.getElementById("btn2").disabled = true
        fetch("/gate_pass/add-gate-pass", {
            method: "POST",
            body: JSON.stringify({ 
                                    "gp_number_manual":gp_number_manual,                                        
                                    "gate_pass_type":gate_pass_type, 
                                    "gate_pass_date":gate_pass_date, 
                                    "gate_pass_party_id":gate_pass_party_id,
                                    "gate_pass_party_name": gate_pass_party_name,
                                    "gate_pass_grand_total":gate_pass_grand_total,
                                    "gate_pass_contact": gate_pass_contact,
                                    "gate_pass_payment_type": gate_pass_type,
                                    "gp_entries":data,
                                    "cash_voucher": "false" }),
            headers: new Headers({
                'Content-Type': 'application/json'
            }),
        }).then(data => data.json()).then(data => {
            if (data.status == "ok") {
                toastr.success("Gate Pass Added")
                window.location.replace("/gate_pass/view-gate-pass/"+data.gp_number)
            } else if (data.status == "error") {
                toastr.error("Error: "+data.errorMessage)
                document.getElementById("btn2").disabled = false
            }
        })
    }
}

function getGatePass(){
    gp_number_manual = document.getElementById("gp_number_manual").value
    gate_pass_date = document.getElementById('gate_pass_date').value;
    gate_pass_party_id = document.getElementById('gp_party_id').value;
    gate_pass_party_name = document.getElementById('gate_pass_party_id').value;
    gate_pass_type = document.querySelector('input[name="gate_pass_type_in_out"]:checked').value;
    gate_pass_contact = document.getElementById("gate_pass_contact").value;
    gate_pass_grand_total = document.getElementById('gate_pass_grand_total').value;    
    
    if(gate_pass_party_id == ""){
        document.getElementById("gate_pass_name_error").innerHTML = "Enter Party Name";
        return false;
    } else if(gp_number_manual == ""){
        document.getElementById("gate_pass_name_error").innerHTML = "";
        document.getElementById("gp_number_manual_error").innerHTML = "Enter Manual GP Number";
        return false;
    } else {
        document.getElementById("gate_pass_name_error").innerHTML = "";
        let gate_pass_commodity, gate_pass_unit, gate_pass_unit_amount, gate_pass_details;
        for(let i=0; i<=idList.length; i++){
            if(i==idList.length){
                console.log("breaking")
                break;
            }
                
            gate_pass_commodity = document.getElementById('gate_pass_commodity'+i).value;
            gate_pass_quantity = document.getElementById('gate_pass_quantity'+i).value;
            gate_pass_unit = document.getElementById('gate_pass_unit'+i).value;
            gate_pass_unit_amount = document.getElementById('gate_pass_unit_amount'+i).value;
            gate_pass_total_amount = document.getElementById('gate_pass_total_amount'+i).value;
            gate_pass_details = document.getElementById('gate_pass_details'+i).value;

            let row = {};
            row.commodity = gate_pass_commodity;
            row.quantity = gate_pass_quantity;
            row.unit = gate_pass_unit;
            row.unit_amount = gate_pass_unit_amount;
            row.total_amount = gate_pass_total_amount;
            row.details = gate_pass_details;
                
            data[i] = row
        }
        return true;
    }
}

function isGpManualExists(gp_number_manual){
    fetch("/gate_pass/check-gp-manual", {
        method: "POST",
        body: JSON.stringify({ gp_number_manual }),
        headers: new Headers({
            'Content-Type': 'application/json'
        }),
    }).then(data => data.json()).then(data => {
        if (data.status == "yes") {
            isGp = true
        } else if (data.status == "no") {
            isGp = false
        }
    })
}

function getGrandTotal(){
    gate_pass_grand_total = document.getElementById("gate_pass_grand_total")
    sum=0;
    for(var i=0; i<idList.length; i++){
        let inputTotalAmount = document.getElementById("gate_pass_total_amount"+i).value
        sum += parseFloat(inputTotalAmount)
        gate_pass_grand_total.value = sum
    }
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

function submitWithVoucher(){
    if(getGatePass() && getCashVoucher()){
        fetch("/gate_pass/add-gate-pass", {
            method: "POST",
            body: JSON.stringify({ "gate_pass_type":gate_pass_type, 
                                    "gate_pass_date":gate_pass_date, 
                                    "gate_pass_party_id":gate_pass_party_id,
                                    "gate_pass_party_name": gate_pass_party_name,
                                    "gate_pass_contact": gate_pass_contact,
                                    "gate_pass_grand_total":gate_pass_grand_total,
                                    "gate_pass_payment_type": cash_voucher_type,
                                    "gp_entries":data,
                                    "cash_voucher": "true",
                                    "cash_voucher_type": cash_voucher_type,
                                    "cash_voucher_signature": cash_voucher_signature,
                                    "cash_voucher_details":cash_voucher_details }),
            headers: new Headers({
                'Content-Type': 'application/json'
            }),
        }).then(data => data.json()).then(data => {
            if (data.status == "ok") {
                toastr.success("Gate Pass Added")
                window.location.replace("/gate_pass")
            } else if (data.status == "error") {
                toastr.error("Error: "+data.errorMessage)
                document.getElementById("btn2").disabled = false
            }
        })
    }
}

function add_gp_row(){
    ++idCounter;
    idList.push(idCounter);
    addCommodity();
}

function removeFromIdList(){
    const index = idList.indexOf(idCounter);
    if (index > -1) {
        idList.splice(index, 1);
    }
}

function isPresentInList(id){
    check = false;
    for(var i=0; i<idList.length; i++){
        if(idList[i] == id){
            check = true;
            break;
        }
    }

    return check;
}

function addCommodity(){
    //making gp_row start
    var gp_row = document.createElement("div");
        gp_row.setAttribute("id","gp_row"+idCounter);
        gp_row.setAttribute("class","row form-group");
    //making gp_row end

    //making col commodity start
    var col_md_2 = document.createElement("div");
        col_md_2.setAttribute("class", "col-md-2");
    var form_group = document.createElement("div");
        form_group.setAttribute("class", "form-group input-group-md");
    var label = document.createElement("label");
        label.innerHTML = "Commodity";

    var commodity_select = document.createElement("select");
        commodity_select.setAttribute("class", "form-control")
        commodity_select.setAttribute("id", "gate_pass_commodity"+idCounter)

        var option1 = document.createElement("option")
            option1.setAttribute("value", "Raw Material")
            option1.innerText = "Raw Material"
            commodity_select.appendChild(option1)

        var option2 = document.createElement("option")
            option2.setAttribute("value", "Tools & Consumables")
            option2.innerText = "Tools & Consumables"
            commodity_select.appendChild(option2)

        var option3 = document.createElement("option")
            option3.setAttribute("value", "Services")
            option3.innerText = "Services"
            commodity_select.appendChild(option3)

        var option4 = document.createElement("option")
            option4.setAttribute("value", "Personal")
            option4.innerText = "Personal"
            commodity_select.appendChild(option4)

        var option5 = document.createElement("option")
            option5.setAttribute("value", "Food, Welfare & Entertainment")
            option5.innerText = "Food, Welfare & Entertainment"
            commodity_select.appendChild(option5)
            
        var option6 = document.createElement("option")
            option6.setAttribute("value", "Iron Scrap")
            option6.innerText = "Iron Scrap"
            commodity_select.appendChild(option6)
            
        var option7 = document.createElement("option")
            option7.setAttribute("value", "Rotor")
            option7.innerText = "Rotor"
            commodity_select.appendChild(option7)

        var option8 = document.createElement("option")
            option8.setAttribute("value", "Cast Iron")
            option8.innerText = "Cast Iron"
            commodity_select.appendChild(option8)

        var option9 = document.createElement("option")
            option9.setAttribute("value", "Silver")
            option9.innerText = "Silver"
            commodity_select.appendChild(option9)
 
        var option10 = document.createElement("option")
            option10.setAttribute("value", "Copper")
            option10.innerText = "Copper"
            commodity_select.appendChild(option10)

        var option12 = document.createElement("option")
            option12.setAttribute("value", "Khulaai")
            option12.innerText = "Khulaai"
            commodity_select.appendChild(option12)

        var option13 = document.createElement("option")
            option13.setAttribute("value", "Wages")
            option13.innerText = "Wages"
            commodity_select.appendChild(option13)

        var option14 = document.createElement("option")
            option14.setAttribute("value", "Brass")
            option14.innerText = "Brass"
            commodity_select.appendChild(option14)

        var option15 = document.createElement("option")
            option15.setAttribute("value", "Zinc")
            option15.innerText = "Zinc"
            commodity_select.appendChild(option15)
            
        var option16 = document.createElement("option")
            option16.setAttribute("value", "SS")
            option16.innerText = "SS"
            commodity_select.appendChild(option16)

        var option17 = document.createElement("option")
            option17.setAttribute("value", "Bacha Part")
            option17.innerText = "Bacha Part"
            commodity_select.appendChild(option17)

        var option18 = document.createElement("option")
            option18.setAttribute("value", "Weight Loss")
            option18.innerText = "Weight Loss"
            commodity_select.appendChild(option18)

        var option19 = document.createElement("option")
            option19.setAttribute("value", "Chalu")
            option19.innerText = "Chalu"
            commodity_select.appendChild(option19)

        var option20 = document.createElement("option")
            option20.setAttribute("value", "Misc")
            option20.innerText = "Misc"
            commodity_select.appendChild(option20)

        var option21 = document.createElement("option")
            option21.setAttribute("value", "Transport")
            option21.innerText = "Transport"
            commodity_select.appendChild(option21)

    form_group.appendChild(label);
    form_group.appendChild(commodity_select);
    col_md_2.appendChild(form_group);
    gp_row.appendChild(col_md_2);
    //making col commodity end

    //making col quantity start
    var col_md_2 = document.createElement("div");
        col_md_2.setAttribute("class", "col-md-2");
    
    var form_group = document.createElement("div");
        form_group.setAttribute("class", "form-group input-group-md");
    
    var label = document.createElement("label");
        label.innerHTML = "Weight";

    var inputQuantity = document.createElement("input");
        inputQuantity.setAttribute("id","gate_pass_quantity"+idCounter);
        inputQuantity.setAttribute("type","number");
        inputQuantity.setAttribute("class","form-control");
        inputQuantity.setAttribute("placeholder","Enter Weight");
        inputQuantity.addEventListener('input', (event) => {
            if(inputQuantity.value == ""){
                inputTotalAmount.value = inputUnitAmount.value
                getGrandTotal()
            }
            else{
                inputTotalAmount.value = inputQuantity.value * inputUnitAmount.value
                getGrandTotal()
            }
            
        })
    
    form_group.appendChild(label)
    form_group.appendChild(inputQuantity)
    col_md_2.appendChild(form_group)
    gp_row.appendChild(col_md_2)    
    //making col quantity end
    
    //making col unit start
    var col_md_2 = document.createElement("div");
        col_md_2.setAttribute("class", "col-md-2");
    var form_group = document.createElement("div");
        form_group.setAttribute("class", "form-group input-group-md");
    var label = document.createElement("label");
        label.innerHTML = "Unit";

    var unit_select = document.createElement("select");
        unit_select.setAttribute("class", "form-control")
        unit_select.setAttribute("id", "gate_pass_unit"+idCounter)

        var option1 = document.createElement("option")
            option1.setAttribute("value", "KG")
            option1.innerText = "KG"
            unit_select.appendChild(option1)

        var option2 = document.createElement("option")
            option2.setAttribute("value", "NOS")
            option2.innerText = "NOS"
            unit_select.appendChild(option2)

        var option3 = document.createElement("option")
            option3.setAttribute("value", "PCS")
            option3.innerText = "PCS"
            unit_select.appendChild(option3)

    form_group.appendChild(label);
    form_group.appendChild(unit_select);
    col_md_2.appendChild(form_group);
    gp_row.appendChild(col_md_2);
    //making col unit end

    //making col amount start
    var col_md_2 = document.createElement("div");
        col_md_2.setAttribute("class", "col-md-2");
    
    var form_group = document.createElement("div");
        form_group.setAttribute("class", "form-group input-group-md");
    
    var label = document.createElement("label");
        label.innerHTML = "Unit Amount";

    var inputUnitAmount = document.createElement("input");
        inputUnitAmount.setAttribute("id","gate_pass_unit_amount"+idCounter);
        inputUnitAmount.setAttribute("type","number");
        inputUnitAmount.setAttribute("class","form-control");
        inputUnitAmount.setAttribute("placeholder","Enter Amount");
        inputUnitAmount.addEventListener('input', (event) => {
            if(inputQuantity.value == ""){
                inputTotalAmount.value = inputUnitAmount.value
                getGrandTotal()
            }
            else{
                inputTotalAmount.value = inputQuantity.value * inputUnitAmount.value
                getGrandTotal()
            }
            
        })
    
    form_group.appendChild(label)
    form_group.appendChild(inputUnitAmount)
    col_md_2.appendChild(form_group)
    gp_row.appendChild(col_md_2)    
    //making col amount end

    //making col total amount start
    var col_md_2 = document.createElement("div");
        col_md_2.setAttribute("class", "col-md-2");
    
    var form_group = document.createElement("div");
        form_group.setAttribute("class", "form-group input-group-md");
    
    var label = document.createElement("label");
        label.innerHTML = "Total Amount";

    var inputTotalAmount = document.createElement("input");
        inputTotalAmount.setAttribute("id","gate_pass_total_amount"+idCounter);
        inputTotalAmount.setAttribute("type","number");
        inputTotalAmount.setAttribute("class","form-control");
        inputTotalAmount.setAttribute("placeholder","Enter Total Amount");
    
    form_group.appendChild(label)
    form_group.appendChild(inputTotalAmount)
    col_md_2.appendChild(form_group)
    gp_row.appendChild(col_md_2)    
    //making col total amount end

    //making col details start
    var col_md_2 = document.createElement("div");
        col_md_2.setAttribute("class", "col-md-2");
    
    var form_group = document.createElement("div");
        form_group.setAttribute("class", "form-group input-group-md");
    
    var label = document.createElement("label");
        label.innerHTML = "Details";

    var inputDetails = document.createElement("input");
        inputDetails.setAttribute("id","gate_pass_details"+idCounter);
        inputDetails.setAttribute("type","text");
        inputDetails.setAttribute("class","form-control");
        inputDetails.setAttribute("placeholder","Enter Details");
    
    form_group.appendChild(label)
    form_group.appendChild(inputDetails)
    col_md_2.appendChild(form_group)
    gp_row.appendChild(col_md_2)    

    var row_hr = document.createElement("div")
        row_hr.setAttribute("class", "row")
        row_hr.setAttribute("id", "row_hr"+idCounter)
    var col_hr = document.createElement("div")
        col_hr.setAttribute("class", "col-md-12")
    var hr = document.createElement("hr")
        col_hr.appendChild(hr)
        row_hr.appendChild(col_hr)
    //making col amount end
    
    //adding gp_row
    var idInput = document.createElement("input");
        idInput.setAttribute("value", idCounter);
        idInput.setAttribute("type", "hidden");
        idInput.setAttribute("id", "idInput"+idCounter);
        gp_row.appendChild(idInput)

    document.getElementById("tab2").appendChild(gp_row);
    document.getElementById("tab2").appendChild(row_hr);
}

function buttonXgpRowDelete(){
    removeFromIdList(idCounter);
    document.getElementById("tab2").removeChild(document.getElementById('gp_row0'));
}

function remove_last_gp_row(){
    if(idCounter > 0){
        removeFromIdList(idCounter);
        document.getElementById("tab2").removeChild(document.getElementById('gp_row'+idCounter));
        document.getElementById("tab2").removeChild(document.getElementById('row_hr'+idCounter));
        idCounter--;
    }
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