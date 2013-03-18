(function(factory){
	if(typeof define != "undefined"){ // AMD
		define(["../utils/loop"], factory);
	}else if(typeof module != "undefined"){ // node.js
		module.exports = factory(require("../utils/loop"));
	}else{
		funPipeLoopersOwnKeys = factory(funPipeUtilsLoop);
	}
})(function(loop){
	"use strict";

	return loop(
		[
			"// for..in iterator function over own keys",
			"for(var __i in __source){",
			"    if(__source.hasOwnProperty(__i)){",
			"        var value = __i;",
			"        #{code}",
			"    }",
			"}"
		]
	);
});
