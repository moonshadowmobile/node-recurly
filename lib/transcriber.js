
module.exports = function(xml) {
	var rootKeys = Object.keys(xml);

	if(!rootKeys.length) {
		throw new Error('This xml has no root');
	}

	if(rootKeys.length > 1) {
		throw new Error('This xml has multiple roots');
	}

	var key = rootKeys[0];
	return dispatcher[key](xml[key]);
};

var dispatcher = {
	'accounts': accountsRecorder,
	'account': accountRecorder,
	'plans': plansRecorder,
	'plan': planRecorder
};

function accountsRecorder(xml) {
	var accounts = [];

	if(xml.account) {
		xml.account.forEach(function(account) {
			accounts.push(accountRecorder(account));
		});
	}

	return accounts;
}

function accountRecorder(xml) {
	var account = {
		'adjustments': xml.adjustments['@'].href,
		'invoices': xml.invoices['@'].href,
		'subscriptions': xml.subscriptions['@'].href,
		'transactions': xml.transactions['@'].href,
		'account_code': xml.account_code,
		'state': xml.state,
		'username': (typeof xml.username === 'object') ? null : xml.username,
		'email': xml.email,
		'first_name': xml.first_name,
		'last_name': xml.last_name,
		'company_name': xml.company_name,
		'accept_language': xml.accept_language,
		'hosted_login_token': xml.hosted_login_token,
		'created_at': xml.created_at['#']
	};

	return account;
}

function plansRecorder(xml) {
	var plans = [];
	
	if(xml.plan) {
		xml.plan.forEach(function(plan) {
			plans.push(planRecorder(plan));
		});
	}

	return plans;
}

function planRecorder(xml) {
	var plan = {
		'add_ons': xml.add_ons['@'].href,
		'plan_code': xml.plan_code,
 		'name': xml.name,
	    'description': xml.description,
		'success_url': (typeof xml.success_url === 'object') ? null : xml.success_url,
		'cancel_url': (typeof xml.cancel_url === 'object') ? null : xml.cancel_url,
		'display_donation_amounts': xml.display_donation_amounts['#'] === 'true',
		'display_quantity': xml.display_quantity['#'] === 'true',
		'display_phone_number': xml.display_phone_number['#'] === 'true',
		'bypass_hosted_confirmation': xml.bypass_hosted_confirmation['#'] === 'true',
		'unit_name': xml.unit_name,
		'payment_page_tos_link': xml.payment_page_tos_link['#'] || null,
		'plan_interval_length': parseInt(xml.plan_interval_length['#'], 10),
		'plan_interval_unit': xml.plan_interval_unit,	
		'trial_interval_length': parseInt(xml.trial_interval_length['#'], 10),
		'trial_interval_unit': xml.trial_interval_unit,
		'total_billing_cycles': xml.total_billing_cycles['#'] || null,
		'accounting_code': (typeof xml.accounting_code === 'object') ? null : xml.accounting_code,
		'created_at': xml.created_at['#']
	};

	plan.unit_amount_in_cents = {};
	Object.keys(xml.unit_amount_in_cents).forEach(function(key) {
		plan.unit_amount_in_cents[key] = parseInt(xml.unit_amount_in_cents[key]['#'], 10);
	});

	plan.setup_fee_in_cents = {};
	Object.keys(xml.setup_fee_in_cents).forEach(function(key) {
		plan.setup_fee_in_cents[key] = parseInt(xml.setup_fee_in_cents[key]['#'], 10);
	});

	return plan;
}


