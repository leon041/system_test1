const secret = '2-V5GnjdoZbLW2Uq7iIIBDkCYMwOcLZ83u24go-Ea7bQ7Bpu2jurKKrS7v51OaIzXBSAHJ-gJMs5auLL51GLO9d4ntchDKLus5qp';
const crypto = require('crypto');
const dateUtils = require('date-utils');
const query = require('./query');


async function checkThread(teamCode,threadID)
{
	console.log('checkThread start : teamCode=' + teamCode+',threadID='+threadID);
	const command = "select count(*) from threadbook where teamCode=$1 and threadID=$2;";
	
	const result = await query(command,[teamCode,threadID]);
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
async function createThreadID(teamCode)
{
	const command = "select max(threadID) from threadbook where teamCode=$1;";
	const result = await query(command,[teamCode]);
	if(result.rows[0]['max'] === null) return 1;
	else return result.rows[0]['max']+1;
}


// hashâªïsóvÅ@é©ìÆÇ≈hashê∂ê¨
async function insertThread(teamCode,threadTitle,mail,labelID)
{
	console.log('insertThread start : teamCode=' + teamCode+',threadTitle='+threadTitle+',mail='+mail+',labelID='+labelID);
	const threadID = await createThreadID(teamCode);
	const threadHash = ''+crypto.createHash('sha256').update(teamCode+threadID+secret).digest('hex');
	const now = (new Date()).toFormat('YYYY-MM-DD HH24:MI:SS');
	const command = "insert into threadbook values ($1,$2,$3,$4,$5,$6,$7);";
	
	const result = await query(command,[teamCode,threadID,threadTitle,threadHash,now,mail,labelID]);
	console.log('insertThread completed : teamCode=' + teamCode+',threadTitle='+threadTitle+',mail='+mail+',labelID='+labelID);
	
}

const type = require('./constant').labeltype;
async function getThreadList(teamCode)
{
	console.log('getThreadList start : teamCode=' + teamCode);
	const command = "select threadbook.threadID,threadbook.threadTitle,threadbook.creationDate,labelbook.label,labelbook.labeltype, labelbook.mail "+
		" from threadbook"+
		" inner join labelbook on threadbook.mail=labelbook.mail and threadbook.labelID=labelbook.labelID "+
		" and teamCode=$1;";
	const result = await query(command,[teamCode]);
	
	for(let i = 0;i < result.rows.length;i++)
	{
		if(result.rows[i].labeltype == type.Non)
		{
			result.rows[i].mail = void 0;
		}
	}
	
	console.log('getThreadList completed : teamCode=' + teamCode);
	return result.rows;
}


async function getThreadHash(teamCode,threadID)
{
	console.log('getThreadHash start : teamCode=' + teamCode+',threadID='+threadID);
	const command = "select threadHash from threadbook where teamCode=$1 and threadID=$2;";
	const result = await query(command,[teamCode,threadID]);
	console.log('getThreadHash completed : teamCode=' + teamCode+',threadID='+threadID);
	return result.rows[0]['threadhash'];
}

const constant = require('./constant');
async function getThreadInfo(teamCode,threadID)
{
	console.log('getThreadCreationInfo start : teamCode=' + teamCode+',threadID='+threadID);
	const command = "select threadbook.threadTitle, threadbook.creationDate,labelbook.label,labelbook.labelType, labelbook.mail from threadbook inner join labelbook on "+
					"teamCode=$1 and threadID=$2 and threadbook.labelID=labelbook.labelID;";
	const result = await query(command,[teamCode,threadID]);
	const res = result.rows[0];
	if(res.labeltype == constant.labeltype.Non)
	{
		res.mail = void 0;
	}
	
	console.log('getThreadHash completed : teamCode=' + teamCode+',threadID='+threadID);
	return res;
}

async function matchThread(teamCode,threadID,threadHash)
{
	console.log('mathThread start : teamCode=' + teamCode+',threadID='+threadID);
	const temp = ''+crypto.createHash('sha256').update(teamCode+threadID+secret).digest('hex');
	const command = "select count(*) from threadbook where teamCode=$1 and threadID=$2;";
	
	const result = await query(command,[teamCode,threadID]);
	const count = result.rows[0]['count'];
	if(count == 0)
	{
		console.log('thread does not match : teamCode=' + teamCode+',threadID='+threadID);
		return false;
	}
	else if (count == 1)
	{
		if(threadHash !== temp)
		{
			return false;
		}
		else return true;
	}
	else
	{
		console.log('error thread : teamCode=' + teamCode+',threadID='+threadID);
		return false;
	}
	
}


async function changeThreadTitle(teamCode,threadID,threadHash,after)
{
	console.log('changeThreadTitle start : teamCode=' + teamCode+',threadID='+threadID+'after='+after);
	const command = "update threadbook set threadTitle=$1 where teamCode=$2 and threadID=$3;";
	const match = await matchThread(teamCode,threadID,threadHash);
	if(!match) return;
	const result = await query(command,[after,teamCode,threadID]);
	console.log('changeThreadTitle completed : teamCode=' + teamCode+',threadID='+threadID+'after='+after);
}
async function deleteThread(teamCode,threadID)
{
	console.log('deleteThread start : teamCode=' + teamCode+',threadID='+threadID);
	const command = "delete from threadbook where teamCode=$1 and threadID=$2;";
	
	const result = await query(command,[teamCode,threadID]);
	console.log('deleteThread completed : teamCode=' + teamCode+',threadID='+threadID);
}

const queryThread = 
{
	check:checkThread,
	insert:insertThread,
	getList:getThreadList,
	getInfo:getThreadInfo,
	getHash:getThreadHash,
	match:matchThread,
	changeTitle:changeThreadTitle,
	del:deleteThread
};

module.exports = queryThread;