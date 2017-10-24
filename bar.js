function Bar(size,id){
	this.id = id;
	this.size = size;
	this.sizeLeft = size;
	this.pieces = [];

	this.addPiece = function(cut){
		if(this.sizeLeft == cut.l)
			{this.sizeLeft -= cut.l}
		else {this.sizeLeft -= cut.totalSize()}
			this.pieces.push(cut);
		cut.setUsed();
		//console.log('Add '+cut.l+'--> barID='+this.id+' sizeLeft:'+this.sizeLeft+' nbPiece='+cut.pieces.length+' nbParent='+cut.parents.length+' extra='+cut.extra);
	}

	this.sizeUsed = function(){
		return (this.size - this.sizeLeft);

	}

	this.countPieces = function(){
		return this.pieces.length;
	}
	this.sumPieces = function(){
		var res=0;
		for(p of this.pieces){
			res += p.l;
		}
		return res;
	}
	this.getPiecesIdList = function(){
		var ids=[];
		for(p of this.pieces){
			ids.push(p.id);
		}
		return ids;
	}
}

exports.Bar = Bar;