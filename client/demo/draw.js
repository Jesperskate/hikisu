
var canvas = [];

Session.set('moveAllowed', false);

Deps.autorun( function () {
  Meteor.subscribe('points');
});

Meteor.startup( function() {
  Deps.autorun( function() {
   //  for (var i = 0; i <= 12; i++) {

    //   if (canvas[i]) {
    //     console.log('is canvas now do canvas.draw(data): ');
    //     canvas[i].draw();

    //   }
    // };
  });
});


Template.note.onRendered(function() {
  console.log(document && document.getElementById("canvas"));
    
  var sessieCode = Router.current().params._id;
  var countLogs = Logs.find({spelcode: sessieCode}).count();

  console.log('refresh done man ',sessieCode, 'aantal notes: ',countLogs);
  //dit moet in een array om alle canvassen apart te laten werken

  for (var i = 0; i < countLogs; i++) {
    canvas[i] = new Canvas();
    console.log('canvas['+i+'] here: '+canvas[i]);
    canvas[i].draw(i);  
  };
  
  console.log(canvas);

});
 
Template.canvas.helpers({

});

Template.note.helpers({
  moveAllowed: function(){
    if (Session.get('moveAllowed') ===  true) {
      return 'moveOn';

    }else{
      return 'moveOff';
    }
  },
  height: function(){
    var h = $(window).height();
    var w = $(window).width();

    if(w <= h){
      return w - 30;
    } 
    return h - 150; 
  }

})

Template.note.events({
  'click .undoButton': function (event) {
      canvas[$(event.target).attr('data-noteid')].clear();

  },      
  'click .deleteNote': function () {
    Meteor.call('deleteNote',this._id);
    canvas[$(event.target).attr('data-noteid')].clear();

  },  
  'click .moveButton': function (event) {
    if (Session.get('moveAllowed') === false) {
      Session.set('moveAllowed', true);

    }else{
      Session.set('moveAllowed', false);
    }
  },
  // 'click .drawPopUp': function(event){

  //   console.log('id of note: '+ event.target.id+ 'noteid:'+$(event.target).attr('data-noteid'));

  //   var p = Logs.findOne({_id:event.target.id}).fileURL
  //   var canvasid = '#canvas'+$(event.target).attr('data-noteid');

  //   console.log('canvasid: '+canvasid);

  //   Meteor.popUp("canvas");
  //   $('#closeDrawPopUp').show();

  //   $(canvasid).css('height','100%');
  //   $(canvasid).css('width','100%');
  //   console.log('css background img: '+ p);
  //     if (p === null) {
  //       $(canvasid).css('background-color','white');
  //     }else{
  //       $(canvasid).css('background','url('+p+')');
  //       $(canvasid).css('background-repeat','no-repeat');
  //       $(canvasid).css('background-position','center');
  //       $(canvasid).css('background-color','white');

  //     }
  //   $(canvasid).css('position','fixed');
  //   $(canvasid).attr('class', event.target.id);


  // },    
  'click .colorButton': function (event) {
      console.log('thisvalue'+event.target.value);
      Session.set('color', event.target.value);
  },
  'mousedown': function (event) {
    console.log('Test, show note number: '+ $(event.target).attr('class') );// het werkt!
    console.log('Test, show note number: '+ $(event.target).attr('data-noteid') );// het werkt!
    Session.set('draw', true);
    var offset = $(event.target).offset();
    console.log('offset'+offset.left)
    currentLine = [];
    currentLine.push({
      x: (event.pageX - offset.left),
      y: (event.pageY - offset.top)
    });
  },
  'mouseup': function (event) {
    Points.insert({
      points:   currentLine.slice(0),
      noteID:   $('#canvas').attr('class'),
      color:    Session.get('color'),
      owner:    Session.get('spelernaam')
    });
    currentLine = [];
    Session.set('draw', false);
  },  

  'mousemove': function (event) {
    if (Session.get('draw')) {
      var offset = $(event.target).offset();
      currentLine.push({
        x: (event.pageX - offset.left),
        y: (event.pageY - offset.top)
      });
      var x = $(event.target).attr('data-noteid');
      console.log('x '+x)
      canvas[x].draw();
    }
  },  
  // for mobile
  'touchstart': function (event) {
    console.log('touchStart...'+ $('#canvas').attr('class'));
    Session.set('draw', true);
    var touch = event.originalEvent.touches[0] || event.originalEvent.changedTouches[0];
    var offset = $(event.target).offset();
    currentLine = [];
    currentLine.push({
      x: (touch.pageX - offset.left),
      y: (touch.pageY - offset.top)
    });
  },
  'touchend': function (event) {
     console.log('touchEnd...');
    Points.insert({
      points:   currentLine.slice(0),
      noteID:   $('#canvas').attr('class'),
      color:    Session.get('color'),
      owner:    Session.get('spelernaam')
    });
    currentLine = [];
    Session.set('draw', false);
  },
  'touchmove': function (event) {
    console.log('touchMove...');
    if (Session.get('draw')) {
      var offset = $('#canvas').offset();
      var touch = event.originalEvent.touches[0] || event.originalEvent.changedTouches[0];
      currentLine.push({
        x: (touch.pageX - offset.left),
        y: (touch.pageY - offset.top)
      });
      canvas[$(event.target).attr('data-noteid')].draw();
    }
  },

  'click #closeDrawPopUp': function(event){
    $('#closeDrawPopUp').hide();
      Meteor.popDown('canvas');

      canvas[$(event.target).attr('data-noteid')] = new Canvas(); 
      canvas[$(event.target).attr('data-noteid')].draw();
      canvas[$(event.target).attr('data-noteid')].clear();

      
  }
});



