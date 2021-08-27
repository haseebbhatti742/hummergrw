"use strict";

$(window).on('load', function () {
  ajaxExample();
});
var input = document.getElementById("product_id"); // Execute a function when the user releases a key on the keyboard

input.addEventListener("keyup", function (event) {
  // Number 13 is the "Enter" key on the keyboard
  if (event.keyCode === 13) {
    // Cancel the default action, if needed
    event.preventDefault(); // Trigger the button element with a click
    // document.getElementById("myBtn").click();

    addItem(); // ajaxExample();
  }
});
var productIdArray = [];

function ajaxExample() {
  var xhttp = new XMLHttpRequest();

  xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      document.getElementById("demo").innerHTML = this.responseText;
    }
  };

  xhttp.open("GET", "/admin/temp-order/", true);
  xhttp.send();
}

function addItem() {
  product_id = input.value;

  if (product_id == "") {
    document.getElementById("product_id_error").innerHTML = "Enter Product ID";
  } else {
    fetch("/admin/products/get", {
      method: "POST",
      body: JSON.stringify({
        product_id: product_id
      }),
      headers: new Headers({
        'Content-Type': 'application/json'
      })
    }).then(function (data) {
      return data.json();
    }).then(function (data) {
      if (data.status == "no") {
        document.getElementById("product_id_error").innerHTML = "Product Not Found"; // alert("Product Not Found..!");
      } else if (data.status == "error") {
        alert("Error: " + data.errorMessage);
      } else if (data.status == "yes") {
        document.getElementById("product_id_error").innerHTML = "";
        document.getElementById("product_id").value = "";
        addItemInDatabase(data.dataset[0].product_id, data.dataset[0].product_name, data.dataset[0].product_selling_price);
      }
    });
  }
}

function addItemInDatabase(product_id, product_name, unit_price) {
  fetch("/admin/home/addTempOrder", {
    method: "POST",
    body: JSON.stringify({
      product_id: product_id,
      product_name: product_name,
      unit_price: unit_price
    }),
    headers: new Headers({
      'Content-Type': 'application/json'
    })
  }).then(function (data) {
    return data.json();
  }).then(function (data) {
    if (data.status == "error") {
      alert("Error: " + data.errorMessage);
    } else if (data.status == "yes") {
      ajaxExample();
    }
  });
}

function deleteRow(temp_order_id) {
  fetch("/admin/home/deleteTempOrderRow", {
    method: "POST",
    body: JSON.stringify({
      temp_order_id: temp_order_id
    }),
    headers: new Headers({
      'Content-Type': 'application/json'
    })
  }).then(function (data) {
    return data.json();
  }).then(function (data) {
    if (data.status == "error") {
      alert("Error: " + data.errorMessage);
    } else if (data.status == "yes") {
      ajaxExample();
    }
  });
} // function addData(array) {
//     if (productIdArray.includes(array.product_id)) {
//     }
//     var table = document.getElementById("myTable");
//     var currentIndex, row;
//     currentIndex = table.rows.length;
//     var index = productIdArray.indexOf(array.product_id)
//     row = table.insertRow(currentIndex);
//     var sr = row.insertCell(0);
//     var id = row.insertCell(1);
//     var name = row.insertCell(2);
//     var unit_price = row.insertCell(3);
//     var quantity = row.insertCell(4);
//     var sub_total = row.insertCell(5);
//     var remove = row.insertCell(6);
//     sr.innerHTML = currentIndex;
//     id.innerHTML = array.product_id;
//     name.innerHTML = array.product_name;
//     unit_price.innerHTML = array.product_selling_price;
//     quantity.innerHTML = 1;
//     sub_total.innerHTML = array.product_selling_price * quantity.innerHTML;
//     var i = document.createElement('i');
//     i.setAttribute('class', 'fa fa-remove btn btn-danger');
//     i.onclick = function() {
//         currentIndex;
//         alert(index)
//         if (currentIndex != -1) {
//             alert(productIdArray)
//             productIdArray.splice(index, 1);
//             document.getElementById("myTable").deleteRow(index + 1);
//             // alert(productIdArray)
//             // currentIndex--;
//             // addData();
//         }
//     }
//     remove.setAttribute('class', 'text-center');
//     remove.appendChild(i);
//     // var currentIndex = table.rows.length;
//     // var row = table.insertRow(currentIndex);
//     // var sr = row.insertCell(0);
//     // var id = row.insertCell(1);
//     // var name = row.insertCell(2);
//     // var unit_price = row.insertCell(3);
//     // var quantity = row.insertCell(4);
//     // var sub_total = row.insertCell(5);
//     // var remove = row.insertCell(6);
//     // sr.innerHTML = currentIndex;
//     // id.innerHTML = product_id;
//     // name.innerHTML = data.dataset[0].product_name;
//     // unit_price.innerHTML = data.dataset[0].product_selling_price;
//     // quantity.innerHTML = 1;
//     // sub_total.innerHTML = data.dataset[0].product_selling_price * quantity.innerHTML;
//     // var i = document.createElement('i');
//     // i.setAttribute('class', 'fa fa-remove btn btn-danger');
//     // remove.setAttribute('class', 'text-center');
//     // remove.appendChild(i);
// }