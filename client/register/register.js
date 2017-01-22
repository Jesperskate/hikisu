if (Meteor.isClient) {
Template.register.events({
    'submit form': function(event){
        event.preventDefault();
        var emailVar = event.target.registerEmail.value;
        var passwordVar = event.target.registerPassword.value;
        console.log("Form submitted.");
          Accounts.createUser({
            email: emailVar,
            password: passwordVar
        });
     FlashMessages.sendSuccess("Registratie is gelukt, <a href='/login'>log in hier</a>");
    },

});

    Template.register.rendered = function (){
          if(BrowserDetect.browser === "Explorer"){
                    alert('Explorer is not supported');
                    $('input').css('padding','0px !important');
                }
    }
}