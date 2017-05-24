
var canvas;
// var canvasArray = [];

Session.set('moveAllowed', false);

Deps.autorun( function () {
  Meteor.subscribe('points');
});

// Once 
Template.note.onRendered(function() {
  console.log(document && document.getElementById("canvas"));
    
  var sessieCode = Router.current().params._id;
  var countLogs = Logs.find({spelcode: sessieCode}).count();

  console.log('refresh done man',sessieCode, countLogs);
  //dit moet in een array om alle canvassen apart te laten werken
  canvas = new Canvas();
  canvas.draw();  
  console.log('NOTE onRENDERED')

});

// Continu refresh
Meteor.startup( function() {
  Deps.autorun( function() {
    var data = Points.find({}).fetch();
    if (canvas) {
        canvas.draw(data);
        var sessieCode = Router.current().params._id;
        var countLogs = Logs.find({spelcode: sessieCode}).count();
        console.log('DEP AUTORUN',sessieCode, countLogs);
    }
  });
});


 
Template.canvas.helpers({
  height: function(){
    var h = $(window).height();
    var w = $(window).width();
    if(w <= h){
      return w - 30;
    } 
    return h - 150; 
  }
});

Template.note.helpers({
  moveAllowed: function(){
    if (Session.get('moveAllowed') ===  true) {
      return 'moveOn';

    }else{
      return 'moveOff';
    }
  }
})

Template.note.events({
  'click .undoButton': function (event) {
    canvas.clear();
  },          
  'click .deleteNote': function () {
    Meteor.call('deleteNote',this._id);
    canvas.clear();
  },  
  'click .moveButton': function () {
    if (Session.get('moveAllowed') === false) {
      Session.set('moveAllowed', true);
    }else{
      Session.set('moveAllowed', false);
    }
  },
  'click .drawPopUp': function(event){
    console.log('id of this element (noteID): '+ event.target.id);
    var c0 = '.'+event.target.id;
    var c1 = '.'+event.target.id+'-svg';
    var p = Logs.findOne({_id:event.target.id}).fileURL;

    $('.closeDrawPopUp').show();
    $('.drawPopUp').hide();
    

    $(c0).addClass('mobileFull');
  },
  'click .closeDrawPopUp': function(event){
    $('#canvas').removeClass('mobileFull');
    $('.closeDrawPopUp').hide();
    $('.drawPopUp').show();

  },   
  'click .colorButton': function (event) {
      console.log('thisvalue'+event.target.value);
      Session.set('color', event.target.value);
  }
});

Template.canvas.events({
  'mousedown': function (event) {
    Session.set('draw', true);
    var offset = $('#canvas').offset();
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
      var offset = $('#canvas').offset();
      currentLine.push({
        x: (event.pageX - offset.left),
        y: (event.pageY - offset.top)
      });
      canvas.draw();
    }
  },  
  // for mobile
  'touchstart': function (event) {
    console.log('touchStart...'+ $('#canvas').attr('class'));
    Session.set('draw', true);
    var touch = event.originalEvent.touches[0] || event.originalEvent.changedTouches[0];
    var offset = $('#canvas').offset();
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
      canvas.draw();
    }
  }

});



var currentLine = []

Canvas = function () {
  var self = this;
  var svg;
  var width = '100%' ;
  var height = '100%' ;
  var noteid = $('#canvas').attr('class');
  var noteidsvg = $('#canvas').attr('class')+'-svg';

  var createSvg = function() {
    svg = d3.select('#canvas').append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('class', noteid)
    .append("g")
      .call(d3.behavior.zoom().scaleExtent([0.5, 8]).on("zoom", zoom))
    .append("g");
  };

  console.log('SVG '+!svg)

  if(!svg) createSvg();

  self.clear = function() {
    console.log('noteid in self clear '+noteid);
    Meteor.call('undoPoints', noteid);
    d3.select('svg').remove();
    createSvg();
  };

  var lastData;

  self.draw = function(data) {

    if(typeof data === "undefined") {
      data = lastData;
    }
    lastData = data;

    if (data === undefined) {
      return false;
    };

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
        .attr('stroke', function (line) {
          if (line.color === undefined) { 
            return 'grey';
          }
          else{
            return line.color; 
          };               
        })
        .attr('noteid', noteid)
    }

  };
  self.zoom = function(){
      // would be nice

  };

  function zoom() {
    var a = Session.get('moveAllowed');
    if(a === true){
      svg.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")"); //with zoom
      // svg.attr("transform", "translate(" + d3.event.translate + ")");
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


