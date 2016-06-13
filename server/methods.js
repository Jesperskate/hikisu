  Meteor.methods({
    addPlayer: function(userName, spelcode){
      var id = Deelnemers.insert({
        spelernaam: userName,
        spelcode: spelcode,
        createdAt: new Date(), // current time
        x: 0,
        y: 0,
        z: 0,
        accelero:0,
        points:0

      });

      return id; //[BUG!]
    },
    givePoints: function(userId, currentPoints){
      var currentPoints = Deelnemers.findOne(userId).points;

      Deelnemers.update(userId, {$set: {
        points:currentPoints+1
        }
      });


    },    
    clearPoints: function(userId){ 

      Deelnemers.update(userId, {$set: {
        points:0
        }
      });


    },
    removePlayer:function(userId){

        Deelnemers.remove(userId);
      
        // var foundname = Deelnemers.findOne({ _id: userId}).spelernaam;
        // console.log(foundname+' is foundname');
        // if (foundname === spelernaam) {
        //   Deelnemers.remove(userId);
        // }else{
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
    },    
    updateAccelero: function(id, accelero){

      Deelnemers.update(id, {
        $set: {
          accelero: accelero

        }
      });
    }

  });