var currentLine = []

Canvas = function (i) {
  var self = this;
  var svg;
  var width = '100%' ;
  var height = '100%' ;
  var canvasid = '#canvas'+i;
  var noteid = $(canvasid).attr('class');
  var id = $(canvasid).parent().attr('data-noteid');

  var createSvg = function() {
    svg = d3.select(canvasid).append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('class', noteid)
      .attr('id', id)
    .append("g")
      .call(d3.behavior.zoom().scaleExtent([1, 8]).on("zoom", zoom))
    .append("g");
  };

  if(!svg) createSvg();

  self.clear = function() {
    d3.select('svg').remove();
    Meteor.call('undoPoints', noteid)
    createSvg();
  };

  var lastData;

  self.draw = function() {

    
    var stroke = 'grey';
    var data = Points.find({'noteID': noteid}).fetch();

    if (Points.find({'noteID': noteid}).count() > 0) {
      if (Points.findOne({'noteID': noteid, 'owner':Session.get('spelernaam')})=== undefined) {
        var stroke = 'grey';  
      }else{
        var stroke = Points.findOne({'noteID': noteid, 'owner':Session.get('spelernaam')}).color;
      }  
    };

    if(typeof data === "undefined") {
      data = lastData;
    }
    lastData = data;

    var renderData = data;
    if(currentLine.length) {
      renderData = data.concat([{ 
        points: currentLine,
        _id: new Date().getTime()
      }])
    }

    if (svg) {
      svg
        .selectAll('path').data(renderData, function(d) { return d._id; })
        .enter().append('path')
        .attr('stroke-width', 2)
        .attr('d', function (line) {
          console.log(line)
          if (typeof line.points === "undefined") {
            return "M " + line.x + " " + line.y;
          } else {
            return "M " + line.points.map(p => p.x + " " + p.y).join(" L ");        
          }
        })
        .attr('fill', 'transparent')
        .attr('stroke', stroke)
        .attr('noteid', noteid)
    }

  };
  self.zoom = function(){
      // would be nice

  };

  function zoom() {
    var a = Session.get('moveAllowed');
    if(a === true){
      // svg.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")"); with zoom
      svg.attr("transform", "translate(" + d3.event.translate + ")");
    }
    else{ 
      return false;
    }
    
  }

  function zoomed() {
    svg.select(".x.axis").call(xAxis);
    svg.select(".y.axis").call(yAxis);
  }

  function clicked() {
    svg.call(zoom.event); // https://github.com/mbostock/d3/issues/2387

    // Record the coordinates (in data space) of the center (in screen space).
    var center0 = zoom.center(), translate0 = zoom.translate(), coordinates0 = coordinates(center0);
    zoom.scale(zoom.scale() * Math.pow(2, +this.getAttribute("data-zoom")));

    // Translate back to the center.
    var center1 = point(coordinates0);
    zoom.translate([translate0[0] + center0[0] - center1[0], translate0[1] + center0[1] - center1[1]]);

    svg.transition().duration(750).call(zoom.event);
  }


}


