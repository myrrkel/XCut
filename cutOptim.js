
function Cut(jsonCut,parentOptimizer){
	this.l = jsonCut.l;
	this.packingId = jsonCut.packingId;
	this.optimizer = parentOptimizer;
	this.used = false;

}
Cut.prototype.totalSize = function(){return this.l+this.optimizer.bladeThickness};



function Bar(size,id){
	this.ID = id;
	this.size = size;
	this.sizeLeft = size;
	this.pieces = [];

	this.addPiece = function(cut){
		if(this.sizeLeft == cut.l)
			{this.sizeLeft -= cut.l}
		else {this.sizeLeft -= cut.totalSize()}
			this.pieces.push(cut);
		cut.used = true;
		console.log('Add '+cut.l+'--> barID='+this.ID+' sizeLeft:'+this.sizeLeft);
	};

	this.sizeUsed = function(){
		return (this.size - this.sizeLeft);

	};
}



function Optimizer(arrayCuts)
{
	this.jsonCuts = arrayCuts;
	this.cuts = [];
	this.barSize = 6000;
	this.bars = [];
	this.lastBar = new Bar();
	this.stock = [1200,826];
	this.bladeThickness = 2;

	this.countBars = function(){return this.bars.length}
	this.totalSizeBars= function(){
		var tsize = 0;
		for (bar of this.bars){tsize += bar.size;}
			return tsize;
	}
	this.totalUsedBars= function(){
		var tsize = 0;
		for (bar of this.bars){tsize += bar.sizeUsed();}
			return tsize;
	}
	this.totalLossBars= function(){
		var tsize = 0;
		for (bar of this.bars){tsize += bar.sizeLeft;}
			return tsize;
	}
	this.totalCuts= function(){
		var tsize = 0;
		for (i=0;i<this.cuts.length;i++){tsize += this.cuts[i].l;}
			return tsize;
	}
	this.totalCutsLeft= function(){
		var tsize = 0;
		for (i=0;i<this.cuts.length;i++){
			if(this.cuts[i].used ==false){tsize += this.cuts[i].l;}
		}
		return tsize;
	}
	this.countCutsLeft= function(){
		var nb = 0;
		for (i=0;i<this.cuts.length;i++){
			if(this.cuts[i].used ==false){nb++}
		}
	return nb;
}


this.findBarFitBest= function(size){
	var ibar = -1;
	var bestSizeFound = 0;
	for (i=0;i<this.bars.length;i++){
		if(this.bars[i].sizeLeft >= size && (bestSizeFound > this.bars[i].sizeLeft || bestSizeFound==0)){
			bestSizeFound = this.bars[i].sizeLeft;
			ibar = i;
		}
	}

	if (ibar >= 0) {this.lastBar = this.bars[ibar]}
		else {this.addBar(this.barSize)}
	}



this.findCutFitBest= function(size){
	var icut = -1;
	var bestSizeFound = 0;
	for (i=0;i<this.cuts.length;i++){
		if(this.cuts[i].totalSize() > bestSizeFound && this.cuts[i].used==false){
			if(this.cuts[i].totalSize() < size) {bestSizeFound = this.cuts[i].sizeLeft;icut = i;}
			if(this.cuts[i].l == size) {bestSizeFound = this.cuts[i].l;icut = i;}
		}
	}

	return icut;
}


this.findEmptyBar= function(){
	var ibar = -1;
	for (i=0;i<this.bars.length && ibar<0;i++){
		if(this.bars[i].sizeLeft == this.barSize){ibar = i}
	}

if (ibar >= 0) {this.lastBar = this.bars[ibar]}
	else {this.addBar(this.barSize)}
}

this.optimize = function()
{
	//Loading Cuts in an array
	this.jsonToCuts();
	//Create a set of empty bars
	this.initBars();	
	//fill bars
	this.optiBiggestCuts();
	this.optiCutFitBest();
	//this.optiBarFitBest();

	return this.bars;
}

this.optimize2 = function()
{
	this.jsonToCuts();
	this.optiBiggestCuts();		
	this.optiBarFitBest();

	return this.bars;
}

this.minBarNeeded = function(){
	return Math.ceil(this.totalCuts()/this.barSize)
}

this.initBars = function(){
	var nbBar = this.minBarNeeded();
	console.log('min bars='+nbBar);
	for (i=0;i<nbBar;i++)
		{this.addBar();}
}


this.optiBarFitBest = function(){

	this.sortCuts(false);

		//We add the unused cuts
		for (cut of this.cuts){
			if (cut.used != true)
			{
				//Get the best fit bar
				this.findBarFitBest(cut.totalSize());

				//Add the cut to the bar
				this.lastBar.addPiece(cut);
			}
		}
	}


	this.optiCutFitBest = function(){
		var cutLeft = this.countCutsLeft();
		var icut = 0;
		var barFound = true;
		this.sortCuts(false);

		//We add the unused cuts
		console.log('cutLeft='+cutLeft);
		while (cutLeft > 0 && barFound==true) 
		{
			barFound = false;
			for (bar of this.bars){
				//Get cut that fit best
				icut = this.findCutFitBest(bar.sizeLeft);
				console.log('icut='+icut);
				//Add the cut to the bar
				if(icut >= 0) {
					bar.addPiece(this.cuts[icut]);
					barFound = true;
					this.sortBars();
				}
			}
			if (barFound==false) {this.addBar();barFound = true;}
			cutLeft = this.countCutsLeft();	
			console.log('cutLeft='+cutLeft);
		}
	}

	this.optiBiggestCuts = function(autoAdd=false){

		this.sortCuts();
		//We add the cuts bigger than a half of bar
		for (cut of this.cuts){
			if (cut.totalSize() >= this.barSize/2 || cut.l==this.barSize)
			{
				if (autoAdd==true) {
					//Add a new bar
					this.addBar();
				}
				else
				{
					//Find an empty bar
					this.findEmptyBar();

				}

				//Add the cut to the bar
				this.lastBar.addPiece(cut);
			}
		}

	}




	this.jsonToCuts = function() {
		this.cuts = [];
		for (jcut of this.jsonCuts){

			this.cuts.push(new Cut(jcut,this));
		}

	}


	this.addBar = function(sizeBar=0){
		console.log('Add BAR '+sizeBar);
		if (sizeBar==0){sizeBar=this.barSize;}
		this.bars.push(new Bar(sizeBar,this.bars.length+1));
		this.lastBar = this.bars[this.bars.length-1];

	}


	this.sortCuts = function(randomize=false){
		if (randomize==true) 
			{this.cuts.sort(function(a, b){return 0.5 - Math.random()});}
		else
			{this.cuts.sort(function(a, b){return b.l - a.l});}		
	}


	this.sortBars= function(sizeLeftAsc=true){
		if (sizeLeftAsc) 
			{this.bars.sort(function(a, b){return a.sizeLeft - b.sizeLeft});}
		else
			{this.bars.sort(function(a, b){return b.sizeLeft - a.sizeLeft});}
	}


}


exports.Optimizer = Optimizer;

exports.Bar = Bar;