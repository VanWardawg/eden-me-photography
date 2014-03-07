var app = angular.module('Photography', []);

app.config(function($routeProvider,$locationProvider) {
	$routeProvider
	  .when('/', {controller:MainCtrl, templateUrl:'html/homePage.html'})
	  .when('/gallery/families',{controller:GalleryCtrl,templateUrl:'html/families.html'})
	  .when('/gallery/wedding',{controller:GalleryCtrl,templateUrl:'../html/wedding.html'})
	  .when('/gallery/newborn',{controller:GalleryCtrl,templateUrl:'../html/newborn.html'})
	  .when('/gallery/portraits',{controller:GalleryCtrl,templateUrl:'../html/portrait.html'})
	  .when('/gallery',{controller:GalleryCtrl,templateUrl:'html/gallery.html'})
	  .when('/aboutme',{controller:AboutMeCtrl,templateUrl:'html/aboutme.html'})
	  .when('/pricing',{controller:AboutMeCtrl,templateUrl:'html/pricing.html'})
	  .when('/contact',{controller:AboutMeCtrl,templateUrl:'html/contact.html'})
	  .otherwise({redirectTo:'/'});

   		$locationProvider.html5Mode(true);
}).run(['$rootScope','$location',function($root,$loc){
	$root.location = $loc;
}]);;

app.factory('player', function(audio, $rootScope) {
	var player,
	    playlist = [{"file":'assets/Everything.m4a',"name":"Everything","artist":"Michael Buble"},
	    			{"file":'assets/MyWish.m4a',"name":"My Wish","artist":"Rascal Flatts"},
	    			{"file":'assets/itsTime.m4a',"name":"It's Time","artist":"Imagine Dragons"},
	    			{"file":'assets/ChangeYourMind.m4a',"name":"Change Your Mind","artist":"All-American Rejects"},
	    			{"file":'assets/SomewhereOnlyWeKnow.m4a',"name":"Somewhere Only We Know","artist":"Glee"},
	    			{"file":'assets/WhatMakesYouBeautiful.m4a',"name":"What Makes You Beautiful","artist":"One Direction"}],
	    paused = false,
	    current = 0;

	player = {
	  playlist: playlist,

	  current: current,

	  playing: false,

	  song: playlist[current].name,

	  artist: playlist[current].artist,

	  songs: function(){
	  	return playlist.length;
	  },

	  playSong: function(song){
	  	current = song-1;
	  	if (!paused) audio.src = playlist[current].file;
	    audio.play();
	    player.playing = true;
	    paused = false;
	    player.song = playlist[current].name;
	    player.artist = playlist[current].artist;
	  },

	  play: function() {
	    if (!paused) audio.src = playlist[current].file;
	    audio.play();
	    player.playing = true;
	    paused = false;
	    player.song = playlist[current].name;
	    player.artist = playlist[current].artist;
	  },

	  pause: function() {
	    if (player.playing) {
	      audio.pause();
	      player.playing = false;
	      paused = true;
	    }
	  },

	  reset: function() {
	    player.pause();
	    current.album = 0;
	    current.track = 0;
	  },

	  next: function() {
	    if (!playlist.length) return;
	    paused = false;
	    if (playlist.length > (current + 1)) {
	      current++;
	    } else {
	      current = 0;
	    }
	    if (player.playing) player.play();
	  },

	  previous: function() {
	    if (!playlist.length) return;
	    paused = false;
	    if (current > 0) {
	      current--;
	    } else {
	      current.track = playlist.length - 1;
	    }
	    if (player.playing) player.play();
	  }
	};

	playlist.add = function(album) {
	  if (playlist.indexOf(album) != -1) return;
	  playlist.push(album);
	};

	playlist.remove = function(album) {
	  var index = playlist.indexOf(album);
	  if (index == current.album) player.reset();
	  playlist.splice(index, 1);
	};

	audio.addEventListener('ended', function() {
	  $rootScope.$apply(player.next);
	}, false);

	return player;
});

app.factory('audio', function($document) {
    var audio = $document[0].createElement('audio');
    return audio;
});
