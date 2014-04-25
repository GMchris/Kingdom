'use strict'

var Structures = (function(){

	function addEvents(){
		$(document).on("click",".build",function(e){
			e.stopPropagation();
			closePrompt();
			openBuildMenu($(this));
		});

		$(document).on("click",".building",function(e){
			e.stopPropagation();
			closePrompt();
			openBuildingMenu($(this));
		});

		$("#gameScreen").on("click",function(){
			closePrompt();
		})

		buildingManager.build("townhall",3);
	}

function Building(){
	this.index = null;
	this.type = null;
	this.level=1;

	this.woodToUpgrade=null;
	this.citizensToUpgrade = null;

	this.totalWoodSpent=0;
	this.totalCitizensSpent=0;

	this.upgrade = function(index){
		if(this.level==3){return}//Cannot go past level four
		if(Game.playerStats.wood >= this.woodToUpgrade&&Game.playerStats.citizens >= this.citizensToUpgrade){
			this.level++;//raise level
			Game.playerStats.wood -= this.woodToUpgrade;//remove wood and citizens from the player
			Game.playerStats.citizens -= this.citizensToUpgrade;
			this.totalWoodSpent += this.woodToUpgrade;//adjust the ammount of wood and citizens that were used to create the building
			this.totalCitizensSpent += this.citizensToUpgrade;
			this.woodToUpgrade *= 2;//raise the price for further upgrades
			this.citizensToUpgrade *=2;

			Game.updatePlayerStats();

			$("#spot"+index)
			.css("background-image","url(images/buildings/"+this.type+this.level+".png)");
			closePrompt();
			// Make taller level three building
			if(this.level==3){
				$("#spot"+index).addClass("upgraded");
			}

			//Change background of village
			if(this instanceof TownHall){
				$("#village").css("background-image","url(images/backgrounds/village"+this.level+".png)");
			}

		}
	}
	this.gather = function(){
		throw new Error("Undefined gather method");
	}
}

var BuildingPseudo = {
	townhall:{
		costWood : 1000,
		costCitizens : 0
	},

	forester:{
		costWood : 500,
		costCitizens : 110
	},

	mine:{
		costWood : 600,
		costCitizens : 120
	},

	barn:{
		costWood: 400,
		costCitizens: 60
	},

	barracks:{
		costWood : 800,
		costCitizens : 140
	}
}

//Building classes
function Forester(index){
	this.index=index;
	this.type="forester";
	this.totalWoodSpent = BuildingPseudo.forester.costWood;
	this.totalCitizensSpent = BuildingPseudo.forester.costCitizens;
	this.woodToUpgrade = this.totalWoodSpent*2;
	this.citizensToUpgrade = this.totalCitizensSpent*2;
};
function Mine(index){
	this.index=index;
	this.type="mine";
	this.totalWoodSpent = BuildingPseudo.mine.costWood;
	this.totalCitizensSpent = BuildingPseudo.mine.costCitizens;
	this.woodToUpgrade = this.totalWoodSpent*2;
	this.citizensToUpgrade = this.totalCitizensSpent*2;
};
function Barracks(index){
	this.active = true;
	this.index=index;
	this.type="barracks";
	this.totalWoodSpent = BuildingPseudo.barracks.costWood;
	this.totalCitizensSpent = BuildingPseudo.barracks.costCitizens;
	this.woodToUpgrade = this.totalWoodSpent*2;
	this.citizensToUpgrade = this.totalCitizensSpent*2;
};
function TownHall(index){
	this.index=index;
	this.currentResource = "wood";
	this.type="townhall";
	this.totalWoodSpent = BuildingPseudo.townhall.costWood;
	this.totalCitizensSpent = BuildingPseudo.townhall.costCitizens;
	this.woodToUpgrade = 1000;
	this.citizensToUpgrade = 0;
};
function Barn(index){
	this.index=index;
	this.type="barn";
	this.totalWoodSpent = BuildingPseudo.barn.costWood;
	this.totalCitizensSpent = BuildingPseudo.barn.costCitizens;
	this.woodToUpgrade = this.totalWoodSpent*2;
	this.citizensToUpgrade = this.totalCitizensSpent*2;
};

//Building inhertiance
Forester.prototype = new Building();
Mine.prototype = new Building();
Barracks.prototype = new Building();
TownHall.prototype = new Building();
Barn.prototype = new Building();

//Forester specifics
Forester.prototype.gather = function(){
	var currentSeason = Game.getSeason;
	Game.playerStats.wood += this.level*2;
	if(currentSeason=="Spring"){Game.playerStats.food += this.level*2;floatIcon("food",this.index),true}
	else if(currentSeason=="Winter"){Game.playerStats.wood += this.level}
	else{Game.playerStats.food += this.level;floatIcon("food",this.index,true);}
	floatIcon("wood",this.index)
}

//Mine specifics
Mine.prototype.gather = function(){
	Game.playerStats.iron += this.level*2;
	if(Game.getSeason=="Summer"){Game.playerStats.gold += this.level}
	else{Game.playerStats.gold += this.level/2;}
	floatIcon("iron",this.index)
	floatIcon("gold",this.index,true);
}

//TownHall specifics
TownHall.prototype.gather=function(){
	if(Game.getSeason=="Autumn"){Game.playerStats.citizens += this.level/3}
	else{Game.playerStats.citizens += this.level/4;}
	Game.playerStats[this.currentResource] += this.level/4;
	$("#foodOwed").text(Math.floor(Game.playerStats.citizens));
	floatIcon("citizens",this.index)
	floatIcon(this.currentResource,this.index,true);
}

//Barn specifics
Barn.prototype.gather=function(){
	if(Game.getSeason=="Summer"){Game.playerStats.food += this.level*1.5;floatIcon("food",this.index);}
	else if(Game.getSeason == "Winter"){}
	else{Game.playerStats.food += this.level;floatIcon("food",this.index);}
}

//Barracks specifics
Barracks.prototype.gather=function(){
	if(this.active===false){return}
	Game.playerStats.citizens -= 0.5;
	Game.playerStats.warriors += this.level*0.10;
	floatIcon("warriors",this.index);
}

//Creates a menu to select a building from
function openBuildMenu(element){
	var classArray = ["forester","mine","barn","barracks"];
	var index = parseInt(element.attr("id").charAt(element.attr("id").length-1));
	$("<div/>")
	.addClass("prompt buildPrompt")
	.css("left",170+(index*120)+"px")
	.appendTo("#gameScreen");

	for(var i=0;i<classArray.length;i++){
		$(makeBuildCell(classArray[i],index)).appendTo(".buildPrompt");
	}

}

//Creates a selection with the building type to add.
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
			description="Convert citizens to warriors";
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

//Creates the menu for an existing building
function openBuildingMenu(element){
	var index = parseInt(element.attr("id").charAt(element.attr("id").length-1)),object=buildingManager.allBuildings[index];
	if(object.type=="forester"||object.type=="mine"||object.type=="barn"||object.type=="barracks"){
		if(object.level<3){
			openSimpleBuildingMenu(index,object);
			return;
		}
		//Creates a prompt with only the destroy button
		else{
			openDestroyMenu(index);
			return;
		}
	}
	else if(object.type=="townhall"){
		openTownhallBuildingMenu(index,object);
	}
}

//Creates a building menu for barns, foresters and mine. Display
function openSimpleBuildingMenu(index,object){
	var isBarracks = (object.type=="barracks");
	var classForMenu = isBarracks ? "barracksBuildingPrompt":"simpleBuildingPrompt";
	$("<div/>")
		.addClass("prompt "+classForMenu)
		.css("left",170+(index*120)+"px")
		.appendTo("#gameScreen");

	$("<div/>")
		.addClass("buildingButtons upgradeButton")
		.appendTo(".simpleBuildingPrompt")
		.on("click",function(e){
			e.stopPropagation;
			buildingManager.allBuildings[index].upgrade(index);
		});

	$("<div/>")
		.addClass("woodCost")
		.text(object.woodToUpgrade)
		.appendTo(".simpleBuildingPrompt");

	$("<div/>")
		.addClass("citizenCost")
		.text(object.citizensToUpgrade)
		.appendTo(".simpleBuildingPrompt");

	$("<div/>")
		.addClass("buildingButtons destroyButton")
		.appendTo(".simpleBuildingPrompt")
		.on("click",function(e){
			e.stopPropagation;
			buildingManager.destroy(index);
			Game.updatePlayerStats();
		});
}

//Creates a menu for the townhall
function openTownhallBuildingMenu(index,object){
	var lastLevel = (object.level==3) ? true : false;
	var production = ["wood","iron","food","gold"];
	$("<div/>")
		.addClass("prompt townhallBuildingPrompt")
		.css("left",170+(index*120)+"px")
		.css("top",(lastLevel)?"230px":"275px")
		.appendTo("#gameScreen");

	var upgradeButton= $("<div/>").addClass("buildingButtons upgradeButton");
	if(lastLevel){
		upgradeButton.addClass("inactive");
	}else{
	$("<div/>")
		upgradeButton.on("click",function(e){
				e.stopPropagation;
				buildingManager.allBuildings[index].upgrade(index);
			});
	}
		upgradeButton.appendTo(".townhallBuildingPrompt");

	$("<div/>")
		.addClass("woodCost")
		.text(object.woodToUpgrade)
		.appendTo(".townhallBuildingPrompt");

	$("<div/>")
		.addClass("citizenCost")
		.text(object.citizensToUpgrade)
		.appendTo(".townhallBuildingPrompt");

	for(var i=0;i<production.length;i++){
		var tempProd = production[i];
		$("<div/>",{
			"id":production[i]
		})
			.addClass("productionIcon")
			.css("background-image","url(images/icons/"+production[i]+"ProductionIcon.png)")
			.appendTo(".townhallBuildingPrompt")
			.on("click",function(e){
				e.stopPropagation();
				buildingManager.allBuildings[index].currentResource=$(this).attr("id");
				closePrompt();
			})
	}


}

//Creates a menu with only a remove button.
function openDestroyMenu(index){
	$("<div/>")
		.addClass("prompt destroyPrompt")
		.css("left",230+(index*120)+"px")
		.appendTo("#gameScreen");

	$("<div/>")
		.addClass("buildingButtons destroyButton")
		.appendTo(".destroyPrompt")
		.on("click",function(e){
			e.stopPropagation;
			buildingManager.destroy(index);
			Game.updatePlayerStats();
		});
}

function floatIcon(resource,index,hasOffset){
	var offset = (hasOffset)? 30:0;
	var floater = $("<div/>")
	.addClass("floatIcon")
	.css({"background-image":"url(images/icons/"+resource+"Icon.png)",
	"left": 240+offset+(index*120)+"px"})
	.appendTo("#gameScreen");

	setTimeout(function(){floater.remove();},1000)
}

//Close all prompts on the screen.
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

	//Add a building to the array and give it a graphic
	build:function(type,index){
		if(Game.playerStats.wood>=BuildingPseudo[type].costWood
			&& Game.playerStats.citizens>=BuildingPseudo[type].costCitizens){
			//Backend
			Game.playerStats.wood -= BuildingPseudo[type].costWood;
			Game.playerStats.citizens -= BuildingPseudo[type].costCitizens;

		switch(type){
		case "townhall":
			this.allBuildings[index]=new TownHall(index);
			break;
		case "forester":
			this.allBuildings[index]=new Forester(index);
			break;
		case "mine":
			this.allBuildings[index]=new Mine(index);
			break;
		case "barn":
			this.allBuildings[index]=new Barn(index);
			break;
		case "barracks":
			this.allBuildings[index]=new Barracks(index);
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
		Game.playerStats.wood += this.allBuildings[index].totalWoodSpent/2;
		Game.playerStats.citizens += this.allBuildings[index].totalCitizensSpent;
		this.allBuildings[index]="";
		$("#spot"+index)
		.css("background-image","none")
		.removeClass("building")
		.removeClass("upgraded")
		.addClass("build");
		closePrompt();
	}
}

return {
	buildingManager:buildingManager,
	buildingInit:addEvents
}

})();