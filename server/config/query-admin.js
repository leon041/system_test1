const query = require('./query');
const crypto = require('crypto');
const dateUtils = require('date-utils');
const secret = 'elYRjE7RHW5YwjnqkcEjpzGUFkSInrRvcUjvjJpD2mwB67f_ZmmLj90kuxdLnIgKA5yY423SfwSO5bau_-ZMUxziUWMkpRNPNC3Z';
const secret2 = 'ig9cgMQn40kxoPeSfopuTjc5hmzB1BWlTwEkSxTeundlCC60GJUk5ijiNBbbfiq82HCdKsRg9agLDdZ7KX4x_O9_dpz15Bo8RWk-';

function getHashPass(teamCode,mail,pass)
{
	return ''+crypto.createHash('sha256').update(teamCode+mail+pass+secret).digest('hex');
}

async function checkAdmin(teamCode,mail)
{
	console.log('checkAdmin start : mail=' + mail+', teamCode='+teamCode);
	const command = "select count(*) from adminbook where teamCode=$1 and mail=$2;";
	
	const result = await query(command,[teamCode,mail]);
	const count = parseInt(result.rows[0]['count']);
	console.log('count : '+count);
	if(count == 0)
	{
		return false;
	}
	else if (count == 1) return true;
	else 
	{
		console.log('error user : ' + mail);
		return false;
	}
}

async function insertAdmin(teamCode,mail,pass)
{
	console.log('insertAdmin start : teamCode='+teamCode+'mail=' + mail);
	const now = (new Date()).toFormat('YYYY-MM-DD HH24:MI:SS');
	const hashPass = getHashPass(teamCode,mail,pass);
	const token = ''+crypto.createHash('sha256').update(teamCode+mail+now+secret2).digest('hex');
	const command = "insert into adminbook values ($1,$2,$3,$4);";
	
	const result = await query(command,[teamCode,mail,hashPass,token]);
	console.log('insertAdmin completed : teamCode='+teamCode+',mail=' + mail);
	
}


async function updateAdminToken(teamCode,mail)
{
	console.log('updateAdminToken start : teamCode='+teamCode+',mail=' + mail);
	const now = (new Date()).toFormat('YYYY-MM-DD HH24:MI:SS');
	const token = ''+crypto.createHash('sha256').update(teamCode+mail+now+secret2).digest('hex');
	const command = "update adminbook set token=$1 where teamCode=$2 and mail=$3;";
	
	const result = await query(command,[token,teamCode,mail]);
	console.log('updateAdminToken completed : teamCode='+teamCode+',mail=' + mail);
	return token;
}
async function matchAdminToken(teamCode,mail,token)
{
	console.log('matchAdminToken start : teamCode='+teamCode+',mail=' + mail);
	const command = "select count(*) from adminbook where teamCode=$1 and mail=$2 and token=$3;";
	
	const result = await query(command,[teamCode,mail,token]);
	count = parseInt(result.rows[0]['count']);
	console.log('count : '+ count);
	if(count == 0)
	{
		return false;
	}
	else if (count == 1) return true;
	else 
	{
		console.log('error user :teamCode='+teamCode+',mail=' + mail);
		return false;
	}
}

async function getAdminList(teamCode)
{
	console.log('getAdminList start : teamCode='+teamCode);
	
	const command = "select mail from adminbook where teamCode='"+teamCode+"';";
	
	const result = await query(command);
	console.log('getAdminList completed : teamCode='+teamCode);
	return result.rows;
}

async function deleteAdmin(teamCode,mail)
{
	console.log('deleteAdmin start : teamCode='+teamCode+',mail=' + mail);
	
	const command = "delete from adminbook where teamCode=$1 and mail=$2;";
	
	const result = await query(command,[teamCode,mail]);
	console.log('deleteAdmin completed : teamCode='+teamCode+',mail=' + mail);
}

// no need hashed password
async function matchAdmin(teamCode,mail,pass)
{
	console.log('checkAdmin start : teamCode='+teamCode+', mail='+mail);
	const hashPass = getHashPass(teamCode,mail,pass);
	const command = "select count(*) from adminbook where teamCode=$1 and mail=$2 and password=$3;";
	
	const result = await query(command,[teamCode,mail,hashPass]);
	const count = result.rows[0]['count'];
	console.log('count : '+count);
	if(count == 0)
	{
		return false;
	}
	else if (count == 1) return true;
	else 
	{
		console.log('error user : ' + mail);
		return false;
	}
}

async function changeAdminPass(teamCode,mail,after)
{
	console.log('changeAdminPass start : teamCode=' + teamCode+',mail='+mail);
	const hashPass = getHashPass(teamCode,mail,after);
	const command = "update adminbook set password=$1 where teamCode=$2 and mail=$3;";

	const result = await query(command,[hashPass,teamCode,mail]);
	console.log('changeAdminPass completed : teamCode=' + teamCode+',mail='+mail);
}
const queryAdmin =
{
	check: checkAdmin,
	insert:insertAdmin,
	updateToken:updateAdminToken,
	matchToken:matchAdminToken,
	getList:getAdminList,
	del : deleteAdmin,
	match: matchAdmin,
	changePass:changeAdminPass
};

module.exports = queryAdmin;