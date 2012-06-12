var vows = require("vows");
var should = require("should");
var config = require("../config");

var Recurly = require('../lib/recurly');
var recurly = new Recurly(config);

var plan_code = 'test_plan_code';
var additional_plan_code = 'test_plan_code_two';

vows.describe('Recurly Plans Tests').addBatch({
	"list": {
		topic: function() {
			recurly.plans.list(null, null, this.callback);
		},
		"validate results": function(error, result){
			should.not.exist(error);
			should.exist(result);
			result.should.be.instanceof(Array);
		}
	},
	"create": {
		topic: function() {
			var details = {
				"plan_code": plan_code,
				"name": "Test Plan Code",
				"description": "Optional plan description.",
				"accounting_code": "acc_plan_1",
				"plan_interval_unit": "months",
				"plan_interval_length": 1,
				"trial_interval_unit": "days",
				"trial_interval_length": 7,
				"setup_fee_in_cents": {
					"USD": 1000,
					"EUR": 800
				},
				"unit_amount_in_cents": {
					"USD": 500,
					"EUR": 400
				},
				"total_billing_cycles": null,
				"unit_name": "units",
				"display_quantity": true,
				"success_url": "http://moonshadowmobile.com",
				"cancel_url": "http://google.com"
			};

			recurly.plans.create(details, this.callback);
		},
		"no error": function(error, result){
			should.not.exist(error);
		},
		"validate results": function(error, result){
			should.exist(result);
			result.should.be.a("object");
		},
		"results evaluated": function(error, result){
			result.should.have.property("plan_code");
			result.plan_code.should.equal(plan_code);
		},
		"get plan": {
			topic: function() {
				recurly.plans.get(plan_code, this.callback);
			},
			"validate results": function(error, result){
				should.not.exist(error);
				should.exist(result);
				result.should.be.a("object");
				result.should.have.property("plan_code");
				result.plan_code.should.equal(plan_code);
			},
		},
		"update plan": {
			topic: function() {
				var details = {
					"name": "Code Plan Test",
					"description": "Description plan optional.",
					"accounting_code": "acc_plan_2",
					"plan_interval_unit": "months",
					"plan_interval_length": 2,
					"trial_interval_unit": "months",
					"trial_interval_length": 2,
					"setup_fee_in_cents": {
						"USD": 2000,
						"EUR": 1600,
					},
					"unit_amount_in_cents": {
						"USD": 1500,
						"EUR": 700
					},
					"total_billing_cycles": 1,
					"unit_name": "boxes",
					"display_quantity": false,
					"success_url": "http://cnn.com",
					"cancel_url": "http://recurly.com"
				};
				recurly.plans.update(plan_code, details, this.callback);
			},
			"no error": function(error, result){
				should.not.exist(error);
			},
			"validate results": function(error, result){
				should.exist(result);
				result.should.be.a("object");
			},
			"results evaluated": function(error, result){
				result.should.have.property("name");
				result.name.should.equal('Code Plan Test');
			},
			"plans delete": {
				topic: function() {
					recurly.plans.deletePlan(plan_code, this.callback);
				},
				"results evaluated": function(error, result){
					should.not.exist(error);
					result.should.equal(204);
				}
			}
		}
	},
	"plans create additional": {
		topic: function() {
			var details = {
				"plan_code": additional_plan_code,
				"name": "Test Plan Code Two",
				"description": "Optional plan description Two.",
				"accounting_code": "acc_plan_3",
				"plan_interval_unit": "months",
				"plan_interval_length": 3,
				"trial_interval_unit": "days",
				"trial_interval_length": 8,
				"setup_fee_in_cents": {
					"USD": 6000,
					"EUR": 300
				},
				"unit_amount_in_cents": {
					"USD": 1100,
					"EUR": 330
				},
				"total_billing_cycles": null,
				"unit_name": "units",
				"display_quantity": true,
				"success_url": "http://moonshadowmobile.com",
				"cancel_url": "http://google.com"
			};

			recurly.plans.create(details, this.callback);
		},
		"no error": function(error, result){
			should.not.exist(error);
		},
		"validate results": function(error, result){
			should.exist(result);
			result.should.be.a("object");
		},
		"results evaluated": function(error, result){
			result.should.have.property("plan_code");
			result.plan_code.should.equal(additional_plan_code);
		},
		"delete plan": {
			topic: function() {
				recurly.plans.deletePlan(additional_plan_code, this.callback);
			},
			"results evaluated": function(error, result){
				should.not.exist(error);
				result.should.equal(204);
			}
		}
	}
}).export(module);