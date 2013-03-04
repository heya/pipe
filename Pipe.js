(function(factory){
	if(typeof define != "undefined"){ // AMD
		define([], factory);
	}else if(typeof module != "undefined"){ // node.js
		module.exports = factory();
	}else{
		funPipePipe = factory();
	}
})(function(){
	"use strict";

	function Arg(name){
		this.name = name;
	}

	function Pipe(){
		this.stages = [];
	}

	Pipe.Arg = Arg;

	Pipe.prototype = {
		add: function(type, stage, context, value){
			if(type && type instanceof Pipe){
				if(type.stages.length){
					this.stages.push.apply(this.stages, type.stages);
				}
				return;
			}
			var s = {type: type};
			if(stage){
				if(typeof stage == "string"){
					s.code = stage.split("\n");
				}else if(stage instanceof Array){
					s.code = stage;
				}else if(typeof stage == "function"){
					s.code = context ? stage.bind(context) : stage;
				}else{
					s.head = stage.head;
					s.tail = stage.tail;
					s.args = stage.args;
					s.vars = stage.vars;
				}
			}
			if(arguments.length > 3){
				s.value = stage.value;	// literal value
			}
			this.stages.push(s);
		},

		// standard operations

		forEach: function(code, context){
			return this.add("forEach", code, context);
		},
		transform: function(code, context){
			return this.add("transform", code, context);
		},
		map: function(code, context){
			return this.add("map", code, context);
		},
		filter: function(code, context){
			return this.add("filter", code, context);
		},
		indexOf: function(value){
			return this.add("indexOf", null, null, value);
		},
		every: function(code, context){
			return this.add("every", code, context);
		},
		some: function(code, context){
			return this.add("some", code, context);
		},
		fold: function(code, value){
			return this.add("fold", code, null, value);
		},
		scan: function(code, value){
			return this.add("scan", code, null, value);
		},
		skip: function(value){
			return this.add("skip", null, null, value);
		},
		skipWhile: function(code, context){
			return this.add("skipWhile", code, context);
		},
		take: function(value){
			return this.add("take", null, null, value);
		},
		takeWhile: function(code, context){
			return this.add("takeWhile", code, context);
		},
		voidResult: function(){
			return this.add("voidResult");
		}
	};

	return Pipe;
});
