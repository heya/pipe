/* UMD.define */ (typeof define=="function"&&define||function(d,f,m){m={module:module,require:require};module.exports=f.apply(null,d.map(function(n){return m[n]||require(n)}))})
(["../utils/loop"], function(loop){
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
