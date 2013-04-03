/* UMD.define */ (typeof define=="function"&&define||function(d,f,m){m={module:module,require:require};module.exports=f.apply(null,d.map(function(n){return m[n]||require(n)}))})
(["./translate", "heya-ctr"], function(translate, ctr){
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
		fTry = [
			"try{",
			"    #{body}",
			"}finally{",
			"    #{tail}",
			"}"
		];

	return function loop(tmpl, isArraySrc, extraArgs){
		return function(pipe, name, isResultSpecified){
			var result = translate(pipe, true, isArraySrc, isResultSpecified);

			var body = ctr(tmpl, result).lines;
			if(result.tail.length){
				body = ctr(fTry, {body: body, tail: result.tail}).lines;
			}
			if(result.ret){
				body.push(result.ret);
			}

			var externals = result.ext, vars = result.vars,
				args = extraArgs ? [result.args[0]].concat(extraArgs, result.args.slice(1)): result.args;

			return ctr(fTmpl, {
				args: args.join(", "),
				ext:  externals.length ? "var __e = __self.__e;" : undefined,
				vars: vars.length ? "var " + vars.join(", ") + ";" : undefined,
				head: result.head,
				body: body,
				name: name || ("/pipe/loop/" + pipe.getName())
			}, externals.length && {__e: externals});
		}
	};
});
