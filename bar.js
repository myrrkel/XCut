function Bar(size,id){
	this.id = id;
	this.size = size;
	this.sizeLeft = size;
	this.pieces = [];

}


Bar.prototype.addPiece = function(cut){
	if(this.sizeLeft == cut.l)
		{this.sizeLeft -= cut.l}
	else {this.sizeLeft -= cut.totalSize()}
		this.pieces.push(cut);
	cut.setUsed();
		//console.log('Add '+cut.l+'--> barID='+this.id+' sizeLeft:'+this.sizeLeft+' nbPiece='+cut.pieces.length+' nbParent='+cut.parents.length+' extra='+cut.extra);
};

Bar.prototype.sizeUsed = function(){
	return (this.size - this.sizeLeft);

};

Bar.prototype.countPieces = function(){
	return this.pieces.length;
};

Bar.prototype.sumPieces = function(){
	var res=0;
	for(p of this.pieces){
		res += p.l;
	}
	return res;
};

Bar.prototype.getPiecesIdList = function(){
	var ids=[];
	for(p of this.pieces){
		ids.push(p.id);
	}
	return ids;
};

Bar.prototype.started = function(){
	return this.sizeUsed() > 0;
};

exports.Bar = Bar;