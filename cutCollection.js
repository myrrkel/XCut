var libCut = require('./cut');

function CutCollection(parentOptimizer){
	this.cuts = [];
	this.extraCuts = [];
	this.optimizer = parentOptimizer;

	this.totalCuts= function(){
		var tsize = 0;
		for (cut of this.cuts){tsize += cut.l;}
			return tsize;
	}
	this.totalCutsLeft= function(){
		var tsize = 0;
		for (cut of this.cuts){
			if(cut.used ==false){tsize += cut.l;}
		}
		return tsize;
	}
	this.countCutsLeft= function(){
		var nb = 0;
		for (cut of this.cuts){
			if(cut.used ==false){nb++};
		}
		return nb;
	}
	this.minimum = function(){
		var res = 0;
		for (var i=this.cuts.length-1;i>=0;i--){
			if(this.cuts[i].used==false){res = this.cuts[i].l; break}
		}
		return res;
	}
	this.maximum = function(){
		var res = 0;
		for (var i=0;i<this.cuts.length;i++){
			if(this.cuts[i].used==false){res = this.cuts[i].l; break}
		}
		return res;
	}
	this.countExtraCutsEqualTo = function(size){
		var res = 0;
		for (extra of this.extraCuts){
			if(extra.used==false && extra.l == size){
				res++;
				console.log('#'+size+' '+extra.getText());
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
		for (cut of this.cuts){
			cut.used = false
		}
	}

	this.findLongestCut= function(){
		var longestCut;
		for (cut of this.cuts){
			if(cut.used==false){
				longestCut = cut;
				break;
			}
		}
		return longestCut;
	}

	this.findCutFitBest= function(size){
		var bestCut=null;
		var bestSizeFound = 0;
		for (cut of this.cuts){

			if(cut.totalSize() > bestSizeFound && cut.used==false){

				if(cut.totalSize() < size-2 || cut.l == size){
					
					if(size==2029){console.log('best='+bestSizeFound+' l='+cut.l+' id='+cut.id)}
						bestSizeFound = cut.l;
					bestCut = cut;
					break;

				}
			}
		}

		//find if there is a best cut in extras
		for (extra of this.extraCuts){


			if((extra.totalSize() > bestSizeFound || extra.l > bestSizeFound)
				&& (extra.totalSize() < size || extra.l == size) && extra.used==false){


				if(size==2029){console.log('*best='+bestSizeFound+' l='+extra.l+' id='+extra.id)}
					bestSizeFound = extra.l;
				bestCut = extra;
				break;

			}
		}
		
		return bestCut;
	}

	this.copyExtras= function(){
		var newExtras = [];
		for (e of this.extraCuts){
			newExtras.push(e);
		}
		return newExtras;
	}

	this.generateExtraCuts= function(cuts1=null,cuts2=null,depth=3,minCutSize=500){
		var sum=0;
		var max= this.optimizer.barSize;
		var cutsA; var cutsB; 

		if(cuts1==null){cutsA=this.cuts}else{this.sortCuts(true);cutsA=cuts1;};
		if(cuts2==null){cutsB=this.cuts}else{cutsB=this.copyExtras()};

		console.log('max='+max+' depth='+depth+' cutsA='+cutsA.length+' cutsB='+cutsB.length);

		if(depth > 1){
			for(cutA of cutsA){
				if(cutA.used == false && cutA.l > minCutSize){
					for(cutB of cutsB){
						if(cutB.used==false && cutA.checkID(cutB.id)==true && cutB.getSizeLastPiece() > cutA.l){
							//console.log('checkID='+cutsA[i].checkID(cutsB[j].id));
							sum = cutA.totalSize()+cutB.l;
							if (sum <= max){
								var cut = new libCut.Cut(null,this.optimizer,this.cuts.length+this.extraCuts.length);
								cut.l = sum;
								cut.pieces = [];
								cut.extra = true;


								this.extraCuts.push(cut);
								var n = this.extraCuts.length-1;

								//Add cutB or his members to pieces
								if(cutB.pieces.length > 0) {
									for(p of cutB.pieces) {
										p.parents.push(this.extraCuts[n]);
										this.extraCuts[n].pieces.push(p);
									}
								}
								else {
									this.extraCuts[n].pieces.push(cutB);
								}
								//Add cutA (after cutB because bigger)
								this.extraCuts[n].pieces.push(cutA);

								cutA.parents.push(this.extraCuts[n]);
								cutB.parents.push(this.extraCuts[n]);

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

	this.setUsedExtraCutsWith = function(pieces){
		var extra;

		for(piece of pieces){
			for(extra of this.extraCuts){
				if(extra.findPiece(piece.id)) extra.used=true;
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