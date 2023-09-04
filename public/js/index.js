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

// HAMBURGER MENU
const myElement = document.getElementById('menu');
function hamburger() {
  const element2 = document.querySelector("#hambClose"); 
  const element3 = document.querySelector(".links"); 
  // document.querySelector("#animID")[0].classList.add("addAnim");
  if (myElement.style.visibility === 'collapse') {
    element2.classList.remove("fa-bars");
    element2.classList.add("fa-close");
    element3.classList.add("addAnim");
    myElement.style.visibility = 'visible'; // Show the element
  } else {
    element2.classList.remove("fa-close");
    element2.classList.add("fa-bars");
    element3.classList.remove("addAnim");
    myElement.style.visibility = 'collapse'; // Hide the element
  }
};

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