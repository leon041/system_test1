const secret = 'ng5ynkc9bezHrcmuoeGqkP16XA0aTibvm-MvuQbvRJdS88eTczVj2py4tJXsnfRGR3OfjRFRlvJ6AlBDE3BahJ9RDQbspvbD6t0j';
const crypto = require('crypto');
const query = require('./query');


// teamCodeÇ™Ç†ÇÈÇ©check
async function checkTeam(teamCode)
{
	console.log('checkTeam : ' + teamCode);
	const command = "select count(*) from teambook where teamCode=$1;";
	
	const result = await query(command,[teamCode]);
	const count = result.rows[0]['count'];
	console.log('count : '+count);
	if(count == 0)
	{
		return false;
	}
	else if (count == 1) return true;
	else 
	{
		console.log('error team : ' + teamCode);
		return false;
	}
}


// hashâªïsóvÅ@é©ìÆÇ≈hashê∂ê¨
async function insertTeam(teamCode,title)
{
	console.log('insertTeam start : teamCode=' + teamCode+',title='+title);
	
	const teamHash = ''+crypto.createHash('sha256').update(teamCode+secret).digest('hex');
	const command = "insert into teambook values ($1,$2,$3);";
	
	const result = await query(command,[teamCode,title,teamHash]);
	console.log('insertTeam completed : teamCode=' + teamCode+',title='+title);
	
}

// teamCodeÇ∆teamHashÇÃêÆçáÇÇ∆ÇÈ
async function matchTeam(teamCode,teamHash)
{
	console.log('matchTeam start : teamCode=' + teamCode);
	const temp = ''+crypto.createHash('sha256').update(teamCode+secret).digest('hex');
	const command = "select count(*) from teambook where teamCode=$1 and teamHash=$2;";
	
	const result = await query(command,[teamCode,temp]);
	const count = result.rows[0]['count'];
	if(count == 0) return false;
	else if (count == 1)
	{
		if(teamHash !== temp) return false;
		else return true;
	}
	else 
	{
		console.log('error team : teamCode='+teamCode);
		return false;
	}
	
}

async function changeTeamTitle(teamCode,after)
{
	console.log('changeTeamTitle start : teamCode=' + teamCode+',after='+after);
	const command = "update teambook set title=$1 where teamCode=$2;";
	
	const result = await query(command,[after,teamCode]);
	console.log('changeTeamTitle completed : teamCode=' + teamCode+',after='+after);
}

async function getTeamTitle(teamCode)
{
	console.log('getTeamTitle start : teamCode=' + teamCode);
	const command = "select title from teambook where teamCode=$1;";
	
	const result = await query(command,[teamCode]);
	console.log('getTeamTitle completed : teamCode=' + teamCode);
	return result.rows[0]['title'];
}


async function getTeamHash(teamCode)
{
	const check_team = await checkTeam(teamCode);
	if(!check_team) return null;
	const command = "select * from teambook where teamCode=$1;";
	const result = await query(command,[teamCode]);
	return result.rows[0]['teamhash'];
}
const queryTeam = 
{
	check:checkTeam,
	insert:insertTeam,
	match:matchTeam,
	changeTitle:changeTeamTitle,
	getTitle:getTeamTitle,
	getHash:getTeamHash
};

module.exports = queryTeam;
