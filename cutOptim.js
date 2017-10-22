
function Cut(jsonCut,parentOptimizer){
	if (jsonCut == null){
		this.l = 0;
		this.packingId = 0;
	}
	else{
		this.l = jsonCut.l;
		this.packingId = jsonCut.packingId;
	}
	this.optimizer = parentOptimizer;
	this.used = false;
	this.pieces = [];
	this.parents = [];
	this.extra = false;


	this.totalSize = function(){return this.l+this.optimizer.bladeThickness};
	this.setUsed = function(){
		this.used = true;
			//this.setUsedParents();
		}

		this.setUsedPieces = function(){

			var piece;

			for(i=0;i<this.pieces.length;i++)
			{
			//SetUsed for the pieces that make up this cut
			piece = this.optimizer.cutCol.cuts[this.pieces[i]];
			piece.setUsed();
			piece.setUsedParents();
			
		}

		//this.used = true;
	}

	this.setUsedParents = function(){

		var parent;

			//SetUsed cuts that contain this pieces
			for(j=0;j<this.parents.length;j++)
			{
				parent = this.optimizer.cutCol.extraCuts[this.parents[j]];
				parent.setUsed();
				
			}
			//this.used = true;
		}

		this.getTxtPieces = function(){
			var txt = '';
			for(i=0;i<this.pieces.length;i++){
				txt += this.pieces[i]+';';
			}
			return txt
		}

		this.getTxtParents = function(){
			var txt = '';
			for(i=0;i<this.parents.length;i++){
				txt += this.parents[i]+';';
			}
			return txt
		}


	}




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
			cut.setUsed();
			console.log('Add '+cut.l+'--> barID='+this.ID+' sizeLeft:'+this.sizeLeft+' nbPiece='+cut.pieces.length+' nbParent='+cut.parents.length+' extra='+cut.extra);
		};

		this.sizeUsed = function(){
			return (this.size - this.sizeLeft);

		};
	}

	function CutCollection(parentOptimizer){
		this.cuts = [];
		this.extraCuts = [];
		this.optimizer = parentOptimizer;

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
	this.sortCuts = function(randomize=false){
		if (randomize==true) 
			{this.cuts.sort(function(a, b){return 0.5 - Math.random()});}
		else
			{this.cuts.sort(function(a, b){return b.l - a.l});}		
	}
	this.raz= function(){
		for (i=0;i<this.cuts.length;i++){this.cuts[i].used = false;}
	}

this.findCutFitBest= function(size){
	var cut=null;
	var bestSizeFound = 0;
	for (i=0;i<this.cuts.length;i++){
		
		if(this.cuts[i].totalSize() > bestSizeFound && this.cuts[i].used==false){
			
			if(this.cuts[i].totalSize() < size || this.cuts[i].l == size){
				//console.log('Cut size='+(this.cuts[i].totalSize() > bestSizeFound));
				bestSizeFound = this.cuts[i].l;
				cut = this.cuts[i];
				//console.log('found cut');
			}
		}
	}
		//find if there is a best cut in extras
		for (i=0;i<this.extraCuts.length;i++){
			if(this.extraCuts[i].totalSize() > bestSizeFound && this.extraCuts[i].used==false){
				if(this.extraCuts[i].totalSize() < size || this.extraCuts[i].l == size){
					bestSizeFound = this.extraCuts[i].l;
					cut = this.extraCuts[i];
					console.log('found ExtraCut '+cut.used+' i='+i);
				}
			}
		}


		return cut;
	}

	this.generateExtraCuts= function(){
		for(i=0;i<this.cuts.length;i++){
			console.log('i='+i);
			if(this.cuts[i].used == false){
				for(j=i+1;j<this.cuts.length;j++){
					if(this.cuts[j].used==false){
						
						for(k=j+1;k<this.cuts.length;k++){
							if(this.cuts[k].used == false){
								var cut = new Cut(null,this.optimizer);
								//cut.l = this.cuts[i].totalSize()+this.cuts[j].l;
								cut.l = this.cuts[i].totalSize()+this.cuts[j].totalSize()+this.cuts[k].l;
								cut.pieces = [];
								cut.extra = true;


								this.extraCuts.push(cut);
								var n = this.extraCuts.length-1;
								this.extraCuts[n].pieces.push(i);
								this.extraCuts[n].pieces.push(j);
								this.extraCuts[n].pieces.push(k);

						//console.log('cutExtra '+cut.l+' nbPiece='+cut.pieces.length+' nbParent='+cut.parents.length);
						//console.log('extra '+n+' i='+i+' j='+j+' parenti='+this.cuts[i].parents.length+' parentj='+this.cuts[j].parents.length);
						this.cuts[i].parents.push(n);
						this.cuts[j].parents.push(n);
						this.cuts[k].parents.push(n);
					}
				}
			}
		}
	}
}
}

}


