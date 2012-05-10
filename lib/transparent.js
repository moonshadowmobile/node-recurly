var crypto = require('crypto');
var Tools = require('./tools');
	
module.exports = function(config){
	
	var tools = new Tools(config);

	var TRANSPARENT_POST_BASE_URL = config.RECURLY_BASE_URL + '/transparent/' + config.SUBDOMAIN;
	var BILLING_INFO_URL = TRANSPARENT_POST_BASE_URL + '/billing_info';
	var SUBSCRIBE_URL = TRANSPARENT_POST_BASE_URL + '/subscription';
	var TRANSACTION_URL = TRANSPARENT_POST_BASE_URL + '/transaction';
	
	tools.debug('============================');
	tools.debug(TRANSPARENT_POST_BASE_URL);
	tools.debug(BILLING_INFO_URL);
	tools.debug(SUBSCRIBE_URL);
	tools.debug(TRANSACTION_URL);
	tools.debug('============================');
	
	this.billingInfoUrl = function(){return BILLING_INFO_URL};
	this.subscribeUrl = function(){return SUBSCRIBE_URL};
	this.transactionUrl = function(){return TRANSACTION_URL};
	
	this.hidden_field = function(data){
		return '<input type="hidden" name="data" value="'+tools.htmlEscape(encoded_data(data))+'" />';
	}
	
	this.getResults =	function(confirm, result, status, type, callback){
		validateQueryString(confirm, type, status, result);
		tools.request('/transparent/results/' + result, 'GET', callback);
	}

	this.getFormValuesFromResult = function getFormValuesFromResult(result, type){
		var fields = {};
		var errors = [];
		tools.traverse(result.data,function(key, value, parent){
			var shouldprint = false;
			var toprint = ''
			if(value instanceof Object){
				if(Object.keys(value).length === 0){
					shouldprint = true;
					toprint = ''
				}
				if(Object.hasOwnProperty('@') || Object.hasOwnProperty('#')){
					shouldprint = true;
					toprint = value;
				}
				if(value instanceof Array){
					shouldprint = true;
					toprint = value;
				}
			}
			else if(!(value instanceof Object)){
				shouldprint = true;
				toprint = value;
				if(key === 'error'){
					errors.push( { field: '_general', reason: value } );
					shouldprint = false;
				}
			}
			if(key === "@" || key === '#'){
				shouldprint = false;
			}
			if(parent === "@" || parent === '#'){
				shouldprint = false;
			}

			if(!parent){
				switch(type){
					case 'subscribe':
						parent = 'account';
						break;
					case 'billing_info':
						parent = 'billing_info';
				}
			}

			if(key === 'errors'){
				shouldprint = false;
				errors = errors.concat(processErrors(value, parent));
			}

			if(shouldprint){
				var toadd = {};
				try{
					fields[parent+'['+key+']'] = toprint.replace(/'/g, '&apos;');
				}
				catch(e){
					tools.debug('GET FIELDS: could not process: ' + parent+'['+key+'] : ' + toprint );
				}
			}
		});
		errors = handleFuzzyLogicSpecialCases(errors);
		return {fields: fields, errors: errors};
	}
	
	function processErrors(errors, parent){
		var acc = [];
		var processSingleError = function(e){
			try{
				acc.push({
					field: parent+'['+e['@'].field+']',
					reason: e['#'].replace(/'/g, '&apos;')
				});
			}
			catch(err){
				tools.debug('Could not process listed error: ' + e);
			}
		};
		errors.forEach(function(item){
			if(item instanceof Array){
				//loop through the error list
				item.forEach(processSingleError)
			}
			else{
				//its a single error so grab it out
				try{
					processSingleError(item);
				}
				catch(err){
					tools.debug('Could not process single error: ' + item);
				}
			}
		});
		return acc;
	}

	function encoded_data(data){
		verify_required_fields(data);
		var query_string = make_query_string(data);
		var validation_string = hash(query_string);
		return validation_string + "|" + query_string;
	}
	
	function verify_required_fields(params){
		if(!params.hasOwnProperty('redirect_url')){
			throw "Missing required parameter: redirect_url";
		}
		if(!params.hasOwnProperty('account[account_code]')){
			throw "Missing required parameter: account[account_code]";
		}
	}
	
	function make_query_string(params){
		params.time = makeDate();
		return buildQueryStringFromSortedObject(makeSortedObject(params, true));
	}
	
	function makeDate(){
		var d = new Date();
		var addleadingzero = function(n){ return (n<10)?'0'+n:''+n };
		return d.getUTCFullYear() + '-' +
			addleadingzero(d.getUTCMonth()+1) + '-' +
			addleadingzero(d.getUTCDate()) + 'T' + 
			addleadingzero(d.getUTCHours()) + ':' +
			addleadingzero(d.getUTCMinutes()) + ':' +
			addleadingzero(d.getUTCSeconds()) + 'Z';
	}
	
	function hash(data) {
		//get the sha1 of the private key in binary
		var shakey = crypto.createHash('sha1');
		shakey.update(config.PRIVATE_KEY);
		shakey = shakey.digest('binary');
		//now make an hmac and return it as hex
		var hmac = crypto.createHmac('sha1', shakey);
		hmac.update(data);
		return hmac.digest('hex');
		//php:	03021207ad681f2ea9b9e1fc20ac7ae460d8d988		<== Yes this sign is identical to the php version
		//node: 03021207ad681f2ea9b9e1fc20ac7ae460d8d988
	 }
	
	function buildQueryStringFromSortedObject(params){
		return params.map(function(p){
			return escape(p.key) + "=" + tools.urlEncode(p.value);
		}).join('&');
	}
			
	function makeSortedObject(obj, casesensitive){
		return Object.keys(obj).map(function(key){
			return {key: key, value: obj[key]};
		}).sort(function(a,b){
			return (casesensitive? a.key : a.key.toLowerCase()) > (casesensitive? b.key : b.key.toLowerCase());
		});
	}
	
	//Used for validating return params from Recurly
	function validateQueryString(confirm, type, status, result_key)
	{
		var values = {
			result: result_key,
			status: status,
			type: type
		}
		var query_values = buildQueryStringFromSortedObject(makeSortedObject(values, true));
		hashed_values = hash(query_values);

		if(hashed_values !== confirm) {
			throw "Error: Forged query string";
		}
		return true;
	}

	function handleFuzzyLogicSpecialCases(errors){
		var returnArray = []
		errors.forEach(function(e){
			switch(e.field){
				case 'billing_info[verification_value]':
					returnArray.push(copyWithNewName('billing_info[credit_card][verification_value]', e));
					returnArray.push(copyWithNewName('credit_card[verification_value]', e));
					break;
				case 'credit_card[number]':
					returnArray.push(copyWithNewName('billing_info[credit_card][number]', e));
					returnArray.push(e);
						break;
				default:
					returnArray.push(e);
					break;
			}
		});
		return returnArray;
	}
	
	function copyWithNewName(name, error){
		return {field: name,reason: error.reason};
	}
	
}
