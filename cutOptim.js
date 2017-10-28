
var libCut = require('./cut');
var libBar = require('./bar');
var libCutCol = require('./cutCollection');
var libBarCol = require('./barCollection');

//Optimizer : return the best cutting plan
function Optimizer(arrayCuts){
	this.jsonCuts = arrayCuts;

	this.stock = [1200,826];
	this.bladeThickness = 2;
	this.barSize = 6000;
	this.lossCeil = 1000; //If a bar has a sizeLeft >= 1000, it's not a loss, this part of bar could be added in stock.

	this.cutCol = new libCutCol.CutCollection(this);
	this.barCol = new libBarCol.BarCollection(this);


	this.optimize = function(){
		//Loading Cuts in an array
		this.jsonToCuts();
		//Create a set of empty bars
		this.initBars();	
		//fill bars
		this.optiBiggestCuts();

		this.optimize_NOTBAD();

		var nbImprovement = 0, i=1;
		do {
			
			console.log('/////////////////////////////////////  IMPROVEMENT N°'+i);
			nbImprovement = this.barCol.improve();
			this.repport();
			this.barCol.razImproved();
			i++;

		} while(nbImprovement>0);

		//this.optiCutFitBest(false,false,false);
		this.repport();

		return this.barCol.bars;
	};


	this.optimize_NOTBAD = function(){

		this.cutCol.generateExtraCuts(null,null,2,800,true);
						// (onlyStartedBars=false,worstFirst=false,onePass=false)
		this.optiCutFitBest(true,false,true);

		this.cutCol.resetExtraCuts();

		this.cutCol.generateExtraCuts(null,null,3,300);

		this.optiCutFitBest(false,false,false);

		return this.barCol.bars;
	};


	this.optimize_VERYBEST = function(){
		
		//Loading Cuts in an array
		this.jsonToCuts();
		//Create a set of empty bars
		this.initBars();	
		//fill bars
		this.optiBiggestCuts();


		this.cutCol.generateExtraCuts(null,null,3,800,true);
						// (onlyStartedBars=false,worstFirst=false,onePass=false)
		this.optiCutFitBest(true,false,true);


		this.cutCol.resetExtraCuts();

		this.cutCol.generateExtraCuts(null,null,3,700);
		this.optiCutFitBest(false,false,true);


		this.cutCol.resetExtraCuts();

		this.cutCol.generateExtraCuts(null,null,5,0);
		this.optiCutFitBest(false,false,false);


		return this.barCol.bars;
	};

	this.optimize_GOODFAST = function(){
		//Loading Cuts in an array
		this.jsonToCuts();
		//Create a set of empty bars
		this.initBars();	
		//fill bars
		this.optiBiggestCuts();

		//this.optiStartAllBars();
		this.cutCol.generateExtraCuts(null,null,2,800,true);
		this.optiCutFitBest(true,true);

		this.cutCol.extraCuts.splice(0,this.cutCol.extraCuts.length);
		this.cutCol.deleteParents();

		this.cutCol.generateExtraCuts(null,null,3,511);
		this.optiCutFitBest(false,true);


		return this.barCol.bars;
	};

	this.optimize_BEST = function(){
		//Loading Cuts in an array
		this.jsonToCuts();
		//Create a set of empty bars
		this.initBars();	
		//fill bars
		this.optiBiggestCuts();

		this.cutCol.generateExtraCuts(null,null,2,800);

		//console.log('count 2029 ='+this.cutCol.countExtraCutsEqualTo(2029));
		this.optiCutFitBest(true,true);

		this.cutCol.generateExtraCuts(null,null,3,600);

		this.optiCutFitBest(false,true);

		//this.barCol.sortByID();

		return this.barCol.bars;
	};



	this.optiBarFitBest = function(){

		this.cutCol.sortCuts(false);

		//We add the unused cuts
		for (cut of this.cutCol.cuts){
			if (cut.used != true){
				//Get the best fit bar
				this.barCol.findBarFitBest(cut.totalSize());

				//Add the cut to the bar
				this.barCol.lastBar.addPiece(cut);
			}
		}
	};


	this.optiCutFitBest = function(onlyStartedBars=false,worstFirst=false,onePass=false){
		var cutLeft = this.cutCol.countCutsLeft();
		var cut = null;
		var barFound = false;
		var nbPass = 0;
		this.cutCol.sortCuts(true);
		this.cutCol.sortExtraCuts(true);
		this.barCol.sortBars((worstFirst==false));
		console.log(worstFirst==false);

		//We add the unused cuts
		while (cutLeft > 0 && ((onePass==false)||(onePass==true && nbPass==0))) {
			barFound = false;
			for (bar of this.barCol.bars){
				if(bar.sizeLeft >= this.cutCol.minimum()+this.bladeThickness && ((onlyStartedBars==true && bar.started()) || (onlyStartedBars==false))){
					//Get the cut that fit best
					cut = this.cutCol.findCutFitBest(bar.sizeLeft);
					if(cut != null) {
						console.log('bar'+bar.id+' sizeLeft='+bar.sizeLeft+' cutLeft='+cutLeft+' cut='+cut.l+' cutID='+cut.id+' mini='+this.cutCol.minimum()+' '+cut.getText());

						if(cut.pieces.length > 0){
							for (p of cut.pieces){
								bar.addPiece(p);
							}
							cut.setUsed();
						}
						else {bar.addPiece(cut)};

						barFound = true;
						
					}
				}
				cutLeft = this.cutCol.countCutsLeft();	
			}
			this.barCol.sortBars(true);

			if(onlyStartedBars){break;}

			if (barFound==false){this.barCol.addBar()};
			cutLeft = this.cutCol.countCutsLeft();	
			nbPass++;
		}
	};


	this.optiBiggestCuts = function(autoAdd=false){

		this.cutCol.sortCuts(true);
		//We add the cuts bigger than a half of bar
		for (cut of this.cutCol.cuts){
			if (cut.totalSize() >= this.barSize/2 || cut.l==this.barSize){
				if (autoAdd==true) {
					//Add a new bar
					this.barCol.addBar();
				}
				else{
					//Find an empty bar
					this.barCol.findEmptyBar();
				}

				//Add the cut to the bar
				this.barCol.lastBar.addPiece(cut);
			}
			else {break};
		}
	};


	this.optiStartAllBars = function(){
		this.cutCol.sortCuts(true);
		for (bar of this.barCol.bars){
			if(bar.sizeLeft == bar.size){
				//Get the longest cut
				cut = this.cutCol.findLongestCut(bar.sizeLeft);
				console.log('bar'+bar.id+' sizeLeft='+bar.sizeLeft+' cut='+cut.l+' cutID='+cut.id+' mini='+this.cutCol.minimum());
				if(cut != null) {
					bar.addPiece(cut);
				}
			}
		}
	};


	this.minBarNeeded = function(){
		return Math.ceil(this.cutCol.totalCuts()/this.barSize)
	};


	this.maxBarNeeded = function(onlyStartedBars){
		if(onlyStartedBars==true){
			return this.barCol.maxBarNeeded(onlyStartedBars);
		}
		else{
			return this.barSize;
		}
	};


	this.initBars = function(){
		var nbBar = this.minBarNeeded();
		console.log('min bars='+nbBar);
		for (var i=0;i<nbBar;i++){
			this.barCol.addBar()
		}
	};


	this.jsonToCuts = function() {
		this.cutCol.cuts = [];
		for (var i=0;i<this.jsonCuts.length;i++){

			this.cutCol.cuts.push(new libCut.Cut(this.jsonCuts[i],this,i));
		}
	};


	this.repport = function() {

		console.log('Bars number='+this.barCol.countBars());
		console.log('TotalSizeBars='+this.barCol.totalSizeBars());
		console.log('TotalUsedBars='+this.barCol.totalUsedBars());
		console.log('CountPiecesInBars='+this.barCol.countPieces());
		console.log('SumPiecesInBars='+this.barCol.sumPieces());
		console.log('SumCuts='+this.cutCol.cuts.length);
		console.log('TotalCuts='+this.cutCol.totalCuts());
		console.log('TotalLoss='+this.barCol.totalLossBars());
		console.log('PerfectBars='+this.barCol.countPerfectBars());
		console.log('LossRate='+Math.round(this.barCol.totalLossBars()*1000000/this.barCol.totalSizeBars(),4)/10000+'%');

	};


}




exports.Optimizer = Optimizer;

exports.Bar = libBar.Bar;