
  Meteor.subscribe("spellen");
  Meteor.subscribe("deelnemers");

  
// Open sessie by get var from url
  Router.route('/game/:_id', function () {
    this.render('game', {
      //niks nodig zover
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
    'click #removePlayer': function(){
      Meteor.call('removePlayer',this._id);

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
      
      var spelernaam = event.target.spelernaam.value;
      var spelcode = event.target.spelcode.value;



      if (!spelcode || spelcode === undefined) {
        console.log('Code is vereist');
         $('#spelcode').css('border', '1px solid red'); 
        return false;
      }
      var checkExist = Deelnemers.findOne({'spelernaam': spelernaam, 'spelcode': spelcode});

      if (checkExist) {
          FlashMessages.sendSuccess('Deelnemers is al in spel, daarom sturen we je hierheen ;) ');
          Meteor.popDown('addPlayer');
          Router.go('/game/'+spelcode);
          return false;

      }
      else {
        Meteor.call('addPlayer', spelernaam, spelcode,
          function(error, result){
              if(error){
                  console.log(error);
              } else {
                  console.log('Added deelnemer._id: '+result);
                  Session.setPersistent('spelerid', result);
              }
          });        
      }
       
        event.target.spelcode.value = ""; //clear input field
        Session.setPersistent("spelernaam", spelernaam);
        Meteor.popDown('addPlayer');
        Router.go('/game/'+spelcode);
        FlashMessages.sendSuccess("Nieuwe deelnemer toevoegen gelukt");

    }
  });
Template.addPlayer.helpers({
  currentSpelerNaam: function(){
    if (Session.get('spelernaam')) {
      return Session.get('spelernaam');
    }
    else{
      return false;
    }
  }

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
    display: function (y) {
      if ( y > 150 && y < 210){
        return 'none';
      }
      else {
        return 'block';
      }
    }      
});

// alle bewegings detectie code
if (window.DeviceOrientationEvent) {
 console.log("DeviceOrientation is supported");

   window.addEventListener("deviceorientation", function(event) {
    // handmatige check of deviceorientation mogelijk is:
    if (event.alpha !== null || event.beta !== null || event.gamma !== null) {
    
       console.log(event.alpha, event.beta, event.gamma);

    
       var idDeelnemer = Session.get('spelerid');
       var idFocus = '#'+Meteor.userId();


       var x = event.beta.toFixed(0); // geen decimalen
       var y = event.gamma.toFixed(0);
       var z = event.alpha.toFixed(0);

        // if beta / alfa / gamma > 30 set color to..
        if (event.alpha > 30) {
          console.log('alpha is groter dan 30');
           Meteor.call('updateGyro', idDeelnemer , x, y, z); 
        };      
        if (event.beta > 30) {
          console.log('beta is groter dan 30');
          Meteor.call('updateGyro', idDeelnemer , x, y, z); 
        };      
        if (event.gamma >= 180) {
          console.log('gamma is groter dan 180');
          Meteor.call('updateGyro', idDeelnemer , x, y, z); 

        };
      } else{
        return false;
      }
    }, true);

  // >>>>>>>>>> Accelerometer <<<<<<<<<
    window.addEventListener("devicemotion", function(event) {
        console.log("Accelerometer: "
          + event.accelerationIncludingGravity.x + ", "
          + event.accelerationIncludingGravity.y + ", "
          + event.accelerationIncludingGravity.z
        );
        console.log('Sessie spelernaam: '+ Session.get('spelernaam'));
        if (Session.get('spelernaam') && Router.current().params._id) {
          console.log(Session.get('spelernaam'), Router.current().params._id);
          // var idDeelnemer = Deelnemers.findOne({'spelernaam': Session.get('spelernaam'), 'spelcode': Router.current().params._id}, {fields: {'_id':1}})._id;
          Meteor.call('updateAccelero', Session.get('spelerid'), event.accelerationIncludingGravity.x); 
        }else{
          console.log('Geen speler gevonden. Er mist een sessie of een spelcode')
        }
      }
    );
    
  }
  if (!window.DeviceOrientationEvent) {
       console.log('deviceorientation not supported in this browser')
  }







// Leave game function

Meteor.startup(function(){
    $(window).bind('beforeunload', function() {
        // closingWindow();
        // var idDeelnemer = Deelnemers.findOne({spelernaam: Session.get('spelernaam'), spelcode: Router.current().params._id}, {fields: {'_id':1}})._id;
              
        //     console.log('-------------------------------------------'+Session.get('spelernaam')+'-----'+idDeelnemer);

        //         Meteor.call('removePlayer', idDeelnemer);

        // have to return null, unless you want a chrome popup alert
        return null;
        //return 'Are you sure you want to leave?';
    });
});
closingWindow = function(){
    console.log('closingWindow');

    // alert('bye');
}