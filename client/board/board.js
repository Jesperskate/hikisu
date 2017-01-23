
  Meteor.subscribe("spellen");
  Meteor.subscribe("deelnemers");
  Meteor.subscribe("logs");
  Meteor.subscribe("fileUploads");

Meteor.startup(function(){
 $(window).bind('beforeunload', function() {

  });


});

Template.registerHelper('extendContext', function(key, value) {
  var result = _.clone(this);
  result[key] = value;
  return result;
});

  // timer funtion
  var clock = 0;
  var end = 100;
  var timeLeft = function() {
    if ((clock => 0) && (clock < end)) {
      clock++;
      Session.set("time", clock);

    } 
  else {   
      return Meteor.clearInterval(interval);
    }
  };
  var interval = Meteor.setInterval(timeLeft, 1000);

  
// Open sessie by get var from url
  Router.route('/b/:_id', function () {
    this.render('board', {
    });
  });

  Template.board.onRendered(function () {

  });

  Template.board.rendered = function(){
        $(".deelnemerbox").popover({
        html: true,
        title: 'New Letter',
        content: function() {
            return 'xxx';
        }
    });
  }
    
  Template.board.events ({
    'click #newBoardBtn': function(){
      Meteor.popUp("addBoard");
    },      
    'click #overviewBoard': function(){
      Meteor.popUp("overview");
    },  
    'click #newPlayerBtn': function(){
      Meteor.popUp("addParticipant");
    },       
    'click #newNote': function(){
      Meteor.popUp("addNote");
    },    
    'click #removePlayer': function(){
      Meteor.call('removePlayer',this._id);
    },    
    'click #removeAll': function(){
      var find = Deelnemers.find({spelcode: Router.current().params._id}, {_id:1}).fetch();
      console.log(find[0]._id);
      for (var i = 0; i < find.length; i++) {
        Meteor.call('removePlayer',find[i]._id);
      };
    },
    'click .deelnemerbox': function(){
      // sAlert.success('Your message'); cool
    }
    
  });  

// Overview Pop Up:
Template.overview.helpers ({
  totalLogs: function(){
    var sessieCode = Router.current().params._id;
    return Logs.find({spelcode: sessieCode}).count();
  },
  totalParticipants: function(){
    var sessieCode = Router.current().params._id;
    return Deelnemers.find({spelcode: sessieCode}).count();
  }

});

Template.overview.events({

});

Template.addNote.helpers ({
  theFiles: function () {
    var sessieCode = Router.current().params._id;
    return YourFileCollection.find({spelcode: sessieCode},{sort: {uploadedAt: -1}, limit:1});
  },
  oneFile: function(){
    var sessieCode = Router.current().params._id;
    return YourFileCollection.findOne({spelcode: sessieCode});
  }
});

Template.addNote.events ({
  'click #deleteFileButton ': function (event) {
        console.log("deleteFile button ", this);
        YourFileCollection.remove({_id:this._id});
        
      },
  'change .your-upload-class': function (event, template) {
    console.log("uploading...")
    FS.Utility.eachFile(event, function (file) {
      console.log("each file...");
      var yourFile = new FS.File(file);
      var user = Meteor.userId();
      console.log('user = '+user);

      if (user === null) {
        if ((Session.get('spelernaam') === null)||(Session.get('spelernaam')=== undefined)) {
          user = 'noproblemo';
        }else{
          user = Session.get('spelernaam');
        }        
      }

      console.log('specific url '+yourFile.fileURL);
      var sessieCode = Router.current().params._id;
      yourFile.creatorId = user; // meteor user ID
      yourFile.spelcode = sessieCode;

      YourFileCollection.insert(yourFile, function (err, fileObj) {
        console.log("callback for the insert, err: ", err);
        if (!err) {
          console.log("inserted without error");
        }
        else {
          console.log("there was an error", err);
        }
      }
      );
      
    });
    $('.loaded-img').show();
  },
  'submit': function(event, template) {
      event.preventDefault();
      var noteTitle = event.target.note.value;
      var fileInput = event.target.file.value;
      var sessieCode = Router.current().params._id;
      var filepath = null;
      
      //if input file is used, find path of last added picture
      if (fileInput) {
        var filepath = YourFileCollection.findOne({spelcode: sessieCode},{sort: {uploadedAt: -1}}).url();
      };
      
      if ((Meteor.userId() === undefined)||(Meteor.userId() === null)) {
        var owner = Session.get('spelernaam');
      }
      else{ 
        var owner = Meteor.user().emails[0].address;
      } 
      // logs is collection of notes/items
      Logs.insert({
        content: noteTitle,
        type: 'note',
        spelcode: sessieCode,
        owner: owner,
        fileURL: filepath,
        createdAt: new Date() // current time
      });
      
      //empty form fields
      event.target.note.value = "";

      Meteor.popDown('addNote');
      Router.go('/b/'+sessieCode);
      // FlashMessages.sendSuccess("Item added to the meeting");
    }
  });