function BarCollection(barsize){
	this.bars = [];
	this.lastBar = new Bar();
	this.barSize = barsize;

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

	this.findEmptyBar= function(){
		var ibar = -1;
		for (i=0;i<this.bars.length && ibar<0;i++){
			if(this.bars[i].sizeLeft == this.barSize){ibar = i}
		}

	if (ibar >= 0) {this.lastBar = this.bars[ibar]}
		else {this.addBar(this.barSize)}
	}


this.addBar = function(sizeBar=0){
	
	if (sizeBar==0){sizeBar=this.barSize;}
	this.bars.push(new Bar(sizeBar,this.bars.length+1));
	this.lastBar = this.bars[this.bars.length-1];
	console.log('Add BAR '+sizeBar+' ID='+this.lastBar.ID);

}


this.sortBars= function(sizeLeftAsc=true){
	if (sizeLeftAsc) 
		{this.bars.sort(function(a, b){return a.sizeLeft - b.sizeLeft});}
	else
		{this.bars.sort(function(a, b){return b.sizeLeft - a.sizeLeft});}
}




}



function Optimizer(arrayCuts)
{
	this.jsonCuts = arrayCuts;

	this.stock = [1200,826];
	this.bladeThickness = 2;
	this.barSize = 6000;

	this.cutCol = new CutCollection(this);
	this.barCol = new BarCollection(this.barSize);




	this.optimize = function()
	{
	//Loading Cuts in an array
	this.jsonToCuts();
	//Create a set of empty bars
	this.initBars();	
	//fill bars
	this.optiBiggestCuts();
	this.cutCol.generateExtraCuts();
	this.optiCutFitBest();
	//this.optiBarFitBest();

	return this.barCol.bars;
}



this.optiBarFitBest = function(){

	this.cutCol.sortCuts(false);

		//We add the unused cuts
		for (cut of this.cutCol.cuts){
			if (cut.used != true)
			{
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
		//this.cutCol.sortCuts(false);

		//We add the unused cuts
		while (cutLeft > 0) 
		//while (cutLeft > 0 && this.barCol.bars.length <= 99) 
	{
		barFound = false;
		for (bar of this.barCol.bars){
				//Get the cut that fit best
				cut = this.cutCol.findCutFitBest(bar.sizeLeft);
				if(cut != null) {
					if(cut.pieces.length > 0){
						for (p of cut.pieces){
							console.log('add extra p='+p);
							bar.addPiece(this.cutCol.cuts[p]);
							//this.cutCol.cuts[p].setUsedParents();
							//this.cutCol.cuts[p].setUsed();
						}
						cut.setUsedPieces();
						cut.setUsed();
					}
					else {
						console.log('add simple');
						bar.addPiece(cut);
						cut.setUsedParents();
						cut.setUsed();
					}

					barFound = true;
					this.barCol.sortBars();
				}
				else {
					//console.log('Cut null!');
				}
			}
			if (barFound==false) {
				console.log('Cut not found!');
				this.barCol.addBar();
				barFound = true;
			}
			cutLeft = this.cutCol.countCutsLeft();	
		}
	}


	this.optiBiggestCuts = function(autoAdd=false){

		this.cutCol.sortCuts();
		//We add the cuts bigger than a half of bar
		for (cut of this.cutCol.cuts){
			if (cut.totalSize() >= this.barSize/2 || cut.l==this.barSize)
			{
				if (autoAdd==true) {
					//Add a new bar
					this.barCol.addBar();
				}
				else
				{
					//Find an empty bar
					this.barCol.findEmptyBar();

				}

				//Add the cut to the bar
				this.barCol.lastBar.addPiece(cut);
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
		for (jcut of this.jsonCuts){

			this.cutCol.cuts.push(new Cut(jcut,this));
		}

	}




}


exports.Optimizer = Optimizer;

exports.Bar = Bar;