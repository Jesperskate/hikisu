
Template.dbfield.firstvar = function () {
  return "First Var";
}
Template.dbfield.events({
  'click .comment-box':function(evt,tmpl){
    evt.stopPropagation();
    evt.preventDefault();
    Session.set('editing_field',this._id);
  },
  'keyup .efield':function(evt,tmpl){
    evt.stopPropagation();
    evt.preventDefault();
    var fieldname = tmpl.find('.efield').value;
    if(fieldname && evt.which == 13){
      DBfields.update(this._id,{$set:{name:fieldname}});
      Session.set('editing_field',null);
    }
  },
      'click .comment-remove':function(evt,tmpl){

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

      DBfields.remove({_id:this._id});
  }
});

Template.dbfield.helpers({
editing_field: function(){
  return Session.equals('editing_field',this._id);
}

});
