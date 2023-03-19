const query = require('./query');


async function checkTeamUser(teamCode,mail)
{
	console.log('checkTeamUser start : mail=' + mail+', teamCode='+teamCode);
	const command = "select count(*) from teamuserbook where teamCode=$1 and mail=$2;";
	
	const result = await query(command,[teamCode,mail]);
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

async function insertTeamUser(teamCode,mail)
{
	console.log('insertTeamUser start : teamCode='+teamCode+'mail=' + mail);
	
	const command = "insert into teamuserbook values ($1,$2);";
	
	const result = await query(command,[teamCode,mail]);
	console.log('insertTeamUser completed : teamCode='+teamCode+'mail=' + mail);
}
async function getTeamUserList(teamCode)
{
	console.log('getTeamUserList start :teamCode='+teamCode);
	
	const command = "select * from teamuserbook where teamCode=$1;";
	
	const result = await query(command,[teamCode]);
	console.log('getTeamUserList completed :teamCode='+teamCode);
	return result.rows;
}

async function deleteTeamUser(teamCode,mail)
{
	console.log('deleteTeamUser start : teamCode='+teamCode+'mail=' + mail);
	
	const command = "delete from teamuserbook where teamCode=$1 and mail=$2;";
	
	const result = await query(command,[teamCode,mail]);
	console.log('deleteTeamUser completed : teamCode='+teamCode+'mail=' + mail);
}

async function changeTeamUserMail(teamCode,before,after)
{
	console.log('deleteTeamUser start : teamCode='+teamCode+'before=' + before + ',after='+after);
	
	const command = "update teamuserbook set mail=$1 where teamCode=$2 and mail=$3;";
	
	const result = await query(command,[after,teamCode,before]);
	console.log('deleteTeamUser completed : teamCode='+teamCode+'before=' + before + ',after='+after);
}


const queryTeamUser =
{
	check:checkTeamUser,
	insert:insertTeamUser,
	getList:getTeamUserList,
	del : deleteTeamUser,
	changeMail:changeTeamUserMail
};

module.exports = queryTeamUser;