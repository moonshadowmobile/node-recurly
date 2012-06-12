var vows = require("vows");
var should = require("should");
var config = require("../config");
var testData = require("./testData");

// Note: Tests should only be run on a Recurly account that is in developement mode (sandbox mode).
// Advisable to clear all test data and delete existing plans prior to running.
// Don't forget to put configuration settings into the config object below. 

var Recurly;
var recurly;
var test_plan_code_uuid;
var test_plan_code_two_uuid;
var test_adjustment_uuid;
var test_invoice_number;
var test_transaction_uuid;

var account_test_results = [];
var subscriptions_test_results = [];
var plans_test_results = [];
var plan_addons_test_results = [];
var adjustment_test_results = [];
var coupons_test_results = [];
var invoices_test_results = [];
var account_invoices_test_results = [];
var transactions_test_results = [];
var account_transactions_test_results = [];

var generated_uuids = {};

var validate_results = function(result){
	should.exist(result);
	result.should.be.a("object");
};

var no_results_expected = function(result){
	result.should.equal(204);
};

var evaluate_results = function(result, type, itemType){
	var result_storage = {
		"type": type
	};
	if(!!result[itemType]){
		if(toString.call(result.data[itemType]) == "[object Object]"){
			if(result.data[itemType].uuid)
				generated_uuids[itemType + " " + type + " " + "0"] = result.data[itemType].uuid;
			console.log("	count is 1");
			result_storage.count = 1;
		}
		if(toString.call(result.data[itemType]) == "[object Array]"){
			for(var i = 0, l = result.data[itemType].length; i < l; ++i)
				if(result.data[itemType][i].uuid)
					generated_uuids[itemType + " " + type + " " + i] = result.data[itemType][i].uuid;
			var count = result.data[itemType].length;
			console.log("	count is " + count);
			result_storage.count = count;
		}
	}else{
		result_storage.count = 0;
	}
	return result_storage;
};

var makeDate = function(plus){
	var dateObj = new Date();
	var returnDate = new Date();
	if(plus){
		plus.m && returnDate.setMonth(dateObj.getMonth() + plus.m);
		plus.d && returnDate.setDate(dateObj.getDate() + plus.d);
		plus.y && returnDate.setFullYear(dateObj.getFullYear() + plus.y);
	}
	return returnDate.toJSON();
};

var billing_info = {
	"first_name": "FirstName",
	"last_name": "LastName",
	"address1": "1234 Here St.",
	"address2": "Suite 4321",
	"city": "Thereville",
	"state": "New Stateland",
	"country": "US",
	"zip": "98765",
	"phone": "(123) 123-1234",
	"ip_address": "192.168.0.1",
	"number": "4111111111111111",
	"month": "1",
	"year": "2030",
	"verification_value": "123"
};

var account_code = "testAccount";
var create_account_details = {
	"account_code": account_code,
	"username": "testUser",
	"email": "testemail@testemail.com",
	"first_name": "FirstName",
	"last_name": "LastName",
	"company_name": "CompanyName",
	"accept_language": "en-us,en;q=0.5",
	"billing_info" : billing_info
};

var create_adjustment_details = {
	"currency": "USD",
	"unit_amount_in_cents": 5000,
	"descripstion": "Description of the adjustment for the invoice",
	"quantity": 1,
	"accounting_code": "test_accounting_code_adjustment"
};

var redeem_coupon_details = {
	"account_code": account_code,
	"currency": "USD"
};

var plan_code = "test_plan_code";
var additional_plan_code = 'test_plan_code_two';

var coupon_code = "test_coupon_id";
var create_coupon_details = {
	"coupon_code": coupon_code,
	"name": "Test Coupon for API Testing",
	"hosted_description": "Test Coupon",
	"invoice_description": "Description of the coupon on the invoice",
	"redeem_by_date": makeDate({"y":4}),
	"single_use": true,
	"applies_for_months": 3,
	"max_redemptions": 1,
	"applies_to_all_plans": true,
	"discount_type": "percent",
	"discount_percent": 10,
	"discount_in_cents": null,
	"plan_codes": [
		{"plan_code": additional_plan_code},
		{"plan_code": plan_code}
	]
};

var addon_code = "test_addon_code";
var create_addon_details = {
	"add_on_code": addon_code,
	"name": "Test Add-On Code",
	"unit_amount_in_cents": {
		"USD": 3500
	},
	"default_quantity": 2,
	"display_quantity_on_hosted_page": true, 
	"accounting_code": "acc_addon_1"
};

var additional_addon_code = "additional_test_addon_code";
var additional_create_addon_details = {
	"add_on_code": additional_addon_code,
	"name": "Additional Test Add-On Code",
	"unit_amount_in_cents": {
		"USD": 5500
	},
	"default_quantity": 3,
	"display_quantity_on_hosted_page": true, 
	"accounting_code": "acc_addon_2"
};

var update_addon_details = {
	"add_on_code": addon_code,
	"name": "Updated Test Add-On Code",
	"unit_amount_in_cents": {
		"USD": 4300
	},
	"default_quantity": 1,
	"display_quantity_on_hosted_page": true, 
	"accounting_code": "acc_addon_3"
};

var create_subscription_details = {
	"plan_code": plan_code,
	"account": create_account_details,
	"unit_amount_in_cents": 1500,
	"currency": "USD",
	"quantity": 1,
	"trial_ends_at": makeDate({"d":7}),
	"starts_at": makeDate({"d":-1}),
	"total_billing_cycles": 2,
	"first_renewal_date": makeDate({"m":1})
};

var create_additional_subscription_details = {
	"plan_code": additional_plan_code,
	"account": create_account_details,
	"unit_amount_in_cents": 1700,
	"currency": "USD",
	"quantity": 2,
	"trial_ends_at": makeDate({"d":8}),
	"starts_at": makeDate({"d":-1}),
	"total_billing_cycles": 4,
	"first_renewal_date": makeDate({"m":3})
};

var update_account_details = {
	"username": "test_user",
	"email": "testers_email@testemail.com",
	"first_name": "First_Name",
	"last_name": "Last_Name",
	"company_name": "Company_Name"
};

var update_subscription_details = {
	"timeframe": "now", 
	"plan_code": plan_code,
	"subscription_add_ons": {
		"subscription_add_on": {
			"add_on_code": additional_addon_code,
			"quantity": 3,
			"unit_amount_in_cents": 5500
		}
	},
	"quantity": 1,
	"unit_amount_in_cents": 2400
};

var update_billing_info = {
	"first_name": "First_Name",
	"last_name": "Last_Name",
	"address1": "4321 There St.",
	"address2": "Appt. 1234",
	"city": "Hereville",
	"state": "South Stateland",
	"country": "US",
	"zip": "56789",
	"phone": "(321) 321-4321",
	"ip_address": "192.168.0.2",
	"number": "4111111111111111",
	"month": "2",
	"year": "2031",
	"verification_value": "321"
};

var create_transaction_details = {
	"account": {
		"account_code": account_code,
		"billing_info": billing_info
	},
	"amount_in_cents": 6600,
	"currency": "USD",
	"description": "Description of the transactions"
};

