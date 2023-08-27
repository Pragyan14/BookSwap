/*Check password and confirm password
-----------------------------------------*/
function validatePassword() {
  var password = $("#password").val();
  var confirmPassword = $("#confirmPassword").val();

  if (password !== confirmPassword) {
    $("#password, #confirmPassword").addClass("error");
    setTimeout(function () {
      $("#password, #confirmPassword").removeClass("error");
    }, 10000);
    return false;
  } else {
    return true;
  }
}

/*update profile 
-----------------------------------------*/
$("#profileForm").submit(function (event) {
  event.preventDefault();
  const formData = $(this).serialize();

  // Send the POST request
  $.post("/profile", formData)
    .done(function (response) {
      if (response == "success") {
        $(".success").css("display", "block");
      }
    })
    .fail(function (error) {
      console.error(error);
    });
});

/*Upload book
-----------------------------------------*/
$("#uploadBookForm").submit(function (event) {
  event.preventDefault();
  const formData = $(this).serialize();

  // Send the POST request
  $.post("/uploadBook", formData)
    .done(function (response) {
      if (response == "success") {
        $(".success").css("display", "block");
      }
    })
    .fail(function (error) {
      console.error(error);
    });
});