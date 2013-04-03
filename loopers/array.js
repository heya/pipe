/* UMD.define */ (typeof define=="function"&&define||function(d,f,m){m={module:module,require:require};module.exports=f.apply(null,d.map(function(n){return m[n]||require(n)}))})
(["../utils/loop"], function(loop){
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
