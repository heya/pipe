/* UMD.define */ (typeof define=="function"&&define||function(d,f,m){m={module:module,require:require};module.exports=f.apply(null,d.map(function(n){return m[n]||require(n)}))})
(["./utils/translate", "heya-ctr"], function(translate, ctr){
	"use strict";

	var fTmpl = [
			"(function(${varList}){",
			"    #{extDecl}",
			"    return {",
			"        start: function(${argList}){",
			"            #{extInit}",
			"            #{assignArgs}",
			"            #{assignVars}",
			"            #{undefineVars}",
			"            #{head}",
			"        },",
			"        process: function(value){",
			"            if(__stop) return value;",
			"            #{code}",
			"        },",
			"        stop: function(){",
			"            #{tail}",
			"            __stop = true;",
			"        },",
			"        isStopped: function(){ return __stop; },",
			"        getResult: function(){",
			"            #{ret}",
			"        }",
			"    };",
			"})()",
			"//@ sourceURL=#{name}"
		];

	return function object(pipe, name){
		var result = translate(pipe),
			externals = result.ext,
			varList = result.args.concat(result.vars.map(function(value){
				return /\b\w+\b/.exec(value)[0];
			})).join(", "),
			argList = result.args.map(function(value, index){
				return "__arg" + index;
			}).join(", "),
			assignArgs = result.args.map(function(value, index){
				return value + " = __arg" + index + ";";
			}),
			assignVars = result.vars.filter(function(value){
				return value.indexOf("=") > 0;
			}).map(function(value){
				return value + ";";
			}),
			undefineVars = result.vars.filter(function(value){
				return value.indexOf("=") < 0;
			}).join(" = ");

		undefineVars = undefineVars ? undefineVars + " = undefined;" : undefined;

		return ctr(fTmpl, {
			varList: varList,
			argList: argList,
			assignArgs: assignArgs,
			assignVars: assignVars,
			undefineVars: undefineVars,
			extDecl: externals.length ? "var __e;" : undefined,
			extInit: externals.length ? "__e = this.externals;" : undefined,
			head: result.head,
			code: result.code,
			tail: result.tail,
			ret:  result.ret,
			name: name || ("/pipe/object/" + pipe.getName())
		}, externals.length && {externals: externals});
	};
});
