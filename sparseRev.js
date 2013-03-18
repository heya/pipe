(function(factory){
	if(typeof define != "undefined"){ // AMD
		define(["./loop"], factory);
	}else if(typeof module != "undefined"){ // node.js
		module.exports = factory(require("./loop"));
	}else{
		funPipeSparseRev = factory(funPipeLoop);
	}
})(function(loop){
	"use strict";

	return loop(
		[
			"// reversed sparse array-based iterator function",
			"for(var __i = __source.length; --__i >= 0;){",
			"    if(__i in __source){",
			"        var value = __source[__i];",
			"        #{code}",
			"    }",
			"}"
		]
	);
});
