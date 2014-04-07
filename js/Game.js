'use strict'
var Game = (function(){
var GameControls = {

	init : function(){
		GameControls.setInitialValues();
		GameControls.activateTimer();
	},

	gameTimer:null,

	activateTimer:function(){
		this.gameTimer = setInterval(function(){GameControls.gameLoop();},1000);
	},

	setInitialValues: function(){
		Player.wood =0;
		Player.iron =0;
		Player.food =0;
		Player.gold =0;
		Player.citizens =0;
		Player.warriors =0;
	},

	gameLoop: function(){
		Structures.buildingManager.gatherResources();
		$.each(Player,function(i,prop){

		});
	}
}

var Player = {
	citizens:null,
	wood:null,
	iron:null,
	food:null,
	gold:null,
	warriors:null
}

window.addEventListener("load",GameControls.init,false);

return {
	playerStats:Player
}

})();