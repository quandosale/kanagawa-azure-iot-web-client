$(function () {
  $("#menu-toggle").click(function (e) {
    e.preventDefault();
    $("#wrapper").toggleClass("toggled");
    if ($("#wrapper").hasClass("toggled")) {
      $("#menu-toggle").addClass("active");
    } else {
      $("#menu-toggle").removeClass("active");
    }
  });
});
