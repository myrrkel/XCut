var libBar = require('./bar');

function BarCollection(parentOptimizer){
	this.bars = [];
	this.lastBar = new libBar.Bar();
	this.optimizer = parentOptimizer;
	this.barSize = this.optimizer.barSize;

	this.countBars = function(){return this.bars.length};

	this.totalSizeBars= function(){
		var tsize = 0;
		for (bar of this.bars){tsize += bar.size;}
			return tsize;
	};

	this.countPerfectBars= function(){
		var nb = 0;
		for (bar of this.bars){if(bar.isPerfect()) nb ++;}
			return nb;
	};

	this.totalUsedBars= function(){
		var tsize = 0;
		for (bar of this.bars){tsize += bar.sizeUsed();}
			return tsize;
	};

	this.totalLossBars= function(){
		var tsize = 0;
		this.sortBars(true);
		var worst = this.findWorstBar(true);

		for (bar of this.bars){
			if(bar.sizeLeft < this.optimizer.lossCeil && bar.id!=worst.id){
				tsize += bar.sizeLeft;
			}
		}
		return tsize;
	};

	this.findBarFitBest= function(size){
		var ibar = -1;
		var bestSizeFound = 0;
		for (var i=0;i<this.bars.length;i++){
			if(this.bars[i].sizeLeft >= size && (bestSizeFound > this.bars[i].sizeLeft || bestSizeFound==0)){
				bestSizeFound = this.bars[i].sizeLeft;
				ibar = i;
			}
		}

		if (ibar >= 0) {this.lastBar = this.bars[ibar]}
			else {this.addBar(this.barSize)};
	};


	this.findEmptyBar= function(){
		var ibar = -1;
		for (var i=0;i<this.bars.length && ibar<0;i++){
			if(this.bars[i].sizeLeft == this.barSize){ibar = i};
		}

		if (ibar >= 0) {this.lastBar = this.bars[ibar]}
			else {this.addBar(this.barSize)};
	};


	this.addBar = function(sizeBar=0){

		if (sizeBar==0){sizeBar=this.barSize;}
		this.bars.push(new libBar.Bar(sizeBar,this.bars.length+1));
		this.lastBar = this.bars[this.bars.length-1];
		console.log('Add BAR '+sizeBar+' id='+this.lastBar.id);

	};


	this.sortBars = function(descending=false){
		if (descending==false){
			this.bars.sort(compareBarsAsc);
		}
		else {
			this.bars.sort(compareBarsDesc);
		}
	};


	this.maxBarNeeded = function(onlyStartedBars){
		var max=0;
		for(bar of this.bars){
			if(bar.sizeLeft > max && (onlyStartedBars==false || (onlyStartedBars==true && bar.sizeLeft!=bar.size))){
				max = bar.sizeLeft;
			}

		}
		return max;
	};


	this.sortByID = function(){
		this.bars.sort(function(a, b){return a.id - b.id});
	};


	this.countPieces = function(){
		var res=0;
		for(b of this.bars){
			res += b.countPieces();
		}
		return res;
	};


	this.sumPieces = function(){
		var res=0;
		for(b of this.bars){
			res += b.sumPieces();
		}
		return res;
	};

	this.getPiecesIdList = function(){
		var ids=[];
		var pids=[];

		for(b of this.bars){
			pids=b.getPiecesIdList();
			for(id of pids){
				ids.push(id)
			}
		}

		ids.sort();
		for(id of ids){
			console.log(id)
		}
		return ids;
	};

	this.findWorstBar = function(withImproved=false){
		var worst=null;
		for(b of this.bars){
			if((b.improved==false && withImproved==false && b.isPerfect()==false) || withImproved==true){
				worst = b;
				break;
			}
		}
		
		return worst;

	};


	this.findBarToImproveWith= function(pieceToSwitch,originBar){
		var res = new Object(); piece = null; minPiece = pieceToSwitch; newLeft = 0;nextLeft = -1; bestSizeLeft=-1;
		//console.log('Search bar for size '+pieceToSwitch.l);

		for (bar of this.bars){
			if(bar.sizeLeft > 0 && bar.id!=this.lastBar.id && bar.improved==false && bar.id!=originBar.id){
				for(var i=bar.pieces.length-1;i>0;i--){
					piece = bar.pieces[i];
					if(piece.l < pieceToSwitch.l){
						newLeft = bar.sizeLeft+piece.totalSize();
						if(pieceToSwitch.l==newLeft) {
							nextLeft = 0;
						}
						else{
							if(pieceToSwitch.totalSize()<newLeft) nextLeft = newLeft - pieceToSwitch.totalSize();
						}


						if((nextLeft >=0 && (nextLeft < bestSizeLeft||bestSizeLeft==-1)) && (minPiece.l > piece.l || minPiece==null)){
							minPiece = piece;
							bestSizeLeft = nextLeft;
							res.bar = bar;
							res.pieceToReplace = piece;
							res.pieceToSwitch = pieceToSwitch;
							res.nextLeft = nextLeft;

							//console.log('Find bar id='+bar.id+' left='+bar.sizeLeft+' next= '+nextLeft+' pieceToDelete='+minPiece.l);
						}
					}
				}
			}
		}

		return res;
	};


	this.improve = function(){
		var improvement = null;
		var bestImprovement = null;
		this.sortBars(true);
		var i=0;
		var worstBar = this.findWorstBar();
		while(worstBar!=null){
			i++;
			
			console.log('Worst='+worstBar.id+' left='+worstBar.sizeLeft);
			for(p of worstBar.pieces){
				improvement = this.findBarToImproveWith(p,worstBar);
				improvement.pieceToSwitch = p;
				if(improvement.bar != null){
					if(bestImprovement==null) {
						bestImprovement = improvement;
					}
					else{
						if(improvement.nextLeft < bestImprovement.nextLeft){
							bestImprovement = improvement;
						}
					}
				}
			}

			if(bestImprovement != null){
				console.log('BestImprovement=> bar='+bestImprovement.bar.id+' pieceToReplace='+bestImprovement.pieceToReplace.l+' pieceToSwitch='+bestImprovement.pieceToSwitch.l);
				//bestImprovement.pieceToReplace.setUsed(false);
				bestImprovement.bar.supprPiece(bestImprovement.pieceToReplace);

				worstBar.supprPiece(bestImprovement.pieceToSwitch);

				//worstBar.calcSizeLeft();
				//bestImprovement.bar.calcSizeLeft();

				bestImprovement.bar.addPiece(bestImprovement.pieceToSwitch);
				worstBar.addPiece(bestImprovement.pieceToReplace);

				bestImprovement = null;


			}else{
				worstBar.improved = true;
			}
			worstBar = this.findWorstBar();
		}

	};

	this.razImproved = function(){
		for(b of this.bars){
			b.improved = false;
		}
	};

}



//Globals functions for sorting
function compareBars(a,b){
	var res = 0;
	res = b.sizeLeft - a.sizeLeft;
	if(res==0){
		res = b.getSizeLastPiece() - a.getSizeLastPiece();
	}


	return res;
}

function compareBarsDesc(a,b){
	var res = 0;
	res = b.sizeLeft - a.sizeLeft;
	if(res==0){
		res = b.id - a.id;
	}
	if(res==0){
		res = b.getSizeLastPiece() - a.getSizeLastPiece();
	}

	return res;
}

function compareBarsAsc(a,b){
	return compareBarsDesc(b,a);
}


exports.BarCollection = BarCollection;