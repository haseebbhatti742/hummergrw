var today = new Date();
var day=today.getDate()>9?today.getDate():"0"+today.getDate(); // format should be "DD" not "D" e.g 09
var month=(today.getMonth()+1)>9?(today.getMonth()+1):"0"+(today.getMonth()+1);
var year=today.getFullYear();
$("#date_to").attr('max', year + "-" + month + "-" + day);

function searchLedger(){
    party_name = document.getElementById("party_name").value
    party_id = document.getElementById("party_id").value
    date_from = document.getElementById("date_from").value
    date_to = document.getElementById("date_to").value

    if(party_name == ""){
        document.getElementById("party_name_error").innerHTML = "Enter Party"
    } else {
        if(date_from == "")date_from = "null"
        if(date_to == "")date_to = "null"
          
        document.getElementById("party_name_error").innerHTML = ""
        url = "/ledger/get_general_ledger/"+party_id+"/"+date_from+"/"+date_to
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                document.getElementById("general-ledger").innerHTML = this.responseText;
            }
        };
        xhttp.open("GET", url, true);
        xhttp.send();
    }
}

$("#party_name").keyup(function(event) {
    if (event.keyCode === 13) {
        $("#btnSearch").click();
    }
});

//party select start
var $selectParty = $('#party_name');
var partyNameArray = [];
var partyIdArray = [];
getParty();
autocomplete(document.getElementById("party_name"), partyNameArray);
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
                document.getElementById("party_id").value = partyIdArray[index];
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

function printLedger(){
  var printContents = document.getElementById("ledgerReport").innerHTML;
  var originalContents = document.body.innerHTML;
  document.body.innerHTML = printContents;
  window.print();
  document.body.innerHTML = originalContents;
}