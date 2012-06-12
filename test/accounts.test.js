var vows = require("vows");
var should = require("should");
var config = require("../config");

var Recurly = require('../lib/recurly');
var recurly = new Recurly(config);

var testData = require('./testData');

vows.describe('Recurly Accounts Tests').addBatch({
	"list all": {
		topic: function() {
			recurly.accounts.list(null, null, null, this.callback);
		},
		"validate results": function(error, result){
			should.not.exist(error);
			should.exist(result);
			result.should.be.instanceof(Array);
		}
	},
	"list active": {
		topic: function() {
			recurly.accounts.list("active", null, null, this.callback);
		},
		"validate results": function(error, result){
			should.not.exist(error);
			should.exist(result);
			result.should.be.instanceof(Array);
		}
	},
	"list closed": {
		topic: function() {
			recurly.accounts.list("closed", null, null, this.callback);
		},
		"validate results": function(error, result){
			should.not.exist(error);
			should.exist(result);
			result.should.be.instanceof(Array);
		}
	},
	"list past_due": {
		topic: function() {
			recurly.accounts.list("past_due", null, null, this.callback);
		},
		"validate results": function(error, result){
			should.not.exist(error);
			should.exist(result);
			result.should.be.instanceof(Array);
		}
	},
	"delete": {
		topic: function() {
			recurly.accounts.create(testData.create_account_details, this.callback);
		},
	},
	"create account": {
		topic: function() {
			recurly.accounts.create(testData.create_account_details, this.callback);
		},
		"no error": function(error, result){
			should.not.exist(error);
		},
		"validate results": function(error, result){
			validate_results(result);
		},
		"results evaluated": function(error, result){
			result.data.should.have.property("account_code");
			result.data.account_code.should.equal(account_code);
		},
		"get account":{
			topic: function() {
				recurly.accounts.get(testData.account_code, this.callback);
			},
			"no error": function(error, result){
				should.not.exist(error);
			},
			"validate results": function(error, result){
				validate_results(result);
			},
			"results evaluated": function(error, result){
				result.data.should.have.property("account_code");
				result.data.account_code.should.equal(account_code);
			}
		},
		"update account":{
			topic: function() {
				recurly.accounts.update(account_code, testData.update_account_details, this.callback);
			},
			"no error": function(error, result){
				should.not.exist(error);
			},
			"validate results": function(error, result){
				validate_results(result);
			},
			"results evaluated": function(error, result){
				result.data.should.have.property("company_name");
				result.data.company_name.should.equal(testData.update_account_details.company_name);
				result.data.should.have.property("last_name");
				result.data.last_name.should.equal(testData.update_account_details.last_name);
			},
			"close account":{
				topic: function() {
					recurly.accounts.close(account_code, this.callback);
				},
				"no error": function(error, result){
					should.not.exist(error);
				},
				"validate results": function(error, result){
					validate_results(result);
				},
				"results evaluated": function(error, result){
					no_results_expected(result);
				}
			},
			"reopen account":{
				topic: function() {
					recurly.accounts.reopen(account_code, this.callback);
				},
				"no error": function(error, result){
					should.not.exist(error);
				},
				"validate results": function(error, result){
					validate_results(result);
				},
				"results evaluated": function(error, result){
					result.data.should.have.property("account_code");
					result.data.account_code.should.equal(account_code);
				}
			}
		}
	}
}).export(module);