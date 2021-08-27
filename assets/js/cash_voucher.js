$(window).on('load', function() {
    show_cv_form();
});

function show_cv_form() {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            document.getElementById("cash_voucher_form").innerHTML = this.responseText;
        }
    };
    xhttp.open("GET", "/cash_voucher/cv_form", true);
    xhttp.send();
}
