var Transparent = require("./transparent");
var Tools = require("./tools");

module.exports = function(config){
	
	//add additional info to the config object
	config.RECURLY_API_VERSION = "/v2";
	config.RECURLY_HOST = "api" + config.ENVIRONMENT + ".recurly.com"
	config.RECURLY_BASE_URL = "https://" + config.RECURLY_HOST;
	
	var tools = new Tools(config);
	var transparent = new Transparent(config);
	
	//http://docs.recurly.com/api/accounts
	this.accounts = {
		"list": function list(state, cursor, per_page, callback){
			var query_params = {
				"state": state || "active",
				"cursor": cursor,
				"per_page": per_page || 50
			};
			tools.request("/accounts", "GET", callback, null, query_params);
		},
		"get": function get(account_code, callback){
			tools.request("/accounts/" + account_code, "GET", callback);
		},
		"create": function create(details, callback){
			tools.request("/accounts", "POST", callback, tools.js2xml(details,"account"));
		},
		"update": function update(account_code, details, callback){
			tools.request("/accounts/" + account_code, "PUT", callback, tools.js2xml(details,"account"));
		},
		"close": function close(account_code, callback){
			tools.request("/accounts/" + account_code, "DELETE", callback);
		},
		"reopen": function reopen(account_code, callback){
			tools.request("/accounts/" + account_code + "/reopen", "PUT", callback);
		}
	};
	
	//http://docs.recurly.com/api/adjustments
	this.adjustments = {
		"list": function get(type, state, cursor, per_page, account_code, callback){
			var query_params = {
				"type": type,
				"state": state,
				"cursor": cursor,
				"per_page": per_page || 50
			};
			tools.request("/accounts/" + account_code + "/adjustments", "GET", callback, null, query_params);
		},
		"create": function create(account_code, details, callback){
			tools.request("/accounts/" + account_code + "/adjustments", "POST", callback, tools.js2xml(details,"adjustment"));
		},
		"deleteAdjustment": function deleteAdjustment(uuid, callback){
			tools.request("/adjustments/"+uuid, "DELETE", callback);
		}
	};
	
	//http://docs.recurly.com/api/billing-info
	this.billingInfo = {
		"get": function get(account_code, callback){
			tools.request("/accounts/" + account_code + "/billing_info", "GET", callback);
		},
		"update": function update(account_code, details, callback){
			tools.request("/accounts/" + account_code + "/billing_info", "PUT", callback, tools.js2xml(details,"billing_info"));
		},
		"clear": function clear(account_code, callback){
			tools.request("/accounts/" + account_code + "/billing_info", "DELETE", callback);
		}
	};
	
	//http://docs.recurly.com/api/coupons
	this.coupons = {
		"list": function list(state, cursor, per_page, callback){
			var query_params = {
				"state": state,
				"cursor": cursor,
				"per_page": per_page || 50
			};
			tools.request("/coupons", "GET", callback, null, query_params);
		},
		"get": function get(coupon_code, callback){
			tools.request("/coupons/" + coupon_code, "GET", callback);
		},
		"create": function create(details, callback){
			tools.request("/coupons", "POST", callback, tools.js2xml(details,"coupon"));
		},
		"deactivate": function deactivate(coupon_code, callback){
			tools.request("/coupons/" + coupon_code, "DELETE", callback);
		}
	};
	
	//http://docs.recurly.com/api/coupons/coupon-redemption
	this.redemptions = {
		"get": function get(account_code, callback){
			tools.request("/accounts/" + account_code +"/redemption" , "GET", callback);
		},
		"redeem": function redeem(coupon_code, details, callback){
			tools.request("/coupons/" + coupon_code + "/redeem", "POST", callback, tools.js2xml(details,"redemption"));
		},
		"remove": function remove(account_code, callback){
			tools.request("/accounts/" + account_code + "/redemption", "DELETE", callback);
		}
	};
	
	//http://docs.recurly.com/api/invoices
	this.invoices = {
		"list": function list(state, cursor, per_page, callback){
			var query_params = {
				"state": state,
				"cursor": cursor,
				"per_page": per_page || 50
			};
			tools.request("/invoices", "GET", callback, null, query_params);
		},
		"getAccountInvoice": function getAccountInvoice(account_code, cursor, per_page, callback){
			var query_params = {
				"cursor": cursor,
				"per_page": per_page || 50
			};
			tools.request("/accounts/" + account_code + "/invoices", "GET", callback, null, query_params);
		},
		"get": function get(invoice_number, callback){
			tools.request("/invoices/" + invoice_number, "GET", callback);
		},
		"getPDF": function getPDF(invoice_number, callback){
			var additional_options = {
				"headers": {
					"Accept-Type": "application/pdf"
				}
			};
			tools.request("/invoices/" + invoice_number, "GET", callback, null, null, additional_options);
		},
		"invoiceAccount": function invoiceAccount(account_code, callback){
			tools.request("/accounts/" + account_code + "/invoices", "POST", callback);
		}
	};

	//http://docs.recurly.com/api/plans
	this.plans = {
		"list": function list(cursor, per_page, callback){
			var query_params = {
				"cursor": cursor,
				"per_page": per_page || 50
			};
			tools.request("/plans", "GET", callback, null, query_params);
		},
		"get": function get(plan_code, callback){
			tools.request("/plans/" + plan_code, "GET", callback);
		},
		"create": function create(details, callback){
			tools.request("/plans", "POST", callback, tools.js2xml(details,"plan"));
		},
		"update": function update(plan_code, details, callback){
			tools.request("/plans/" + plan_code, "PUT", callback, tools.js2xml(details,"plan"));
		},
		"deletePlan": function deletePlan(plan_code, callback){
			tools.request("/plans/" + plan_code, "DELETE", callback);
		}
	};
	
	//http://docs.recurly.com/api/plans/add-ons
	this.planAddons = {
		"list": function list(plan_code, cursor, per_page, callback){
			var query_params = {
				"cursor": cursor,
				"per_page": per_page || 50
			};
			tools.request("/plans/" + plan_code + "/add_ons", "GET", callback, null, query_params);
		},
		"get": function get(plan_code, add_on_code, callback){
			tools.request("/plans/" + plan_code + "/add_ons/" + add_on_code, "GET", callback);
		},
		"create": function create(plan_code, details, callback){
			tools.request("/plans/" + plan_code + "/add_ons", "POST", callback, tools.js2xml(details,"add_on"));
		},
		"update": function update(plan_code, add_on_code, details, callback){
			tools.request("/plans/" + plan_code + "/add_ons/" + add_on_code, "PUT", callback, tools.js2xml(details,"add_on"));
		},
		"deleteAddon": function deleteAddon(plan_code, add_on_code, callback){
			tools.request("/plans/" + plan_code + "/add_ons/" + add_on_code, "DELETE", callback);
		}
	};
	
	//http://docs.recurly.com/api/subscriptions
	this.subscriptions = {
		"list": function list(state, cursor, per_page, callback){
			var query_params = {
				"state": state || "live",
				"cursor": cursor,
				"per_page": per_page || 50
			};
			tools.request("/subscriptions", "GET", callback, null, query_params);
		},
		"getAccountSubscription": function getAccountSubscription(account_code, callback){
			tools.request("/accounts/" + account_code +"/subscriptions", "GET", callback);
		},
		"get": function get(uuid, callback){
			tools.request("/subscriptions/" + uuid, "GET", callback);
		},
		"create": function create(account_code, details, callback){
			tools.request("/subscriptions", "POST", callback, tools.js2xml(details,"subscription"));
		},
		"update": function update(uuid, details, callback){
			tools.request("/subscriptions/" + uuid, "PUT", callback, tools.js2xml(details,"subscription"));
		},
		"cancel": function cancel(uuid, callback){
			tools.request("/subscriptions/" + uuid + "/cancel", "PUT", callback);
		},
		"reactivate": function reactivate(uuid, callback){
			tools.request("/subscriptions/" + uuid + "/reactivate", "PUT", callback);
		},
		"terminate": function terminate(uuid, refund_type, callback){
			var query_params = {
				"refund": refund_type
			};
			tools.request("/subscriptions/" + uuid + "/terminate", "PUT", callback, null, query_params);
		},
		"postpone": function postpone(uuid, next_renewal_date, callback){
			var query_params = {
				"next_renewal_date": next_renewal_date
			};
			tools.request("/subscriptions/" + uuid + "/postpone", "PUT", callback, null, query_params);
		}
	};
	
	//http://docs.recurly.com/api/transactions
	this.transactions = {
		"list": function list(account_code, state, type, cursor, per_page, callback){
			var query_params = {
				"state": state,
				"type": type,
				"cursor": cursor,
				"per_page": per_page || 50
			};
			tools.request("/transactions", "GET", callback, null, query_params);
		},
		"getAccountTransactions": function getAccountTransactions(account_code, callback){
			tools.request("/accounts/" + account_code +"/transactions", "GET", callback);
		},
		"get": function get(uuid, callback){
			tools.request("/transactions/" + uuid, "GET", callback);
		},
		"create": function create(details, callback){
			tools.request("/transactions", "POST", callback, tools.js2xml(details,"transaction"));
		},
		"refund": function refund(uuid, amount_in_cents, callback){
			var query_params = {};
			if(amount_in_cents)
				query_params.amount_in_cents = amount_in_cents;
			tools.request("/transactions/" + uuid, "DELETE", callback, null, query_params);
		}
	};
	
	this.js2xmlTest = function(input, wrap){
		console.log(tools.js2xml(input, wrap));		
	};
	
	//http://docs.recurly.com/transparent-post
	//@TODO: transparent is not yet updated to V2 
	this.transparent = transparent;
	
}
