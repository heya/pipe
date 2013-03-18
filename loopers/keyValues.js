(function(factory){
	if(typeof define != "undefined"){ // AMD
		define(["../utils/loop"], factory);
	}else if(typeof module != "undefined"){ // node.js
		module.exports = factory(require("../utils/loop"));
	}else{
		funPipeLoopersKeyValuePairs = factory(funPipeUtilsLoop);
	}
})(function(loop){
	"use strict";

	return loop(
		[
			"// for..in iterator function over key-value-source triplets",
			"for(var __i in __source){",
			"    var value = [__i, __source[__i], __source];",
			"    #{code}",
			"}"
		]
	);
});
