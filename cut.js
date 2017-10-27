function Cut(jsonCut,parentOptimizer,id=0){
	if (jsonCut == null){
		this.l = 0;
		this.packingId = '';
	}
	else{
		this.l = jsonCut.l;
		this.packingId = jsonCut.packingId;
	}
	this.optimizer = parentOptimizer;
	this.id = id;
	this.used = false;
	this.pieces = [];
	this.parents = [];
	this.extra = false;

}


Cut.prototype.totalSize = function(){return this.l+this.optimizer.bladeThickness};

Cut.prototype.setUsed = function(isUsed=true){
	this.used = isUsed;
	if (isUsed==true){
		this.setUsedParents();
		this.setUsedPieces();
	}
		//this.optimizer.cutCol.setUsedExtraCutsWith(this.pieces)
};

Cut.prototype.setUsedParents = function(){
		//SetUsed ExtraCuts that contained this cut
	for(parent of this.parents)
	{
		if(parent.used==false) parent.used = true;
			//if(this.parents[i].used==false) this.parents[i].setUsedPieces();	
	}
};

Cut.prototype.setUsedPieces = function(){
		//SetUsed cuts that contain this pieces
	for(piece of this.pieces)
	{
		if(piece.used==false) piece.setUsed();	
	}
};

Cut.prototype.getSizeLastPiece= function(){
	var res = this.l;
	if(this.pieces.length>0){
		res = this.pieces[this.pieces.length-1].l;
	}
	return res;
};

Cut.prototype.getText = function(){
	var ptxt = '';

	if(this.pieces.length>0){
		for(p of this.pieces){ptxt += p.getText()+' ; '}
			return 'id='+this.id+' l='+this.l+' pieces: '+ptxt;
	}
	else {
		return 'id='+this.id+' l='+this.l;
	}
};

Cut.prototype.checkID = function(id){
	var res = true;
	if(this.id==id)
		{res=false}

	for(piece of this.pieces){
		if(piece.id==id){
			res=false};
			if(piece.checkID()==false){res=false}
		}
	return res
};

Cut.prototype.findPiece = function(id){
	var res = false;
	for(p of this.pieces){
		if(p.id==id) res = true;
	}

	return res
};


exports.Cut = Cut;