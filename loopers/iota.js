(function(factory){
	if(typeof define != "undefined"){ // AMD
		define(["../utils/loop"], factory);
	}else if(typeof module != "undefined"){ // node.js
		module.exports = factory(require("../utils/loop"));
	}else{
		funPipeLoopersIota = factory(funPipeUtilsLoop);
	}
})(function(loop){
	"use strict";

	return loop(
		[
			"// number sequence",
			"__to = isNaN(__to) ? Infinity : __to;",
			"__step = Math.abs(isNaN(__step) ? 1 : __step);",
			"var __if = __source, __it = __to, __is = __step;",
			"if(__it < __if){",
			"    __if = -__source, __it = -__to, __is = -__is;",
			"}",
			"for(; __if < __it; __if += __step, __source += __is){",
			"    var value = __source;",
			"    #{code}",
			"}"
		],
		false,
		["__to", "__step"]	// __from is __source
	);
});
