if (Meteor.isClient) {
  // To store the slideout instance.
  var slideout;

    Meteor.subscribe("sessies");
    Meteor.subscribe("users");


  // Auto-close the menu on route stop (when navigating to a new route)
  Router.onStop(function () {
    if (slideout) {
      slideout.close();
    }
  });

    // Setup code for Slideout menu in layout
  Template.layout.onRendered(function () {
    var template = this;
    slideout = new Slideout({
      'panel': template.$('#content').get(0),
      'menu': template.$('.slideout-menu').get(0),
      'padding': 256,
      'tolerance': 70
    });


  });

  Template.layout.helpers({
    email: function() {return Meteor.user().emails[0].address},
    isOwner: function () {
       var currentCode = Router.current().params._id;
       var sessieOwner = Sessies.findOne({random: currentCode}, {fields: {'owner':1}}) ;
       if(Meteor.userId() === sessieOwner){ return true;}
       else{
            return false;}
     },

  });

  Template.layout.events({
    'click #togglebtn': function(){
      slideout.toggle();
    },

    'click .logout': function(event){
        event.preventDefault();
        Meteor.logout();
        Session.set('spelernaam', undefined);

        console.log('remove this user: '+ Meteor.userId(),  Meteor.call('logoutPlayer', Meteor.userId()));
        Meteor.call('logoutPlayer', Meteor.userId());
     
        FlashMessages.sendSuccess("Tot ziens");
    }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });

    // This code only runs on the server
  Meteor.publish("sessies", function () {
    return Sessies.find();
  });
}

