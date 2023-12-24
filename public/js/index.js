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

// TESTOMINAL BUTTONS
const element = document.querySelector('.wrapTesti');
const blocks = document.querySelector('.testi1');
function scrollNext() {
  element.scrollLeft += blocks.clientWidth;
}
function scrollPrev() {
  element.scrollLeft -= blocks.clientWidth;
}

/*update profile 
-----------------------------------------*/
$("#about2").submit(function (event) {
  event.preventDefault();
  const formData = $(this).serialize();

  // Send the POST request
  $.post("/updateProfile", formData)
    .done(function (response) {
      if (response == "success") {
          // location.reload();
        $("#showSuccess").fadeIn(1000, function () {
          setTimeout(function () {
            $("#showSuccess").fadeOut(1000);
          }, 3000);
        });
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


// Profile page
function editBtm() {
  var element1 = document.querySelector(".selectEdit");
  var element2 = document.querySelector(".selectClose");
  var section1 = document.querySelector("#about1");
  var section2 = document.querySelector("#about2");

  // showing details
  if (section2.classList.contains("hide")) {
    section1.classList.add("hide");
    section2.classList.remove("hide");
    element1.classList.add("hide");
    element2.classList.remove("hide");
  } else {
    section1.classList.remove("hide");
    section2.classList.add("hide");
    element1.classList.remove("hide");
    element2.classList.add("hide");
  }

}
function scrollNext() {
  element.scrollLeft += blocks.clientWidth;
}
function scrollPrev() {
  element.scrollLeft -= blocks.clientWidth;
}
function nextBook() {
  updatePageNext();
}
function prevBook() {
  updatePagePrev();
}
function updatePageNext() {
  let totalBook = bookName.length;
  if (pageNumber * 4 >= totalBook) {
    return booksEnd();
  }
  pageNumber++;
  document.getElementById("page").innerHTML = pageNumber;
  updateBooks(pageNumber);
}
function booksEnd() {
  document.getElementById("showError").style.display = "flex";
  setTimeout(() => {
    document.getElementById("showError").style.display = "none";
  }, 2000);
}
function uploadSuccess() {
  document.getElementById("showSuccess").style.display = "flex";
  setTimeout(() => {
    document.getElementById("showSuccess").style.display = "none";
  }, 2000);
}

function updatePagePrev() {
  if (pageNumber == 1) {
    return 1;
  }
  pageNumber--;
  document.getElementById("page").innerHTML = pageNumber;
  updateBooks(pageNumber);
}


function sliceText() {
  const element1 = document.getElementsByClassName("bold")[0];
  const element2 = document.getElementsByClassName("bold")[1];
  const element3 = document.getElementsByClassName("bold")[2];
  const element4 = document.getElementsByClassName("bold")[3];
  let width = screen.width;
  element1.innerHTML.length > 15 && width < 770 ? element1.innerHTML = element1.innerHTML.slice(0, 15) + "..." : null;
  element2.innerHTML.length > 15 && width < 770 ? element2.innerHTML = element2.innerHTML.slice(0, 15) + "..." : null;
  element3.innerHTML.length > 15 && width < 770 ? element3.innerHTML = element3.innerHTML.slice(0, 15) + "..." : null;
  element4.innerHTML.length > 15 && width < 770 ? element4.innerHTML = element4.innerHTML.slice(0, 15) + "..." : null;
}

function chngInnerHTML() {
  let width = screen.width;
  if (width < 580) {
    document.querySelector("#chngHTML").innerHTML = "Books Uploaded";
    document.querySelector(".bookAdd").innerHTML = "+";
  }
}

// chngInnerHTML();
// sliceText();
// updateBooks(pageNumber);

function uploadBook(num) {
  const element1 = document.getElementsByClassName("hideWhenClicked")[0];
  const element2 = document.getElementsByClassName("showWhenClicked")[0];
  const currentClass1 = element1.classList.contains("hide");

  // If element1 has the "hide" class, remove it
  if (currentClass1) {
    element1.classList.remove("hide");
  } else {
    // Otherwise, add the "hide" class to element1
    element1.classList.add("hide");
  }
  // Check the current class of element2
  const currentClass2 = element2.classList.contains("hide");
  // If element2 has the "hide" class, remove it
  if (currentClass2) {
    element2.classList.remove("hide");
  } else {
    // Otherwise, add the "hide" class to element2
    element2.classList.add("hide");
  }
}

function uploadBook2() {
  const element1 = document.getElementsByClassName("hideWhenClicked")[0];
  const element2 = document.getElementsByClassName("showWhenClicked")[0];
  const currentClass1 = element1.classList.contains("hide");

  if (currentClass1) {
    element1.classList.remove("hide");
    document.querySelector(".bookAdd").innerHTML = "Add new book";
  } else {
    element1.classList.add("hide");
  }

  const currentClass2 = element2.classList.contains("hide");
  if (currentClass2) {
    element2.classList.remove("hide");
    document.querySelector(".bookAdd").innerHTML = "SAVE";
  } else {
    element2.classList.add("hide");
  }
}