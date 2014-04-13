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
		Player.citizens =2000;
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

var Time={
		total: 0,
		ticks : 0,
		day : 1,
		month : 0,
		season: 0,
		months : ["March","April","May","June","July","August","September","October","November","December","January","February"],
		seasons: ["Spring","Summer","Autumn","Winter"],
		seasonModifiers:["Spring modifer","Summer modifer","Autumn modifer","Winter modifer"],

		tick: function(){
			this.total++;
			this.ticks++;
			if(this.ticks>=4){
				this.ticks=0;
				this.addDay()
			}
		},

		addDay: function(){
			if(this.month%2==0 && this.day==31||this.month%2 !=0 && this.day==30){
				this.day=0;
				this.addMonth();
			}
			this.day++;
			$("#day").text(this.day);
		},
		addMonth:function(){
			this.month++;
			tax();
			feed();
			if(this.month==3||this.month==6||this.month==9){
				this.addSeason();
			}
			$("#month").text(this.months[this.month]);
		},
		addSeason:function(){
			this.seasons++;
			$("#season").text(this.seasons[this.season]);
			$("#seasonModifiers").text(this.seasonModifiers[this.season]);
		},
	}

function tax(){
	var taxThisMonth = Time.month*150;
	if(Player.gold>=taxThisMonth){
		Player.gold -= taxThisMonth;
		return;
	}
	GameControls.loseGame("tax")
}

function feed(){
	if(Player.food>=Player.citizens){
		Player.food -= Player.citizens;
		return;
	}
	GameControls.loseGame("food")
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
	getSeason:Time.seasons[Time.season],
}

})();