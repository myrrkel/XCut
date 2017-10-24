var libCut = require('./cut');

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
			if(this.cuts[i].used ==false){nb++};
		}
		return nb;
	}
	this.minimum = function(){
		var res = 0;
		for (i=this.cuts.length-1;i>=0;i--){
			if(this.cuts[i].used==false){res = this.cuts[i].l; break}
		}
		return res;
	}
	this.maximum = function(){
		var res = 0;
		for (i=0;i<this.cuts.length;i++){
			if(this.cuts[i].used==false){
				console.log('MAX'+this.cuts[i].l);
				res = this.cuts[i].l; break;
			}
		}
		return res;
	}
	this.countExtraCutsEqualTo = function(size){
		var res = 0;
		for (i=0;i<this.extraCuts.length;i++){
			if(this.extraCuts[i].used==false && this.extraCuts[i].l == size){
				res++;
				console.log('#'+size+' '+this.extraCuts[i].getText());
			}
		}
		return res;
	}

	this.radomizeCuts = function(){{this.extraCuts.sort(function(a, b){return b.l - a.l});}}
	this.sortCuts = function(descending=false){
		if (descending==false) 
			{this.cuts.sort(function(a, b){return a.l - b.l});}
		else
			{this.cuts.sort(function(a, b){return b.l - a.l});}		
	}


	this.sortExtraCuts = function(descending=false){
		if (descending==false) 
			{this.extraCuts.sort(function(a, b){return a.l - b.l});}
		else
			//{this.extraCuts.sort(function(a, b){return b.l - a.l});}		
			{this.extraCuts.sort(compareExtraCuts);}		
	}
	this.raz= function(){
		for (i=0;i<this.cuts.length;i++){
			this.cuts[i].used = false
		}
	}

	this.findLongestCut= function(){
		for (i=0;i<this.cuts.length;i++){

			if(this.cuts[i].used==false){
				cut = this.cuts[i];
				break;
			}
		}
		return cut;
	}

	this.findCutFitBest= function(size){
		var cut=null;
		var bestSizeFound = 0;
		for (i=0;i<this.cuts.length;i++){

			if(this.cuts[i].totalSize() > bestSizeFound && this.cuts[i].used==false){

				if(this.cuts[i].totalSize() < size-2 || this.cuts[i].l == size){
					
					if(size==2029){console.log('best='+bestSizeFound+' l='+this.cuts[i].l+' id='+this.cuts[i].id)}
						bestSizeFound = this.cuts[i].l;
					cut = this.cuts[i];
					break;

				}
			}
		}

		//find if there is a best cut in extras
		for (i=0;i<this.extraCuts.length;i++){


			if((this.extraCuts[i].totalSize() > bestSizeFound || this.extraCuts[i].l > bestSizeFound)
				&& (this.extraCuts[i].totalSize() < size || this.extraCuts[i].l == size)
				&& this.extraCuts[i].used==false){


				if(size==2029){console.log('*best='+bestSizeFound+' l='+this.extraCuts[i].l+' id='+this.extraCuts[i].id)}
					bestSizeFound = this.extraCuts[i].l;
				cut = this.extraCuts[i];
				break;

			}
		}
		
		return cut;
	}

	this.copyExtras= function(){
		var newExtras = [];
		for (e of this.extraCuts){
			newExtras.push(e);
		}
		return newExtras;
	}

	this.generateExtraCuts= function(cuts1=null,cuts2=null,depth=3){
		var sum=0;
		var max= this.maximum();
		var cutsA; var cutsB; 

		if(cuts1==null){cutsA=this.cuts}else{this.sortCuts(true);cutsA=cuts1;};
		if(cuts2==null){cutsB=this.cuts}else{cutsB=this.copyExtras()};

		console.log('max='+max+' depth='+depth+' cutsA='+cutsA.length+' cutsB='+cutsB.length);

		if(depth > 1){
			for(i=0;i<cutsA.length;i++){
				if(cutsA[i].used == false){
					//console.log('generateExtras='+cutsA[i].id);
					for(j=0;j<cutsB.length;j++){
						//if(cutsB[j].used==false){
						if(cutsB[j].used==false && cutsA[i].checkID(cutsB[j].id)==true && cutsB[j].getSizeLastPiece() > cutsA[i].l){
							//console.log('checkID='+cutsA[i].checkID(cutsB[j].id));
							sum = cutsA[i].totalSize()+cutsB[j].l;
							if (sum <= max){
								var cut = new libCut.Cut(null,this.optimizer,this.cuts.length+this.extraCuts.length);
								cut.l = sum;
								cut.pieces = [];
								cut.extra = true;


								this.extraCuts.push(cut);
								var n = this.extraCuts.length-1;

								//Add cutB or his members to pieces
								if(cutsB[j].pieces.length > 0) {
									for(p of cutsB[j].pieces) {
										this.extraCuts[n].pieces.push(p);
									}
								}
								else {
									this.extraCuts[n].pieces.push(cutsB[j]);
								}
								//Add cutA (after cutB because bigger)
								this.extraCuts[n].pieces.push(cutsA[i]);

								//cutsA[i].parents.push(this.extraCuts[n]);
								//cutsB[j].parents.push(this.extraCuts[n]);

							}
						}
					}
				}
			}
		}

		console.log('extraCuts depth'+depth+' = '+this.extraCuts.length);

		if(depth > 2){
			depth--;
			this.generateExtraCuts(this.cuts,this.extraCuts,depth);
		}
	}

	this.generateExtraCutsOLD= function(){

		var sum=0;
		var max= this.maximum();
		console.log('max='+max);
		for(i=0;i<this.cuts.length;i++){
			console.log('i='+i);
			if(this.cuts[i].used == false){
				for(j=i+1;j<this.cuts.length;j++){
					if(this.cuts[j].used==false){

						for(k=j+1;k<this.cuts.length;k++){
							if(this.cuts[k].used == false){
								sum = this.cuts[i].totalSize()+this.cuts[j].totalSize()+this.cuts[k].l;
								if (sum <= max){
									var cut = new Cut(null,this.optimizer);
									//cut.l = this.cuts[i].totalSize()+this.cuts[j].l;
									cut.l = sum;
									cut.pieces = [];
									cut.extra = true;


									this.extraCuts.push(cut);
									var n = this.extraCuts.length-1;
									this.extraCuts[n].pieces.push(this.cuts[i]);
									this.extraCuts[n].pieces.push(this.cuts[j]);
									this.extraCuts[n].pieces.push(this.cuts[k]);

									this.cuts[i].parents.push(this.extraCuts[n]);
									this.cuts[j].parents.push(this.extraCuts[n]);
									this.cuts[k].parents.push(this.extraCuts[n]);

								}
							}
						}
					}
				}
			}
		}
	}

	this.setUsedExtrasWith = function(pieces){
		for(piece of pieces){
			for(extra of this.extraCuts){
				
			}
		}


	}


}

function compareExtraCuts(a,b){
	var res = 0;
	res = b.l - a.l;
	if(res==0){
		res = b.getSizeLastPiece() - a.getSizeLastPiece();
	}


	return res;
}

exports.CutCollection = CutCollection;