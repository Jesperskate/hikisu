  Meteor.methods({
    // General methods

    // Game methods
    newGame: function(spelnaam, spelcode){
      var id = Spellen.insert({
          naam: spelnaam,
          speltype: 1,
          spelcode: spelcode,
          createdAt: new Date() // current time
        });
      console.log("Method is called: newGame");

      return id;

    },   
    addPlayer: function(userName, spelcode){
      var id = Deelnemers.insert({
        spelernaam: userName,
        spelcode: spelcode.toString(),
        createdAt: new Date(), // current time
        x: 0,
        y: 0,
        z: 0,
        accelero:0,
        points:0
      });
      return id; //[BUG!]
    },    
    addParticipant: function(userName, spelcode){

      var carray = ['#0051ba','#c41e3a','#007a3d','#2b2b28','#fca311'];
      var guess = Math.floor((Math.random() * 4) ); 
      
      var c = carray[guess];

      console.log('random color for new participant: '+c);

      var id = Deelnemers.insert({
        spelernaam: userName,
        spelcode: spelcode.toString(),
        spelercolor:c,
        createdAt: new Date(), // current time
      });
      console.log('participant added: '+ id)
      return id; //[BUG!]
    },
    givePoints: function(userId){
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
    },
    //END Game methods

    // Board Methods
    canvas: function() {
    var self = this;
    var svg;

    // Creates the SVG canvas.
    var createSvg = function() {
      svg = d3.select('#canvas').append('svg')
        .attr('width', '100%')
        .attr('height', '100%');
    };
    createSvg();

    // Clears the SVG canvas.
    self.clear = function() {
      d3.select('svg').remove();
      createSvg();
    };

    // Naively draws an array of simple point objects.
    self.draw = function(data) {
      if (data.length < 1) {
        self.clear();
        return;
      }
      if (svg) {
        // This is what actually does the drawing. We're not
        // going to cover d3 in any great detail here.
        svg.selectAll('circle').data(data, function(d) { return d._id; })
        .enter().append('circle')
        .attr('r', 10)
        .attr('cx', function (d) { return d.x; })
        .attr('cy', function (d) { return d.y; });
          }
        };
      },
    removeAllPoints: function() {
         return Points.remove({});
      },
    undoPoints: function(noteid) {
        console.log('remove all with noteid: '+ noteid);
        var s = noteid+' mobileFull';
        // Points.remove({noteID:s}); // remove with full class id_mobileFull...
        // Points.remove({noteID: noteid});
        Points.remove({}); // jest remove all for the demo
      },    
    deleteNote: function(idNote) {
        Points.remove({});
        Logs.remove(idNote);
      },
    logoutPlayer: function(userID){
      //[BUG] functie is undefined bij layout.js
          return Deelnemers.remove({'spelerID': userID});
      },
    drawPopUp: function(){
        // roept niet hier aan
        console.log('drawPopUp element: '+this);
        return true;
    }
  });