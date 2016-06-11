DBfields = new Meteor.Collection('dbfield');
Positions = new Meteor.Collection('positions');
FieldItems = new Meteor.Collection('fielditems');
Sessies = new Mongo.Collection("sessies");
Votes = new Mongo.Collection("votes");
Persons = new Mongo.Collection("persons");

Spellen = new Mongo.Collection("spellen");
Deelnemers = new Mongo.Collection("deelnemers");

if (Meteor.isServer) {
    Meteor.publish("users", function(){
      return Meteor.users.find({});
    })
	 Meteor.publish("sessies", function () {
    	return Sessies.find();
  	});
  	Meteor.publish("positions", function () {
    	return Positions.find();
  	});
  	Meteor.publish("dbfields", function () {
    	return DBfields.find();
  	});
  	Meteor.publish("fielditems", function () {
    	return FieldItems.find();
  	});
  	Meteor.publish("votes", function () {
    	return Votes.find();
  	});
  	Meteor.publish("persons", function () {
    	return Persons.find();
  	});  	
  	Meteor.publish("spellen", function () {
    	return Spellen.find();
  	});  	
  	Meteor.publish("deelnemers", function () {
    	return Deelnemers.find();
  	});


    Deelnemers.allow({
      insert: function (userId, doc) {
        return !!userId;
      },
      update: function (userId, doc) {
        return !!userId;
      },
      remove: function(userId, doc){
        return !!userId;
      }
    }); 

    Spellen.allow({
      insert: function (userId, doc) {
        return !!userId;
      }
    });


	Meteor.publish("user_linkedin_data", function(){
		var projectie = { 
			"profile": 1, 
			'services.linkedin.firstName': 1, 
		    'services.linkedin.lastName': 1,
		    'services.linkedin.pictureUrl': 1
		};
		return Meteor.users.find({}, { fields: projectie });
	});

	// Accounts.addAutopublishFields({
	//   forLoggedInUser: ['services.linkedin'],
	//   forOtherUsers: [
	//     'services.linkedin.firstName', 
	//     'services.linkedin.lastName',
	//     'services.linkedin.pictureUrl'
	//   ]
	// });
}

if (Meteor.isClient) {
	Meteor.subscribe("user_linkedin_data");


}
