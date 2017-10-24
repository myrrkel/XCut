
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

	this.cutCol = new libCutCol.CutCollection(this);
	this.barCol = new libBarCol.BarCollection(this.barSize);


	this.optimize = function(){
		//Loading Cuts in an array
		this.jsonToCuts();
		//Create a set of empty bars
		this.initBars();	
		//fill bars
		//this.optiBiggestCuts();

		this.optiStartAllBars();
		this.cutCol.generateExtraCuts();

		//console.log('count 2029 ='+this.cutCol.countExtraCutsEqualTo(2029));
		this.optiCutFitBest();

		//this.optiBarFitBest();

		return this.barCol.bars;
	}



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
	}


	this.optiCutFitBest = function(){
		var cutLeft = this.cutCol.countCutsLeft();
		var cut = null;
		var barFound = false;
		this.cutCol.sortCuts(true);
		this.cutCol.sortExtraCuts(true);
		this.barCol.sortBars();

		//We add the unused cuts
		while (cutLeft > 0) {
			barFound = false;
			for (bar of this.barCol.bars){
				if(bar.sizeLeft >= this.cutCol.minimum()+this.bladeThickness){
					//Get the cut that fit best
					cut = this.cutCol.findCutFitBest(bar.sizeLeft);
					if(cut != null) {
						console.log('bar'+bar.id+' sizeLeft='+bar.sizeLeft+' cutLeft='+cutLeft+' cut='+cut.l+' cutID='+cut.id+' mini='+this.cutCol.minimum()+' '+cut.getText());

						if(cut.pieces.length > 0){
							for (p of cut.getAllPieces()){
								bar.addPiece(p);
							}
							cut.setUsed();
						}
						else {bar.addPiece(cut)};

						barFound = true;
						this.barCol.sortBars(true);
					}
				}
			}

			if (barFound==false){this.barCol.addBar()};
			cutLeft = this.cutCol.countCutsLeft();	
		}
	}


	this.optiBiggestCuts = function(autoAdd=false){

		this.cutCol.sortCuts(false);
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
	}

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
	}


	this.minBarNeeded = function(){
		return Math.ceil(this.cutCol.totalCuts()/this.barSize)
	}

	this.initBars = function(){
		var nbBar = this.minBarNeeded();
		console.log('min bars='+nbBar);
		for (i=0;i<nbBar;i++)
			{this.barCol.addBar();}
	}

	this.jsonToCuts = function() {
		this.cutCol.cuts = [];
		for (i=0;i<this.jsonCuts.length;i++){

			this.cutCol.cuts.push(new libCut.Cut(this.jsonCuts[i],this,i));
		}

	}

}




exports.Optimizer = Optimizer;

exports.Bar = libBar.Bar;