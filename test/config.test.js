var vows = require("vows");
var should = require("should");
var config = require("../config");

vows.describe('Recurly API Config Test').addBatch({
	"config requirements" : {
		topic: config,
		"exists": function(config){
			should.exist(config);
		},
		"is an object": function(config){
			config.should.be.a("object");
		},
		"API_KEY": {
			topic: config.API_KEY,
			"exists": function(API_KEY){
				should.exist(API_KEY);
			},
			"is a string": function(API_KEY){
				API_KEY.should.be.a("string");
			},
			"has length > 0": function(API_KEY){
				API_KEY.length.should.be.above(0);
			}
		},
		"PRIVATE_KEY": {
			topic: config.PRIVATE_KEY,
			"exists": function(PRIVATE_KEY){
				should.exist(PRIVATE_KEY);
			},
			"is a string": function(PRIVATE_KEY){
				PRIVATE_KEY.should.be.a("string");
			},
			"has length > 0": function(PRIVATE_KEY){
				PRIVATE_KEY.length.should.be.above(0);
			}
		},
		"SUBDOMAIN": {
			topic: config.SUBDOMAIN,
			"is a string": function(SUBDOMAIN){
				SUBDOMAIN.should.be.a("string");
			}
		},
		"ENVIRONMENT": {
			topic: config.ENVIRONMENT,
			"is a string": function(ENVIRONMENT){
				ENVIRONMENT.should.be.a("string");
			}
		},
		"DEBUG": {
			topic: config.DEBUG,
			"is a boolean": function(DEBUG){
				DEBUG.should.be.a("boolean");
			}
		}
	}
}).export(module);