Template.addBoard.events ({
  'submit': function(event, template) {
      event.preventDefault();
      var typespel = 1;
      var spelnaam = event.target.spelnaam.value;
      var duration = event.target.duration.value;
      var spelcode = Math.floor((Math.random() * 10000) + 1);

      if (!spelnaam || spelnaam === undefined) {
        console.log('Naam is required');
         $('#spelnaam').css('border', '1px solid red'); 
        return false;
      }

        Spellen.insert({
          naam: spelnaam,
          speltype: typespel,
          spelcode: spelcode,
          duration: duration,
          createdAt: new Date() // current time
        });
    
      event.target.spelnaam.value = "";

       // Add logged user to the new board, not working yet. It does insert in Deelnemer collection
      if(Meteor.userId()){
        var x = Meteor.user().emails[0].address;
        console.log('User is logged in as ',x);
        Meteor.call('addPlayer', x.slice(0,6).toString(), spelcode,
          function(error, result){
              if(error){
                  console.log(error);
              } else {
                  console.log('Added deelnemer._id: '+result);

                  Session.setPersistent('spelerid', result);
                  Session.setPersistent('spelernaam', x.slice(0,6).toString());
              }
          }); 
      }else{
        Meteor.call('addPlayer', 'Host', spelcode,
          function(error, result){
              if(error){
                  console.log(error);
              } else {
                  console.log('Added deelnemer._id: '+result);
                  Session.setPersistent('spelerid', result);
                  Session.setPersistent('spelernaam', 'Host');
              }
          });
      }

      Meteor.popDown('addBoard');
      Router.go('/b/'+spelcode);
    
    }
  });

Template.addParticipant.events ({
  'submit': function(event, template) {
      event.preventDefault();
      var typespel = 1;
      var spelernaam = event.target.spelernaam.value;
      var spelcode = event.target.spelcode.value;

      if (!spelernaam || spelernaam === undefined) {
        console.log('Name is required');
         $('#spelernaam').css('border', '2px solid red'); 
        return false;
      }     
      if (!spelcode || spelcode === undefined) {
        console.log('Code is required');
         $('#spelcode').css('border', '2px solid red'); 
        return false;
      }
      var checkExist = Deelnemers.findOne({'spelernaam': spelernaam, 'spelcode': spelcode});

      if (checkExist) {
          FlashMessages.sendSuccess('You are already in the meeting ');
          Meteor.popDown('addPlayer');
          Router.go('/b/'+spelcode);
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

        var currentParticipants = Deelnemers.find({spelcode: spelcode.toString()}).count();
        // selectColor by number 
        Session.setPersistent('color', selectColor(currentParticipants));
        
        console.log('Color session set:'+ Session.get('color'));


        Meteor.popDown('addParticipant');
        Router.go('/b/'+spelcode);
        FlashMessages.sendSuccess("Adding participant done");
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

//Load collections into discuss template
Template.board.helpers({
    currentCod: function(){
      return Router.current().params._id;
    },
    boarddata: function(){
      var sessieCodeInt = parseInt(Router.current().params._id); //find moet met Int gedaan worden
      var data = Spellen.findOne({spelcode: sessieCodeInt});
      return data;
    },
    logs: function() {
      var sessieCode = Router.current().params._id;
      // get all logs with sessieID
      return Logs.find({spelcode: sessieCode}, {sort: {createdAt: -1}});
    },
    progress: function(){
      return Session.get("time");
    },
    deelnemers: function() {
      var sessieCode = Router.current().params._id;
      // get all positions with sessieID
      return Deelnemers.find({spelcode: sessieCode});
    },
    color: function(index){
      console.log('index of user is '+index);
      return selectColor(index);
    },
    displayBox: function(input) {
          return 'show';
      },
    displayScore: function(score) {
        if (score < 101){
          return score+'%';
        }else{
          return '100%';
        }
      }

  });

selectColor = function (input) {
   switch(input) {
          case 0:
             var col ='#0051ba'; 
             return col;
              break;
          case 1:
             var col ='#c41e3a'; 
             return col;
              break;          
          case 2:
             var col ='#007a3d'; 
             return col;
              break;
          case 3:
             var col = '#2b2b28'; 
             return col;
              break;
          case 4:
             var col ='#fca311'; 
             return col;
              break;          
          case 5:
             var col ='#0051ba'; 
             return col;
              break;
          case 6:
             var col ='#c41e3a'; 
             return col;
              break;          
          case 7:
             var col ='#007a3d'; 
             return col;
              break;
          case 8:
             var col = '#2b2b28'; 
             return col;
              break;
          case 9:
             var col ='#fca311'; 
             return col;
              break;
          default:
             var col ='grey'; 
             return col;
      }  
    }


