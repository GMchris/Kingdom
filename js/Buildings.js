'use strict'

var Structures = (function(){

	function addEvents(){
		$(document).on("click",".build",function(e){
			e.stopPropagation();
			closePrompt();
			openBuildMenu($(this));
		});

		$(document).on("click",".building",function(){
			console.log("sup")
		});

		$("#gameScreen").on("click",function(){
			closePrompt();
		})

		buildingManager.build("townhall",3);
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

var BuildingPseudo = {
	townhall:{
		costWood : 0,
		costCitizens : 0
	},

	forester:{
		costWood : 250,
		costCitizens : 55
	},

	mine:{
		costWood : 300,
		costCitizens : 60
	},

	barn:{
		costWood: 200,
		costCitizens: 30
	},

	barracks:{
		costWood : 400,
		costCitizens : 70
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
	var classArray = ["forester","mine","barn","barracks"];
	var index = parseInt(object.attr("id").charAt(object.attr("id").length-1));
	$("<div/>")
	.addClass("prompt buildPrompt")
	.css("left",170+(index*120)+"px")
	.appendTo("#gameScreen");

	for(var i=0;i<classArray.length;i++){
		$(makeBuildCell(classArray[i],index)).appendTo(".buildPrompt");
	}

}

function makeBuildCell(type,index){
	var title=type.toUpperCase(),description,icon=type+"Icon";
	var cell = $("<div/>")
	.addClass("buildCell")
	.on("click",function(e){
		e.stopPropagation();
		buildingManager.build(type,index);
	})

	switch(type){
		case "forester":
			description="Gathers wood and some food.";
			break;
		case "mine":
			description="Refines iron and some gold.";
			break;
		case "barn":
			description="Produces food";
			break;
		case "barracks":
			description="Hire warriors";
			break;
		default:
			break;
	}
	$("<div/>").addClass("icon "+icon).appendTo(cell);
	$("<div/>").addClass("cellTitle").text(title).appendTo(cell);
	$("<div/>").addClass("woodCost").text(BuildingPseudo[type].costWood).appendTo(cell);
	$("<div/>").addClass("citizenCost").text(BuildingPseudo[type].costCitizens).appendTo(cell);
	$("<div/>").addClass("cellDescription").text(description).appendTo(cell);

	return cell;
}

function closePrompt(){
	$(".prompt").remove();
}

var buildingManager = {
	allBuildings:["","","","","",""],

	gatherResources:function(){
		for(var i=0;i<this.allBuildings.length;i++){
			if(!(this.allBuildings[i])){
				continue;
			}
			this.allBuildings[i].gather();
		}
	},

	build:function(type,index){
		if(Game.playerStats.wood>=BuildingPseudo[type].costWood
			&& Game.playerStats.citizens>=BuildingPseudo[type].costCitizens){
			//Backend
			Game.playerStats.wood -= BuildingPseudo[type].costWood;
			Game.playerStats.citizens -= BuildingPseudo[type].costCitizens;

		switch(type){
		case "townhall":
			this.allBuildings[index]=new TownHall();
			break;
		case "forester":
			this.allBuildings[index]=new Forester();
			break;
		case "mine":
			this.allBuildings[index]=new Mine();
			break;
		case "barn":
			this.allBuildings[index]=new Barn();
			break;
		case "barracks":
			this.allBuildings[index]=new Barracks();
			break;
		default:
			break;
			}
			Game.updatePlayerStats();
			$(".prompt").remove();
		//Frontend

		$("#spot"+index)
		.addClass("building")
		.removeClass("build")
		.css("background-image","url(images/buildings/"+type+"1.png)");

		}
	},

	destroy:function(index){
		
	}
}

window.addEventListener("load",addEvents,false);

return {
	buildingManager:buildingManager
}

})();