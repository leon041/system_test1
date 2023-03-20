const secret = '0LaBneJbqYCm0slqN_bpem3pncrp2Rf1cSw_blvQWUh8_nw7bHW1JJeRiD8yrvWJn7S5w5h3k50uWi-yqZ_9HOP8m4oM39FeGQuv';
const crypto = require('crypto');
const query = require('./query');

// in userbook , does the mail exist ? : bool
async function checkMail(mail)
{
	console.log('checkMail : ' + mail);
	const command = "select count(*) from userbook where mail=$1;";
	
	const result = await query(command,[mail]);
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
// hashâªïsóvÅ@é©ìÆÇ≈hashê∂ê¨
async function insertUser(mail)
{
	console.log('insertUser start : ' + mail);
	
	const userHash = ''+crypto.createHash('sha256').update(mail+secret).digest('hex');
	const command = "insert into userbook values ($1,$2);";
	
	const result = await query(command,[mail,userHash]);
	console.log('insertUser completed : ' + mail);
	
}

// userIDÇ∆userHashÇÃêÆçáÇÇ∆ÇÈ
async function matchUser(mail,userHash)
{
	console.log('matchUser start : mail='+mail);
	const temp = ''+crypto.createHash('sha256').update(mail+secret).digest('hex');
	const command = "select count(*) from userbook where mail=$1 and userHash=$2";
	
	const result = await query(command,[mail,temp]);
	const count = result.rows[0]['count'];
	if(count == 0) return false;
	else if (count == 1)
	{
		if(userHash !== temp) return false;
		else return true;
	}
	else 
	{
		console.log('error mail : mail='+mail);
		return false;
	}
	
}

async function getUserHash(mail)
{
	const check_mail = await checkMail(mail);
	if(!check_mail) return null;
	const command = "select * from userbook where mail=$1";
	const result = await query(command,[mail]);
	return result.rows[0]['userhash'];
}

const queryUser = 
{
	check:checkMail,
	insert:insertUser,
	match:matchUser,
	getHash:getUserHash
};

module.exports = queryUser;

