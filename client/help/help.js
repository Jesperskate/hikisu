Session.set('authCode',null);
Session.set('profile',null);
Template.help.events({

});



Template.help.helpers({
    profilePictureUrl: function() {
        return Meteor.user().services.linkedin.pictureUrl;
    }
});