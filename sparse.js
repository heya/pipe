(function(factory){
	if(typeof define != "undefined"){ // AMD
		define(["./loop"], factory);
	}else if(typeof module != "undefined"){ // node.js
		module.exports = factory(require("./loop"));
	}else{
		funPipeSparse = factory(funPipeLoop);
	}
})(function(loop){
	"use strict";

	return loop(
		[
			"// sparse array-based iterator function",
			"for(var __i = 0; __i < __source.length; ++__i){",
			"    if(__i in __source){",
			"        var value = __source[__i];",
			"        #{code}",
			"    }",
			"}"
		]
	);
});
