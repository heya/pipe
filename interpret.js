/* UMD.define */ (typeof define=="function"&&define||function(d,f,m){m={module:module,require:require};module.exports=f.apply(null,d.map(function(n){return m[n]||require(n)}))})
([], function(){
	"use strict";

	//TODO: add asserts
	//  code should be a function,
	//  value-taking methods should have physical values supplied

	function interpret(pipe, array){
		var stages = pipe.stages, len = stages.length, temp;
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
					temp = stage.value;	// accumulator
					array = array.map(function(value, index){
						return temp = f(temp, value, index);
					});
					temp = null;
					break;
				case "skip":
					temp = stage.value;
					array = array.filter(function(_, index){
						return index >= temp;
					});
					break;
				case "take":
					temp = stage.value;
					array = array.filter(function(_, index){
						return index < temp;
					});
					break;
				case "skipWhile":
					temp = false;
					array = array.filter(function(value, index){
						return temp || (temp = !f(value, index));
					});
					break;
				case "takeWhile":
					temp = true;
					array = array.filter(function(value, index){
						return temp && (temp = f(value, index));
					});
					break;
				case "voidResult":
					return;
				case "find":
					return array.find(f);
				case "findIndex":
					return array.findIndex(f);
			}
		}
		return array;
	}

	function curry(pipe){
		return function(array){
			return interpret(pipe, array);
		};
	}

	interpret.curry = curry;

	return interpret;
});
