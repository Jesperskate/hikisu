if(Meteor.isClient){
    // Subscribe to all sessies
    Meteor.subscribe("sessies");
    Meteor.subscribe("positions");
    Meteor.subscribe("dbfields");
    Meteor.subscribe("fielditems"); 
    Meteor.subscribe("persons"); 


// Open sessie by get var from url
  Router.route('/home/:_id', function () {
    this.render('Home', {
      data: function () {
         var currentCode = this.params._id;  
         return Sessies.findOne({random: currentCode});     
      }
    });
  });


  
Template.home.events ({
  'click #join-session': function (evt, tmpl) {

      var w = window.innerWidth;
      var h = window.innerHeight;
      evt.preventDefault();
      evt.stopPropagation();
      console.log('Person add clicked');
     if (Persons.findOne({usermail:Meteor.user().email, code: Router.current().params._id})){
        var message = "You have to <a href='/login'>login</a> to post cards";
        FlashMessages.sendError(message);
        throw new Meteor.Error("not-authorized");
     }

        var id = Persons.insert({
          name:'Person ' ,
          code:Router.current().params._id,
          percentLeft: '50%',
          percentTop:'50%',
          createdAt: new Date(),
          owner: Meteor.userId(),
          //usermail:Meteor.user().profile.emailAddress  <-- was het eerst
          // of het is dit:  usermail: Meteor.user().emails[0].address;
          usermail: Meteor.user().email,
          picUrl: Meteor.user().services.linkedin.pictureUrl
        });
        Session.set(
          'editing_table',id
          );
    },
      'click #leave-session': function (evt, tmpl) {
     if (! Meteor.userId()) {
      var message = "You have to <a href='/login'>login</a> to delete cards";
      FlashMessages.sendError(message);
      throw new Meteor.Error("not-authorized");
    }
    console.log('leave session clicked');

    Persons.remove({_id:Persons.findOne({usermail:Meteor.user().email, code: Router.current().params._id})._id});
  
    },
  'click .open-desc': function(){
    $('.axis-card-info ').css({"height": "200px", "opacity": "1", "padding-top":"20px", "padding-bottom":"20px"});
      },
  'click .close-desc': function(){
    $('.axis-card-info ').css({"height": "0px", "opacity": "0", "padding-top":"0px", "padding-bottom":"0px"});
      },

  'dblclick .schema': function (evt, tmpl) {
       if (! Meteor.userId()) {
        var message = "You have to <a href='/login'>login</a> to post cards";
        FlashMessages.sendError(message);
        throw new Meteor.Error("not-authorized");
      }
      var w = window.innerWidth;
      var h = window.innerHeight;
      evt.preventDefault();
      evt.stopPropagation();
      if(evt.target.className === 'container-fluid schema'){
        var id = Positions.insert({
          name:'Type here',
          code:Router.current().params._id,
          left:(evt.pageX + 280) + 'px',
          top:(evt.pageY) + 'px',
          percentLeft: (((evt.pageX + 280)/w)*100)+'%',
          percentTop:(((evt.pageY)/h)*100)+'%',
          createdAt: new Date(),
          owner: Meteor.userId(),
          username: Meteor.user().email
        });
        Session.set(
          'editing_table',id
          );
      }
    },

  'click .topic-h3': function (evt, tmpl) {
     if (! Meteor.userId()) {
        var message = "You have no privileges to edit the session";
        FlashMessages.sendError(message);
        throw new Meteor.Error("not-authorized");
      }
     if ( Meteor.userId() !== this.owner) { 
      var message = "You have to be session owner to edit the topic.";
      FlashMessages.sendError(message);
      throw new Meteor.Error("not-authorized");
      }
      Session.set( 'editing_session', Router.current().params._id);
    },
     'keyup .axis-card':function(evt,tmpl){
      evt.stopPropagation();
      evt.preventDefault();
      if(evt.which === 13){
        Sessies.update(this._id,{$set:{
          text:tmpl.find('.session-topic').value
          // color: tmpl.find('.demo1').value
      }});
        Session.set('editing_session',null);
      }
    }
  });

  //Menu events
Template.layout.events({
  'click .addFieldItem': function (evt, tmpl) {
   var currentCode = Router.current().params._id;
   var sessieOwner = Sessies.findOne({random: currentCode}).owner;

    if ( Meteor.userId() !== sessieOwner) { 
      var message = "You have to be the host of this session to add field cards.";
      FlashMessages.sendError(message);
      throw new Meteor.Error("not-authorized");
    }
      var w = window.innerWidth;
      var h = window.innerHeight;
      evt.preventDefault();
      evt.stopPropagation();

      var id = FieldItems.insert({
        name:'Topic',
        code:Router.current().params._id,
        left:(300 + 280) + 'px',
        top:(200) + 'px',
        percentLeft: (((300 + 280)/w)*100)+'%',
        percentTop:(((200)/h)*100)+'%',
        color:'#3FD697',
        createdAt: new Date(),
        owner: Meteor.userId(),
        username: Meteor.user().email
      });
      Session.set(
        'editing_table',id
        );
  }
});

//Load collections into home template
Template.home.helpers({
    positions: function() {
        var sessieCode = Router.current().params._id;
        // get all positions with sessieID
          return Positions.find({code: sessieCode});
    },
    items: function(){
          var sessieCode = Router.current().params._id;
        // get all positions with sessieID
          return FieldItems.find({code: sessieCode});
    },
    persons:function(){
        var sessieCode = Router.current().params._id;
        // get all positions with sessieID
        return Persons.find({code: sessieCode});
    },
    editing_session: function(){
      return Session.equals('editing_session', Router.current().params._id)
    }
});
//Edit persion session action? Don't know whats exactly for
Template.person.helpers({
    editing_person: function() {
          return Session.equals('editing_person',this._id);
    }
  });

Template.fielditem.helpers({
editing_tablename: function() {
      return Session.equals('editing_tablename',this._id);
  }
});

Template.fielditem.events ({
  'click .tablename': function (evt, tmpl) {

     if (! Meteor.userId()) {
      var message = "You have to <a href='/login'>login</a> to edit cards";
      FlashMessages.sendError(message);
      throw new Meteor.Error("not-authorized");
    }
    else{
      if(this.owner == Meteor.userId()){  
        evt.stopPropagation();
        evt.preventDefault();
        Session.set('editing_tablename',this._id);
      }
      else{
      var message = "You can't edit this card.";
      FlashMessages.sendError(message);
      throw new Meteor.Error("not-authorized");
        }
      }
  },
  
  'click .close':function(evt,tmpl){
     if (! Meteor.userId()) {
      var message = "You have to <a href='/login'>login</a> to delete cards";
      FlashMessages.sendError(message);
      throw new Meteor.Error("not-authorized");
    }
     if(this.owner != Meteor.userId()){ 
      var message = "You can only delete your own cards";
      FlashMessages.sendError(message);
      throw new Meteor.Error("not-authorized");}

      FieldItems.remove({_id:this._id});
  },
  'keyup .tablename':function(evt,tmpl){
    evt.stopPropagation();
    evt.preventDefault();
    if(evt.which === 13){
      FieldItems.update(this._id,{$set:{
        name:tmpl.find('.tablename').value
        // color: tmpl.find('.demo1').value
    }});
      Session.set('editing_tablename',null);
    }
  }
  ,
    'keyup .tablename-color':function(evt,tmpl){

          if (! Meteor.userId()) {
      var message = "You have to <a href='/login'>login</a> to edit cards";
      FlashMessages.sendError(message);
      throw new Meteor.Error("not-authorized");
    }
     if(this.owner != Meteor.userId()){ 
      var message = "You can only edit your own cards";
      FlashMessages.sendError(message);
      throw new Meteor.Error("not-authorized");}

    evt.stopPropagation();
    evt.preventDefault();
    if(evt.which === 13){
      FieldItems.update(this._id,{$set:{
       
        color: tmpl.find('.demo1').value
    }});
      Session.set('editing_tablename',null);
    }
  }


});
Template.fielditem.rendered = function () {
  $('.modal').draggable({
    handle:'.modal-header',
    containment: ".schema",
    stop:function(evt,ui){
      var w = window.innerWidth;
      var h = window.innerHeight;
      var left = ui.position.left;
      var top = ui.position.top;
      console.log('Stopped dragging fielditem');
      FieldItems.update($(this).attr('id'),{
        $set:{
          left:left + 'px',
          top:top + 'px',
          percentLeft: (((left)/w)*100)+'%',
          percentTop:(((top)/h)*100)+'%',
        }});
    }
  });
     var currentCode = Router.current().params._id;
   var sessieOwner = Sessies.findOne({random: currentCode}).owner ;
     if ( Meteor.userId() == sessieOwner) {
        $('.demo1').css('display','block');   
        $('.demo1').colorpicker();
      }
};

Template.person.rendered = function () {
  $('.person-p').draggable({
    handle:'.person-header',
    containment: ".schema",
    stop:function(evt,ui){
      var w = window.innerWidth;
      var h = window.innerHeight;
      var left = ui.position.left;
      var top = ui.position.top;
      console.log('Stopped dragging Person Item');
      Persons.update($(this).attr('id'),{
        $set:{
          percentLeft: (((left)/w)*100)+'%',
          percentTop:(((top)/h)*100)+'%',
        }});
    }
  });

};

}//end Meteor isclient 

if(Meteor.isServer){

}