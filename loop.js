(function(factory){
	if(typeof define != "undefined"){ // AMD
		define(["./translate", "ctr"], factory);
	}else if(typeof module != "undefined"){ // node.js
		module.exports = factory(require("./translate"), require("ctr"));
	}else{
		funPipeLoop = factory(funPipeTranslate, ctr);
	}
})(function(translate, ctr){
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

	return function loop(tmpl, isArraySrc){
		return function(pipe, name, isResultSpecified){
			var result = translate(pipe, true, isArraySrc, isResultSpecified);

			var body = ctr(tmpl, result).lines;
			if(result.tail.length){
				body = ctr(fTry, {body: body, tail: result.tail}).lines;
			}
			if(result.ret){
				body.push(result.ret);
			}

			var vars = result.vars, externals = result.ext;

			return ctr(fTmpl, {
				args: result.args.join(", "),
				ext:  externals.length ? "var __e = __self.__e;" : undefined,
				vars: vars.length ? "var " + vars.join(", ") + ";" : undefined,
				head: result.head,
				body: body,
				name: name || ("/pipe/loop/" + pipe.getName())
			}, externals.length && {__e: externals});
		}
	};
});
