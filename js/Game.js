'use strict'
var Game = (function(){
var GameControls = {

	init : function(){
		GameControls.setInitialValues();
		cyclePlayer();
		GameControls.activateTimer();
		Structures.buildingInit();
	},

	gameTimer:null,

	activateTimer:function(){
		this.gameTimer = setInterval(function(){GameControls.gameLoop();},500);
	},

	deactivateTimer:function(){
		clearInterval(GameControls.gameTimer)
	},

	setInitialValues: function(){
		Player.wood =10000;
		Player.iron =10000;
		Player.food =10000;
		Player.gold =10000;
		Player.citizens =200;
		Player.warriors =10000;
	},

	gameLoop: function(){
		Structures.buildingManager.gatherResources();
		cyclePlayer();
		Time.tick();
	},

	loseGame:function(reason){
		this.deactivateTimer();
		$("<div>")
		.addClass("prompt lossPrompt");
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
	updatePlayerStats:cyclePlayer,
	activateTimer:GameControls.activateTimer,
	deactivateTimer:GameControls.deactivateTimer,
}

})();