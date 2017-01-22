Template.position.events ({
  'click .tablename': function (evt, tmpl) {

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
      Session.set('editing_tablename',this._id);
  },
  'click .addfield':function(evt,tmpl){

     if (! Meteor.userId()) {
      
      var message = "You have to <a href='/login'>login</a> to add comments";
      FlashMessages.sendError(message);
      throw new Meteor.Error("not-authorized");
    }
      evt.preventDefault();
      evt.stopPropagation();
    DBfields.insert({
      name:'Type here',
      tableid:this._id,
      createdAt: new Date(),
      owner: Meteor.userId(),
      username: Meteor.user().emails[0].address
    });
  }
  ,
  'click .vote':function(evt,tmpl){

     if (! Meteor.userId()) {
      
      var message = "You have to <a href='/login'>login</a> to vote ";
      FlashMessages.sendError(message);
      throw new Meteor.Error("not-authorized");
    }
    var x =Meteor.userId();
    var sessieID = Router.current().params._id ;
      var help = Votes.find({$and:[{user:x},{sessionid:sessieID}]});

   if( help.count() >= 9){
      var message = "You reached your limit of votes";
      FlashMessages.sendError(message);
      throw new Meteor.Error("not-authorized");
   }
      evt.preventDefault();
      evt.stopPropagation();
    Votes.insert({
      cardid:this._id,
      amount:1,
      votedAt: new Date(),
      user: Meteor.userId(),
      sessionid: Router.current().params._id
    });
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
      throw new Meteor.Error("not-authorized");
    }

      Positions.remove({_id:this._id});

  },

  'keyup .tablename':function(evt,tmpl){
    evt.stopPropagation();
    evt.preventDefault();
    if(evt.which === 13){
      Positions.update(this._id,{$set:{name:tmpl.find('.tablename').value}});
      Session.set('editing_tablename',null);
    }
  },
  'click .info-btn':function(){
    $('.info-mail').toggle();
  }

});
Template.position.rendered = function () {
  $('.modal-p').draggable({
    handle:'.modal-header',
     snap: true, //snap to all other draggable elements 
    containment: ".schema",
    stop:function(evt,ui){
      var w = window.innerWidth;
      var h = window.innerHeight;
      var left = ui.position.left;
      var top = ui.position.top;

      Positions.update($(this).attr('id'),{
        $set:{
          left:left+ 'px',
          top: top + 'px',
          percentLeft: (((left)/w)*100)+'%',
          percentTop:(((top)/h)*100)+'%',
        }});

    }
  })
};

Template.position.helpers({
editing_tablename: function(){
  return Session.equals('editing_tablename',this._id)
},
dbfields: function(){
  return DBfields.find({tableid:this._id});
}
,
votes:function() {
   var help = Votes.find({cardid:this._id});
   return help.count();

},
uservotes:function() {
   var help = Votes.find({user:Meteor.userId()});
   return help.count();

}

});
