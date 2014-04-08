'use strict'
var Game = (function(){
var GameControls = {

	init : function(){
		GameControls.setInitialValues();
		cyclePlayer();
		GameControls.activateTimer();
	},

	gameTimer:null,

	dateTimer:null,

	activateTimer:function(){
		this.gameTimer = setInterval(function(){GameControls.gameLoop();},1000);
	},

	setInitialValues: function(){
		Player.wood =350;
		Player.iron =0;
		Player.food =50;
		Player.gold =0;
		Player.citizens =60;
		Player.warriors =0;
	},

	gameLoop: function(){
		Structures.buildingManager.gatherResources();
		cyclePlayer();
	}
}

var Player = {
	citizens:null,
	wood:null,
	iron:null,
	gold:null,
	food:null,
	warriors:null
}

function cyclePlayer(){
	var spots = $(".stats"),iterator=0;
	$.each(Player,function(key,value){
			$(spots[iterator]).text(Math.floor(value));
			iterator++;
		});
}

window.addEventListener("load",GameControls.init,false);

return {
	playerStats:Player,
	updatePlayerStats:cyclePlayer
}

})();