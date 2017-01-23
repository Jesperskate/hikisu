
// var canvas = [];
var canvas;

Session.set('moveAllowed', false);

Deps.autorun( function () {
  Meteor.subscribe('points');
});

Meteor.startup( function() {
  Deps.autorun( function() {
    var data = Points.find({'noteID': $('#canvas').attr('class')}).fetch();
    if (canvas) {
      console.log('is canvas now do canvas.draw(data): '+data);
      canvas.draw(data);
    }
  });
});

Template.registerHelper('extendContext2', function(key, value) {
  var result = _.clone(this);
  result[key] = value;
  return result;
});

Template.canvas.onRendered(function() {
  console.log(document && document.getElementById("canvas"));
    
  var sessieCode = Router.current().params._id;
  var countLogs = Logs.find({spelcode: sessieCode}).count();

  console.log('refresh done man',sessieCode, countLogs);
  //dit moet in een array om alle canvassen apart te laten werken

  // for (var i = 0; i < countLogs; i++) {
  //   canvas[i] = new Canvas();
  //   canvas[i].draw();  
  // };
    canvas = new Canvas();
    canvas.draw();  

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
  'click .moveButton': function (event) {
    
    if (Session.get('moveAllowed') === false) {
      Session.set('moveAllowed', true);

    }else{
      Session.set('moveAllowed', false);
    }
  },
  'click .drawPopUp': function(event){

    console.log('id of note: '+ event.target.id);

    var p = Logs.findOne({_id:event.target.id}).fileURL

    Meteor.popUp("canvas");
    $('#closeDrawPopUp').show();

    $('#canvas').css('height','100%');
    $('#canvas').css('width','100%');
    console.log('css background img: '+ p);
      if (p === null) {
        $('#canvas').css('background-color','white');
      }else{
        $('#canvas').css('background','url('+p+')');
        $('#canvas').css('background-repeat','no-repeat');
        $('#canvas').css('background-position','center');
        $('#canvas').css('background-color','white');

      }
    $('#canvas').css('position','fixed');
    $('#canvas').attr('class', event.target.id);


  },    
  'click .colorButton': function (event) {
      console.log('thisvalue'+event.target.value);
      Session.set('color', event.target.value);
  }
  
});


Template.canvas.events({
  'mousedown': function (event) {
    console.log('Test, show note number: '+ $(event.target).parent().attr('class') );// het werkt!
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
  },

  'click #closeDrawPopUp': function(event){


    $('#closeDrawPopUp').hide();
      Meteor.popDown('canvas');
      console.log('this---> '+this);

      canvas = new Canvas(); 
      canvas.draw();
      canvas.clear();
      
  }
});



var currentLine = []

Canvas = function () {
  var self = this;
  var svg;
  var width = '100%' ;
  var height = '100%' ;
  var noteid = $('#canvas').attr('class');

  var createSvg = function() {
    svg = d3.select('#canvas').append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('class', noteid)
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


