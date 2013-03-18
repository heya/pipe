(function(factory){
	if(typeof define != "undefined"){ // AMD
		define(["../utils/loop"], factory);
	}else if(typeof module != "undefined"){ // node.js
		module.exports = factory(require("../utils/loop"));
	}else{
		funPipeLoopersArray = factory(funPipeUtilsLoop);
	}
})(function(loop){
	"use strict";

	return loop(
		[
			"// array-based iterator function",
			"for(var __i = 0; __i < __source.length; ++__i){",
			"    var value = __source[__i];",
			"    #{code}",
			"}"
		],
		true
	);
});
