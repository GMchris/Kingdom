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
			if(this.month==3||this.month==6||this.month==9){
				this.addSeason();
			}
			$("#month").text(this.months[this.month]);
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
