
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

    },    
    'click #joinAsHost': function(){

      // Deelnemers.insert({
      //     spelerID: spelerID,
      //     speleremail: speleremail,
      //     spelcode: spelcode,
      //     createdAt: new Date(), // current time
      //     x: 0,
      //     y: 0,
      //     z: 0
      //   });
      

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

      var spelcodeStr =  spelcode.toString();

      console.log("Spel aangemaakt en spelcodeStr: "+spelcodeStr);


      Deelnemers.insert({
          spelerID: Meteor.userId(),
          speleremail: Meteor.user().emails[0].address,
          spelcode: spelcodeStr,
          createdAt: new Date(), // current time
          x: 0,
          y: 0,
          z: 0
        });

       
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

       Meteor.call('addPlayer', Meteor.userId(), spelcode);
        // Deelnemers.insert({
          
        //   spelerID: spelerID,
        //   speleremail: speleremail,
        //   spelcode: spelcode,
        //   createdAt: new Date(), // current time
        //   x: 0,
        //   y: 0,
        //   z: 0
        // });



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



  // device orientation code. Always running?
 if (window.DeviceOrientationEvent) {
      // Our browser supports DeviceOrientation
     window.addEventListener("deviceorientation", function(event) {
      if(event.alpha !== null){
       console.log( 'test '+ event.alpha, event.beta, event.gamma);

       var idFocus = '#'+Meteor.userId();
       var idDeelnemer = Deelnemers.findOne({spelerID: Meteor.userId(), spelcode: Router.current().params._id}, {fields: {'_id':1}})._id;
       console.log('idDeelnemer: '+idDeelnemer);

       var x = event.beta;
       var y = event.gamma;
       var z = event.alpha;

        // if beta / alfa / gamma > 30 set colort to..
        if (event.alpha > 30) {
          console.log('alpha is groter dan 30'+idFocus);
           Meteor.call('updateGyro', idDeelnemer , x, y, z); 
        };      
        if (event.beta > 30) {
          console.log('beta is groter dan 30');
          Meteor.call('updateGyro', idDeelnemer , x, y, z); 
        };      
        if (event.gamma > 30) {
          console.log('gamma is groter dan 30');
          Meteor.call('updateGyro', idDeelnemer , x, y, z); 
        };
      }
      else{
        console.log('event.alpha is null');
        return false;
      }
        // get object of owner...? via #id or 
      }, true);
  }
  else{
      console.log('deviceorientation not supported in this browser')
  }


