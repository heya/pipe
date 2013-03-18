(function(factory){
	if(typeof define != "undefined"){ // AMD
		define(["../utils/loop"], factory);
	}else if(typeof module != "undefined"){ // node.js
		module.exports = factory(require("../utils/loop"));
	}else{
		funPipeLoopersArrayRev = factory(funPipeUtilsLoop);
	}
})(function(loop){
	"use strict";

	return loop(
		[
			"// reversed array-based iterator function",
			"for(var __i = __source.length; --__i >= 0;){",
			"    var value = __source[__i];",
			"    #{code}",
			"}"
		]
	);
});
