DBfields = new Meteor.Collection('dbfield');
Positions = new Meteor.Collection('positions');
FieldItems = new Meteor.Collection('fielditems');
Sessies = new Mongo.Collection("sessies");
Votes = new Mongo.Collection("votes");
Persons = new Mongo.Collection("persons");
Logs = new Mongo.Collection("logs");

Spellen = new Mongo.Collection("spellen");
Deelnemers = new Mongo.Collection("deelnemers");

Points = new Meteor.Collection('pointsCollection');

YourFileCollection = new FS.Collection("yourFileCollection", {
    stores: [new FS.Store.FileSystem("yourFileCollection", {path: "~/public/images"})]
});




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
    Meteor.publish("logs", function () {
      return Logs.find();
    });    
    Meteor.publish("points", function () {
      return Points.find();
    });
    Meteor.publish("fileUploads", function () {
    	console.log("publishing fileUploads");
      return YourFileCollection.find();
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

    YourFileCollection.allow({
      insert: function (userId, doc) {
          return true;
      },
      update: function (userId, doc) {
          return true;
      },
      remove: function (userId, doc) {
          return true;
      },
      download: function (userId, doc) {
          return true;
      }
    });

}

if (Meteor.isClient) {
	Meteor.subscribe("user_linkedin_data");


}
