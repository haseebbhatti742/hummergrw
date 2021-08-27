"use strict";

$(window).on('load', function () {
  getCategory(); //loadAllData();
});
var $selectCategory = $('#category');
var categoriesNameArray = [];
var categoriesIdArray = []; // function addSelectItems(array, $select) {
//     $.each(array, function(key, value) {
//         $select.append($("<option></option>").attr("value", value).text(value));
//     });
// }

function addSelectItems(arrayNames, arrayId, $select) {
  for (var i = 0; i < arrayNames.length; i++) {
    $select.append($("<option></option>").attr("value", arrayId[i]).text(arrayNames[i]));
  }
}

function addNewCategory() {
  var category = document.getElementById("newCategory").value;

  if (category == "") {
    document.getElementById("newCategoryError").innerHTML = "Please Enter a new category";
  } else {
    document.getElementById("newCategoryError").innerHTML = "";
    fetch("/admin/categories/add", {
      method: "POST",
      body: JSON.stringify({
        category: category
      }),
      headers: new Headers({
        'Content-Type': 'application/json'
      })
    }).then(function (data) {
      return data.json();
    }).then(function (data) {
      if (data.status == "ok") {
        alert("Category Added Successfully..!");
        window.location.replace('/admin/categories'); // document.getElementById("category").options.length = 0;
        // getCategory();
      } else if (data.status == "error") {
        alert("Error: " + data.errorMessage);
      }
    });
  }
}

function addNewSubCategory() {
  var category_id = document.getElementById("category").value;
  var newSubCategory = document.getElementById("newSubCategory").value;

  if (category_id == "") {
    document.getElementById("newSubCategoryError").innerHTML = "Please Select a category";
  } else if (newSubCategory == "") {
    document.getElementById("newSubCategoryError").innerHTML = "Please Enter a new sub category";
  } else {
    document.getElementById("newSubCategoryError").innerHTML = "";
    fetch("/admin/categories/addSubCategory", {
      method: "POST",
      body: JSON.stringify({
        category_id: category_id,
        newSubCategory: newSubCategory
      }),
      headers: new Headers({
        'Content-Type': 'application/json'
      })
    }).then(function (data) {
      return data.json();
    }).then(function (data) {
      if (data.status == "ok") {
        alert("Sub Category Added Successfully..!");
        window.location.replace('/admin/categories');
      } else if (data.status == "error") {
        alert("Error: " + data.errorMessage);
      }
    });
  }
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
      for (var i = 0; i < data.category.length; i++) {
        categoriesNameArray.push(data.category[i].category);
        categoriesIdArray.push(data.category[i].category_id);
      }

      addSelectItems(categoriesNameArray, categoriesIdArray, $selectCategory); // var arr = [];
      // for (var i = 0; i < data.category.length; i++) {
      //     arr.push(data.category[i].category);
      // }
      // addSelectItems(arr, $selectCategory);
    }
  });
}

function loadAllData() {
  var node = document.getElementById("rowDiv");
  var col_md_3 = document.createElement("div");
  col_md_3.className = ".col-md-3";
  var card = document.createElement("div");
  card.className = ".card";
  var card_header = document.createElement("div");
  card_header.className = ".card-header";
  var h3 = document.createElement("h3");
  h3.className = ".card-title";
  h3.innerHTML = "Hey There";
  card_header.appendChild(h3);
  card.appendChild(card_header);
  col_md_3.appendChild(card);
  node.appendChild(col_md_3);
}