var tests = {

	"Recurly Subscriptions Tests": {
		"subscriptions list": {
			topic: function() {
				return recurly.subscriptions.list;
			},
			"is a function": function(list){
				should.isFunction(list);
			},
			"active": {
				topic: function() {
					recurly.subscriptions.list("active", null, null, this.callback);
				},
				"no error": function(error, result){
					should.not.exist(error);
				},
				"validate results": function(error, result){
					validate_results(result);
				},
				"results evaluated": function(error, result){
					subscriptions_test_results.push(evaluate_results(result, "active", "subscription"));
				}
			},
			"canceled": {
				topic: function() {
					recurly.subscriptions.list("canceled", null, null, this.callback);
				},
				"no error": function(error, result){
					should.not.exist(error);
				},
				"validate results": function(error, result){
					validate_results(result);
				},
				"results evaluated": function(error, result){
					subscriptions_test_results.push(evaluate_results(result, "canceled", "subscription"));
				}
			},
			"expired": {
				topic: function() {
					recurly.subscriptions.list("expired", null, null, this.callback);
				},
				"no error": function(error, result){
					should.not.exist(error);
				},
				"validate results": function(error, result){
					validate_results(result);
				},
				"results evaluated": function(error, result){
					subscriptions_test_results.push(evaluate_results(result, "expired", "subscription"));
				}
			},
			"future": {
				topic: function() {
					recurly.subscriptions.list("future", null, null, this.callback);
				},
				"no error": function(error, result){
					should.not.exist(error);
				},
				"validate results": function(error, result){
					validate_results(result);
				},
				"results evaluated": function(error, result){
					subscriptions_test_results.push(evaluate_results(result, "future", "subscription"));
				}
			},
			"in_trial": {
				topic: function() {
					recurly.subscriptions.list("in_trial", null, null, this.callback);
				},
				"no error": function(error, result){
					should.not.exist(error);
				},
				"validate results": function(error, result){
					validate_results(result);
				},
				"results evaluated": function(error, result){
					subscriptions_test_results.push(evaluate_results(result, "in_trial", "subscription"));
				}
			},
			"live": {
				topic: function() {
					recurly.subscriptions.list("live", null, null, this.callback);
				},
				"no error": function(error, result){
					should.not.exist(error);
				},
				"validate results": function(error, result){
					validate_results(result);
				},
				"results evaluated": function(error, result){
					subscriptions_test_results.push(evaluate_results(result, "live", "subscription"));
				}
			},
			"past_due": {
				topic: function() {
					recurly.subscriptions.list("past_due", null, null, this.callback);
				},
				"no error": function(error, result){
					should.not.exist(error);
				},
				"validate results": function(error, result){
					validate_results(result);
				},
				"results evaluated": function(error, result){
					subscriptions_test_results.push(evaluate_results(result, "past_due", "subscription"));
				}
			}
		},
		"subscriptions create": {
			topic: function() {
				return recurly.subscriptions.create;
			},
			"is a function": function(create){
				should.isFunction(create);
			},
			"create subscription": {
				topic: function() {
					recurly.subscriptions.create(account_code, create_subscription_details, this.callback);
				},
				"no error": function(error, result){
					should.not.exist(error);
				},
				"validate results": function(error, result){
					validate_results(result);
				},
				"results evaluated": function(error, result){
					result.data.should.have.property("plan");
					result.data.plan.should.be.a("object");
					result.data.plan.should.have.property("plan_code");
					result.data.plan.plan_code.should.equal(plan_code);
				}
			}
		},
		"subscriptions create additional": {
			topic: function() {
				return recurly.subscriptions.create;
			},
			"is a function": function(create){
				should.isFunction(create);
			},
			"create subscription": {
				topic: function() {
					recurly.subscriptions.create(account_code, create_additional_subscription_details, this.callback);
				},
				"no error": function(error, result){
					should.not.exist(error);
				},
				"validate results": function(error, result){
					validate_results(result);
				},
				"results evaluated": function(error, result){
					result.data.should.have.property("plan");
					result.data.plan.should.be.a("object");
					result.data.plan.should.have.property("plan_code");
					result.data.plan.plan_code.should.equal(additional_plan_code);
				}
			}
		},
		"subscriptions getAccountSubscription": {
			topic: function() {
				return recurly.subscriptions.getAccountSubscription;
			},
			"is a function": function(getAccountSubscription){
				should.isFunction(getAccountSubscription);
			},
			"getAccountSubscription": {
				topic: function() {
					recurly.subscriptions.getAccountSubscription(account_code, this.callback);
				},
				"no error": function(error, result){
					should.not.exist(error);
				},
				"validate results": function(error, result){
					validate_results(result);
				},
				"results evaluated": function(error, result){
					result.data.should.have.property("subscription");
					var subs = [];
					if(toString.call(result.data.subscription) == "[object Object]"){
						subs.push(result.data.subscription);
					}else{
						subs = result.data.subscription;
					}
					for(var i = 0, l = subs.length; i < l; ++i){
						subs[i].should.have.property("plan");
						subs[i].plan.should.be.a("object");
						subs[i].plan.should.have.property("plan_code");
						subs[i].should.have.property("uuid");
						if(subs[i].plan.plan_code == "test_plan_code"){
							test_plan_code_uuid = subs[i].uuid;
						}
						if(subs[i].plan.plan_code == "test_plan_code_two"){
							test_plan_code_two_uuid = subs[i].uuid;
						}
					}
				}
			}
		},
		"subscriptions get": {
			topic: function() {
				return recurly.subscriptions.get;
			},
			"is a function": function(get){
				should.isFunction(get);
			},
			"get subscription": {
				topic: function() {
					recurly.subscriptions.get(test_plan_code_uuid, this.callback);
				},
				"no error": function(error, result){
					should.not.exist(error);
				},
				"validate results": function(error, result){
					validate_results(result);
				},
				"results evaluated": function(error, result){
					result.data.should.have.property("plan");
					result.data.plan.should.be.a("object");
					result.data.plan.should.have.property("plan_code");
					result.data.should.have.property("uuid");
				}
			}
		},
		"subscriptions update": {
			topic: function() {
				return recurly.subscriptions.update;
			},
			"is a function": function(update){
				should.isFunction(update);
			},
			"update subscription": {
				topic: function() {
					recurly.subscriptions.update(test_plan_code_uuid, update_subscription_details, this.callback);
				},
				"no error": function(error, result){
					should.not.exist(error);
				},
				"validate results": function(error, result){
					validate_results(result);
				},
				"results evaluated": function(error, result){
					result.data.should.have.property("plan");
					result.data.plan.should.be.a("object");
					result.data.plan.should.have.property("plan_code");
					result.data.should.have.property("uuid");
				}
			}
		},
		"subscriptions cancel": {
			topic: function() {
				return recurly.subscriptions.cancel;
			},
			"is a function": function(cancel){
				should.isFunction(cancel);
			},
			"cancel subscription": {
				topic: function() {
					recurly.subscriptions.cancel(test_plan_code_two_uuid, this.callback);
				},
				"no error": function(error, result){
					should.not.exist(error);
				},
				"validate results": function(error, result){
					validate_results(result);
				},
				"results evaluated": function(error, result){
					result.data.should.have.property("plan");
					result.data.plan.should.be.a("object");
					result.data.plan.should.have.property("plan_code");
					result.data.should.have.property("uuid");
				}
			}
		},
		"subscriptions reactivate": {
			topic: function() {
				return recurly.subscriptions.reactivate;
			},
			"is a function": function(reactivate){
				should.isFunction(reactivate);
			},
			"reactivate subscription": {
				topic: function() {
					recurly.subscriptions.reactivate(test_plan_code_two_uuid, this.callback);
				},
				"no error": function(error, result){
					should.not.exist(error);
				},
				"validate results": function(error, result){
					validate_results(result);
				},
				"results evaluated": function(error, result){
					result.data.should.have.property("plan");
					result.data.plan.should.be.a("object");
					result.data.plan.should.have.property("plan_code");
					result.data.should.have.property("uuid");
				}
			}
		},
		"subscriptions terminate": {
			topic: function() {
				return recurly.subscriptions.terminate;
			},
			"is a function": function(terminate){
				should.isFunction(terminate);
			},
			"terminate subscription no refund": {
				topic: function() {
					recurly.subscriptions.terminate(test_plan_code_two_uuid, null, this.callback);
				},
				"no error": function(error, result){
					should.not.exist(error);
				},
				"validate results": function(error, result){
					validate_results(result);
				},
				"results evaluated": function(error, result){
					result.data.should.have.property("plan");
					result.data.plan.should.be.a("object");
					result.data.plan.should.have.property("plan_code");
					result.data.should.have.property("uuid");
				}
			},
			"terminate subscription partial refund": {
				topic: function() {
					recurly.subscriptions.terminate(test_plan_code_two_uuid, "partial", this.callback);
				},
				"no error": function(error, result){
					should.not.exist(error);
				},
				"validate results": function(error, result){
					validate_results(result);
				},
				"results evaluated": function(error, result){
					result.data.should.have.property("plan");
					result.data.plan.should.be.a("object");
					result.data.plan.should.have.property("plan_code");
					result.data.should.have.property("uuid");
				}
			},
			"terminate subscription full refund": {
				topic: function() {
					recurly.subscriptions.terminate(test_plan_code_two_uuid, "full", this.callback);
				},
				"no error": function(error, result){
					should.not.exist(error);
				},
				"validate results": function(error, result){
					validate_results(result);
				},
				"results evaluated": function(error, result){
					result.data.should.have.property("plan");
					result.data.plan.should.be.a("object");
					result.data.plan.should.have.property("plan_code");
					result.data.should.have.property("uuid");
				}
			}
		}
	},
	"Recurly Add-ons Tests": {
		"planAddons list": {
			topic: function() {
				return recurly.planAddons.list;
			},
			"is a function": function(list){
				should.isFunction(list);
			},
			"list": {
				topic: function() {
					recurly.planAddons.list(plan_code, null, null, this.callback);
				},
				"no error": function(error, result){
					should.not.exist(error);
				},
				"validate results": function(error, result){
					validate_results(result);
				},
				"results evaluated": function(error, result){
					plan_addons_test_results.push(evaluate_results(result, "list", "add_on"));
				}
			}
		},
		"planAddons create": {
			topic: function() {
				return recurly.planAddons.create;
			},
			"is a function": function(create){
				should.isFunction(create);
			},
			"create add-on": {
				topic: function() {
					recurly.planAddons.create(plan_code, create_addon_details, this.callback);
				},
				"no error": function(error, result){
					should.not.exist(error);
				},
				"validate results": function(error, result){
					validate_results(result);
				},
				"results evaluated": function(error, result){
					result.data.should.have.property("add_on_code");
					result.data.add_on_code.should.be.equal(addon_code);
				}
			}
		},
		"planAddons create additional": {
			topic: function() {
				return recurly.planAddons.create;
			},
			"is a function": function(create){
				should.isFunction(create);
			},
			"create add-on": {
				topic: function() {
					recurly.planAddons.create(plan_code, additional_create_addon_details, this.callback);
				},
				"no error": function(error, result){
					should.not.exist(error);
				},
				"validate results": function(error, result){
					validate_results(result);
				},
				"results evaluated": function(error, result){
					result.data.should.have.property("add_on_code");
					result.data.add_on_code.should.be.equal(additional_addon_code);
				}
			}
		},
		"planAddons get": {
			topic: function() {
				return recurly.planAddons.get;
			},
			"is a function": function(get){
				should.isFunction(get);
			},
			"get add-on": {
				topic: function() {
					recurly.planAddons.get(plan_code, addon_code, this.callback);
				},
				"no error": function(error, result){
					should.not.exist(error);
				},
				"validate results": function(error, result){
					validate_results(result);
				},
				"results evaluated": function(error, result){
					result.data.should.have.property("add_on_code");
					result.data.add_on_code.should.be.equal(addon_code);
				}
			}
		},
		"planAddons update": {
			topic: function() {
				return recurly.planAddons.update;
			},
			"is a function": function(update){
				should.isFunction(update);
			},
			"create add-on": {
				topic: function() {
					recurly.planAddons.update(plan_code, addon_code, update_addon_details, this.callback);
				},
				"no error": function(error, result){
					should.not.exist(error);
				},
				"validate results": function(error, result){
					validate_results(result);
				},
				"results evaluated": function(error, result){
					result.data.should.have.property("name");
					result.data.name.should.be.equal("Updated Test Add-On Code");
				}
			}
		},
		"planAddons delete": {
			topic: function() {
				return recurly.planAddons.deleteAddon;
			},
			"is a function": function(deleteAddon){
				should.isFunction(deleteAddon);
			},
			"create add-on": {
				topic: function() {
					recurly.planAddons.deleteAddon(plan_code, addon_code, this.callback);
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
			}
		}
	},
	"Recurly Adjustments Tests": {
		"adjustments list": {
			topic: function() {
				return recurly.adjustments.list;
			},
			"is a function": function(list){
				should.isFunction(list);
			},
			"type: all, state: all": {
				topic: function() {
					return recurly.adjustments.list(null, null, null, null, account_code, this.callback);
				},
				"no error": function(error, result){
					should.not.exist(error);
				},
				"validate results": function(error, result){
					validate_results(result);
				},
				"results evaluated": function(error, result){
					adjustment_test_results.push(evaluate_results(result, "all_all", "adjustment"));
				}
			},
			"type: charge, state: invoiced": {
				topic: function() {
					return recurly.adjustments.list("charge", "invoiced", null, null, account_code, this.callback);
				},
				"no error": function(error, result){
					should.not.exist(error);
				},
				"validate results": function(error, result){
					validate_results(result);
				},
				"results evaluated": function(error, result){
					adjustment_test_results.push(evaluate_results(result, "all_invoiced", "adjustment"));
				}
			},
			"type: charge, state: pending": {
				topic: function() {
					return recurly.adjustments.list("charge", "pending", null, null, account_code, this.callback);
				},
				"no error": function(error, result){
					should.not.exist(error);
				},
				"validate results": function(error, result){
					validate_results(result);
				},
				"results evaluated": function(error, result){
					adjustment_test_results.push(evaluate_results(result, "all_invoiced", "adjustment"));
				}
			},
			"type: credit, state: invoiced": {
				topic: function() {
					return recurly.adjustments.list("credit", "invoiced", null, null, account_code, this.callback);
				},
				"no error": function(error, result){
					should.not.exist(error);
				},
				"validate results": function(error, result){
					validate_results(result);
				},
				"results evaluated": function(error, result){
					adjustment_test_results.push(evaluate_results(result, "all_invoiced", "adjustment"));
				}
			},
			"type: credit, state: pending": {
				topic: function() {
					return recurly.adjustments.list("credit", "pending", null, null, account_code, this.callback);
				},
				"no error": function(error, result){
					should.not.exist(error);
				},
				"validate results": function(error, result){
					validate_results(result);
				},
				"results evaluated": function(error, result){
					adjustment_test_results.push(evaluate_results(result, "all_invoiced", "adjustment"));
				}
			}
		},
		"adjustments create": {
			topic: function() {
				return recurly.adjustments.create;
			},
			"is a function": function(create){
				should.isFunction(create);
			},
			"create adjustment": {
				topic: function() {
					return recurly.adjustments.create(account_code, create_adjustment_details, this.callback);
				},
				"no error": function(error, result){
					should.not.exist(error);
				},
				"validate results": function(error, result){
					validate_results(result);
				},
				"results evaluated": function(error, result){
					test_adjustment_uuid = result.data.uuid;
				}
			}
		},
		"adjustments delete": {
			topic: function() {
				return recurly.adjustments.deleteAdjustment;
			},
			"is a function": function(deleteAdjustment){
				should.isFunction(deleteAdjustment);
			},
			"delete adjustment": {
				topic: function() {
					return recurly.adjustments.deleteAdjustment(test_adjustment_uuid, this.callback);
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
			}
		}
	},
	"Recurly Billing Info Tests": {
		"billingInfo insert": {
			topic: function() {
				return recurly.billingInfo.update;
			},
			"is a function": function(update){
				should.isFunction(update);
			},
			"insert billingInfo": {
				topic: function() {
					return recurly.billingInfo.update(account_code, billing_info, this.callback);
				},
				"no error": function(error, result){
					should.not.exist(error);
				},
				"validate results": function(error, result){
					validate_results(result);
				},
				"results evaluated": function(error, result){
					result.data.should.have.property("last_name");
					result.data.last_name.should.be.equal(billing_info.last_name);
				}
			}
		},
		"billingInfo get": {
			topic: function() {
				return recurly.billingInfo.get;
			},
			"is a function": function(get){
				should.isFunction(get);
			},
			"get billingInfo": {
				topic: function() {
					return recurly.billingInfo.get(account_code, this.callback);
				},
				"no error": function(error, result){
					should.not.exist(error);
				},
				"validate results": function(error, result){
					validate_results(result);
				},
				"results evaluated": function(error, result){
					result.data.should.have.property("last_name");
					result.data.last_name.should.be.equal(billing_info.last_name);
				}
			}
		},
		"billingInfo update": {
			topic: function() {
				return recurly.billingInfo.update;
			},
			"is a function": function(update){
				should.isFunction(update);
			},
			"update billingInfo": {
				topic: function() {
					return recurly.billingInfo.update(account_code, update_billing_info, this.callback);
				},
				"no error": function(error, result){
					should.not.exist(error);
				},
				"validate results": function(error, result){
					validate_results(result);
				},
				"results evaluated": function(error, result){
					result.data.should.have.property("last_name");
					result.data.last_name.should.be.equal(update_billing_info.last_name);
				}
			}
		},
		"billingInfo delete": {
			topic: function() {
				return recurly.billingInfo.clear;
			},
			"is a function": function(clear){
				should.isFunction(clear);
			},
			"delete billingInfo": {
				topic: function() {
					return recurly.billingInfo.clear(account_code, this.callback);
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
			}
		},
		"billingInfo recreate": {
			topic: function() {
				return recurly.billingInfo.update;
			},
			"is a function": function(update){
				should.isFunction(update);
			},
			"recreate billingInfo": {
				topic: function() {
					return recurly.billingInfo.update(account_code, billing_info, this.callback);
				},
				"no error": function(error, result){
					should.not.exist(error);
				},
				"validate results": function(error, result){
					validate_results(result);
				},
				"results evaluated": function(error, result){
					result.data.should.have.property("last_name");
					result.data.last_name.should.be.equal(billing_info.last_name);
				}
			}
		}
	},
	"Recurly Coupons Tests": {
		"coupons list": {
			topic: function() {
				return recurly.coupons.list;
			},
			"is a function": function(list){
				should.isFunction(list);
			},
			"all": {
				topic: function() {
					recurly.coupons.list(null, null, null, this.callback);
				},
				"no error": function(error, result){
					should.not.exist(error);
				},
				"validate results": function(error, result){
					validate_results(result);
				},
				"results evaluated": function(error, result){
					coupons_test_results.push(evaluate_results(result, "all", "coupon"));
				}
			},
			"redeemable": {
				topic: function() {
					recurly.coupons.list("redeemable", null, null, this.callback);
				},
				"no error": function(error, result){
					should.not.exist(error);
				},
				"validate results": function(error, result){
					validate_results(result);
				},
				"results evaluated": function(error, result){
					coupons_test_results.push(evaluate_results(result, "redeemable", "coupon"));
				}
			},
			"expired": {
				topic: function() {
					recurly.coupons.list("expired", null, null, this.callback);
				},
				"no error": function(error, result){
					should.not.exist(error);
				},
				"validate results": function(error, result){
					validate_results(result);
				},
				"results evaluated": function(error, result){
					coupons_test_results.push(evaluate_results(result, "expired", "coupon"));
				}
			},
			"maxed_out": {
				topic: function() {
					recurly.coupons.list("maxed_out", null, null, this.callback);
				},
				"no error": function(error, result){
					should.not.exist(error);
				},
				"validate results": function(error, result){
					validate_results(result);
				},
				"results evaluated": function(error, result){
					coupons_test_results.push(evaluate_results(result, "maxed_out", "coupon"));
				}
			}
		},
		"coupons create": {
			topic: function() {
				return recurly.coupons.create;
			},
			"is a function": function(create){
				should.isFunction(create);
			},
			"create coupon": {
				topic: function() {
					recurly.coupons.create(create_coupon_details, this.callback);
				},
				"no error": function(error, result){
					should.not.exist(error);
				},
				"validate results": function(error, result){
					validate_results(result);
				},
				"results evaluated": function(error, result){
					result.data.should.have.property("coupon_code");
					result.data.coupon_code.should.be.equal(create_coupon_details.coupon_code);
				}
			}
		},
		"coupons get": {
			topic: function() {
				return recurly.coupons.get;
			},
			"is a function": function(get){
				should.isFunction(get);
			},
			"get coupon": {
				topic: function() {
					recurly.coupons.get(coupon_code, this.callback);
				},
				"no error": function(error, result){
					should.not.exist(error);
				},
				"validate results": function(error, result){
					validate_results(result);
				},
				"results evaluated": function(error, result){
					result.data.should.have.property("coupon_code");
					result.data.coupon_code.should.be.equal(create_coupon_details.coupon_code);
				}
			}
		},
		"coupons delete": {
			topic: function() {
				return recurly.coupons.deactivate;
			},
			"is a function": function(deactivate){
				should.isFunction(deactivate);
			},
			"delete coupon": {
				topic: function() {
					recurly.coupons.deactivate(coupon_code, this.callback);
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
			}
		}
	},
	"Recurly Coupon Redemptions Tests": {
		"redemptions redeem": {
			topic: function() {
				return recurly.redemptions.redeem;
			},
			"is a function": function(redeem){
				should.isFunction(redeem);
			},
			"redeem redemption": {
				topic: function() {
					recurly.redemptions.redeem(coupon_code, redeem_coupon_details, this.callback);
				},
				"no error": function(error, result){
					should.not.exist(error);
				},
				"validate results": function(error, result){
					validate_results(result);
				},
				"results evaluated": function(error, result){
					result.data.should.have.property("coupon");
					result.data.coupon.should.have.property("@");
					result.data.coupon["@"].should.have.property("href");
					result.data.coupon["@"].href.should.equal("https://api.recurly.com/v2/coupons/" + coupon_code);
					result.data.should.have.property("account");
					result.data.account.should.have.property("@");
					result.data.account["@"].should.have.property("href");
					result.data.account["@"].href.should.equal("https://api.recurly.com/v2/accounts/" + redeem_coupon_details.account_code);
				}
			}
		},
		"redemptions get": {
			topic: function() {
				return recurly.redemptions.get;
			},
			"is a function": function(get){
				should.isFunction(get);
			},
			"get redemption": {
				topic: function() {
					recurly.redemptions.get(account_code, this.callback);
				},
				"no error": function(error, result){
					should.not.exist(error);
				},
				"validate results": function(error, result){
					validate_results(result);
				},
				"results evaluated": function(error, result){
					result.data.should.have.property("coupon");
					result.data.coupon.should.have.property("@");
					result.data.coupon["@"].should.have.property("href");
					result.data.coupon["@"].href.should.equal("https://api.recurly.com/v2/coupons/" + coupon_code);
					result.data.should.have.property("account");
					result.data.account.should.have.property("@");
					result.data.account["@"].should.have.property("href");
					result.data.account["@"].href.should.equal("https://api.recurly.com/v2/accounts/" + redeem_coupon_details.account_code);
				}
			}
		},
		"redemptions remove": {
			topic: function() {
				return recurly.redemptions.remove;
			},
			"is a function": function(remove){
				should.isFunction(remove);
			},
			"remove redemption": {
				topic: function() {
					recurly.redemptions.remove(account_code, this.callback);
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
			}
		}
	},
	"Recurly Invoices Tests": {
		"invoices list": {
			topic: function() {
				return recurly.invoices.list;
			},
			"is a function": function(list){
				should.isFunction(list);
			},
			"all": {
				topic: function() {
					recurly.invoices.list(null, null, null, this.callback);
				},
				"no error": function(error, result){
					should.not.exist(error);
				},
				"validate results": function(error, result){
					validate_results(result);
				},
				"results evaluated": function(error, result){
					invoices_test_results.push(evaluate_results(result, "all", "invoice"));
				}
			},
			"open": {
				topic: function() {
					recurly.invoices.list("open", null, null, this.callback);
				},
				"no error": function(error, result){
					should.not.exist(error);
				},
				"validate results": function(error, result){
					validate_results(result);
				},
				"results evaluated": function(error, result){
					invoices_test_results.push(evaluate_results(result, "open", "invoice"));
				}
			},
			"failed": {
				topic: function() {
					recurly.invoices.list("failed", null, null, this.callback);
				},
				"no error": function(error, result){
					should.not.exist(error);
				},
				"validate results": function(error, result){
					validate_results(result);
				},
				"results evaluated": function(error, result){
					invoices_test_results.push(evaluate_results(result, "failed", "invoice"));
				}
			},
			"past_due": {
				topic: function() {
					recurly.invoices.list("past_due", null, null, this.callback);
				},
				"no error": function(error, result){
					should.not.exist(error);
				},
				"validate results": function(error, result){
					validate_results(result);
				},
				"results evaluated": function(error, result){
					invoices_test_results.push(evaluate_results(result, "past_due", "invoice"));
				}
			}
		},
		"invoices invoiceAccount": {
			topic: function() {
				return recurly.invoices.invoiceAccount;
			},
			"is a function": function(invoiceAccount){
				should.isFunction(invoiceAccount);
			},
			"invoice account": {
				topic: function() {
					return recurly.invoices.invoiceAccount(account_code, this.callback);
				},
				"no error": function(error, result){
					should.not.exist(error);
				},
				"validate results": function(error, result){
					validate_results(result);
				},
				"results evaluated": function(error, result){
					result.data.should.have.property("invoice_number");
					result.data.invoice_number.should.have.property("#");
					test_invoice_number = result.data.invoice_number["#"];
				}
			}
		},
		"invoices getAccountInvoice": {
			topic: function() {
				return recurly.invoices.getAccountInvoice;
			},
			"is a function": function(getAccountInvoice){
				should.isFunction(getAccountInvoice);
			},
			"get account invoice": {
				topic: function() {
					return recurly.invoices.getAccountInvoice(account_code, null, null, this.callback);
				},
				"no error": function(error, result){
					should.not.exist(error);
				},
				"validate results": function(error, result){
					validate_results(result);
				},
				"results evaluated": function(error, result){
					account_invoices_test_results.push(evaluate_results(result, "list", "invoice"));
				}
			}
		},
		"invoices get": {
			topic: function() {
				return recurly.invoices.get;
			},
			"is a function": function(get){
				should.isFunction(get);
			},
			"get invoice by number": {
				topic: function() {
					return recurly.invoices.get(test_invoice_number, this.callback);
				},
				"no error": function(error, result){
					should.not.exist(error);
				},
				"validate results": function(error, result){
					validate_results(result);
				},
				"results evaluated": function(error, result){
					result.data.should.have.property("invoice_number");
					result.data.invoice_number.should.have.property("#");
					result.data.invoice_number["#"].should.equal(test_invoice_number);
				}
			}
		},
		"invoices getPDF": {
			topic: function() {
				return recurly.invoices.getPDF;
			},
			"is a function": function(getPDF){
				should.isFunction(getPDF);
			},
			"get PDF invoice by number": {
				topic: function() {
					return recurly.invoices.getPDF(test_invoice_number, this.callback);
				},
				"no error": function(error, result){
					should.not.exist(error);
				},
				"validate results": function(error, result){
					validate_results(result);
				},
				"results evaluated": function(error, result){
					result.data.should.have.property("invoice_number");
					result.data.invoice_number.should.have.property("#");
					result.data.invoice_number["#"].should.equal(test_invoice_number);
				}
			}
		}
	},
	"Recurly Transactions Tests": {
		"transactions list": {
			topic: function() {
				return recurly.transactions.list;
			},
			"is a function": function(list){
				should.isFunction(list);
			},
			"state: all, type: all": {
				topic: function() {
					recurly.transactions.list(account_code, null, null, null, null, this.callback);
				},
				"no error": function(error, result){
					should.not.exist(error);
				},
				"validate results": function(error, result){
					validate_results(result);
				},
				"results evaluated": function(error, result){
					transactions_test_results.push(evaluate_results(result, "state: all, type: all", "transaction"));
				}
			},
			"state: successful, type: authorization": {
				topic: function() {
					recurly.transactions.list(account_code, "successful", "authorization", null, null, this.callback);
				},
				"no error": function(error, result){
					should.not.exist(error);
				},
				"validate results": function(error, result){
					validate_results(result);
				},
				"results evaluated": function(error, result){
					transactions_test_results.push(evaluate_results(result, "state: successful, type: authorization", "transaction"));
				}
			},
			"state: successful, type: refund": {
				topic: function() {
					recurly.transactions.list(account_code, "successful", "refund", null, null, this.callback);
				},
				"no error": function(error, result){
					should.not.exist(error);
				},
				"validate results": function(error, result){
					validate_results(result);
				},
				"results evaluated": function(error, result){
					transactions_test_results.push(evaluate_results(result, "state: successful, type: refund", "transaction"));
				}
			},
			"state: successful, type: purchase": {
				topic: function() {
					recurly.transactions.list(account_code, "successful", "purchase", null, null, this.callback);
				},
				"no error": function(error, result){
					should.not.exist(error);
				},
				"validate results": function(error, result){
					validate_results(result);
				},
				"results evaluated": function(error, result){
					transactions_test_results.push(evaluate_results(result, "state: successful, type: purchase", "transaction"));
				}
			},
			"state: failed, type: authorization": {
				topic: function() {
					recurly.transactions.list(account_code, "failed", "authorization", null, null, this.callback);
				},
				"no error": function(error, result){
					should.not.exist(error);
				},
				"validate results": function(error, result){
					validate_results(result);
				},
				"results evaluated": function(error, result){
					transactions_test_results.push(evaluate_results(result, "state: failed, type: authorization", "transaction"));
				}
			},
			"state: failed, type: refund": {
				topic: function() {
					recurly.transactions.list(account_code, "failed", "refund", null, null, this.callback);
				},
				"no error": function(error, result){
					should.not.exist(error);
				},
				"validate results": function(error, result){
					validate_results(result);
				},
				"results evaluated": function(error, result){
					transactions_test_results.push(evaluate_results(result, "state: failed, type: refund", "transaction"));
				}
			},
			"state: failed, type: purchase": {
				topic: function() {
					recurly.transactions.list(account_code, "failed", "purchase", null, null, this.callback);
				},
				"no error": function(error, result){
					should.not.exist(error);
				},
				"validate results": function(error, result){
					validate_results(result);
				},
				"results evaluated": function(error, result){
					transactions_test_results.push(evaluate_results(result, "state: failed, type: purchase", "transaction"));
				}
			},
			"state: voided, type: authorization": {
				topic: function() {
					recurly.transactions.list(account_code, "voided", "authorization", null, null, this.callback);
				},
				"no error": function(error, result){
					should.not.exist(error);
				},
				"validate results": function(error, result){
					validate_results(result);
				},
				"results evaluated": function(error, result){
					transactions_test_results.push(evaluate_results(result, "state: voided, type: authorization", "transaction"));
				}
			},
			"state: voided, type: refund": {
				topic: function() {
					recurly.transactions.list(account_code, "voided", "refund", null, null, this.callback);
				},
				"no error": function(error, result){
					should.not.exist(error);
				},
				"validate results": function(error, result){
					validate_results(result);
				},
				"results evaluated": function(error, result){
					transactions_test_results.push(evaluate_results(result, "state: voided, type: refund", "transaction"));
				}
			},
			"state: voided, type: purchase": {
				topic: function() {
					recurly.transactions.list(account_code, "voided", "purchase", null, null, this.callback);
				},
				"no error": function(error, result){
					should.not.exist(error);
				},
				"validate results": function(error, result){
					validate_results(result);
				},
				"results evaluated": function(error, result){
					transactions_test_results.push(evaluate_results(result, "state: voided, type: purchase", "transaction"));
				}
			}
		},
		"transactions getAccountTransactions": {
			topic: function() {
				return recurly.transactions.getAccountTransactions;
			},
			"is a function": function(getAccountTransactions){
				should.isFunction(getAccountTransactions);
			},
			"get account transactions": {
				topic: function() {
					return recurly.transactions.getAccountTransactions(account_code, this.callback);
				},
				"no error": function(error, result){
					should.not.exist(error);
				},
				"validate results": function(error, result){
					validate_results(result);
				},
				"results evaluated": function(error, result){
					account_transactions_test_results.push(evaluate_results(result, "list", "transaction"));
				}
			}
		},
		"transactions get": {
			topic: function() {
				return recurly.transactions.get;
			},
			"is a function": function(get){
				should.isFunction(get);
			},
			"get transaction": {
				topic: function() {
					return recurly.transactions.get(generated_uuids["transaction list 0"], this.callback);
				},
				"no error": function(error, result){
					should.not.exist(error);
				},
				"validate results": function(error, result){
					validate_results(result);
				},
				"results evaluated": function(error, result){
					result.data.should.have.property("uuid");
					result.data.uuid.should.equal(generated_uuids["transaction list 0"]);
				}
			}
		},
		"transactions create": {
			topic: function() {
				return recurly.transactions.create;
			},
			"is a function": function(create){
				should.isFunction(create);
			},
			"create transaction": {
				topic: function() {
					return recurly.transactions.create(create_transaction_details, this.callback);
				},
				"no error": function(error, result){
					should.not.exist(error);
				},
				"validate results": function(error, result){
					validate_results(result);
				},
				"results evaluated": function(error, result){
					result.data.should.have.property("details");
					result.data.details.should.be.a("object");
					result.data.details.should.have.property("account");
					result.data.details.account.should.be.a("object");
					result.data.details.account.should.have.property("account_code");
					result.data.details.account.account_code.should.equal(account_code);
					result.data.should.have.property("uuid");
					test_transaction_uuid = result.data.uuid;
				}
			}
		},
		"transactions refund": {
			topic: function() {
				return recurly.transactions.refund;
			},
			"is a function": function(refund){
				should.isFunction(refund);
			},
			"refund transaction": {
				topic: function() {
					return recurly.transactions.refund(test_transaction_uuid, 300, this.callback);
				},
				"no error": function(error, result){
					should.not.exist(error);
				},
				"validate results": function(error, result){
					validate_results(result);
				},
				"results evaluated": function(error, result){
					result.data.should.have.property("account");
					result.data.account.should.have.property("@");
					result.data.account["@"].should.have.property("href");
					result.data.account["@"].href.should.equal("https://api.recurly.com/v2/accounts/" + redeem_coupon_details.account_code);
				}
			}
		}
	},
	"Recurly Count Results Output": {
		"account_test_results consoled": {
			topic: account_test_results,
			"consoled": function(account_test_results){
				console.log(account_test_results);
			}
		},
		"account_test_results reset": {
			topic: account_test_results,
			"reset": function(){
				delete account_test_results;
				account_test_results = [];
			}
		},
		"account_test_results compared": {
			"plus one all account": {
				topic: account_test_results,
				"compare": function(account_test_results){
					var all = 0;
					for(var tst = 0, len = account_test_results.length; tst < len; ++tst){
						if(account_test_results[tst].type == "all"){
							if(all == 0){
								all = account_test_results[tst].count;
							}else{
								account_test_results[tst].count.should.equal(all + 1);
							}
						}
					}
				}
			},
			"plus one active account": {
				topic: account_test_results,
				"compare": function(account_test_results){
					var active = 0;
					for(var tst = 0, len = account_test_results.length; tst < len; ++tst){
						if(account_test_results[tst].type == "active"){
							if(active == 0){
								active = account_test_results[tst].count;
							}else{
								account_test_results[tst].count.should.equal(active + 1);
							}
						}
					}
				}
			},
			"plus one closed account": {
				topic: account_test_results,
				"compare": function(account_test_results){
					var closed = 0;
					for(var tst = 0, len = account_test_results.length; tst < len; ++tst){
						if(account_test_results[tst].type == "closed"){
							if(closed == 0){
								closed = account_test_results[tst].count;
							}else{
								account_test_results[tst].count.should.equal(closed + 1);
							}
						}
					}
				}
			},
			"minus one active account": {
				topic: account_test_results,
				"compare": function(account_test_results){
					var active = 0;
					for(var tst = 0, len = account_test_results.length; tst < len; ++tst){
						if(account_test_results[tst].type == "active"){
							if(active == 0){
								active = account_test_results[tst].count;
							}else{
								account_test_results[tst].count.should.equal(active - 1);
							}
						}
					}
				}
			},
			"minus one closed account": {
				topic: account_test_results,
				"compare": function(account_test_results){
					var closed = 0;
					for(var tst = 0, len = account_test_results.length; tst < len; ++tst){
						if(account_test_results[tst].type == "closed"){
							if(closed == 0){
								closed = account_test_results[tst].count;
							}else{
								account_test_results[tst].count.should.equal(closed - 1);
							}
						}
					}
				}
			}
		},
		"plans_test_results reset": {
			topic: plans_test_results,
			"reset": function(){
				plans_test_results = [];
			}
		},
		"plans_test_results consoled": {
			topic: plans_test_results,
			"consoled": function(plans_test_results){
				console.log(plans_test_results);
			}
		},
		"plans_test_results compared": {
			"plus one plan": {
				topic: plans_test_results,
				"compare": function(plans_test_results){
					plans_test_results[1].count.should.equal(plans_test_results[0].count + 1);
				}
			},
			"minus one plan": {
				topic: plans_test_results,
				"compare": function(plans_test_results){
					plans_test_results[0].count.should.equal(plans_test_results[1].count - 1);
				}
			}
		},
		
		
		"subscriptions_test_results reset": {
			topic: subscriptions_test_results,
			"reset": function(){
				subscriptions_test_results = [];
			}
		},
		"subscriptions_test_results consoled": {
			topic: subscriptions_test_results,
			"consoled": function(subscriptions_test_results){
				console.log(subscriptions_test_results);
			}
		},
		"subscriptions_test_results compared": {
			"plus one live subscription": {
				topic: subscriptions_test_results,
				"compare": function(subscriptions_test_results){
					var live = 0;
					for(var tst = 0, len = subscriptions_test_results.length; tst < len; ++tst){
						if(subscriptions_test_results[tst].type == "live"){
							if(live == 0){
								live = subscriptions_test_results[tst].count;
							}else{
								subscriptions_test_results[tst].count.should.equal(live + 1);
							}
						}
					}
				}
			},
			"minus one live subscription": {
				topic: subscriptions_test_results,
				"compare": function(subscriptions_test_results){
					var live = 0;
					for(var tst = 0, len = subscriptions_test_results.length; tst < len; ++tst){
						if(subscriptions_test_results[tst].type == "live"){
							if(live == 0){
								live = subscriptions_test_results[tst].count;
							}else{
								subscriptions_test_results[tst].count.should.equal(live - 1);
							}
						}
					}
				}
			},
			"plus one canceled subscription": {
				topic: subscriptions_test_results,
				"compare": function(subscriptions_test_results){
					var canceled = 0;
					for(var tst = 0, len = subscriptions_test_results.length; tst < len; ++tst){
						if(subscriptions_test_results[tst].type == "canceled"){
							if(canceled == 0){
								canceled = subscriptions_test_results[tst].count;
							}else{
								subscriptions_test_results[tst].count.should.equal(canceled + 1);
							}
						}
					}
				}
			},
			"minus one canceled subscription": {
				topic: subscriptions_test_results,
				"compare": function(subscriptions_test_results){
					var canceled = 0;
					for(var tst = 0, len = subscriptions_test_results.length; tst < len; ++tst){
						if(subscriptions_test_results[tst].type == "canceled"){
							if(canceled == 0){
								canceled = subscriptions_test_results[tst].count;
							}else{
								subscriptions_test_results[tst].count.should.equal(canceled - 1);
							}
						}
					}
				}
			}
		},
		"plan_addons_test_results consoled": {
			topic: plan_addons_test_results,
			"consoled": function(plan_addons_test_results){
				console.log(plan_addons_test_results);
			}
		},
		"plan_addons_test_results compared": {
			"plus one addon": {
				topic: plan_addons_test_results,
				"compare": function(plan_addons_test_results){
					plan_addons_test_results[1].count.should.equal(plan_addons_test_results[0].count + 1);
				}
			}
		}
	}
};




//----------------Testing configuration settings----------------
var configTest = function(){
	testsToRun.push({
		"name": "Recurly API Config Test",
		"tests": tests["Recurly API Config Test"]
	});
};

//----------------Recurly Add-ons Tests----------------
var addonsTest = function(){
	//List addons
	testsToRun.push({
		"name": "Recurly Add-ons First List",
		"tests": {
			"First List": tests["Recurly Add-ons Tests"]["planAddons list"]
		}
	});
	//Create add-ons on account subscription
	testsToRun.push({
		"name": "Recurly Add-ons Create",
		"tests": {
			"planAddons create": tests["Recurly Add-ons Tests"]["planAddons create"]
		}
	});
	//Create add-ons on account subscription
	testsToRun.push({
		"name": "Recurly Add-ons Create Additional",
		"tests": {
			"planAddons create additional": tests["Recurly Add-ons Tests"]["planAddons create additional"]
		}
	});
	//List addons
	testsToRun.push({
		"name": "Recurly Add-ons Second List",
		"tests": {
			"Second List": tests["Recurly Add-ons Tests"]["planAddons list"]
		}
	});
	//Get addon
	testsToRun.push({
		"name": "Recurly Get Add-on By Code",
		"tests": {
			"planAddons get": tests["Recurly Add-ons Tests"]["planAddons get"]
		}
	});
	//Update addon
	testsToRun.push({
		"name": "Recurly Update Add-on",
		"tests": {
			"planAddons update": tests["Recurly Add-ons Tests"]["planAddons update"]
		}
	});
	//Delete addon
	testsToRun.push({
		"name": "Recurly Delete Add-on",
		"tests": {
			"planAddons delete": tests["Recurly Add-ons Tests"]["planAddons delete"]
		}
	});
	//List addons
	testsToRun.push({
		"name": "Recurly Add-ons Third List",
		"tests": {
			"Third List": tests["Recurly Add-ons Tests"]["planAddons list"]
		}
	});
};
//-----

//----------------Testing Accounts----------------
var accountsTest = function(){
	//list accounts
	testsToRun.push({
		"name": "Recurly Accounts First List",
		"tests": {
			"First List": tests["Recurly Accounts Tests"]["accounts list"]
		}
	});
	//create new account
	testsToRun.push({
		"name": "Recurly Accounts Creation",
		"tests": {
			"accounts create": tests["Recurly Accounts Tests"]["accounts create"]
		}
	});
	//get account details
	testsToRun.push({
		"name": "Recurly Get Account",
		"tests": {
			"accounts get": tests["Recurly Accounts Tests"]["accounts get"]
		}
	});
	//second listing of accounts
	testsToRun.push({
		"name": "Recurly Accounts Second List",
		"tests": {
			"Second List": tests["Recurly Accounts Tests"]["accounts list"]
		}
	});
	
	//compare list, accounts count should be incremented by one
	testsToRun.push({
		"name": "Recurly Count Results Output One",
		"tests": {
			"compare": {
				"plus one all": tests["Recurly Count Results Output"]["account_test_results compared"]["plus one all account"],
				"plus one active": tests["Recurly Count Results Output"]["account_test_results compared"]["plus one active account"]
			}
		}
	});
	//update account details
	testsToRun.push({
		"name": "Recurly Update Account",
		"tests": {
			"accounts update": tests["Recurly Accounts Tests"]["accounts update"]
		}
	});
	//reset account_test_results
	testsToRun.push({
		"name": "Recurly Reset Account Test Reset",
		"tests": {
			"account_test_results reset": tests["Recurly Count Results Output"]["account_test_results reset"]
		}
	});
	//third listing of accounts
	testsToRun.push({
		"name": "Recurly Accounts Third List",
		"tests": {
			"Third List": tests["Recurly Accounts Tests"]["accounts list"]
		}
	});
	//close account
	testsToRun.push({
		"name": "Recurly Close Account",
		"tests": {
			"accounts close": tests["Recurly Accounts Tests"]["accounts close"]
		}
	});
	//fourth listing of accounts
	testsToRun.push({
		"name": "Recurly Accounts Fourth List",
		"tests": {
			"Fourth List": tests["Recurly Accounts Tests"]["accounts list"]
		}
	});
	//compare list, accounts closed should be incremented by one, active decremented by one
	testsToRun.push({
		"name": "Recurly Count Results Output Two",
		"tests": {
			"compare": {
				"plus one closed": tests["Recurly Count Results Output"]["account_test_results compared"]["plus one closed account"],
				"minus one active": tests["Recurly Count Results Output"]["account_test_results compared"]["minus one active account"]
			}
		}
	});
	//reset account_test_results
	testsToRun.push({
		"name": "Recurly Reset Account Test Reset",
		"tests": {
			"account_test_results reset": tests["Recurly Count Results Output"]["account_test_results reset"]
		}
	});
	//Fifth listing of accounts
	testsToRun.push({
		"name": "Recurly Accounts Fifth List",
		"tests": {
			"Fifth List": tests["Recurly Accounts Tests"]["accounts list"]
		}
	});
	//reopen account
	testsToRun.push({
		"name": "Recurly Reopen Account",
		"tests": {
			"accounts reopen": tests["Recurly Accounts Tests"]["accounts reopen"]
		}
	});
	//Sixth listing of accounts
	testsToRun.push({
		"name": "Recurly Accounts Sixth List",
		"tests": {
			"Sixth List": tests["Recurly Accounts Tests"]["accounts list"]
		}
	});
	//compare list, accounts active should be incremented by one, closed decremented by one
	testsToRun.push({
		"name": "Recurly Count Results Output Three",
		"tests": {
			"compare": {
				"plus one active": tests["Recurly Count Results Output"]["account_test_results compared"]["plus one active account"],
				"minus one closed": tests["Recurly Count Results Output"]["account_test_results compared"]["minus one closed account"]
			}
		}
	});
};
//-----

//----------------Billing Info Tests----------------
var billinginfoTest = function(){
	//insert billing info
	testsToRun.push({
		"name": "Recurly Insert Billing Info",
		"tests": {
			"billingInfo insert": tests["Recurly Billing Info Tests"]["billingInfo insert"]
		}
	});
	//get billing info
	testsToRun.push({
		"name": "Recurly Get Billing Info",
		"tests": {
			"billingInfo get": tests["Recurly Billing Info Tests"]["billingInfo get"]
		}
	});
	//update billing info
	testsToRun.push({
		"name": "Recurly Update Billing Info",
		"tests": {
			"billingInfo update": tests["Recurly Billing Info Tests"]["billingInfo update"]
		}
	});
	//delete billing info
	testsToRun.push({
		"name": "Recurly Delete Billing Info",
		"tests": {
			"billingInfo delete": tests["Recurly Billing Info Tests"]["billingInfo delete"]
		}
	});
	//recreat billing info
	testsToRun.push({
		"name": "Recurly Recreate Billing Info",
		"tests": {
			"billingInfo recreate": tests["Recurly Billing Info Tests"]["billingInfo recreate"]
		}
	});
};
//-----

//----------------Testing Subscriptions----------------
var subscriptionTest = function(){
	//List subscriptions
	testsToRun.push({
		"name": "Recurly Subscriptions First List",
		"tests": {
			"First List": tests["Recurly Subscriptions Tests"]["subscriptions list"]
		}
	});
	//Create subscription on account
	testsToRun.push({
		"name": "Recurly Create Subscription on Account",
		"tests": {
			"subscriptions create": tests["Recurly Subscriptions Tests"]["subscriptions create"]
		}
	});
	//Create additional subscription on account
	testsToRun.push({
		"name": "Recurly Create Additional Subscription on Account",
		"tests": {
			"subscriptions create additional": tests["Recurly Subscriptions Tests"]["subscriptions create additional"]
		}
	});
	//List subscriptions again
	testsToRun.push({
		"name": "Recurly Subscriptions Second List",
		"tests": {
			"Second List": tests["Recurly Subscriptions Tests"]["subscriptions list"]
		}
	});
	//get account subscription and store uuid
	testsToRun.push({
		"name": "Recurly Subscriptions Get Account Subscription",
		"tests": {
			"subscriptions getAccountSubscription": tests["Recurly Subscriptions Tests"]["subscriptions getAccountSubscription"]
		}
	});
	//get subscription by uuid
	testsToRun.push({
		"name": "Recurly Subscriptions Get Subscription By UUID",
		"tests": {
			"subscriptions get": tests["Recurly Subscriptions Tests"]["subscriptions get"]
		}
	});
	//update subscription by uuid
	testsToRun.push({
		"name": "Recurly Subscriptions Update Subscription By UUID",
		"tests": {
			"subscriptions update": tests["Recurly Subscriptions Tests"]["subscriptions update"]
		}
	});
	//List subscriptions again
	testsToRun.push({
		"name": "Recurly Subscriptions Third List",
		"tests": {
			"Third List": tests["Recurly Subscriptions Tests"]["subscriptions list"]
		}
	});
	//cancel subscription by uuid
	testsToRun.push({
		"name": "Recurly Subscriptions Cancel Subscription By UUID",
		"tests": {
			"subscriptions cancel": tests["Recurly Subscriptions Tests"]["subscriptions cancel"]
		}
	});
	//List subscriptions again
	testsToRun.push({
		"name": "Recurly Subscriptions Fourth List",
		"tests": {
			"Fourth List": tests["Recurly Subscriptions Tests"]["subscriptions list"]
		}
	});
	//terminate subscription by uuid
	testsToRun.push({
		"name": "Recurly Subscriptions Reactivate Subscription By UUID",
		"tests": {
			"subscriptions reactivate": tests["Recurly Subscriptions Tests"]["subscriptions reactivate"]
		}
	});
	//List subscriptions again
	testsToRun.push({
		"name": "Recurly Subscriptions Fifth List",
		"tests": {
			"Fifth List": tests["Recurly Subscriptions Tests"]["subscriptions list"]
		}
	});
	//terminate subscription by uuid
	testsToRun.push({
		"name": "Recurly Subscriptions Terminate Subscription By UUID",
		"tests": {
			"subscriptions terminate": {
				"terminate subscription partial refund": tests["Recurly Subscriptions Tests"]["subscriptions terminate"]["terminate subscription partial refund"]
			}
		}
	});
	//List subscriptions again
	testsToRun.push({
		"name": "Recurly Subscriptions Sixth List",
		"tests": {
			"Sixth List": tests["Recurly Subscriptions Tests"]["subscriptions list"]
		}
	});
};
//-----

//----------------Adjustments Tests----------------
var adjustmentsTest = function(){
	//List adjustment
	testsToRun.push({
		"name": "Recurly Adjustments First List",
		"tests": {
			"Adjustments First List": tests["Recurly Adjustments Tests"]["adjustments list"]
		}
	});
	//create adjustment
	testsToRun.push({
		"name": "Recurly Create Adjustments",
		"tests": {
			"adjustments create": tests["Recurly Adjustments Tests"]["adjustments create"]
		}
	});
	//List adjustment
	testsToRun.push({
		"name": "Recurly Adjustments Second List",
		"tests": {
			"Adjustments Second List": tests["Recurly Adjustments Tests"]["adjustments list"]
		}
	});
	//delete adjustment
	testsToRun.push({
		"name": "Recurly Delete Adjustments",
		"tests": {
			"adjustments delete": tests["Recurly Adjustments Tests"]["adjustments delete"]
		}
	});
	//List adjustment
	testsToRun.push({
		"name": "Recurly Adjustments Third List",
		"tests": {
			"Adjustments Third List": tests["Recurly Adjustments Tests"]["adjustments list"]
		}
	});
	//create another adjustment for further testing
	testsToRun.push({
		"name": "Recurly Create Another Adjustment",
		"tests": {
			"adjustments create": tests["Recurly Adjustments Tests"]["adjustments create"]
		}
	});
};
//-----

//----------------Coupons Tests----------------
var couponsTest = function(){
	//List coupons
	testsToRun.push({
		"name": "Recurly Coupons First List",
		"tests": {
			"Coupons First List": tests["Recurly Coupons Tests"]["coupons list"]
		}
	});
	//create coupon
	testsToRun.push({
		"name": "Recurly Create Coupon",
		"tests": {
			"coupons create": tests["Recurly Coupons Tests"]["coupons create"]
		}
	});
	//List coupons again
	testsToRun.push({
		"name": "Recurly Coupons Second List",
		"tests": {
			"Coupons Second List": tests["Recurly Coupons Tests"]["coupons list"]
		}
	});
	//get coupon
	testsToRun.push({
		"name": "Recurly Get Coupon",
		"tests": {
			"coupons get": tests["Recurly Coupons Tests"]["coupons get"]
		}
	});
	//delete coupon
	testsToRun.push({
		"name": "Recurly Delete Coupon",
		"tests": {
			"coupons delete": tests["Recurly Coupons Tests"]["coupons delete"]
		}
	});
	//List coupons again
	testsToRun.push({
		"name": "Recurly Coupons Third List",
		"tests": {
			"Coupons Third List": tests["Recurly Coupons Tests"]["coupons list"]
		}
	});
	//create another coupon for further testing
	testsToRun.push({
		"name": "Recurly Create Coupon",
		"tests": {
			"coupons create": tests["Recurly Coupons Tests"]["coupons create"]
		}
	});
};
//-----

//----------------Coupon Redemption Tests----------------
var redemptionsTest = function(){
	//redeem coupon on account
	testsToRun.push({
		"name": "Recurly Redeem Coupon",
		"tests": {
			"redemptions redeem": tests["Recurly Coupon Redemptions Tests"]["redemptions redeem"]
		}
	});
	//get redemption
	testsToRun.push({
		"name": "Recurly Get Redemption",
		"tests": {
			"redemptions get": tests["Recurly Coupon Redemptions Tests"]["redemptions get"]
		}
	});
	//remove redemption
	testsToRun.push({
		"name": "Recurly Remove Redemption",
		"tests": {
			"redemptions remove": tests["Recurly Coupon Redemptions Tests"]["redemptions remove"]
		}
	});
};
//-----

//----------------Invoices Tests----------------
var invoicesTest = function(){
	//list invoices 
	testsToRun.push({
		"name": "Recurly List Invoices",
		"tests": {
			"invoices list": tests["Recurly Invoices Tests"]["invoices list"]
		}
	});
	//invoices an account and store invoice number
	testsToRun.push({
		"name": "Recurly Invoice Account",
		"tests": {
			"invoices invoiceAccount": tests["Recurly Invoices Tests"]["invoices invoiceAccount"]
		}
	});
	//list invoices on an account
	testsToRun.push({
		"name": "Recurly Lookup Invoice on Account",
		"tests": {
			"invoices getAccountInvoice": tests["Recurly Invoices Tests"]["invoices getAccountInvoice"]
		}
	});
	//get invoice by invoice number
	testsToRun.push({
		"name": "Recurly Get Invoice By Number",
		"tests": {
			"invoices get": tests["Recurly Invoices Tests"]["invoices get"]
		}
	});
	//get PDF version of invoice by invoice number
	testsToRun.push({
		"name": "Recurly Get PDF Invoice By Number",
		"tests": {
			"invoices getPDF": tests["Recurly Invoices Tests"]["invoices getPDF"]
		}
	});
};
//-----

//----------------Transactions Tests----------------
var transactionsTest = function(){
	//list all transactions
	testsToRun.push({
		"name": "Recurly List Transacrions",
		"tests": {
			"transactions list": tests["Recurly Transactions Tests"]["transactions list"]
		}
	});
	//list all transactions of an account
	testsToRun.push({
		"name": "Recurly First List Account Transactions",
		"tests": {
			"transactions getAccountTransactions": tests["Recurly Transactions Tests"]["transactions getAccountTransactions"]
		}
	});
	//get transaction by id
	testsToRun.push({
		"name": "Recurly Get Transaction By ID",
		"tests": {
			"transactions get": tests["Recurly Transactions Tests"]["transactions get"]
		}
	});
	//create transaction on account
	testsToRun.push({
		"name": "Recurly Create Transaction on Account",
		"tests": {
			"transactions create": tests["Recurly Transactions Tests"]["transactions create"]
		}
	});
	//list all transactions of an account
	testsToRun.push({
		"name": "Recurly Second List Account Transactions",
		"tests": {
			"transactions getAccountTransactions": tests["Recurly Transactions Tests"]["transactions getAccountTransactions"]
		}
	});
	//refund transaction by uuid
	testsToRun.push({
		"name": "Recurly Refund Transaction",
		"tests": {
			"transactions refund": tests["Recurly Transactions Tests"]["transactions refund"]
		}
	});
	//list all transactions of an account
	testsToRun.push({
		"name": "Recurly Third List Account Transactions",
		"tests": {
			"transactions getAccountTransactions": tests["Recurly Transactions Tests"]["transactions getAccountTransactions"]
		}
	});
};
//-----

var testsToRun = [];
configTest();
//Testing validity of API object and making recurly instance
testsToRun.push({
	"name": "Recurly API Library Test",
	"tests": tests["Recurly API Library Test"]
});

addonsTest();
//accountsTest();
billinginfoTest();
subscriptionTest();
adjustmentsTest();
couponsTest();
redemptionsTest();
invoicesTest();
transactionsTest();

for(var i = 0, l = testsToRun.length; i < l; ++i){
	if(testsToRun[i].name && testsToRun[i].tests){
		vows.describe(testsToRun[i].name).addBatch(testsToRun[i].tests).export(module);
	}else{
		console.log("Invalid test: ",testsToRun[i].name);
	}
}

















