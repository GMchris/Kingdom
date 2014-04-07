'use strict'

var Structures = (function(){

	function addEvents(){
		$(".build").on("click",function(){
			openBuildMenu($(this));
		});

		$("body").on("click",".building",function(){
			console.log("sup")
		})
	}

function Building(){
	this.level=1;

	this.woodToUpgrade=null;
	this.citizensToUpgrade = null;

	this.totalWoodSpent=0,
	this.totalCitizensSpent=0,

	this.upgrade = function(){
		if(this.level==4){return}//Cannot go past level four
		if(Game.playerStats.wood >= this.woodToUpgrade&&Game.playerStats.citizens >= this.citizensToUpgrade){
			this.level++;//raise level
			Game.playerStats.wood -= this.woodToUpgrade;//remove wood and citizens from the player
			Game.playerStats.citizens -= this.citizensToUpgrade;
			this.totalWoodSpent += this.woodToUpgrade;//adjust the ammount of wood and citizens that were used to create the building
			this.totalCitizensSpent += this.woodToUpgrade;
			this.woodToUpgrade *= 2;//raise the price for further upgrades
			this.citizensToUpgrade *=2;


		}
	}
	this.gather = function(){
		throw new Error("Undefined gather method")
	}
}

//Building classes
function Forester(){};
function Mine(){};
function Barracks(){};
function TownHall(){};
function Barn(){};

//Building inhertiance
Forester.prototype = new Building();
Mine.prototype = new Building();
Barracks.prototype = new Building();
TownHall.prototype = new Building();
Barn.prototype = new Building();

//Forester specifics
Forester.prototype.gather = function(){
	Game.playerStats.wood += this.level*2;
	Game.playerStats.food += this.level;
}

//Mine specifics
Mine.prototype.gather = function(){
	Game.playerStats.iron += this.level*2;
	Game.playerStats.gold += this.level/2;
}

//TownHall specifics
TownHall.prototype.gather=function(){
	Game.playerStats.citizens += this.level/4;
}

//Barn specifics
Barn.prototype.gather=function(){
	Game.playerStats.food += this.level;
}

//Barracks specifics
Barracks.prototype.gather=function(){
	return;
}

//Creates a menu to select a building from
function openBuildMenu(object){
	var index = parseInt(object.attr("id").charAt(object.attr("id").length-1));
	
}

var buildingManager = {
	allBuildings:["","",new TownHall(),"","",""],

	gatherResources:function(){
		for(var i=0;i<this.allBuildings.length;i++){
			if(!(this.allBuildings[i])){
				continue;
			}
			this.allBuildings[i].gather();
		}
	},

	build:function(){

	},

	destroy:function(){

	}
}

window.addEventListener("load",addEvents,false);

return {
	buildingManager:buildingManager
}

})();