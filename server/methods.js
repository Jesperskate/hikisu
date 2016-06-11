  Meteor.methods({
    addPlayer: function(userEmail, spelcode){
      Deelnemers.insert({
        speleremail: userEmail,
        spelcode: spelcode,
        createdAt: new Date(), // current time
        x: 0,
        y: 0,
        z: 0
      });
    },
    removePlayer:function(userId){
      // console.log('MeteorUserId: '+ MeteorUserId);
      //console.log('this.spelerID: '+ this.spelerID);

      // if(this.spelerID === MeteorUserId){
        Deelnemers.remove(userId);
      // }
      // else { 
      //   return false;
      // }
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