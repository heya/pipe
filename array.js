(function(factory){
	if(typeof define != "undefined"){ // AMD
		define(["./loop"], factory);
	}else if(typeof module != "undefined"){ // node.js
		module.exports = factory(require("./loop"));
	}else{
		funPipeArray = factory(funPipeLoop);
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
