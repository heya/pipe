(function(factory){
	if(typeof define != "undefined"){ // AMD
		define(["../utils/loop"], factory);
	}else if(typeof module != "undefined"){ // node.js
		module.exports = factory(require("../utils/loop"));
	}else{
		funPipeLoopersIteratorObj = factory(funPipeUtilsLoop);
	}
})(function(loop){
	"use strict";

	return loop(
		[
			"// Java-like iterator object",
			"while(__source.hasNext()){",
			"    var value = __source.next();",
			"    #{code}",
			"}"
		]
	);
});
