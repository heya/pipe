(function(factory){
	if(typeof define != "undefined"){ // AMD
		define(["../utils/loop", "../Pipe"], factory);
	}else if(typeof module != "undefined"){ // node.js
		module.exports = factory(require("../utils/loop"), require("../Pipe"));
	}else{
		funPipeLoopersUnfold = factory(funPipeUtilsLoop);
	}
})(function(loop, Pipe){
	"use strict";

	var tmplFun = loop(
		[
			"// unfold-based iterator function",
			"for(;;){",
			"    #{code}",
			"}"
		]
	);

	return function unfold(pred, value, next){
		return function(pipe, name, isResultSpecified){
			// The code below uses __source as a starting value,
			// and to hold intermediate values.
			// __source is the first argument of a generated function.
			var p = new Pipe().
					forEach({
						vars: ["__runNext", "accumulator", "value"],
						code: [
							"accumulator = __source;",
							"if(__runNext){"
						]
					}).
					forEach(next).
					forEach([
						"__source = accumulator;",
						"}",
						"__runNext = true;"
					]).
					takeWhile(pred).
					map(value).
					add(pipe);
			return tmplFun(p, name, isResultSpecified);
		};
	};
});
