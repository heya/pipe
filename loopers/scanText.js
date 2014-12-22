/* UMD.define */ (typeof define=="function"&&define||function(d,f,m){m={module:module,require:require};module.exports=f.apply(null,d.map(function(n){return m[n]||require(n)}))})
(["../utils/translate", "heya-ctr"], function(translate, ctr){
	"use strict";

	var fTmpl = [
			"(function __self(${args}){",
			"    #{ext}",
			"    #{vars}",
			"    #{head}",
			"    #{body}",
			"})",
			"//@ sourceURL=#{name}"
		],
		fNormal = [
			"__refIndex = +__refIndex || 0;",
			"__source.replace(__regEx, function(){",
			"    if(__stop) return '';",
			"    var value = arguments[__refIndex];",
			"    #{code}",
			"});"
		],
		fTry = [
			"try{",
			"    #{body}",
			"}finally{",
			"    #{tail}",
			"}"
		];

	return function(pipe, name){
		var result = translate(pipe, false, false, false, true);

		var body = ctr(fNormal, result).lines;
		if(result.tail.length){
			body = ctr(fTry, {body: body, tail: result.tail}).lines;
		}
		if(result.ret){
			body.push(result.ret);
		}

		var externals = result.ext, vars = result.vars,
			args = ["__source, __regEx, __refIndex"].concat(result.args);

		return ctr(fTmpl, {
			args: args.join(", "),
			ext:  externals.length ? "var __e = __self.__e;" : undefined,
			vars: vars.length ? "var " + vars.join(", ") + ";" : undefined,
			head: result.head,
			body: body,
			name: name || ("/pipe/scanText/" + pipe.getName())
		}, externals.length && {__e: externals});
	};
});
