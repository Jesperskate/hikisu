Router.configure({
	layoutTemplate:'layout'
});
Router.map(function(){
	this.route('home',{path:'/home'})
	this.route('help',{path:'/help'})
	this.route('info',{path:'/'})
	this.route('login',{path:'/login'})
	this.route('register',{path:'/register'})
	this.route('panel',{path:'/panel'})
	this.route('game',{path:'/game'})


});
