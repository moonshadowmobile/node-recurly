var vows = require("vows");
var should = require("should");
var config = require("../config");

vows.describe('Recurly API Library Test').addBatch({
	"require recurly.js": {
		topic: function(){
			Recurly = require('../lib/recurly');
			return Recurly;
		},
		"Recurly class is a function": function(){
			should.isFunction(Recurly);
		}
	},
	"recurly instance": {
		topic: function(){
			recurly = new Recurly(config);
			return recurly;
		},
		"is an object": function(){
			recurly.should.be.a("object");
		},
		"accounts": {
			topic: function(){
				return recurly.accounts;
			},
			"is an object": function(accounts){
				accounts.should.be.a("object");
			}
		},
		"adjustments": {
			topic: function(){
				return recurly.adjustments;
			},
			"is an object": function(adjustments){
				adjustments.should.be.a("object");
			}
		},
		"billingInfo": {
			topic: function(){
				return recurly.billingInfo;
			},
			"is an object": function(billingInfo){
				billingInfo.should.be.a("object");
			}
		},
		"coupons": {
			topic: function(){
				return recurly.coupons;
			},
			"is an object": function(coupons){
				coupons.should.be.a("object");
			}
		},
		"redemptions": {
			topic: function(){
				return recurly.redemptions;
			},
			"is an object": function(redemptions){
				redemptions.should.be.a("object");
			}
		},
		"invoices": {
			topic: function(){
				return recurly.invoices;
			},
			"is an object": function(invoices){
				invoices.should.be.a("object");
			}
		},
		"plans": {
			topic: function(){
				return recurly.plans;
			},
			"is an object": function(plans){
				plans.should.be.a("object");
			}
		},
		"planAddons": {
			topic: function(){
				return recurly.planAddons;
			},
			"is an object": function(planAddons){
				planAddons.should.be.a("object");
			}
		},
		"subscriptions": {
			topic: function(){
				return recurly.subscriptions;
			},
			"is an object": function(subscriptions){
				subscriptions.should.be.a("object");
			}
		},
		"transactions": {
			topic: function(){
				return recurly.transactions;
			},
			"is an object": function(transactions){
				transactions.should.be.a("object");
			}
		}
	}
}).export(module);