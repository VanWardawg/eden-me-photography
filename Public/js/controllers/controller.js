function MainCtrl($scope,$location){

	$scope.goToGallery = function(){


		$location.path("/gallery");
	}

}

function GalleryCtrl($scope){
	$scope.selected = 0;

}

function AboutMeCtrl($scope){
	$scope.selected = 0;

}

function MusicCtrl($scope,player){
	$scope.player = player;
	var songs = $scope.player.songs();
	var song = Math.floor((Math.random()*songs)+1);
	//$scope.player.playSong(song);
}

function NavCtrl($scope){

	$scope.dropdown = false;
	$scope.toggle_menu = function() {
		$scope.dropdown = !$scope.dropdown;
		var me = $scope;
	}
}