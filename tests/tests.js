// test harness

if(typeof out == "undefined"){
	out = function(msg){
		console.log(msg);
	};
	_total = 0;
	_errors = 0;
	_current = null;
	_local = 0;
	res = function(msg, isError){
		++_local;
		++_total;
		if(isError){
			++_errors;
			console.log(msg);
		}
	};

	evalWithEnv   = require("heya-ctr/evalWithEnv");

	Pipe          = require("../Pipe");
	interpret     = require("../interpret");
	arrayCompiler = require("../arrayCompiler");

	array         = require("../loopers/array");
	arrayRev      = require("../loopers/arrayRev");
	sparse        = require("../loopers/sparse");
	sparseRev     = require("../loopers/sparseRev");
	slice         = require("../loopers/slice");
	sliceRev      = require("../loopers/sliceRev");

	enumerator    = require("../loopers/enumerator");
	values        = require("../loopers/values");
	ownKeys       = require("../loopers/ownKeys");
	ownValues     = require("../loopers/ownValues");
	keyValues     = require("../loopers/keyValues");
	ownKeyValues  = require("../loopers/ownKeyValues");

	iota          = require("../loopers/iota");
	iteratorObj   = require("../loopers/iteratorObj");
	unfold        = require("../loopers/unfold");

	object        = require("../object");
}

var SHOW_FAILED_TEST_CODE = true;

function submit(msg, success){
	if(success){
		res("Success: " + msg + " --- in " + _current + ", #" + _local);
	}else{
		res("Failed: " + msg + " --- in " + _current + ", #" + _local, true);
	}
}

function assert(condition){
	return "submit('" + quoteString(condition) + "', (" + condition + "))";
}

