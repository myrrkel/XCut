var libBar = require('./bar');

function BarCollection(barsize){
	this.bars = [];
	this.lastBar = new libBar.Bar();
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
		for (var i=0;i<this.bars.length;i++){
			if(this.bars[i].sizeLeft >= size && (bestSizeFound > this.bars[i].sizeLeft || bestSizeFound==0)){
				bestSizeFound = this.bars[i].sizeLeft;
				ibar = i;
			}
		}

		if (ibar >= 0) {this.lastBar = this.bars[ibar]}
			else {this.addBar(this.barSize)};
	}

	this.findEmptyBar= function(){
		var ibar = -1;
		for (var i=0;i<this.bars.length && ibar<0;i++){
			if(this.bars[i].sizeLeft == this.barSize){ibar = i};
		}

		if (ibar >= 0) {this.lastBar = this.bars[ibar]}
			else {this.addBar(this.barSize)};
	}


	this.addBar = function(sizeBar=0){

		if (sizeBar==0){sizeBar=this.barSize;}
		this.bars.push(new libBar.Bar(sizeBar,this.bars.length+1));
		this.lastBar = this.bars[this.bars.length-1];
		console.log('Add BAR '+sizeBar+' id='+this.lastBar.id);

	}


	this.sortBars = function(descending=false){
		if (descending==false){
			this.bars.sort(compareBarsAsc);
		}
		else {
			this.bars.sort(compareBarsDesc);
		}
	}


	this.maxBarNeeded = function(onlyStartedBars){
		var max=0;
		for(bar of this.bars){
			if(bar.sizeLeft > max && (onlyStartedBars==false || (onlyStartedBars==true && bar.sizeLeft!=bar.size))){
				max = bar.sizeLeft;
			}

		}
		return max;
	}


	this.sortByID = function(){
		this.bars.sort(function(a, b){return a.id - b.id});
	}

	this.countPieces = function(){
		var res=0;
		for(b of this.bars){
			res += b.countPieces();
		}
		return res;
	}
	this.sumPieces = function(){
		var res=0;
		for(b of this.bars){
			res += b.sumPieces();
		}
		return res;
	}
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
	}

}


function compareBars(a,b){
	var res = 0;
	res = b.l - a.l;
	if(res==0){
		res = b.getSizeLastPiece() - a.getSizeLastPiece();
	}


	return res;
}

function compareBarsAsc(a,b){
	var res = 0;
	res = b.l - a.l;
	if(res==0){
		res = b.id - a.id;
	}

	return res;
}

function compareBarsDesc(a,b){
	return compareBarsAsc(b,a);
}


exports.BarCollection = BarCollection;