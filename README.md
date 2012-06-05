Node-Recurly
===============

node-recurly is a Node.js library for using the Recurly recurring billing service v2. This library is intended to follow very closely the recurly documentation found at:
http://docs.recurly.com/

**NOTE Certain uses of this interface may have implications on PCI compliance because this it requires access to and transmission of customer credit card information.

Installation
===============

	npm install node-recurly

add a config file to your project that has contents similar to:

		module.exports = {
			API_KEY: "",
			PRIVATE_KEY: "",
			SUBDOMAIN: "",
			ENVIRONMENT: "",
			DEBUG: false
		};


Usage
===============

		var Recurly = require('node-recurly');
		var recurly = new Recurly(require('./config'));

After that, just call the methods below:


Accounts
===============
http://docs.recurly.com/api/accounts

	recurly.accounts.list(state, cursor, per_page, callback)

	recurly.accounts.get(account_code, callback)

	recurly.accounts.create(details, callback)

	recurly.accounts.update(account_code, details, callback)

	recurly.accounts.close(account_code, callback)

	recurly.accounts.reopen(account_code, callback)


Adjustments
===============
http://docs.recurly.com/api/adjustments

	recurly.adjustments.list(type, state, cursor, per_page, account_code, callback)
	
	recurly.adjustments.create(account_code, details, callback)
	
	recurly.adjustments.deleteAdjustment(uuid, callback)


Billing Information
===============
http://docs.recurly.com/api/billing-info

	recurly.billingInfo.get(account_code, callback)

	recurly.billingInfo.update(account_code, details, callback)

	recurly.billingInfo.clear(account_code, callback)


Coupons
===============
http://docs.recurly.com/api/coupons

	recurly.coupons.list(state, cursor, per_page, callback)

	recurly.coupons.get(coupon_code, callback)

	recurly.coupons.create(details, callback)

	recurly.coupons.deactivate(coupon_code, callback)


Coupon Redemptions
===============
http://docs.recurly.com/api/coupons/coupon-redemption

	recurly.redemptions.get(account_code, callback)

	recurly.redemptions.redeem(coupon_code, details, callback)

	recurly.redemptions.remove(account_code, callback)


Invoices
===============
http://docs.recurly.com/api/invoices

	recurly.invoices.list(state, cursor, per_page, callback)

	recurly.invoices.getAccountInvoice(account_code, cursor, per_page, callback)

	recurly.invoices.get(invoice_number, callback)

	recurly.invoices.getPDF(invoice_number, callback)
	
	recurly.invoices.invoiceAccount(account_code, callback)


Plans
===============
http://docs.recurly.com/api/plans

	recurly.plans.list(cursor, per_page, callback)

	recurly.plans.get(plan_code, callback)

	recurly.plans.create(details, callback)

	recurly.plans.update(plan_code, details, callback)

	recurly.plans.deletePlan(plan_code, callback)


Plan Add-ons
===============
http://docs.recurly.com/api/plans/add-ons

	recurly.planAddons.list(plan_code, cursor, per_page, callback)

	recurly.planAddons.get(plan_code, add_on_code, callback)

	recurly.planAddons.create(plan_code, details, callback)

	recurly.planAddons.update(plan_code, add_on_code, details, callback)

	recurly.planAddons.deleteAddon(plan_code, add_on_code, callback)


Subscriptions
===============
http://docs.recurly.com/api/subscriptions

	recurly.subscriptions.list(state, cursor, per_page, callback)

	recurly.subscriptions.getAccountSubscription(account_code, callback)

	recurly.subscriptions.get(uuid, callback)

	recurly.subscriptions.create(account_code, details, callback)

	recurly.subscriptions.update(uuid, details, callback)

	recurly.subscriptions.cancel(uuid, callback)

	recurly.subscriptions.reactivate(uuid, callback)

	recurly.subscriptions.terminate(uuid, refund_type, callback)


Transactions
===============
http://docs.recurly.com/api/transactions

	recurly.transactions.list(account_code, state, type, cursor, per_page, callback)

	recurly.transactions.getAccountTransactions(account_code, callback)

	recurly.transactions.get(uuid, callback)

	recurly.transactions.create(details, callback)

	recurly.transactions.refund(uuid, amount_in_cents, callback)


Transparent Post
==================
http://docs.recurly.com/transparent-post

	recurly.transparent.billingInfoUrl

	recurly.transparent.subscribeUrl

	recurly.transparent.transactionUrl

	recurly.transparent.hidden_field(data)

	recurly.transparent.getResults(confirm, result, status, type, callback)

	recurly.transparent.getFormValuesFromResult(result, type)