(function(factory){
	if(typeof define != "undefined"){ // AMD
		define([], factory);
	}else if(typeof module != "undefined"){ // node.js
		module.exports = factory();
	}else{
		funPipeInterpret = factory();
	}
})(function(){
	"use strict";

	//TODO: add asserts

	function interpret(pipe, array){
		var stages = pipe.stages, len = stages.length;
		for(var i = 0; i < len; ++i){
			var stage = stages[i], f = stage.code;
			switch(stage.type){
				case "forEach":
					array.forEach(f);
					break;
				case "transform":
					array.forEach(function(value, index, array){
						array[index] = f(value, index);
					});
					break;
				case "map":
					array = array.map(f);
					break;
				case "filter":
					array = array.filter(f);
					break;
				case "indexOf":
					return array.indexOf(stage.value);
				case "every":
					return array.every(f);
				case "some":
					return array.some(f);
				case "fold":
					return array.reduce(f, stage.value);
				case "scan":
					var accumulator = stage.value;
					array = array.map(function(value, index){
						return accumulator = f(accumulator, value, index);
					});
					break;
				case "skip":
					array = array.filter(function(_, index){
						return index >= stage.value;
					});
					break;
				case "skipWhile":
					var flag = false;
					array = array.filter(function(value, index){
						return flag || (flag = f(value, index));
					});
					break;
				case "take":
					array = array.filter(function(_, index){
						return index < stage.value;
					});
					break;
				case "takeWhile":
					var flag = true;
					array = array.filter(function(value, index){
						return flag && (flag = f(value, index));
					});
					break;
				case "voidResult":
					return;
			}
		}
		return array;
	}

	return interpret;
});
