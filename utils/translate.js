/* UMD.define */ (typeof define=="function"&&define||function(d,f,m){m={module:module,require:require};module.exports=f.apply(null,d.map(function(n){return m[n]||require(n)}))})
(["heya-ctr", "../Pipe"], function(ctr, Pipe){
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
		var len = lines.length;
		return lines.slice(0, len - 1).concat(
			ctr(tail, {pred: lines[len - 1]}).lines
		);
	}

	function makeBlock(head, tail, lines){
		return ctr(head + "\n    #{code}\n" + tail, {code: lines}).lines;
	}

	var useIndex = {indexOf: 1, skip: 1, take: 1};

	function translate(pipe, isLoopEnv, isArraySrc, isResultSpecified){
		var args = [], argsDict = {},
			vars = [], head = [], tail = [], code = [],
			externals = [], f, v, temp, temp2, voidResult, defaultReturn,
			dupped, skipped, noIndex = true,
			indexLevel = 0, flagLevel = 0, accLevel = 0,
			stages = pipe.stages, len = stages.length;

		if(isLoopEnv){
			args.push("__source");
			if(isResultSpecified){
				args.push("__result");
			}
		}else{
			vars.push("__stop");
		}

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

			// initialize index if required
			f = stage.code;
			if(noIndex){
				temp = f && (typeof f == "function" || /\bindex\b/.test(f.join("\n"))) ||
					stage.type == "transform" && isLoopEnv && isArraySrc && !dupped;
				if(temp || useIndex[stage.type]){
					temp = "__i" + (indexLevel++);
					vars.push(temp + " = 0");
					code.push("index = " + temp + "++;");
					noIndex = false;
				}
			}

			switch(stage.type){
				case "forEach":
					if(typeof f == "function"){
						code.push("(__e[" + externals.length + "])(value, index);");
						externals.push(f);
					}else{
						code.push.apply(code, f);
					}
					break;
				case "transform":
					if(typeof f == "function"){
						code.push("value = (__e[" + externals.length + "])(value, index);");
						externals.push(f);
					}else{
						code.push.apply(code, f);
					}
					if(isLoopEnv && isArraySrc && !dupped){
						code.push("__source[index] = value;");
					}
					break;
				case "map":
					if(typeof f == "function"){
						code.push("value = (__e[" + externals.length + "])(value, index);");
						externals.push(f);
					}else{
						code.push.apply(code, f);
					}
					dupped = true;
					break;
				case "filter":
					temp = isLoopEnv ? "continue;" : "return;";
					if(typeof f == "function"){
						code.push("if(!(__e[" + externals.length + "])(value, index)) " + temp + ";");
						externals.push(f);
					}else{
						code.push.apply(code, makePredicate("if(!(${pred})) " + temp, f));
					}
					noIndex = skipped = dupped = true;
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
					code.push("if(value === " + temp + ")" +
						(isLoopEnv ? " return index;" : "{ __stop = true; return __result = index; }"));
					if(isLoopEnv){
						defaultReturn = "return -1;";
					}else{
						vars.push("__result = -1");
						defaultReturn = "return __result;";
					}
					break loop;
				case "every":
					temp = isLoopEnv ? " return false;" : "{ __stop = true; return __result = false; }";
					if(typeof f == "function"){
						code.push("if(!(__e[" + externals.length + "])(value, index))" + temp);
						externals.push(f);
					}else{
						code.push.apply(code, makePredicate("if(!(${pred}))" + temp, f));
					}
					if(isLoopEnv){
						defaultReturn = "return true;";
					}else{
						vars.push("__result = true");
						defaultReturn = "return __result;";
					}
					break loop;
				case "some":
					temp = isLoopEnv ? " return true;" : "{ __stop = true; return __result = true; }";
					if(typeof f == "function"){
						code.push("if((__e[" + externals.length + "])(value, index))" + temp);
						externals.push(f);
					}else{
						code.push.apply(code, makePredicate("if(${pred})" + temp, f));
					}
					if(isLoopEnv){
						defaultReturn = "return false;";
					}else{
						vars.push("__result = false");
						defaultReturn = "return __result;";
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
					if(!argsDict.hasOwnProperty("accumulator")){
						vars.push("accumulator = " + temp);
					}
					if(typeof f == "function"){
						code.push("accumulator = (__e[" + externals.length + "])(accumulator, value, index);");
						externals.push(f);
					}else{
						code.push.apply(code, f);
					}
					defaultReturn = "return accumulator;";
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
					if(!argsDict.hasOwnProperty("accumulator")){
						vars.push("accumulator");
					}
					temp2 = "__acc" + (accLevel++);
					vars.push(temp2 + " = " + temp);
					if(typeof f == "function"){
						code.push("value = " + temp2 + " = (__e[" +
							externals.length + "])(" + temp2 + ", value, index);");
						externals.push(f);
					}else{
						code.push("accumulator = " + temp2 + ";");
						code.push.apply(code, f);
						code.push(temp2 + " = value = accumulator;");
					}
					dupped = true;
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
					temp2 = isLoopEnv ? "continue;" : "return;";
					code.push("if(index < " + temp + ") " + temp2);
					noIndex = skipped = dupped = true;
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
					temp2 = isLoopEnv ? " break;" : "{ __stop = true; return; }";
					code.push("if(index >= " + temp + ")" + temp2);
					noIndex = skipped = dupped = true;
					break;
				case "skipWhile":
					temp = "__flag" + (flagLevel++);
					vars.push(temp + " = true");
					temp2 = isLoopEnv ? "continue;" : "return;";
					if(typeof f == "function"){
						code.push("if(" + temp + " || (" + temp + " = !(__e[" + externals.length + "])(value, index)))) " + temp2);
						externals.push(f);
					}else{
						code.push.apply(code, makeBlock(
							"if(" + temp + "){",
							"}",
							makePredicate(
								"if(" + temp + " = (${pred})) " + temp2,
								f
							)
						));
					}
					noIndex = skipped = dupped = true;
					break;
				case "takeWhile":
					temp2 = isLoopEnv ? " break;" : "{ __stop = true; return; }";
					if(typeof f == "function"){
						code.push("if(!(__e[" + externals.length + "])(value, index)))" + temp2);
						externals.push(f);
					}else{
						code.push.apply(code, makePredicate("if(!(${pred}))" + temp2, f));
					}
					noIndex = skipped = dupped = true;
					break;
				case "voidResult":
					voidResult = true;
					break loop;
			}
		}

		if(isLoopEnv){
			if(voidResult || defaultReturn){
				// nothing
			}else if(isResultSpecified){
				code.push("__result.push(value);");
				if(!voidResult && !defaultReturn){
					defaultReturn = "return __result;";
				}
			}else if(dupped || !isArraySrc){
				temp2 = isArraySrc && !skipped;
				if(noIndex && temp2){
					temp = "__i" + (indexLevel++);
					vars.push(temp + " = 0");
					code.push("index = " + temp + "++;");
					noIndex = false;
				}
				vars.push("__result = " + (temp2 ? "new Array(__source.length)" : "[]"));
				code.push("__result" + (temp2 ? "[index] = value;" : ".push(value);"));
				if(!voidResult && !defaultReturn){
					defaultReturn = "return __result;";
				}
			}else{
				if(!voidResult && !defaultReturn){
					defaultReturn = "return __source;";
				}
			}
		}else{
			code.push("return value;");
		}

		if(indexLevel){
			vars.push("index");
		}

		return {
			args: args,
			vars: vars,
			head: head,
			code: code,
			tail: tail,
			voidResult: voidResult,
			ret:  defaultReturn,
			ext:  externals
		};
	}

	return translate;
});
