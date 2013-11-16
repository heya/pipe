/* UMD.define */ (typeof define=="function"&&define||function(d,f,m){m={module:module,require:require};module.exports=f.apply(null,d.map(function(n){return m[n]||require(n)}))})
(["heya-ctr", "./Pipe"], function(ctr, Pipe){
	"use strict";

	function processCode(code, externals, list){
		if(typeof code == "function"){
			list.push("(__e[" + externals.length + "])();");
			externals.push(code);
		}else{
			list.push.apply(list, code);
		}
	}

	function makePredicate(tail, lines){
		var last = lines.length - 1;
		return lines.slice(0, last).concat(
			ctr(tail, {pred: lines[last]}).lines
		);
	}

	function makeBlock(head, tail, lines){
		return ctr(head + "\n    #{code}\n" + tail, {code: lines}).lines;
	}

	function arrayCompiler(pipe, name){
		var args = ["__array"], argsDict = {__array: 1},
			vars = [], head = [], tail = [], code = [],
			externals = [], f, v, temp, temp2, voidResult,
			stages = pipe.stages, len = stages.length;
		loop: for(var i = 0; i < len; ++i){
			var stage = stages[i];

			// process common parts
			if(stage.args){
				for(var j = 0; j < stage.args.length; ++j){
					temp = stage.args[j];
					if(!argsDict.hasOwnProperty(temp)){
						argsDict[temp] = 1;
						args.push(temp);
					}
				}
			}
			if(stage.vars){
				vars.push.apply(vars, stage.vars);
			}
			if(stage.head){
				processCode(stage.head, externals, head);
			}
			if(stage.tail){
				processCode(stage.tail, externals, tail);
			}

			f = stage.code;
			switch(stage.type){
				case "forEach":
					if(typeof f == "function"){
						code.push("__array.forEach(__e[" + externals.length + "]);");
						externals.push(f);
					}else{
						code.push.apply(code, makeBlock(
							"__array.forEach(function(value, index){",
							"});",
							f
						));
					}
					break;
				case "transform":
					if(typeof f == "function"){
						temp = "__array[index] = (__e[" +
							externals.length + "])(value, index);";
						externals.push(f);
					}else{
						temp = f.slice(0);
						temp.push("__array[index] = value;");
					}
					code.push.apply(code, makeBlock(
						"__array.forEach(function(value, index, __array){",
						"});",
						temp
					));
					break;
				case "map":
					if(typeof f == "function"){
						code.push("__array = __array.map(__e[" + externals.length + "]);");
						externals.push(f);
					}else{
						temp = f.slice(0);
						temp.push("return value;");
						code.push.apply(code, makeBlock(
							"__array = __array.map(function(value, index){",
							"});",
							temp
						));
					}
					break;
				case "filter":
					if(typeof f == "function"){
						code.push("__array = __array.filter(__e[" + externals.length + "]);");
						externals.push(f);
					}else{
						code.push.apply(code, makeBlock(
							"__array = __array.filter(function(value, index){",
							"});",
							makePredicate("return ${pred};", f)
						));
					}
					break;
				case "indexOf":
					v = stage.value;
					if(v && v instanceof Pipe.Arg){
						temp = v.name;
						if(!argsDict.hasOwnProperty(temp)){
							argsDict[temp] = 1;
							args.push(temp);
						}
					}else{
						temp = "__e[" + externals.length + "]";
						externals.push(v);
					}
					code.push("__array = __array.indexOf(" + temp + ");");
					break loop;
				case "every":
					if(typeof f == "function"){
						code.push("__array = __array.every(__e[" + externals.length + "]);");
						externals.push(f);
					}else{
						code.push.apply(code, makeBlock(
							"__array = __array.every(function(value, index){",
							"});",
							makePredicate("return ${pred};", f)
						));
					}
					break loop;
				case "some":
					if(typeof f == "function"){
						code.push("__array = __array.some(__e[" + externals.length + "]);");
						externals.push(f);
					}else{
						code.push.apply(code, makeBlock(
							"__array = __array.some(function(value, index){",
							"});",
							makePredicate("return ${pred};", f)
						));
					}
					break loop;
				case "fold":
					v = stage.value;
					if(v && v instanceof Pipe.Arg){
						temp = v.name;
						if(!argsDict.hasOwnProperty(temp)){
							argsDict[temp] = 1;
							args.push(temp);
						}
					}else{
						temp = "__e[" + externals.length + "]";
						externals.push(v);
					}
					if(typeof f == "function"){
						code.push("__array = __array.reduce(__e[" + externals.length + "], " + temp + ");");
						externals.push(f);
					}else{
						code.push.apply(code, makeBlock(
							"__array = __array.reduce(function(accumulator, value, index){",
							"}, " + temp + ");",
							f.concat(["return accumulator;"])
						));
					}
					break loop;
				case "scan":
					v = stage.value;
					if(v && v instanceof Pipe.Arg){
						temp = v.name;
						if(!argsDict.hasOwnProperty(temp)){
							argsDict[temp] = 1;
							args.push(temp);
						}
					}else{
						temp = "__e[" + externals.length + "]";
						externals.push(v);
					}
					if(typeof f == "function"){
						temp2 = "return accumulator = (__e[" + externals.length + "])(accumulator, value, index);";
						externals.push(f);
					}else{
						temp2 = f.concat(["return accumulator;"]);
					}
					code.push.apply(code, makeBlock(
						"__array = __array.map((function(accumulator){ return function(value, index){",
						"}})(" + temp + "));",
						temp2
					));
					break;
				case "skip":
					v = stage.value;
					if(v && v instanceof Pipe.Arg){
						temp = v.name;
						if(!argsDict.hasOwnProperty(temp)){
							argsDict[temp] = 1;
							args.push(temp);
						}
					}else{
						temp = "__e[" + externals.length + "]";
						externals.push(v);
					}
					code.push.apply(code, makeBlock(
						"__array = __array.filter(function(value, index){",
						"});",
						"return index >= " + temp + ";"
					));
					break;
				case "take":
					v = stage.value;
					if(v && v instanceof Pipe.Arg){
						temp = v.name;
						if(!argsDict.hasOwnProperty(temp)){
							argsDict[temp] = 1;
							args.push(temp);
						}
					}else{
						temp = "__e[" + externals.length + "]";
						externals.push(v);
					}
					code.push.apply(code, makeBlock(
						"__array = __array.filter(function(value, index){",
						"});",
						"return index < " + temp + ";"
					));
					break;
				case "skipWhile":
					if(typeof f == "function"){
						temp = "return __flag || (__flag = !(__e[" + externals.length + "])(value, index));";
						externals.push(f);
					}else{
						temp = makePredicate(
							"return __flag || (__flag = !(${pred}));",
							f
						);
					}
					code.push.apply(code, makeBlock(
						"__array = __array.filter((function(__flag){ return function(value, index){",
						"}})(false));",
						temp
					));
					break;
				case "takeWhile":
					if(typeof f == "function"){
						temp = "return __flag && (__flag = (__e[" + externals.length + "])(value, index));";
						externals.push(f);
					}else{
						temp = makePredicate(
							"return __flag && (__flag = (${pred}));",
							f
						);
					}
					code.push.apply(code, makeBlock(
						"__array = __array.filter((function(__flag){ return function(value, index){",
						"}})(true));",
						temp
					));
					break;
				case "voidResult":
					voidResult = true;
					break loop;
			}
		}

		// final code construction

		if(!voidResult){
			code.push("return __array;");
		}

		if(tail.length){
			code = ctr([
				"try{",
				"    #{code}",
				"}finally{",
				"    #{tail}",
				"}"
			], {code: code, tail: tail}).lines;
		}

		return ctr(
			[
				"(function __self(${args}){",
				"    #{ext}",
				"    #{vars}",
				"    #{head}",
				"    #{code}",
				"})",
				"//@ sourceURL=#{name}"
			],
			{
				ext:  externals.length ? "var __e = __self.__e;" : undefined,
				args: args.join(", "),
				vars: vars.length ? "var " + vars.join(", ") + ";" : undefined,
				head: head,
				code: code,
				name: name || ("/pipe/arrayCompiler/" + pipe.getName())
			},
			externals.length ? {__e: externals} : null
		);
	}

	return arrayCompiler;
});
