if (Meteor.isClient) {
Template.login.events({
    'submit form': function(event) {
        event.preventDefault();
        var emailVar = event.target.loginEmail.value;
        var passwordVar = event.target.loginPassword.value;
         // Meteor.loginWithPassword(emailVar, passwordVar);
      Meteor.loginWithPassword(emailVar, passwordVar, function(error) {
            // 3. Handle the response
            if (Meteor.user()) {
                // Redirect the user to where they're loggin into. Here, Router.go uses
                // the iron:router package.
                      FlashMessages.sendSuccess("Welkom!");
                Router.go('panel');
            } else {
                // If no user resulted from the attempt, an error variable will be available
                // in this callback. We can output the error to the user here.
                // var message = "There was an error logging in: <strong>" + error.reason + "</strong>";
                var message = "Log in mislukt: <strong>" + error.reason + "</strong>";
                    FlashMessages.sendError(message);
            }

            return;
        });
  return false;

    }
});
    Template.login.rendered = function (){
          if(BrowserDetect.browser == "Explorer"){
                     alert('Hi IE');
                    $('.form__input').css('padding','10px');
                }
    }

}