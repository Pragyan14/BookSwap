// var collection = $(".homeinput");

// $("#submitBtn").click(function(){
  
//   // console.log($('[name="fName"]').val());

//   var firstName = $('[name="fName"]').val();
//   var lastName = $('[name="lName"]').val();

//   $.ajax({
//     type: "POST",
//     url: "/",
//     data:{
//       fName: firstName,
//       lName: lastName
//     },
//     success: function(response){
//       // $("#response").html(response);
//       console.log(response);
//     }
//   })
// });

$('#myForm').submit(function(event) {
  event.preventDefault();

  // Get the form data
  const formData = $(this).serialize();

  // Send the POST request
  $.post('/', formData)
    .done(function(response) {
      // Handle the response here
      if(response == "yes"){
        window.location.href = '/about';
      } else {
        console.log(response);
        
      }
    })
    .fail(function(error) {
      // Handle any errors that occurred during the request
      console.error(error);
    });
});
