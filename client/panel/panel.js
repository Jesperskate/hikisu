

if (Meteor.isClient) {

  Meteor.subscribe("sessies");
  // This code only runs on the client
  Template.panel.helpers({
    sessies: function () {
    // Show newest tasks at the top
    if (! Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }
      return Sessies.find({owner: Meteor.userId()}, {sort: {createdAt: -1} });
    }

  });

  Template.sessie.helpers({
    isOwner: function () {
      return this.owner === Meteor.userId();
    },
    email: function() {return Meteor.user().emails[0].address}, 
    userId: function() {return Meteor.userId()}

    

  });


  Template.panel.events({
    "submit .new-sessie": function (event) {
      // Prevent default browser form submit
      event.preventDefault();
 
      // Get value from form element
      var text = event.target.text.value; 
      var lefttext = event.target.lefttext.value;
      var righttext = event.target.righttext.value;
      var random = makeid();
       var description = event.target.description.value; 
      var setting1 = event.target.anonymous.checked;

          if (! Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }

    Sessies.insert({
      text: text,
      lefttext:lefttext,
      righttext: righttext,
      random: random,
      description: description,
      privacy: setting1,
      createdAt: new Date(),
      owner: Meteor.userId(),
      username: Meteor.user().username
    });
 
      // Clear form
      event.target.text.value = "";
    },
// Hide input fields per discussion or brainstorm
    "click .switch": function (){
    var z =$( ".switch input:checked" ).val();
    
    // hide double_form_field 
    if(z == "brainstorm"){
    $(".double_form_field").hide();
    $("#form_input_topic").attr("placeholder", "Onderwerp");
      }   
    if(z == "discussion"){
    $(".double_form_field").show();
     $("#form_input_topic").attr("placeholder", "Stelling");
      }
    }


  });

  Template.sessie.events({
    "click .toggle-checked": function () {
      // Set the checked property to the opposite of its current value
      Sessies.update(this._id, {
        $set: {checked: ! this.checked}
      });
    },

    "click .delete": function () {
    var message = "Are you sure you want to delete?";
      if (  confirm(message)) {  Sessies.remove(this._id);};
          }
  });


  function makeid()
      {    var text = "";
          var possible = "abcdefghijklmnopqrstuvwxyz0123456789";
          for( var i=0; i < 6; i++ )
              text += possible.charAt(Math.floor(Math.random() * possible.length));
          return text;}

}


Meteor.methods({
  // niet in gebruik
  addSessie: function (text, random) {
    // Make sure the user is logged in before inserting a task
    if (! Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }

    Sessies.insert({
      text: text,
      random: random,
      createdAt: new Date()
      // owner: Meteor.userId(),
      // username: Meteor.user().username
    });
  },
  deleteTask: function (taskId) {
    Sessies.remove(taskId);
  },
  setChecked: function (taskId, setChecked) {
    Sessies.update(taskId, { $set: { checked: setChecked} });
  }
});