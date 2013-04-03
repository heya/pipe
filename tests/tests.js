/* UMD.define */ (typeof define=="function"&&define||function(d,f,m){m={module:module,require:require};module.exports=f.apply(null,d.map(function(n){return m[n]||require(n)}))})
(["module", "heya-unit",
	"heya-ctr/evalWithEnv", "../Pipe",
	"../interpret", "../arrayCompiler",
	"../loopers/array", "../loopers/arrayRev",
	"../loopers/sparse", "../loopers/sparseRev",
	"../loopers/slice", "../loopers/sliceRev",
	"../loopers/enumerator", "../loopers/values",
	"../loopers/ownKeys", "../loopers/ownValues",
	"../loopers/keyValues", "../loopers/ownKeyValues",
	"../loopers/iota", "../loopers/iteratorObj",
	"../loopers/unfold", "../object"],
function(module, unit, evalWithEnv, Pipe, interpret, arrayCompiler,
		array, arrayRev, sparse, sparseRev, slice, sliceRev,
		enumerator, values, ownKeys, ownValues, keyValues, ownKeyValues,
		iota, iteratorObj, unfold, object){
	"use strict";

	// test data

	var testArray = [1, 2, 3, 4, 5];
	var testSparseArray = [1,,3,,5];

	// tests

	unit.add(module, [
		// test interpret
		function test_interpret_forEach(t){
			var a = [], p = new Pipe().forEach(function(value){ a.push(value); }),
				x = interpret(p, testArray);
			eval(t.test("a.join(',') === '1,2,3,4,5'"));
			a = [];
			x = interpret(p, testSparseArray);
			eval(t.test("a.join(',') === '1,3,5'"));
		},
		function test_interpret_transform(t){
			var p = new Pipe().transform(function(value){ return value + 1; }),
				x = interpret(p, testArray.slice(0));
			eval(t.test("x.join(',') === '2,3,4,5,6'"));
			x = interpret(p, testSparseArray.slice(0));
			eval(t.test("x.join(',') === '2,,4,,6'"));
		},
		function test_interpret_map(t){
			var p = new Pipe().map(function(value){ return value + 1; }),
				x = interpret(p, testArray);
			eval(t.test("x.join(',') === '2,3,4,5,6'"));
			x = interpret(p, testSparseArray);
			eval(t.test("x.join(',') === '2,,4,,6'"));
		},
		function test_interpret_filter(t){
			var p = new Pipe().filter(function(value){ return value % 2 && value < 4; }),
				x = interpret(p, testArray);
			eval(t.test("x.join(',') === '1,3'"));
			x = interpret(p, testSparseArray);
			eval(t.test("x.join(',') === '1,3'"));
		},
		function test_interpret_indexOf(t){
			var p = new Pipe().indexOf(3),
				x = interpret(p, testArray);
			eval(t.test("x === 2"));
			x = interpret(p, testSparseArray);
			eval(t.test("x === 2"));
		},
		function test_interpret_every(t){
			var p = new Pipe().every(function(value){ return value < 6; }),
				x = interpret(p, testArray);
			eval(t.test("x"));
			x = interpret(p, testSparseArray);
			eval(t.test("x"));
			//
			p = new Pipe().every(function(value){ return value < 4; });
			x = interpret(p, testArray);
			eval(t.test("!x"));
			x = interpret(p, testSparseArray);
			eval(t.test("!x"));
		},
		function test_interpret_some(t){
			var p = new Pipe().some(function(value){ return value % 2 && value < 4; }),
				x = interpret(p, testArray);
			eval(t.test("x"));
			x = interpret(p, testSparseArray);
			eval(t.test("x"));
			//
			p = new Pipe().some(function(value){ return value === 42; });
			x = interpret(p, testArray);
			eval(t.test("!x"));
			x = interpret(p, testSparseArray);
			eval(t.test("!x"));
		},
		function test_interpret_fold(t){
			var p = new Pipe().fold(function(acc, value){ return acc + value; }, 0),
				x = interpret(p, testArray);
			eval(t.test("x === 15"));
			x = interpret(p, testSparseArray);
			eval(t.test("x === 9"));
			//
			p = new Pipe().fold(function(acc, value){ return acc * value; }, 1);
			x = interpret(p, testArray);
			eval(t.test("x === 120"));
			x = interpret(p, testSparseArray);
			eval(t.test("x === 15"));
		},
		function test_interpret_scan(t){
			var p = new Pipe().scan(function(acc, value){ return acc + value; }, 0),
				x = interpret(p, testArray);
			eval(t.test("x.join(',') === '1,3,6,10,15'"));
			x = interpret(p, testSparseArray);
			eval(t.test("x.join(',') === '1,,4,,9'"));
			//
			p = new Pipe().scan(function(acc, value){ return acc * value; }, 1);
			x = interpret(p, testArray);
			eval(t.test("x.join(',') === '1,2,6,24,120'"));
			x = interpret(p, testSparseArray);
			eval(t.test("x.join(',') === '1,,3,,15'"));
		},
		function test_interpret_skip(t){
			var p = new Pipe().skip(3),
				x = interpret(p, testArray);
			eval(t.test("x.join(',') === '4,5'"));
			x = interpret(p, testSparseArray);
			eval(t.test("x.join(',') === '5'"));
		},
		function test_interpret_take(t){
			var p = new Pipe().take(3),
				x = interpret(p, testArray);
			eval(t.test("x.join(',') === '1,2,3'"));
			x = interpret(p, testSparseArray);
			eval(t.test("x.join(',') === '1,3'"));
		},
		function test_interpret_skipWhile(t){
			var p = new Pipe().skipWhile(function(value){ return value % 2; }),
				x = interpret(p, testArray);
			eval(t.test("x.join(',') === '2,3,4,5'"));
			x = interpret(p, testSparseArray);
			eval(t.test("x.join(',') === ''"));
			//
			p = new Pipe().skipWhile(function(value){ return value !== 3; });
			x = interpret(p, testArray);
			eval(t.test("x.join(',') === '3,4,5'"));
			x = interpret(p, testSparseArray);
			eval(t.test("x.join(',') === '3,5'"));
		},
		function test_interpret_takeWhile(t){
			var p = new Pipe().takeWhile(function(value){ return value % 2; }),
				x = interpret(p, testArray);
			eval(t.test("x.join(',') === '1'"));
			x = interpret(p, testSparseArray);
			eval(t.test("x.join(',') === '1,3,5'"));
			//
			p = new Pipe().takeWhile(function(value){ return value !== 3; });
			x = interpret(p, testArray);
			eval(t.test("x.join(',') === '1,2'"));
			x = interpret(p, testSparseArray);
			eval(t.test("x.join(',') === '1'"));
		},
		function test_interpret_voidResult(t){
			var p = new Pipe().voidResult(),
				x = interpret(p, testArray);
			eval(t.test("x === undefined"));
			x = interpret(p, testSparseArray);
			eval(t.test("x === undefined"));
		},
		function test_interpret_complex(t){
			var p = new Pipe().
					take(4).
					filter(function(_, index){ return index % 2 == 0; }).
					filter(function(value){ return value % 2; }).
					map(function(value){ return 2 * value; }).
					fold(function(acc, value){ return acc * value; }, 1),
				x = interpret(p, testArray);
			eval(t.test("x === 12"));
			x = interpret(p, testSparseArray);
			eval(t.test("x === 2"));
		},
		function test_interpret_curry(t){
			var p = new Pipe().
					take(4).
					filter(function(_, index){ return index % 2 == 0; }).
					filter(function(value){ return value % 2; }).
					map(function(value){ return 2 * value; }).
					fold(function(acc, value){ return acc * value; }, 1),
				f = interpret.curry(p),
				x = f(testArray);
			eval(t.test("x === 12"));
			x = f(testSparseArray);
			eval(t.test("x === 2"));
		},
		// test arrayCompiler
		function test_arrayCompiler_forEach(t){
			var a = [], p = new Pipe().forEach(function(value){ a.push(value); }),
				f = arrayCompiler(p).compile(), x = f(testArray);
			eval(t.test("a.join(',') === '1,2,3,4,5'"));
			a = [];
			x = f(testSparseArray);
			eval(t.test("a.join(',') === '1,3,5'"));
			//
			p = new Pipe().forEach("a.push(value);");
			a = [];
			var env = evalWithEnv({a: a}, "a");
			f = arrayCompiler(p).compile(env);
			x = f(testArray);
			eval(t.test("a.join(',') === '1,2,3,4,5'"));
			env.closure.setA([]);
			x = f(testSparseArray);
			a = env.closure.getA();
			eval(t.test("a.join(',') === '1,3,5'"));
		},
		function test_arrayCompiler_transform(t){
			var p = new Pipe().transform(function(value){ return value + 1; }),
				f = arrayCompiler(p).compile(), x = f(testArray.slice(0));
			eval(t.test("x.join(',') === '2,3,4,5,6'"));
			x = f(testSparseArray.slice(0));
			eval(t.test("x.join(',') === '2,,4,,6'"));
			//
			p = new Pipe().transform("value = value + 1;");
			f = arrayCompiler(p).compile();
			x = f(testArray.slice(0));
			eval(t.test("x.join(',') === '2,3,4,5,6'"));
			x = f(testSparseArray.slice(0));
			eval(t.test("x.join(',') === '2,,4,,6'"));
		},
		function test_arrayCompiler_map(t){
			var p = new Pipe().map(function(value){ return value + 1; }),
				f = arrayCompiler(p).compile(), x = f(testArray);
			eval(t.test("x.join(',') === '2,3,4,5,6'"));
			x = f(testSparseArray);
			eval(t.test("x.join(',') === '2,,4,,6'"));
			//
			p = new Pipe().map("++value;");
			f = arrayCompiler(p).compile();
			x = f(testArray);
			eval(t.test("x.join(',') === '2,3,4,5,6'"));
			x = f(testSparseArray);
			eval(t.test("x.join(',') === '2,,4,,6'"));
		},
		function test_arrayCompiler_filter(t){
			var p = new Pipe().filter(function(value){ return value % 2 && value < 4; }),
				f = arrayCompiler(p).compile(), x = f(testArray);
			eval(t.test("x.join(',') === '1,3'"));
			x = f(testSparseArray);
			eval(t.test("x.join(',') === '1,3'"));
			//
			p = new Pipe().filter("value % 2 && value < 4");
			f = arrayCompiler(p).compile();
			x = f(testArray);
			eval(t.test("x.join(',') === '1,3'"));
			x = f(testSparseArray);
			eval(t.test("x.join(',') === '1,3'"));
		},
		function test_arrayCompiler_indexOf(t){
			var p = new Pipe().indexOf(3),
				f = arrayCompiler(p, "/g/test.js").compile(),
				x = f(testArray);
			eval(t.test("x === 2"));
			x = f(testSparseArray);
			eval(t.test("x === 2"));
			//
			p = new Pipe().indexOf(Pipe.arg("item"));
			f = arrayCompiler(p).compile();
			x = f(testArray, 5);
			eval(t.test("x === 4"));
			x = f(testSparseArray, 5);
			eval(t.test("x === 4"));
		},
		function test_arrayCompiler_every(t){
			var p = new Pipe().every(function(value){ return value < 6; }),
				f = arrayCompiler(p).compile(), x = f(testArray);
			eval(t.test("x"));
			x = f(testSparseArray);
			eval(t.test("x"));
			//
			p = new Pipe().every(function(value){ return value < 4; });
			f = arrayCompiler(p).compile();
			x = f(testArray);
			eval(t.test("!x"));
			x = f(testSparseArray);
			eval(t.test("!x"));
			//
			p = new Pipe().every("value < 6");
			f = arrayCompiler(p).compile();
			x = f(testArray);
			eval(t.test("x"));
			x = f(testSparseArray);
			eval(t.test("x"));
			//
			p = new Pipe().every("value < 4");
			f = arrayCompiler(p).compile();
			x = f(testArray);
			eval(t.test("!x"));
			x = f(testSparseArray);
			eval(t.test("!x"));
		},
		function test_arrayCompiler_some(t){
			var p = new Pipe().some(function(value){ return value % 2 && value < 4; }),
				f = arrayCompiler(p).compile(), x = f(testArray);
			eval(t.test("x"));
			x = f(testSparseArray);
			eval(t.test("x"));
			//
			p = new Pipe().some(function(value){ return value === 42; });
			f = arrayCompiler(p).compile();
			x = f(testArray);
			eval(t.test("!x"));
			x = f(testSparseArray);
			eval(t.test("!x"));
			//
			p = new Pipe().some("value % 2 && value < 4");
			f = arrayCompiler(p).compile();
			x = f(testArray);
			eval(t.test("x"));
			x = f(testSparseArray);
			eval(t.test("x"));
			//
			p = new Pipe().some("value === 42");
			f = arrayCompiler(p).compile();
			x = f(testArray);
			eval(t.test("!x"));
			x = f(testSparseArray);
			eval(t.test("!x"));
		},
		function test_arrayCompiler_fold(t){
			var p = new Pipe().fold(function(acc, value){ return acc + value; }, 0),
				f = arrayCompiler(p).compile(),
				x = f(testArray);
			eval(t.test("x === 15"));
			x = f(testSparseArray);
			eval(t.test("x === 9"));
			//
			p = new Pipe().fold(function(acc, value){ return acc * value; }, 1);
			f = arrayCompiler(p).compile();
			x = f(testArray);
			eval(t.test("x === 120"));
			x = f(testSparseArray);
			eval(t.test("x === 15"));
			//
			p = new Pipe().fold("accumulator += value;", Pipe.arg("acc"));
			f = arrayCompiler(p).compile();
			x = f(testArray, 0);
			eval(t.test("x === 15"));
			x = f(testSparseArray, 0);
			eval(t.test("x === 9"));
			//
			p = new Pipe().fold("accumulator *= value;", Pipe.arg("acc"));
			f = arrayCompiler(p).compile();
			x = f(testArray, 1);
			eval(t.test("x === 120"));
			x = f(testSparseArray, 1);
			eval(t.test("x === 15"));
		},
		function test_arrayCompiler_scan(t){
			var p = new Pipe().scan(function(acc, value){ return acc + value; }, 0),
				f = arrayCompiler(p).compile(),
				x = f(testArray);
			eval(t.test("x.join(',') === '1,3,6,10,15'"));
			x = f(testSparseArray);
			eval(t.test("x.join(',') === '1,,4,,9'"));
			//
			p = new Pipe().scan(function(acc, value){ return acc * value; }, 1);
			f = arrayCompiler(p).compile();
			x = f(testArray);
			eval(t.test("x.join(',') === '1,2,6,24,120'"));
			x = f(testSparseArray);
			eval(t.test("x.join(',') === '1,,3,,15'"));
			//
			p = new Pipe().scan("accumulator += value;", Pipe.arg("acc"));
			f = arrayCompiler(p).compile();
			x = f(testArray, 0);
			eval(t.test("x.join(',') === '1,3,6,10,15'"));
			x = f(testSparseArray, 0);
			eval(t.test("x.join(',') === '1,,4,,9'"));
			//
			p = new Pipe().scan("accumulator *= value;", Pipe.arg("acc"));
			f = arrayCompiler(p).compile();
			x = f(testArray, 1);
			eval(t.test("x.join(',') === '1,2,6,24,120'"));
			x = f(testSparseArray, 1);
			eval(t.test("x.join(',') === '1,,3,,15'"));
		},
		function test_arrayCompiler_skip(t){
			var p = new Pipe().skip(3),
				f = arrayCompiler(p).compile(),
				x = f(testArray);
			eval(t.test("x.join(',') === '4,5'"));
			x = f(testSparseArray);
			eval(t.test("x.join(',') === '5'"));
			//
			p = new Pipe().skip(Pipe.arg("num"));
			f = arrayCompiler(p).compile();
			x = f(testArray, 3);
			eval(t.test("x.join(',') === '4,5'"));
			x = f(testSparseArray, 3);
			eval(t.test("x.join(',') === '5'"));
		},
		function test_arrayCompiler_take(t){
			var p = new Pipe().take(3),
				f = arrayCompiler(p).compile(),
				x = f(testArray);
			eval(t.test("x.join(',') === '1,2,3'"));
			x = f(testSparseArray);
			eval(t.test("x.join(',') === '1,3'"));
			//
			p = new Pipe().take(Pipe.arg("num"));
			f = arrayCompiler(p).compile();
			x = f(testArray, 3);
			eval(t.test("x.join(',') === '1,2,3'"));
			x = f(testSparseArray, 3);
			eval(t.test("x.join(',') === '1,3'"));
		},
		function test_arrayCompiler_skipWhile(t){
			var p = new Pipe().skipWhile(function(value){ return value % 2; }),
				f = arrayCompiler(p).compile(), x = f(testArray);
			eval(t.test("x.join(',') === '2,3,4,5'"));
			x = f(testSparseArray);
			eval(t.test("x.join(',') === ''"));
			//
			p = new Pipe().skipWhile(function(value){ return value !== 3; });
			f = arrayCompiler(p).compile();
			x = f(testArray);
			eval(t.test("x.join(',') === '3,4,5'"));
			x = f(testSparseArray);
			eval(t.test("x.join(',') === '3,5'"));
			//
		},
		function test_arrayCompiler_takeWhile(t){
			var p = new Pipe().takeWhile(function(value){ return value % 2; }),
				f = arrayCompiler(p).compile(), x = f(testArray);
			eval(t.test("x.join(',') === '1'"));
			x = f(testSparseArray);
			eval(t.test("x.join(',') === '1,3,5'"));
			//
			p = new Pipe().takeWhile(function(value){ return value !== 3; });
			f = arrayCompiler(p).compile();
			x = f(testArray);
			eval(t.test("x.join(',') === '1,2'"));
			x = f(testSparseArray);
			eval(t.test("x.join(',') === '1'"));
			//
		},
		function test_arrayCompiler_voidResult(t){
			var p = new Pipe().voidResult(),
				f = arrayCompiler(p).compile(),
				x = f(testArray);
			eval(t.test("x === undefined"));
			x = f(testSparseArray);
			eval(t.test("x === undefined"));
		},
		function test_arrayCompiler_complex(t){
			var p = new Pipe().
					take(4).
					filter(function(_, index){ return index % 2 == 0; }).
					filter(function(value){ return value % 2; }).
					map(function(value){ return 2 * value; }).
					fold(function(acc, value){ return acc * value; }, 1),
				f = arrayCompiler(p).compile(),
				x = f(testArray);
			eval(t.test("x === 12"));
			x = f(testSparseArray);
			eval(t.test("x === 2"));
			//
			p = new Pipe().
				take(Pipe.arg("take")).
				filter(function(_, index){ return index % 2 == 0; }).
				filter("value % 2").
				map(function(value){ return 2 * value; }).
				fold("accumulator = accumulator * value;", 1);
			f = arrayCompiler(p).compile();
			x = f(testArray, 4);
			eval(t.test("x === 12"));
			x = f(testSparseArray, 4);
			eval(t.test("x === 2"));
			//
			p = new Pipe().
				take(Pipe.arg("take")).
				filter("index % 2 == 0").
				filter("value % 2").
				map("value = 2 * value;").
				fold("accumulator = accumulator * value;", Pipe.arg("acc"));
			f = arrayCompiler(p).compile();
			x = f(testArray, 4, 1);
			eval(t.test("x === 12"));
			x = f(testSparseArray, 4, 1);
			eval(t.test("x === 2"));
		},
		// test array
		function test_array(t){
			var sum = new Pipe().
					fold(function(acc, value){ return acc + value; }, 0),
				norm = new Pipe().
					add("decl", {args: ["total"]}).
					map("value /= total;").
					map("value = Math.round(value * 100);"),
				fSum = array(sum).compile(),
				fNorm = array(norm).compile(),
				percent = function(source){
					return fNorm(source, fSum(source));
				},
				result = percent(testArray);
			eval(t.test("result.join(',') === '7,13,20,27,33'"));
			fNorm = array(norm, "name2", true).compile();
			result = [0];
			fNorm(testArray, result, fSum(testArray));
			eval(t.test("result.join(',') === '0,7,13,20,27,33'"));
		},
		// test a reversed array
		function test_reversed_array(t){
			var p = new Pipe().fold(function(acc, value){ acc.push(value); return acc; }, []);
			var f = arrayRev(p).compile();
			var r = f(testArray);
			eval(t.test("r.join(',') === '5,4,3,2,1'"));
			p = new Pipe().fold("accumulator.push(value);", Pipe.arg("array"));
			f = arrayRev(p).compile();
			r = f(testArray, []);
			eval(t.test("r.join(',') === '5,4,3,2,1'"));
		},
		// test sparse array
		function test_sparse(t){
			var sum = new Pipe().
					fold(function(acc, value){ return acc + value; }, 0),
				norm = new Pipe().
					add("decl", {args: ["total"]}).
					map("value /= total;").
					map("value = Math.round(value * 100);"),
				fSum = sparse(sum).compile(),
				fNorm = sparse(norm).compile(),
				percent = function(source){
					return fNorm(source, fSum(source));
				},
				result = percent(testArray);
			eval(t.test("result.join(',') === '7,13,20,27,33'"));
			result = percent(testSparseArray);
			eval(t.test("result.join(',') === '11,33,56'"));
		},
		// test a reversed sparse array
		function test_reversed_sparse(t){
			var p = new Pipe().fold(function(acc, value){ acc.push(value); return acc; }, []);
			var f = sparseRev(p).compile();
			var r = f(testSparseArray);
			eval(t.test("r.join(',') === '5,3,1'"));
			p = new Pipe().fold("accumulator.push(value);", Pipe.arg("array"));
			f = sparseRev(p).compile();
			r = f(testSparseArray, []);
			eval(t.test("r.join(',') === '5,3,1'"));
		},
		// test slice
		function test_slice(t){
			var sum = new Pipe().
					fold(function(acc, value){ return acc + value; }, 0),
				norm = new Pipe().
					add("decl", {args: ["total"]}).
					map("value /= total;").
					map("value = Math.round(value * 100);"),
				fSum = slice(sum).compile(),
				fNorm = slice(norm).compile(),
				percent = function(source, from, to){
					return fNorm(source, from, to, fSum(source, from, to));
				},
				result = percent(testArray, 1, -1);
			eval(t.test("result.join(',') === '22,33,44'"));
			fNorm = slice(norm, null, true).compile();
			result = [0];
			fNorm(testArray, 1, -1, result, fSum(testArray, 1, -1));
			eval(t.test("result.join(',') === '0,22,33,44'"));
		},
		// test a reversed slice
		function test_reversed_slice(t){
			var p = new Pipe().fold(function(acc, value){ acc.push(value); return acc; }, []);
			var f = sliceRev(p).compile();
			var r = f(testArray, -1, 1);
			eval(t.test("r.join(',') === '4,3,2'"));
			p = new Pipe().fold("accumulator.push(value);", Pipe.arg("array"));
			f = sliceRev(p).compile();
			r = f(testArray, -1, 1, [0]);
			eval(t.test("r.join(',') === '0,4,3,2'"));
		},
		// test enumerator
		function test_enumerator_over_keys(t){
			var p = new Pipe();
			var f = enumerator(p).compile();
			var x = {b: 2, d: 3};
			var r = f(x);
			eval(t.test("r.sort().join(',') === 'b,d'"));
			var Y = function(){};
			Y.prototype = x;
			var y = new Y();
			y.a = 1;
			y.c = 2;
			y.e = 3;
			r = f(y);
			eval(t.test("r.sort().join(',') === 'a,b,c,d,e'"));
		},
		function test_enumerator_over_iterator(t){
			if(typeof Iterator != "undefined" && typeof StopIteration != "undefined"){
				var p = new Pipe();
				var f = enumerator(p).compile();
				var r = f(Iterator({a: 1, b: 2, c: 3}, true));
				eval(t.test("r.sort().join(',') === 'a,b,c'"));
			}
		},
		function test_enumerator_over_keys_with_iterator(t){
			if(typeof Iterator != "undefined" && typeof StopIteration != "undefined"){
				var p = new Pipe();
				var f = enumerator(p).compile();
				var r = f(Iterator({a: 1, b: 2, c: 3}, true));
				eval(t.test("r.sort().join(',') === 'a,b,c'"));
			}
		},
		function test_enumerator_over_pairs_with_iterator(t){
			if(typeof Iterator != "undefined" && typeof StopIteration != "undefined"){
				var p = new Pipe().add("decl", {args: "idx"}).map("value = value[idx];");
				var f = enumerator(p).compile();
				var r = f(Iterator({a: 1, b: 2, c: 3}), 0);
				eval(t.test("r.sort().join(',') === 'a,b,c'"));
				r = f(Iterator({a: 1, b: 2, c: 3}), 1);
				eval(t.test("r.sort().join(',') === '1,2,3'"));
			}
		},
		function test_enumerator_with_custom_iterator(t){
			if(typeof Iterator != "undefined" && typeof StopIteration != "undefined"){
				// custom iterator: unbounded Fibonacci sequence
				var FibIter = function(){
					this.pp = this.p  = 0;
				};
				FibIter.prototype.next = function(){
					var c = (this.p + this.pp) || 1;
					this.pp = this.p;
					this.p = c;
					return c;
				};
				var y = {
					__iterator__: function(){
						// Endless Fibonacci numbers
						return new FibIter();
					}
				};

				var p = new Pipe().takeWhile("value < 10");
				var f = enumerator(p).compile();
				var r = f(y);
				eval(t.test("r.join(',') === '1,1,2,3,5,8'"));
			}
		},
		function test_enumerator_with_generator(t){
			if(typeof Iterator != "undefined" && typeof StopIteration != "undefined"){
				// custom generator: unbounded Fibonacci sequence
				var x = {
					// eval is here to hide "yield" from non-compliant interpreters
					__iterator__: eval([
							"(function(){",
							"    var pp = 1, p = 1;",
							"    yield pp;",
							"    yield p;",
							"    for(;;){",
							"        var c = pp + p;",
							"        yield c;",
							"        pp = p;",
							"        p = c;",
							"    }",
							"})"
						].join("\n"))
				};

				var p = new Pipe().takeWhile("value < 10");
				var f = enumerator(p).compile();
				var r = f(x);
				eval(t.test("r.join(',') === '1,1,2,3,5,8'"));
			}
		},
		// test values
		function test_values(t){
			var p = new Pipe();
			var f = values(p).compile();
			var x = {b: 4, d: 5};
			var r = f(x);
			eval(t.test("r.sort().join(',') === '4,5'"));
			var Y = function(){};
			Y.prototype = x;
			var y = new Y();
			y.a = 1;
			y.c = 2;
			y.e = 3;
			r = f(y);
			eval(t.test("r.sort().join(',') === '1,2,3,4,5'"));
		},
		// test ownKeys
		function test_ownKeys(t){
			var p = new Pipe();
			var f = ownKeys(p).compile();
			var x = {b: 4, d: 5};
			var r = f(x);
			eval(t.test("r.sort().join(',') === 'b,d'"));
			var Y = function(){};
			Y.prototype = x;
			var y = new Y();
			y.a = 1;
			y.c = 2;
			y.e = 3;
			r = f(y);
			eval(t.test("r.sort().join(',') === 'a,c,e'"));
		},
		// test ownValues
		function test_ownValues(t){
			var p = new Pipe();
			var f = ownValues(p).compile();
			var x = {b: 4, d: 5};
			var r = f(x);
			eval(t.test("r.sort().join(',') === '4,5'"));
			var Y = function(){};
			Y.prototype = x;
			var y = new Y();
			y.a = 1;
			y.c = 2;
			y.e = 3;
			r = f(y);
			eval(t.test("r.sort().join(',') === '1,2,3'"));
		},
		// test keyValues
		function test_keyValues(t){
			var p = new Pipe().map("value = value[0] + value[1];");
			var f = keyValues(p).compile();
			var x = {b: 4, d: 5};
			var r = f(x);
			eval(t.test("r.sort().join(',') === 'b4,d5'"));
			var Y = function(){};
			Y.prototype = x;
			var y = new Y();
			y.a = 1;
			y.c = 2;
			y.e = 3;
			r = f(y);
			eval(t.test("r.sort().join(',') === 'a1,b4,c2,d5,e3'"));
		},
		// test ownKeyValues
		function test_ownKeyValues(t){
			var p = new Pipe().map("value = value[0] + value[1];");
			var f = ownKeyValues(p).compile();
			var x = {b: 4, d: 5};
			var r = f(x);
			eval(t.test("r.sort().join(',') === 'b4,d5'"));
			var Y = function(){};
			Y.prototype = x;
			var y = new Y();
			y.a = 1;
			y.c = 2;
			y.e = 3;
			r = f(y);
			eval(t.test("r.sort().join(',') === 'a1,c2,e3'"));
		},
		// test iota
		function test_iota(t){
			var p = new Pipe();
			var f = iota(p).compile();
			var r = f(0, 5);
			eval(t.test("r.join(',') === '0,1,2,3,4'"));
			r = f(1, 5, 2);
			eval(t.test("r.join(',') === '1,3'"));
			r = f(1, -1);
			eval(t.test("r.join(',') === '1,0'"));
			p = new Pipe().take(Pipe.arg("num"));
			f = iota(p).compile();
			r = f(1, -1, 0.25, 5);
			eval(t.test("r.join(',') === '1,0.75,0.5,0.25,0'"));
		},
		// test iteratorObj
		function test_iteratorObj(t){
			// custom iterator: unbounded Fibonacci sequence
			var FibIter = function(){
				this.pp = 0;
				this.p  = 0;
			};
			FibIter.prototype.hasNext = function(){ return true; };
			FibIter.prototype.next = function(){
				var c = (this.p + this.pp) || 1;
				this.pp = this.p;
				this.p = c;
				return c;
			};
			var y = new FibIter();

			var p = new Pipe().takeWhile("value < 10");
			var f = iteratorObj(p).compile();
			var r = f(y);
			eval(t.test("r.join(',') === '1,1,2,3,5,8'"));
		},
		// test unfold
		function test_unfold(t){
			var p = new Pipe();
			var f = unfold(
					"accumulator < 100",	// pred
					"value = accumulator;",	// value
					"accumulator *= 2;"		// next
				)(p).compile();
			var r = f(1);
			eval(t.test("r.join(',') === '1,2,4,8,16,32,64'"));
		},
		// test an object
		function test_object(t){
			var sum = new Pipe().
					fold(function(acc, value){ return acc + value; }, 0),
				norm = new Pipe().
					add("decl", {args: ["total"]}).
					map("value /= total;").
					map("value = Math.round(value * 100);"),
				fSum = object(sum).compile(),
				fNorm = object(norm).compile(),
				percent = function(source){
					var r = [];
					fSum.start();
					fNorm.start(15);
					for(var i = 0; i < testArray.length; ++i){
						fSum.process(testArray[i]);
						r.push(fNorm.process(testArray[i]));
					}
					fSum.stop();
					fNorm.stop();
					eval(t.test("fSum.getResult() == 15"));
					return r;
				},
				result = percent(testArray);
			eval(t.test("result.join(',') === '7,13,20,27,33'"));
		}
	]);

	unit.run();
});