function quoteString(text){
	return text.replace(/['"\\]/g, "\\$&");
}

// test data

var testArray = [1, 2, 3, 4, 5];
var testSparseArray = [1,,3,,5];

// tests

var tests = [
	// test interpret
	function test_interpret_forEach(){
		var a = [], p = new Pipe().forEach(function(value){ a.push(value); }),
			t = interpret(p, testArray);
		eval(assert("a.join(',') === '1,2,3,4,5'"));
		a = [];
		t = interpret(p, testSparseArray);
		eval(assert("a.join(',') === '1,3,5'"));
	},
	function test_interpret_transform(){
		var p = new Pipe().transform(function(value){ return value + 1; }),
			t = interpret(p, testArray.slice(0));
		eval(assert("t.join(',') === '2,3,4,5,6'"));
		t = interpret(p, testSparseArray.slice(0));
		eval(assert("t.join(',') === '2,,4,,6'"));
	},
	function test_interpret_map(){
		var p = new Pipe().map(function(value){ return value + 1; }),
			t = interpret(p, testArray);
		eval(assert("t.join(',') === '2,3,4,5,6'"));
		t = interpret(p, testSparseArray);
		eval(assert("t.join(',') === '2,,4,,6'"));
	},
	function test_interpret_filter(){
		var p = new Pipe().filter(function(value){ return value % 2 && value < 4; }),
			t = interpret(p, testArray);
		eval(assert("t.join(',') === '1,3'"));
		t = interpret(p, testSparseArray);
		eval(assert("t.join(',') === '1,3'"));
	},
	function test_interpret_indexOf(){
		var p = new Pipe().indexOf(3),
			t = interpret(p, testArray);
		eval(assert("t === 2"));
		t = interpret(p, testSparseArray);
		eval(assert("t === 2"));
	},
	function test_interpret_every(){
		var p = new Pipe().every(function(value){ return value < 6; }),
			t = interpret(p, testArray);
		eval(assert("t"));
		t = interpret(p, testSparseArray);
		eval(assert("t"));
		//
		p = new Pipe().every(function(value){ return value < 4; });
		t = interpret(p, testArray);
		eval(assert("!t"));
		t = interpret(p, testSparseArray);
		eval(assert("!t"));
	},
	function test_interpret_some(){
		var p = new Pipe().some(function(value){ return value % 2 && value < 4; }),
			t = interpret(p, testArray);
		eval(assert("t"));
		t = interpret(p, testSparseArray);
		eval(assert("t"));
		//
		p = new Pipe().some(function(value){ return value === 42; });
		t = interpret(p, testArray);
		eval(assert("!t"));
		t = interpret(p, testSparseArray);
		eval(assert("!t"));
	},
	function test_interpret_fold(){
		var p = new Pipe().fold(function(acc, value){ return acc + value; }, 0),
			t = interpret(p, testArray);
		eval(assert("t === 15"));
		t = interpret(p, testSparseArray);
		eval(assert("t === 9"));
		//
		p = new Pipe().fold(function(acc, value){ return acc * value; }, 1);
		t = interpret(p, testArray);
		eval(assert("t === 120"));
		t = interpret(p, testSparseArray);
		eval(assert("t === 15"));
	},
	function test_interpret_scan(){
		var p = new Pipe().scan(function(acc, value){ return acc + value; }, 0),
			t = interpret(p, testArray);
		eval(assert("t.join(',') === '1,3,6,10,15'"));
		t = interpret(p, testSparseArray);
		eval(assert("t.join(',') === '1,,4,,9'"));
		//
		p = new Pipe().scan(function(acc, value){ return acc * value; }, 1);
		t = interpret(p, testArray);
		eval(assert("t.join(',') === '1,2,6,24,120'"));
		t = interpret(p, testSparseArray);
		eval(assert("t.join(',') === '1,,3,,15'"));
	},
	function test_interpret_skip(){
		var p = new Pipe().skip(3),
			t = interpret(p, testArray);
		eval(assert("t.join(',') === '4,5'"));
		t = interpret(p, testSparseArray);
		eval(assert("t.join(',') === '5'"));
	},
	function test_interpret_take(){
		var p = new Pipe().take(3),
			t = interpret(p, testArray);
		eval(assert("t.join(',') === '1,2,3'"));
		t = interpret(p, testSparseArray);
		eval(assert("t.join(',') === '1,3'"));
	},
	function test_interpret_skipWhile(){
		var p = new Pipe().skipWhile(function(value){ return value % 2; }),
			t = interpret(p, testArray);
		eval(assert("t.join(',') === '2,3,4,5'"));
		t = interpret(p, testSparseArray);
		eval(assert("t.join(',') === ''"));
		//
		p = new Pipe().skipWhile(function(value){ return value !== 3; });
		t = interpret(p, testArray);
		eval(assert("t.join(',') === '3,4,5'"));
		t = interpret(p, testSparseArray);
		eval(assert("t.join(',') === '3,5'"));
	},
	function test_interpret_takeWhile(){
		var p = new Pipe().takeWhile(function(value){ return value % 2; }),
			t = interpret(p, testArray);
		eval(assert("t.join(',') === '1'"));
		t = interpret(p, testSparseArray);
		eval(assert("t.join(',') === '1,3,5'"));
		//
		p = new Pipe().takeWhile(function(value){ return value !== 3; });
		t = interpret(p, testArray);
		eval(assert("t.join(',') === '1,2'"));
		t = interpret(p, testSparseArray);
		eval(assert("t.join(',') === '1'"));
	},
	function test_interpret_voidResult(){
		var p = new Pipe().voidResult(),
			t = interpret(p, testArray);
		eval(assert("t === undefined"));
		t = interpret(p, testSparseArray);
		eval(assert("t === undefined"));
	},
	function test_interpret_complex(){
		var p = new Pipe().
				take(4).
				filter(function(_, index){ return index % 2 == 0; }).
				filter(function(value){ return value % 2; }).
				map(function(value){ return 2 * value; }).
				fold(function(acc, value){ return acc * value; }, 1),
			t = interpret(p, testArray);
		eval(assert("t === 12"));
		t = interpret(p, testSparseArray);
		eval(assert("t === 2"));
	},
	function test_interpret_curry(){
		var p = new Pipe().
				take(4).
				filter(function(_, index){ return index % 2 == 0; }).
				filter(function(value){ return value % 2; }).
				map(function(value){ return 2 * value; }).
				fold(function(acc, value){ return acc * value; }, 1),
			f = interpret.curry(p),
			t = f(testArray);
		eval(assert("t === 12"));
		t = f(testSparseArray);
		eval(assert("t === 2"));
	},
	// test arrayCompiler
	function test_arrayCompiler_forEach(){
		var a = [], p = new Pipe().forEach(function(value){ a.push(value); }),
			f = arrayCompiler(p).compile(), t = f(testArray);
		eval(assert("a.join(',') === '1,2,3,4,5'"));
		a = [];
		t = f(testSparseArray);
		eval(assert("a.join(',') === '1,3,5'"));
		//
		p = new Pipe().forEach("a.push(value);");
		a = [];
		var env = evalWithEnv({a: a}, "a");
		f = arrayCompiler(p).compile(env);
		t = f(testArray);
		eval(assert("a.join(',') === '1,2,3,4,5'"));
		env.closure.setA([]);
		t = f(testSparseArray);
		a = env.closure.getA();
		eval(assert("a.join(',') === '1,3,5'"));
	},
	function test_arrayCompiler_transform(){
		var p = new Pipe().transform(function(value){ return value + 1; }),
			f = arrayCompiler(p).compile(), t = f(testArray.slice(0));
		eval(assert("t.join(',') === '2,3,4,5,6'"));
		t = f(testSparseArray.slice(0));
		eval(assert("t.join(',') === '2,,4,,6'"));
		//
		p = new Pipe().transform("value = value + 1;");
		f = arrayCompiler(p).compile();
		t = f(testArray.slice(0));
		eval(assert("t.join(',') === '2,3,4,5,6'"));
		t = f(testSparseArray.slice(0));
		eval(assert("t.join(',') === '2,,4,,6'"));
	},
	function test_arrayCompiler_map(){
		var p = new Pipe().map(function(value){ return value + 1; }),
			f = arrayCompiler(p).compile(), t = f(testArray);
		eval(assert("t.join(',') === '2,3,4,5,6'"));
		t = f(testSparseArray);
		eval(assert("t.join(',') === '2,,4,,6'"));
		//
		p = new Pipe().map("++value;");
		f = arrayCompiler(p).compile();
		t = f(testArray);
		eval(assert("t.join(',') === '2,3,4,5,6'"));
		t = f(testSparseArray);
		eval(assert("t.join(',') === '2,,4,,6'"));
	},
	function test_arrayCompiler_filter(){
		var p = new Pipe().filter(function(value){ return value % 2 && value < 4; }),
			f = arrayCompiler(p).compile(), t = f(testArray);
		eval(assert("t.join(',') === '1,3'"));
		t = f(testSparseArray);
		eval(assert("t.join(',') === '1,3'"));
		//
		p = new Pipe().filter("value % 2 && value < 4");
		f = arrayCompiler(p).compile();
		t = f(testArray);
		eval(assert("t.join(',') === '1,3'"));
		t = f(testSparseArray);
		eval(assert("t.join(',') === '1,3'"));
	},
	function test_arrayCompiler_indexOf(){
		var p = new Pipe().indexOf(3),
			f = arrayCompiler(p, "/g/test.js").compile(),
			t = f(testArray);
		eval(assert("t === 2"));
		t = f(testSparseArray);
		eval(assert("t === 2"));
		//
		p = new Pipe().indexOf(Pipe.arg("item"));
		f = arrayCompiler(p).compile();
		t = f(testArray, 5);
		eval(assert("t === 4"));
		t = f(testSparseArray, 5);
		eval(assert("t === 4"));
	},
	function test_arrayCompiler_every(){
		var p = new Pipe().every(function(value){ return value < 6; }),
			f = arrayCompiler(p).compile(), t = f(testArray);
		eval(assert("t"));
		t = f(testSparseArray);
		eval(assert("t"));
		//
		p = new Pipe().every(function(value){ return value < 4; });
		f = arrayCompiler(p).compile();
		t = f(testArray);
		eval(assert("!t"));
		t = f(testSparseArray);
		eval(assert("!t"));
		//
		p = new Pipe().every("value < 6");
		f = arrayCompiler(p).compile();
		t = f(testArray);
		eval(assert("t"));
		t = f(testSparseArray);
		eval(assert("t"));
		//
		p = new Pipe().every("value < 4");
		f = arrayCompiler(p).compile();
		t = f(testArray);
		eval(assert("!t"));
		t = f(testSparseArray);
		eval(assert("!t"));
	},
	function test_arrayCompiler_some(){
		var p = new Pipe().some(function(value){ return value % 2 && value < 4; }),
			f = arrayCompiler(p).compile(), t = f(testArray);
		eval(assert("t"));
		t = f(testSparseArray);
		eval(assert("t"));
		//
		p = new Pipe().some(function(value){ return value === 42; });
		f = arrayCompiler(p).compile();
		t = f(testArray);
		eval(assert("!t"));
		t = f(testSparseArray);
		eval(assert("!t"));
		//
		p = new Pipe().some("value % 2 && value < 4");
		f = arrayCompiler(p).compile();
		t = f(testArray);
		eval(assert("t"));
		t = f(testSparseArray);
		eval(assert("t"));
		//
		p = new Pipe().some("value === 42");
		f = arrayCompiler(p).compile();
		t = f(testArray);
		eval(assert("!t"));
		t = f(testSparseArray);
		eval(assert("!t"));
	},
	function test_arrayCompiler_fold(){
		var p = new Pipe().fold(function(acc, value){ return acc + value; }, 0),
			f = arrayCompiler(p).compile(),
			t = f(testArray);
		eval(assert("t === 15"));
		t = f(testSparseArray);
		eval(assert("t === 9"));
		//
		p = new Pipe().fold(function(acc, value){ return acc * value; }, 1);
		f = arrayCompiler(p).compile();
		t = f(testArray);
		eval(assert("t === 120"));
		t = f(testSparseArray);
		eval(assert("t === 15"));
		//
		p = new Pipe().fold("accumulator += value;", Pipe.arg("acc"));
		f = arrayCompiler(p).compile();
		t = f(testArray, 0);
		eval(assert("t === 15"));
		t = f(testSparseArray, 0);
		eval(assert("t === 9"));
		//
		p = new Pipe().fold("accumulator *= value;", Pipe.arg("acc"));
		f = arrayCompiler(p).compile();
		t = f(testArray, 1);
		eval(assert("t === 120"));
		t = f(testSparseArray, 1);
		eval(assert("t === 15"));
	},
	function test_arrayCompiler_scan(){
		var p = new Pipe().scan(function(acc, value){ return acc + value; }, 0),
			f = arrayCompiler(p).compile(),
			t = f(testArray);
		eval(assert("t.join(',') === '1,3,6,10,15'"));
		t = f(testSparseArray);
		eval(assert("t.join(',') === '1,,4,,9'"));
		//
		p = new Pipe().scan(function(acc, value){ return acc * value; }, 1);
		f = arrayCompiler(p).compile();
		t = f(testArray);
		eval(assert("t.join(',') === '1,2,6,24,120'"));
		t = f(testSparseArray);
		eval(assert("t.join(',') === '1,,3,,15'"));
		//
		p = new Pipe().scan("accumulator += value;", Pipe.arg("acc"));
		f = arrayCompiler(p).compile();
		t = f(testArray, 0);
		eval(assert("t.join(',') === '1,3,6,10,15'"));
		t = f(testSparseArray, 0);
		eval(assert("t.join(',') === '1,,4,,9'"));
		//
		p = new Pipe().scan("accumulator *= value;", Pipe.arg("acc"));
		f = arrayCompiler(p).compile();
		t = f(testArray, 1);
		eval(assert("t.join(',') === '1,2,6,24,120'"));
		t = f(testSparseArray, 1);
		eval(assert("t.join(',') === '1,,3,,15'"));
	},
	function test_arrayCompiler_skip(){
		var p = new Pipe().skip(3),
			f = arrayCompiler(p).compile(),
			t = f(testArray);
		eval(assert("t.join(',') === '4,5'"));
		t = f(testSparseArray);
		eval(assert("t.join(',') === '5'"));
		//
		p = new Pipe().skip(Pipe.arg("num"));
		f = arrayCompiler(p).compile();
		t = f(testArray, 3);
		eval(assert("t.join(',') === '4,5'"));
		t = f(testSparseArray, 3);
		eval(assert("t.join(',') === '5'"));
	},
	function test_arrayCompiler_take(){
		var p = new Pipe().take(3),
			f = arrayCompiler(p).compile(),
			t = f(testArray);
		eval(assert("t.join(',') === '1,2,3'"));
		t = f(testSparseArray);
		eval(assert("t.join(',') === '1,3'"));
		//
		p = new Pipe().take(Pipe.arg("num"));
		f = arrayCompiler(p).compile();
		t = f(testArray, 3);
		eval(assert("t.join(',') === '1,2,3'"));
		t = f(testSparseArray, 3);
		eval(assert("t.join(',') === '1,3'"));
	},
	function test_arrayCompiler_skipWhile(){
		var p = new Pipe().skipWhile(function(value){ return value % 2; }),
			f = arrayCompiler(p).compile(), t = f(testArray);
		eval(assert("t.join(',') === '2,3,4,5'"));
		t = f(testSparseArray);
		eval(assert("t.join(',') === ''"));
		//
		p = new Pipe().skipWhile(function(value){ return value !== 3; });
		f = arrayCompiler(p).compile();
		t = f(testArray);
		eval(assert("t.join(',') === '3,4,5'"));
		t = f(testSparseArray);
		eval(assert("t.join(',') === '3,5'"));
		//
	},
	function test_arrayCompiler_takeWhile(){
		var p = new Pipe().takeWhile(function(value){ return value % 2; }),
			f = arrayCompiler(p).compile(), t = f(testArray);
		eval(assert("t.join(',') === '1'"));
		t = f(testSparseArray);
		eval(assert("t.join(',') === '1,3,5'"));
		//
		p = new Pipe().takeWhile(function(value){ return value !== 3; });
		f = arrayCompiler(p).compile();
		t = f(testArray);
		eval(assert("t.join(',') === '1,2'"));
		t = f(testSparseArray);
		eval(assert("t.join(',') === '1'"));
		//
	},
	function test_arrayCompiler_voidResult(){
		var p = new Pipe().voidResult(),
			f = arrayCompiler(p).compile(),
			t = f(testArray);
		eval(assert("t === undefined"));
		t = f(testSparseArray);
		eval(assert("t === undefined"));
	},
	function test_arrayCompiler_complex(){
		var p = new Pipe().
				take(4).
				filter(function(_, index){ return index % 2 == 0; }).
				filter(function(value){ return value % 2; }).
				map(function(value){ return 2 * value; }).
				fold(function(acc, value){ return acc * value; }, 1),
			f = arrayCompiler(p).compile(),
			t = f(testArray);
		eval(assert("t === 12"));
		t = f(testSparseArray);
		eval(assert("t === 2"));
		//
		p = new Pipe().
			take(Pipe.arg("take")).
			filter(function(_, index){ return index % 2 == 0; }).
			filter("value % 2").
			map(function(value){ return 2 * value; }).
			fold("accumulator = accumulator * value;", 1);
		f = arrayCompiler(p).compile();
		t = f(testArray, 4);
		eval(assert("t === 12"));
		t = f(testSparseArray, 4);
		eval(assert("t === 2"));
		//
		p = new Pipe().
			take(Pipe.arg("take")).
			filter("index % 2 == 0").
			filter("value % 2").
			map("value = 2 * value;").
			fold("accumulator = accumulator * value;", Pipe.arg("acc"));
		f = arrayCompiler(p).compile();
		t = f(testArray, 4, 1);
		eval(assert("t === 12"));
		t = f(testSparseArray, 4, 1);
		eval(assert("t === 2"));
	},
	// test array
	function test_array(){
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
		eval(assert("result.join(',') === '7,13,20,27,33'"));
		fNorm = array(norm, "name2", true).compile();
		result = [0];
		fNorm(testArray, result, fSum(testArray));
		eval(assert("result.join(',') === '0,7,13,20,27,33'"));
	},
	// test a reversed array
	function test_reversed_array(){
		var p = new Pipe().fold(function(acc, value){ acc.push(value); return acc; }, []);
		var f = arrayRev(p).compile();
		var r = f(testArray);
		eval(assert("r.join(',') === '5,4,3,2,1'"));
		p = new Pipe().fold("accumulator.push(value);", Pipe.arg("array"));
		f = arrayRev(p).compile();
		r = f(testArray, []);
		eval(assert("r.join(',') === '5,4,3,2,1'"));
	},
	// test sparse array
	function test_sparse(){
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
		eval(assert("result.join(',') === '7,13,20,27,33'"));
		result = percent(testSparseArray);
		eval(assert("result.join(',') === '11,33,56'"));
	},
	// test a reversed sparse array
	function test_reversed_sparse(){
		var p = new Pipe().fold(function(acc, value){ acc.push(value); return acc; }, []);
		var f = sparseRev(p).compile();
		var r = f(testSparseArray);
		eval(assert("r.join(',') === '5,3,1'"));
		p = new Pipe().fold("accumulator.push(value);", Pipe.arg("array"));
		f = sparseRev(p).compile();
		r = f(testSparseArray, []);
		eval(assert("r.join(',') === '5,3,1'"));
	},
	// test slice
	function test_slice(){
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
		eval(assert("result.join(',') === '22,33,44'"));
		fNorm = slice(norm, null, true).compile();
		result = [0];
		fNorm(testArray, 1, -1, result, fSum(testArray, 1, -1));
		eval(assert("result.join(',') === '0,22,33,44'"));
	},
	// test a reversed slice
	function test_reversed_slice(){
		var p = new Pipe().fold(function(acc, value){ acc.push(value); return acc; }, []);
		var f = sliceRev(p).compile();
		var r = f(testArray, -1, 1);
		eval(assert("r.join(',') === '4,3,2'"));
		p = new Pipe().fold("accumulator.push(value);", Pipe.arg("array"));
		f = sliceRev(p).compile();
		r = f(testArray, -1, 1, [0]);
		eval(assert("r.join(',') === '0,4,3,2'"));
	},
	// test enumerator
	function test_enumerator_over_keys(){
		var p = new Pipe();
		var f = enumerator(p).compile();
		var t = {b: 2, d: 3};
		var r = f(t);
		eval(assert("r.sort().join(',') === 'b,d'"));
		var X = function(){};
		X.prototype = t;
		var x = new X();
		x.a = 1;
		x.c = 2;
		x.e = 3;
		r = f(x);
		eval(assert("r.sort().join(',') === 'a,b,c,d,e'"));
	},
	function test_enumerator_over_iterator(){
		if(typeof Iterator != "undefined" && typeof StopIteration != "undefined"){
			var p = new Pipe();
			var f = enumerator(p).compile();
			var r = f(Iterator({a: 1, b: 2, c: 3}, true));
			eval(assert("r.sort().join(',') === 'a,b,c'"));
		}
	},
	function test_enumerator_over_keys_with_iterator(){
		if(typeof Iterator != "undefined" && typeof StopIteration != "undefined"){
			var p = new Pipe();
			var f = enumerator(p).compile();
			var r = f(Iterator({a: 1, b: 2, c: 3}, true));
			eval(assert("r.sort().join(',') === 'a,b,c'"));
		}
	},
	function test_enumerator_over_pairs_with_iterator(){
		if(typeof Iterator != "undefined" && typeof StopIteration != "undefined"){
			var p = new Pipe().add("decl", {args: "idx"}).map("value = value[idx];");
			var f = enumerator(p).compile();
			var r = f(Iterator({a: 1, b: 2, c: 3}), 0);
			eval(assert("r.sort().join(',') === 'a,b,c'"));
			r = f(Iterator({a: 1, b: 2, c: 3}), 1);
			eval(assert("r.sort().join(',') === '1,2,3'"));
		}
	},
	function test_enumerator_with_custom_iterator(){
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
			var x = {
				__iterator__: function(){
					// Endless Fibonacci numbers
					return new FibIter();
				}
			};

			var p = new Pipe().takeWhile("value < 10");
			var f = enumerator(p).compile();
			var r = f(x);
			eval(assert("r.join(',') === '1,1,2,3,5,8'"));
		}
	},
	function test_enumerator_with_generator(){
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
			eval(assert("r.join(',') === '1,1,2,3,5,8'"));
		}
	},
	// test values
	function test_values(){
		var p = new Pipe();
		var f = values(p).compile();
		var t = {b: 4, d: 5};
		var r = f(t);
		eval(assert("r.sort().join(',') === '4,5'"));
		var X = function(){};
		X.prototype = t;
		var x = new X();
		x.a = 1;
		x.c = 2;
		x.e = 3;
		r = f(x);
		eval(assert("r.sort().join(',') === '1,2,3,4,5'"));
	},
	// test ownKeys
	function test_ownKeys(){
		var p = new Pipe();
		var f = ownKeys(p).compile();
		var t = {b: 4, d: 5};
		var r = f(t);
		eval(assert("r.sort().join(',') === 'b,d'"));
		var X = function(){};
		X.prototype = t;
		var x = new X();
		x.a = 1;
		x.c = 2;
		x.e = 3;
		r = f(x);
		eval(assert("r.sort().join(',') === 'a,c,e'"));
	},
	// test ownValues
	function test_ownValues(){
		var p = new Pipe();
		var f = ownValues(p).compile();
		var t = {b: 4, d: 5};
		var r = f(t);
		eval(assert("r.sort().join(',') === '4,5'"));
		var X = function(){};
		X.prototype = t;
		var x = new X();
		x.a = 1;
		x.c = 2;
		x.e = 3;
		r = f(x);
		eval(assert("r.sort().join(',') === '1,2,3'"));
	},
	// test keyValues
	function test_keyValues(){
		var p = new Pipe().map("value = value[0] + value[1];");
		var f = keyValues(p).compile();
		var t = {b: 4, d: 5};
		var r = f(t);
		eval(assert("r.sort().join(',') === 'b4,d5'"));
		var X = function(){};
		X.prototype = t;
		var x = new X();
		x.a = 1;
		x.c = 2;
		x.e = 3;
		r = f(x);
		eval(assert("r.sort().join(',') === 'a1,b4,c2,d5,e3'"));
	},
	// test ownKeyValues
	function test_ownKeyValues(){
		var p = new Pipe().map("value = value[0] + value[1];");
		var f = ownKeyValues(p).compile();
		var t = {b: 4, d: 5};
		var r = f(t);
		eval(assert("r.sort().join(',') === 'b4,d5'"));
		var X = function(){};
		X.prototype = t;
		var x = new X();
		x.a = 1;
		x.c = 2;
		x.e = 3;
		r = f(x);
		eval(assert("r.sort().join(',') === 'a1,c2,e3'"));
	},
	// test iota
	function test_iota(){
		var p = new Pipe();
		var f = iota(p).compile();
		var r = f(0, 5);
		eval(assert("r.join(',') === '0,1,2,3,4'"));
		r = f(1, 5, 2);
		eval(assert("r.join(',') === '1,3'"));
		r = f(1, -1);
		eval(assert("r.join(',') === '1,0'"));
		p = new Pipe().take(Pipe.arg("num"));
		f = iota(p).compile();
		r = f(1, -1, 0.25, 5);
		eval(assert("r.join(',') === '1,0.75,0.5,0.25,0'"));
	},
	// test iteratorObj
	function test_iteratorObj(){
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
		var x = new FibIter();

		var p = new Pipe().takeWhile("value < 10");
		var f = iteratorObj(p).compile();
		var r = f(x);
		eval(assert("r.join(',') === '1,1,2,3,5,8'"));
	},
	// test unfold
	function test_unfold(){
		var p = new Pipe();
		var f = unfold(
				"accumulator < 100",	// pred
				"value = accumulator;",	// value
				"accumulator *= 2;"		// next
			)(p).compile();
		var r = f(1);
		eval(assert("r.join(',') === '1,2,4,8,16,32,64'"));
	},
	// test an object
	function test_object(){
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
				eval(assert("fSum.getResult() == 15"));
				return r;
			},
			result = percent(testArray);
		eval(assert("result.join(',') === '7,13,20,27,33'"));
	}
];

function runTests(){
	_total = _errors = 0;
	var exceptionFlag = false;
	out("Starting tests...");
	for(var i = 0, l = tests.length; i < l; ++i){
		_current = tests[i].name;
		_local = 0;
		try{
			tests[i]();
		}catch(e){
			exceptionFlag = true;
			if(typeof console != "undefined"){	// IE < 9 :-(
				console.log("Unhandled exception in test #" + i +
					" (" + tests[i].name + "): " + e.message);
				if(e.stack){
					console.log("Stack: ", e.stack);
				}
				if(SHOW_FAILED_TEST_CODE){
					console.log("Code: ", tests[i].toString());
				}
			}
		}
	}
	out(_errors ? "Failed " + _errors + " out of " + _total + " tests." : "Finished " + _total + " tests.");
	if(typeof process != "undefined"){
		process.exit(_errors || exceptionFlag ? 1 : 0);
	}
}

if(typeof require != "undefined" && require.main === module){
	runTests();
}
