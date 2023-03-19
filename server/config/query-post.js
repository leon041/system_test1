const query = require('./query');
const dateUtils = require('date-utils');
const mt = require('mersenne-twister');

async function createPostID(teamCode,threadID)
{
	const command = "select max(postID) from postbook where teamCode=$1 and threadID=$2;";
	const result = await query(command,[teamCode,threadID]);
	if(result.rows[0]['max'] === null) return 1;
	else return result.rows[0]['max']+1;
}

async function getNextCounter(teamCode,threadID)
{
	const command = "select max(counter) from postbook where teamCode=$1 and threadID=$2;";
	const result = await query(command,[teamCode,threadID]);
	if(result.rows[0]['max'] === null) return 1;
	else return result.rows[0]['max']+1;
}

function getRandom(threadHash,num)
{
	const seed = parseInt(threadHash.substr(0,8),16);
	const generator = new mt(seed);
	
	for(let i = 0;i < num;i++) generator.random_int31();
	return generator.random_int31();
}

async function getThreadUserInfo(teamCode,threadID,mail,threadHash)
{
	const command = "select distinct counter,userThreadID from postbook where teamCode=$1 and threadID=$2 and mail=$3;";
	const result = await query(command,[teamCode,threadID,mail]);
	if(result.rows.length == 0)
	{
		const nextCounter = await getNextCounter(teamCode,threadID);
		const nextID = await getRandom(threadHash,nextCounter);
		return {counter:nextCounter,userthreadid:nextID};
	}
	else if (result.rows.length == 1)
	{
		return result.rows[0];
	}
	else
	{
		throw new Error('èdï°ìoò^î≠ê∂ : getUserThreadID('+TeamCode+','+threadID+','+mail);
	}
}

async function checkPost(teamCode,threadID,postID)
{
	console.log('checkPost start : teamCode=' + teamCode+',threadID='+threadID+',postID='+postID);
	const command = "select count(*) from postbook where teamCode=$1 and threadID=$2 and postID=$3;";
	
	const result = await query(command,[teamCode,threadID,postID]);
	const count = result.rows[0]['count'];
	console.log('count : '+count);
	if(count == 0)
	{
		return false;
	}
	else if (count == 1) return true;
	else 
	{
		console.log('error post : teamCode=' + teamCode+',threadID='+threadID+',postID='+postID);
		return false;
	}
}

async function checkPostedMail(teamCode,threadID,mail)
{
	console.log('checkPostedMail start : teamCode=' + teamCode+',threadID='+threadID+',mail='+mail);
	const command = "select count(*) from postbook where teamCode=$1 and threadID=$2 and mail=$3;";
	
	const result = await query(command,[teamCode,threadID,mail]);
	const count = result.rows[0]['count'];
	console.log('count : '+count);
	return count > 0;
}


async function getUserThreadID(teamCode,threadID,mail,threadHash)
{
	console.log('getUserThreadID start : teamCode=' + teamCode+',threadID='+threadID+',mail='+mail);
	return (await getThreadUserInfo(teamCode,threadID,mail,threadHash))['userthreadid'];
}

// hashâªïsóvÅ@é©ìÆÇ≈hashê∂ê¨
async function insertPost(teamCode,threadID,postText,mail,labelID,threadHash)
{
	console.log('insertPost start : teamCode=' + teamCode+',threadID='+threadID+',mail='+mail+',labelID='+labelID);
	const postID = await createPostID(teamCode,threadID);
	const now = (new Date()).toFormat('YYYY-MM-DD HH24:MI:SS');
	const info = await getThreadUserInfo(teamCode,threadID,mail,threadHash);
	const count = info['counter'];
	const userThreadID = info['userthreadid'];
	const command = "insert into postbook values ($1,$2,$3,$4,$5,$6,$7,$8,$9);";
	
	const result = await query(command,[teamCode,threadID,postID,now,postText,mail,labelID,count,userThreadID]);
	console.log('insertPost completed : teamCode=' + teamCode+',threadID='+threadID+',mail='+mail+',labelID='+labelID);
	
}


const constant = require('./constant');
async function getPostList(teamCode,threadID)
{
	console.log('getPostList start : teamCode=' + teamCode+',threadID='+threadID);
	const command = "select postbook.postID ,postbook.postDate, postbook.postText, labelbook.label, labelbook.labelType, labelbook.mail, postbook.userthreadid"+
					" from postbook inner join labelbook on postbook.mail=labelbook.mail and postbook.labelID=labelbook.labelID and teamCode=$1 and threadID=$2;";
	const result = await query(command,[teamCode,threadID]);
	console.log('getPostList completed : teamCode=' + teamCode+',threadID='+threadID);
	
	const rows = result.rows;
	for(let i = 0;i < rows.length;i++)
	{
		if(rows[i].labeltype == constant.labeltype.Non)
		{
			rows[i].mail = void 0;
		}
	}
	
	return rows;
}

async function deletePost(teamCode,threadID,postID)
{
	console.log('deletePost start : teamCode=' + teamCode+',threadID='+threadID+'postID='+postID);
	const command = "delete from postbook where teamCode=$1 and threadID=$2 and postID=$3;";
	
	const result = await query(command,[teamCode,threadID,postID]);
	console.log('deletePost completed : teamCode=' + teamCode+',threadID='+threadID+'postID='+postID);
}

async function deletePostByThread(teamCode,threadID)
{
	console.log('deletePostByThread start : teamCode=' + teamCode+',threadID='+threadID);
	const command = "delete from postbook where teamCode=$1 and threadID=$2;";
	
	const result = await query(command,[teamCode,threadID]);
	console.log('deletePostByThread completed : teamCode=' + teamCode+',threadID='+threadID);
}
const queryPost = 
{
	check: checkPost,
	checkMail:checkPostedMail,
	insert : insertPost,
	getList : getPostList,
	getUserThreadID:getUserThreadID,
	del : deletePost,
	delByThread: deletePostByThread
};

module.exports = queryPost;