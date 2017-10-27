function Bar(size,id){
	this.id = id;
	this.size = size;
	this.sizeLeft = size;
	this.pieces = [];
	this.improved = false;

}


Bar.prototype.addPiece = function(cut){
	
	if(this.sizeLeft >= cut.l || this.sizeLeft > cut.totalSize()){
		if(this.sizeLeft == cut.l){
			this.sizeLeft -= cut.l
		}
		else {
			this.sizeLeft -= cut.totalSize()
		}
		this.pieces.push(cut);
		cut.setUsed();
	}
	else {
		console.log('Impossible Add '+cut.l+' in bar'+this.id+' sizeLeft='+this.sizeLeft);
	}
};

Bar.prototype.supprPiece = function(cut){
	//var index = this.pieces.findIndex(function(p,cut){return });
	var index = -1;
	for(var i=0;i <this.pieces.length;i++){
		if(this.pieces[i].id==cut.id){
			index = i;
		}
	}

	console.log('index suppr piece='+index);
	if(index >=0) {
		this.pieces.splice(index,1);
		this.calcSizeLeft();
	}
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
Bar.prototype.calcSizeLeft = function(){
	var res=0;
	for(p of this.pieces){
		res += p.totalSize();
	}
	this.sizeLeft = this.size-res;
	return this.sizeLeft;
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

Bar.prototype.isPerfect = function(){
	return this.sizeLeft == 0;
};

exports.Bar = Bar;