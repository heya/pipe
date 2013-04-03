/* UMD.define */ (typeof define=="function"&&define||function(d,f,m){m={module:module,require:require};module.exports=f.apply(null,d.map(function(n){return m[n]||require(n)}))})
(["../utils/loop"], function(loop){
	"use strict";

	return loop(
		[
			"// for..in iterator function over own values",
			"for(var __i in __source){",
			"    if(__source.hasOwnProperty(__i)){",
			"        var value = __source[__i];",
			"        #{code}",
			"    }",
			"}"
		]
	);
});
