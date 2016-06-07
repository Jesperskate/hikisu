if(Meteor.isClient){

  Meteor.subscribe("spellen");
  Meteor.subscribe("deelnemers");

// Open sessie by get var from url
  Router.route('/game/:_id', function () {
    this.render('Game', {
      data: function () {
         var currentCode = this.params._id;  
         console.log(currentCode);
         return Sessies.findOne({random: currentCode});     
      }
    });
  });

// dit is voor de scroll fix in de frontpage met slide out menu
Template.game.onRendered(function () {
   $( "#content" ).css("height", "100%");
});
  
Template.game.events ({
  'click #newGameBtn': function(){
    Meteor.popUp("addGame");

  },  
  'click #newPlayerBtn': function(){
    Meteor.popUp("addPlayer");

  }
  });  
Template.addGame.events ({
  'submit': function(event, template) {
      event.preventDefault();
      var typespel = 1;
      var spelnaam = event.target.spelnaam.value;
      var spelcode = Math.floor((Math.random() * 10000) + 1);

      if (!spelnaam || spelnaam === undefined) {
        console.log('Naam is vereist');
         $('#spelnaam').css('border', '1px solid red'); 
        return false;
      }


        Spellen.insert({
          naam: spelnaam,
          speltype: typespel,
          spelcode: spelcode,
          createdAt: new Date() // current time
        });



      console.log("Spel aangemaakt ");

       
        event.target.spelnaam.value = "";


          Meteor.popDown('addGame');
          Router.go('/game/'+spelcode);

          FlashMessages.sendSuccess("Nieuw spel gelukt");

    }
  });

Template.addPlayer.events ({
  'submit': function(event, template) {
      event.preventDefault();
      var typespel = 1;
      var spelerID = Meteor.userId();
      console.log('spelerID: '+spelerID);
      var speleremail = Meteor.user().emails[0].address;
      var spelcode = event.target.spelcode.value;

      if (!spelcode || spelcode === undefined) {
        console.log('Code is vereist');
         $('#spelcode').css('border', '1px solid red'); 
        return false;
      }


        Deelnemers.insert({
          
          spelerID: spelerID,
          speleremail: speleremail,
          spelcode: spelcode,
          createdAt: new Date(), // current time
          x: 0,
          y: 0,
          z: 0
        });



      console.log("Deelnemer toegevoegd ");

       
        event.target.spelcode.value = "";


          Meteor.popDown('addPlayer');
          Router.go('/game/'+spelcode);

          FlashMessages.sendSuccess("Nieuwe deelnemer toevoegen gelukt");

    }
  });

  //Menu events
Template.layout.events({
 
});

//Load collections into game template
Template.game.helpers({
    currentCod: function(){

        return Router.current().params._id;
      },
    deelnemers: function() {
        var sessieCode = Router.current().params._id;
        // get all positions with sessieID
          return Deelnemers.find({spelcode: sessieCode});
    },
});




}//end Meteor isclient 

if(Meteor.isServer){

}