/*update profile 
-----------------------------------------*/
$("#profileForm").submit(function (event) {
  event.preventDefault();
  const formData = $(this).serialize();

  // Send the POST request
  $.post("/profile", formData)
    .done(function (response) {
      if (response == "success") {
        console.log("Hello");
        $(".success").css("display", "block");
      }
    })
    .fail(function (error) {
      console.error(error);
    });
});

/*Check password and confirm password
-----------------------------------------*/

$("#signupForm").submit(function (event) {
  event.preventDefault();
  const password = $("#password").val();
  const confirmPassword = $("#confirm_password").val();

  if (password !== confirmPassword) {
    $("#confirm_password").addClass("error");
    setTimeout(function () {
      $("#confirm_password").removeClass("error");
    }, 10000);
  } else {
    // Handle successful form submission
    alert("Signup Successful!");
    // $("#signupForm")[0].reset();
  }
});
