  Meteor.methods({
    addPlayer: function(userId, spelcode){
      Deelnemers.insert({
        spelerID: userId,
        speleremail: Meteor.user().emails[0].address,
        spelcode: spelcode,
        createdAt: new Date(), // current time
        x: 0,
        y: 0,
        z: 0
      });
    },
    updateGyro: function(id, newx, newy, newz){

      Deelnemers.update(id, {
        $set: {
          x: newx,
          y: newy,
          z: newz

        }
      });
    }

  });