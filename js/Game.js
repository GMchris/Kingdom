'use strict'
var Game = (function(){
var GameControls = {

	init : function(){
		setInterval(function(){GameControls.visualLoop()},50)
		GameControls.setInitialValues();
		cyclePlayer();
		Structures.buildingInit();
		$("<div id='guide'></div>")
		.appendTo("#gameScreen")
		.on("click",function(e){
			e.stopPropagation();
			$(this).remove();
			GameControls.activateTimer();
		});
	},

	gameTimer:null,

	activateTimer:function(){
		this.gameTimer = setInterval(function(){GameControls.gameLoop();},500);
	},

	deactivateTimer:function(){
		clearInterval(GameControls.gameTimer)
	},

	setInitialValues: function(){
		Player.wood =2500;
		Player.iron =0;
		Player.food =400;
		Player.gold =600;
		Player.citizens =350;
		Player.warriors =15;
	},

	gameLoop: function(){
		Structures.buildingManager.gatherResources();
		cyclePlayer();
		Time.tick();
		Events.checkEventTime();
	},

	visualLoop:function(){
		Visual.moveClouds();
	},

	loseGame:function(reason){
		Visual.loseGamePrompt(reason);
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

	increment: 100,

	nextEventTime : 150,

	periodicEvents : ["invasion","fire","plague","invasion","robbery"],

	checkEventTime : function(){
		var spot = Math.floor((Math.random() *this.periodicEvents.length));
		if(Time.total >= this.nextEventTime){
			$(".prompt").remove();
			GameControls.deactivateTimer();
			//In case of invasion only
			if(this.periodicEvents[spot]=="invasion"){this.Invasion.invade()}
			//All other cases(simple events)
			else{Events[Events.periodicEvents[spot]]();}
			this.nextEventTime += this.increment;
		}
	},

	firewood:function(){
		var woodThisMonth = Time.month*100;
		if(Time.season==3){woodThisMonth+=200}
			if(Player.wood>=woodThisMonth){
				Player.wood -=woodThisMonth;
				return;
			}
			GameControls.loseGame("wood")
	},

	tax:function(){
		var taxThisMonth = Time.month*75;
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
				$(".blackoutWindow").remove();
				if(this.warriors>Player.warriors){
					GameControls.loseGame("defeat")
				}
				else{
					Player.warriors -= (this.warriors/100)*20
					Visual.eventPrompt("beatInvasion");
					Events.increment += 20;
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
		seasonModifiers:["Food from forester +100%","Gold +100%/Barn food +50%","Citizen growth +50%","Wood +50%/Food -100%"],
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
			Events.firewood();
			cyclePlayer();
			if(this.month==3||this.month==6||this.month==9){
				this.addSeason();
			}
			$("#month").text(this.months[this.month]);
			$("#goldOwed").text((this.month+1)*75)
			$("#woodOwed").text((this.month+1)*100)
		},
		addSeason:function(){
			this.season++;
			Visual.flash();
			if(this.season==2){
				$("#gameScreen").css("background-image","url(images/backgrounds/autumn.png)");
			}
			if(this.season==3){
				$("#gameScreen").css("background-image","url(images/backgrounds/winter.png)");
			}
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
	flash:function(){
		var flashDiv = $("<div/>");

		flashDiv.addClass("flash")
		.appendTo("#gameScreen")
		.fadeOut(300,function(){
			$(this).remove();
		})

	},

	currentCloudPosition:0,

	moveClouds:function(){
		this.currentCloudPosition+=1;
		$("#clouds").css("background-position",this.currentCloudPosition+"px");
	},

	loseGamePrompt:function(reason){
		var title,text;

		switch(reason){
			case "defeat":
				title = "Military defeat";
				text = "Your army wasn't strong enough to overcome the invaders and your city has fallen."
				break;
			case "tax":
				title = "Broke"
				text = "You couldn't pay the king's taxes. Needless to say the king's men came to collect, and didn't leave much of your village."
				break;
			case "food":
				title = "Hunger";
				text = "You didn't manage to save up enough food for your citizens. Some die of hunger, the rest abandon the village in search for better."
				break;
			case "fire":
				title = "Demoralizing fire";
				text = "A starts at the edge of the city, but quickly reaches the town hall. After it's loss, all hope for the village goes too."
				break;	
			}

		$("<div/>").addClass("blackoutWindow").appendTo("#gameScreen");
		$("<div/>").addClass("eventPrompt losePrompt").appendTo(".blackoutWindow").on("click",function(){
			location.reload();
		});
		$("<div/>").addClass("eventTitle").text(title).appendTo(".eventPrompt");
		$("<div/>").addClass("eventText").text(text).appendTo(".eventPrompt");


	},

	eventPrompt:function(reason){
		var title,text,isInvasion=false;;
		switch(reason){
			case "invasion":
				title = "Invasion";
				text = "The "+Events.Invasion.currentArmy.type+" are attacking! Pay them off with gold or face them in battle with steel.";
				isInvasion = true;
				break;

			case "beatInvasion":
				title = "Victory";
				text = "You've defeated the invading army! They'll think twice before coming back. Sadly you lost some good men yourself."
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
			.text("Fight")
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
				$(".blackoutWindow").remove();
				Events.increment -=15;
				GameControls.activateTimer();
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
