"use strict";

$(window).on('load', function () {
  getCategory();
}); // $( document ).ready(function() {
//     // getMarket();
//     $('#modalContactForm').modal('show');
// });

var $selectCategory = $('#product_category');
var $selectSubCategory = $('#product_sub_category');

function addSelectItems(array, $select) {
  $.each(array, function (key, value) {
    $select.append($("<option></option>").attr("value", value).text(value));
  });
}

function getCategory() {
  var name = "";
  fetch("/admin/products/getCategory", {
    method: "POST",
    body: JSON.stringify({
      name: name
    }),
    headers: new Headers({
      'Content-Type': 'application/json'
    })
  }).then(function (data) {
    return data.json();
  }).then(function (data) {
    if (data.status == "yes") {
      var arr = [];

      for (var i = 0; i < data.category.length; i++) {
        arr.push(data.category[i].category);
      }

      addSelectItems(arr, $selectCategory);
    }
  });
}

function getSubCategory() {
  document.getElementById("product_sub_category").options.length = 0;
  var name = $("#product_category").find(":selected").text();
  fetch("/admin/products/getSubCategory", {
    method: "POST",
    body: JSON.stringify({
      name: name
    }),
    headers: new Headers({
      'Content-Type': 'application/json'
    })
  }).then(function (data) {
    return data.json();
  }).then(function (data) {
    if (data.status == "yes") {
      // var arr = this[x.replace(/\s/g, "") + "Array"];
      var arr = [];

      for (var i = 0; i < data.sub_category.length; i++) {
        arr.push(data.sub_category[i].sub_category);
      }

      addSelectItems(arr, $selectSubCategory);
    }
  });
}

function addProduct() {
  //- document.getElementById("product_name_error").innerHTML = (document.getElementById("product_name").value == "") ? 'Please Fill This' : '';
  var product_name = document.getElementById("product_name").value;
  var product_selling_price = document.getElementById("product_selling_price").value;
  var product_actual_price = document.getElementById("product_actual_price").value;
  var product_quantity = document.getElementById("product_quantity").value;
  var product_size = document.getElementById("product_size").value;
  var product_category = document.getElementById("product_category").value;
  var product_sub_category = document.getElementById("product_sub_category").value;
  var product_desc = document.getElementById("product_desc").value;

  if (product_name == "") {
    document.getElementById("product_name_error").innerHTML = "Enter Product Name";
  } else if (product_selling_price == "") {
    document.getElementById("product_selling_price_error").innerHTML = "Enter Selling Price";
  } else if (product_actual_price == "") {
    document.getElementById("product_actual_price_error").innerHTML = "Enter Actual Price";
  } else if (product_quantity == "") {
    document.getElementById("product_quantity_error").innerHTML = "Enter Product Quantity";
  } else if (product_size == "") {
    document.getElementById("product_size_error").innerHTML = "Enter Product Size";
  } else if (product_category == "") {
    document.getElementById("product_category_error").innerHTML = "Select Product Category";
  } else if (product_sub_category == "") {
    document.getElementById("product_sub_category_error").innerHTML = "Select Sub Category";
  } else if (product_desc == "") {
    document.getElementById("product_desc_error").innerHTML = "Enter Product Description";
  } else {
    fetch("/admin/products/product-add", {
      method: "POST",
      body: JSON.stringify({
        product_name: product_name,
        product_selling_price: product_selling_price,
        product_actual_price: product_actual_price,
        product_quantity: product_quantity,
        product_size: product_size,
        product_category: product_category,
        product_sub_category: product_sub_category,
        product_desc: product_desc
      }),
      headers: new Headers({
        'Content-Type': 'application/json'
      })
    }).then(function (data) {
      return data.json();
    }).then(function (data) {
      if (data.status == "ok") {
        alert("Product Added Successfully..!");
      } else if (data.status == "error") {
        alert("Error: " + data.errorMessage);
      }
    });
  }
}

function reset() {
  $('#form input, #form select, #form textarea').each(function (index) {
    var input = $(this);
    input.val("");
  });
}