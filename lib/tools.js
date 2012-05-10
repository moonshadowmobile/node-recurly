var https = require("https");
var xml2js = require("xml2js");
	
module.exports = function(config){
	var tools = this;
	this.request = function(endpoint, method, callback, data, query_params, additional_options){
		
		if(query_params){
			endpoint += "?";
			for(var i in query_params)
				query_params[i] && (endpoint += "&" + i + "=" + query_params[i]);
		}
		
		if(data)
			data = '<?xml version="1.0"?>\n' + data;
		
		var options = {
			"host": config.RECURLY_HOST,
			"port": 443,
			"path": config.RECURLY_API_VERSION + endpoint,
			"method": method,
			"headers": {
				"Authorization": "Basic "+(new Buffer(config.API_KEY)).toString("base64"),
				"Accept": "application/xml",
				"Content-Length" : (data) ? data.length : 0
			}
		};
		
		if(method.toLowerCase() == "post" || method.toLowerCase() == "put" ){
			options.headers["Content-Type"] = "application/xml";
			tools.debug(data); 
		}
		
		if(additional_options){
			for(var i in additional_options){
				if(options[i]){
					if(typeof additional_options[i] == "string")
						options[i] = additional_options[i];
					if(typeof additional_options[i] == "object"){
						for(var j in additional_options[i]){
							options[i][j] = additional_options[i][j];
						}
					}
				}
			}
		}
		
		tools.debug(options);
		var req = https.request(options, function(res) {
			var responseData = "";
			if(res && res.statusCode == 204){
				return callback(null, {
					"status": "ok", 
					"data": { 
						"description": res.statusCode 
					}
				});
			}
			res.on("data", function(d) {
				responseData += d;
			});
			res.on("end", function(){
				responseData = tools.trim(responseData);
				tools.debug("Response is: " + res.statusCode);
				tools.debug(responseData);
				try{
					var returnObj = {
						"status": "ok",
						"data": ""
					};
					if(res.statusCode >= 400){
						var error_states = [400, 404, 412, 422, 500];
						if(error_states.indexOf(res.statusCode) > -1){
							tools.parseXML(responseData, function(error, result){
								if(error)
									return callback(error);
								var msg = "";
								if(result.error && result.error["@"]){
									msg += (result.error["@"].field + " ") + result.error["#"];
								}
								if(result.description){
									msg += " "+result.description;
								}
								if(result.details){
									msg += " "+result.details;
								}
								var new_error = new Error(msg);
								new_error.type = res.statusCode;
								callback(new_error);
							});
						}else{
							var new_error = new Error("error: "+res.statusCode);
							new_error.type = res.statusCode;
							callback(new_error);
						}
					}else{
						if(responseData != ""){
							tools.parseXML(responseData, function(error, result){
								if(error)
									return callback(error);
								returnObj.data = result;
								callback(null, returnObj);
							});
						}else{
							callback(null, {
								"status": "ok", 
								"data": { 
									"description": res.statusCode 
								}
							});
						}
					}
				}
				catch(error){
					callback(error);
				}
			});
		});
		if(data){
			req.write(data);
		}
		req.end();
		req.on("error", function(error) {
			callback(error);
		});
	};

	this.debug = function(s){
		if(config.DEBUG)
			console && console.log(s);
	};
	
	this.js2xml = function js2xml(js, wraptag){
		if(!!js){
			if(typeof js == "object"){
				return js2xml(
					Object.keys(js).map(function(key){
						return js2xml(js[key], !(js instanceof Array) && key);
					}).join("\n"), 
				wraptag);
			}else{
				return ((wraptag)?"<"+ wraptag+">" : "" ) + js + ((wraptag)?"</"+ wraptag+">" : "" );
			}
		}
	};
		
	this.parseXML = function(xml, callback){
		var parser = new xml2js.Parser();
		parser.addListener("end", function(result) {
			callback(null, result);
		});
		parser.parseString(xml);
	};
	
	this.trim = function(str) {
		str = str.replace(/^\s+/, "");
		for(var i = str.length - 1; i >= 0; i--)
			if (/\S/.test(str.charAt(i))) {
				str = str.substring(0, i + 1);
				break;
			}
		return str;
	};

	this.htmlEscape = function(html) {
		return String(html)
			.replace(/&/g, "&amp;")
			.replace(/"/g, "&quot;")
			.replace(/</g, "&lt;")
			.replace(/>/g, "&gt;");
	};
	
	this.urlEncode = function(toencode){
		return escape(toencode).replace(/\//g, "%2F").replace(/\+/g, "%2B");
	};
	
	this.traverse = function traverse(obj, func, parent) {
		for(var i in obj){
			func.apply(this,[i,obj[i],parent]);	
			if (obj[i] instanceof Object && !(obj[i] instanceof Array)) {
				traverse(obj[i],func, i);
			}
		}
	};

	this.getPropertyRecursive = function(obj, property){
		var acc = [];
		this.traverse(obj, function(key, value, parent){
			if(key === property){
				acc.push({parent: parent, value: value});
			}
		});
		return acc;
	};
};