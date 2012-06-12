
exports.billing_info = {
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

exports.account_code = "testAccount";
exports.create_account_details = {
	"account_code": exports.account_code,
	"username": "testUser",
	"email": "testemail@testemail.com",
	"first_name": "FirstName",
	"last_name": "LastName",
	"company_name": "CompanyName",
	"accept_language": "en-us,en;q=0.5",
	"billing_info" : exports.billing_info
};

exports.update_account_details = {
	"username": "test_user",
	"email": "testers_email@testemail.com",
	"first_name": "First_Name",
	"last_name": "Last_Name",
	"company_name": "Company_Name"
};
