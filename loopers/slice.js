/* UMD.define */ (typeof define=="function"&&define||function(d,f,m){m={module:module,require:require};module.exports=f.apply(null,d.map(function(n){return m[n]||require(n)}))})
(["../utils/loop"], function(loop){
	"use strict";

	return loop(
		[
			"// array-based iterator function with slicing",
			"var __ib = __begin || 0, __ie = isNaN(__end) ? __source.length : __end;",
			"if(__ib < 0) __ib = __source.length + __ib;",
			"if(__ie < 0) __ie = __source.length + __ie;",
			"for(var __i = __ib; __i < __ie; ++__i){",
			"    var value = __source[__i];",
			"    #{code}",
			"}"
		],
		false,
		["__begin", "__end"]
	);
});
