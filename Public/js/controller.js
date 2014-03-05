function MainCtrl($scope,$location,$rootScope){
	$rootScope.landingPage = true;

	console.log($rootScope.landingPage);
	$scope.goToGallery = function(){


		$location.path("/gallery");
	}

}

function GalleryCtrl($scope,$rootScope){
	$rootScope.landingPage = false;
	$scope.selected = 0;

}

function AboutMeCtrl($scope,$rootScope){
	$rootScope.landingPage = false;
	$scope.selected = 0;

}

function MusicCtrl($scope,player){
	$scope.player = player;
	var songs = $scope.player.songs();
	var song = Math.floor((Math.random()*songs)+1);
	$scope.player.playSong(song);
}