/* UMD.define */ (typeof define=="function"&&define||function(d,f,m){m={module:module,require:require};module.exports=f.apply(null,d.map(function(n){return m[n]||require(n)}))})
(["../utils/loop"], function(loop){
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
