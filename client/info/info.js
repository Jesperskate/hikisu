

if(Meteor.isClient){

	Template.info.events({
		"click .interesse": function(){
		 	$( ".target" ).toggle( "slow" );
		}
	});

	Template.info.onRendered(function () {
	 $( "#content" ).css("height", "auto");
	});

}

