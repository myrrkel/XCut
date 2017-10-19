function Bar(size){
	this.ID = 0;
	this.size = size;
	this.sizeLeft = size;
	this.pieces = [];

	this.addPiece = function(cut,bladeThickness){
		this.sizeLeft -= cut.l+bladeThickness;
		this.pieces.push(cut);
	};

	this.sizeUsed = function(){
		return (this.size - this.sizeLeft);

	};
}



function Optimizer(arrayCuts)
{
	this.cuts = arrayCuts;
	this.barSize = 6000;
	this.bars = [];
	this.lastBar = new Bar();
	this.stock = [1200,826];
	this.bladeThickness = 2;

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
	this.findBarFitBest= function(size){
		var ibar = -1;
		var bestSizeFound = 0;
		for (i=0;i<this.bars.length;i++){
			if(this.bars[i].sizeLeft > size && this.bars[i].sizeLeft){
				bestSizeFound = this.bars[i].sizeLeft;
				ibar = i;
			}


		}

		if (ibar >= 0) {
			return this.bars[ibar];
		}
		else 
		{
			this.addBar(this.barSize);
			return this.bars[this.bars.length-1];
		}
	}

	this.optimize = function()
	{
		//this.cuts.sort(function(a, b){return b.l - a.l});
		this.cuts.sort(function(a, b){return 0.5 - Math.random()});

		for (cut of this.cuts){

			//add a bar to start
			if(this.bars.length == 0){ this.addBar(this.barSize);}

			console.log(cut.l+' lastBar.sizeLeft:'+this.lastBar.sizeLeft+' bars='+this.bars.length);

			//Get the best bar
			var barFitBest = this.findBarFitBest(cut.l+this.bladeThickness);

			barFitBest.addPiece(cut,this.bladeThickness);
			}

		return this.bars;
	};

	this.optimizeDumb = function()
	{
		for (cut of this.cuts)
		{

		//add a bar to start
		if(this.bars.length == 0){ this.addBar(this.barSize);}

		console.log(cut.l+' lastBar.sizeLeft:'+this.lastBar.sizeLeft+' bars='+this.bars.length);

		//if the last bar is too short, we add a new bar
		if(this.lastBar.sizeLeft < cut.l+this.bladeThickness){ this.addBar(this.barSize);}

		//add the cut to the last bar
		this.lastBar.addPiece(cut,this.bladeThickness);
		}

	return this.bars;
	};



	this.addBar = function(sizeBar){
		//this.lastBarSize = sizeBar;
		//console.log('addBar:'+sizeBar);
		this.bars.push(new Bar(sizeBar));
		this.lastBar = this.bars[this.bars.length-1];
		//this.lastBar = this.bars.push(new Bar(sizeBar));;

	};


}


exports.Optimizer = Optimizer;

exports.Bar = Bar;