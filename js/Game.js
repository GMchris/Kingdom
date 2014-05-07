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
		this.gameTimer = setInterval(function(){GameControls.gameLoop();},50);
	},

	deactivateTimer:function(){
		clearInterval(GameControls.gameTimer)
	},

	setInitialValues: function(){
		Player.wood =10000;
		Player.iron =10000;
		Player.food =100000;
		Player.gold =10000;
		Player.citizens =5000;
		Player.warriors =10000;
	},

	gameLoop: function(){
		Structures.buildingManager.gatherResources();
		cyclePlayer();
		Time.tick();
		Events.checkEventTime();
	},

	loseGame:function(reason){
		var lossPrompt = $("<div/>").addClass("prompt lossPrompt");
		var description, title;
		this.deactivateTimer();
		$("<div/>").addClass()
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

var Events = {

	increment: 20,

	nextEventTime : 20,

	periodicEvents : ["Invasion.invade","fire","plague","robbery"],

	checkEventTime : function(){
		$(".prompt").remove();
		var spot = Math.floor((Math.random() *this.periodicEvents.length));
		if(Time.total >= this.nextEventTime){
			GameControls.deactivateTimer();
			console.log(spot)
			//In case of invasion only
			if(spot==0){this.Invasion.invade()}
			//All other cases(simple events)
			else{Events[Events.periodicEvents[spot]]();}
			this.nextEventTime += this.increment;
		}
	},

	tax:function(){
		var taxThisMonth = Time.month*150;
			if(Player.gold>=taxThisMonth){
				Player.gold -= taxThisMonth;
				return;
		}
		GameControls.loseGame("tax")
	},

	feed:function(){
		if(Player.food>=Player.citizens){
			Player.food -= Player.citizens;
			return;
		}
		GameControls.loseGame("food")
	},

	fire:function(){
		var buildings = Structures.buildingManager.allBuildings;
		var selectFew = [];
		for(var i=0;i<buildings.length;i++){
			if(buildings[i]&&buildings[i].type!== "townhall"){
				selectFew[selectFew.length]=buildings[i].index
			}
		}
		if(selectFew.length>0){
			Structures.buildingManager.destroy(selectFew[Math.floor((Math.random() *selectFew.length))]);
			Visual.eventPrompt("fire");
		}

		else{
			GameControls.loseGame("fire");
		}

		GameControls.deactivateTimer();

	},

	plague:function(){
		var percentageDead = Math.floor((Math.random() *5)+5);
		var dead = (Player.citizens/100)*percentageDead;
		Player.citizens -=dead;
		cyclePlayer();
		Visual.eventPrompt("plague");

	},

	robbery:function(){
		var stolenGold = (Player.gold/100)*5;
		var stolenFood = (Player.food/100)*5;
		Player.gold -= stolenGold;
		Player.food -= stolenFood;
		Visual.eventPrompt("robbery")
	},

	Invasion:{

		currentArmy:null,

		invade:function(){
			this.currentArmy = new this.Army();
			Visual.eventPrompt("invasion")


		},
		Army:function(){
			this.types = ["gaels","romans","vikings","greeks"]
			this.type = this.types[Math.floor((Math.random() *this.types.length))];
			this.warriors = Time.total/10;
			this.bribe = Time.total/5;
			this.attack=function(){
				if(this.warriors>Player.warriors){
					GameControls.loseGame("defeat")
				}
				else{
					//Win results
				}
			}
			this.payoff=function(){
				Player.gold -= this.bribe;
			}
		}
	}
}

var Time={
		total: 0,
		ticks : 0,
		day : 1,
		month : 0,
		season: 0,
		months : ["March","April","May","June","July","August","September","October","November","December","January","February"],
		seasons: ["Spring","Summer","Autumn","Winter"],
		seasonModifiers:["Food from forester +100%","Gold +100%/Barn food +50%","Citizen grow +50%","Wood +50%/Food -100%"],
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
			Events.tax();
			Events.feed();
			cyclePlayer();
			if(this.month==3||this.month==6||this.month==9){
				this.addSeason();
			}
			$("#month").text(this.months[this.month]);
			$("#goldOwed").text((this.month+1)*150)
		},
		addSeason:function(){

			this.season++;
			$("#season").text(this.seasons[this.season]);
			$("#seasonModifiers").text(this.seasonModifiers[this.season]);
		},
		getSeason:function(){
			return this.seasons[this.season]
		}
	}

function cyclePlayer(){
	var spots = $(".stats"),iterator=0;
	$.each(Player,function(key,value){
			$(spots[iterator]).text(Math.floor(value));
			iterator++;
		});
}

var Visual = {
	eventPrompt:function(type){
		var title,text,isInvasion=false;;
		switch(type){
			case "invasion":
				title = "Invasion";
				text = "The "+Events.Invasion.currentArmy.type+" are attacking! Pay them off with gold or face them in battle with steel.";
				isInvasion = true;
				break;

			case "fire":
				title = "Fire";
				text = "One of your buildings has caught on fire and burned down! No materials were retrieved."
				break;

			case "plague":
				title = "Plague";
				text = "The black death passes through your village, claiming the lives of poor citizens."
				break;

			case "robbery":
				title = "Robbery";
				text = "A group of thieves sneaked in your village during the night and stole some food and gold from your reserves."
				break;
		}

		$("<div/>").addClass("blackoutWindow").appendTo("#gameScreen");
		$("<div/>").addClass("eventPrompt").appendTo(".blackoutWindow");
		$("<div/>").addClass("eventTitle").text(title).appendTo(".eventPrompt");
		$("<div/>").addClass("eventText").text(text).appendTo(".eventPrompt");

		if(isInvasion){
			$("<div/>")
			.addClass("fightButton invasionButton")
			.text("Fight "+ Time.total/10)
			.appendTo(".eventPrompt")
			.on("click",function(){
				Events.Invasion.currentArmy.attack();
			});

			$("<div/>")
			.addClass("bribeButton invasionButton")
			.text("Pay "+Time.total/5)
			.appendTo(".eventPrompt")
			.on("click",function(){
				if(Player.gold<Events.Invasion.currentArmy.bribe){return}
				Events.Invasion.currentArmy.payoff();
				$(this).remove()
			});
		}
		else{
			$(".blackoutWindow").addClass("clickable");
			$(".blackoutWindow").on("click",function(e){
				e.stopPropagation();
				$(this).remove();
				GameControls.activateTimer();
			})
		}

		}
	}

window.addEventListener("load",GameControls.init,false);

return {
	playerStats:Player,
	updatePlayerStats:cyclePlayer,
	activateTimer:GameControls.activateTimer,
	deactivateTimer:GameControls.deactivateTimer,
	eventPrompt:Visual.eventPrompt,
	events:Events
}

})();
