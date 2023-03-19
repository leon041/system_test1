const query = require('./query');
const status = require('./constant').labelstatus;
const type = require('./constant').labeltype;

async function checkLabel(mail,labelID)
{
	console.log('checkLabel start : mail=' + mail+',labelID='+labelID);
	const command = "select count(*) from labelbook where mail=$1 and labelID=$2 and labelStatus<>$3;";
	
	const result = await query(command,[mail,labelID,status.Deleted]);
	const count = result.rows[0]['count'];
	console.log('count : '+count);
	if(count == 0)
	{
		return false;
	}
	else if (count == 1) return true;
	else 
	{
		console.log('error labe : mail=' + mail+',labelID='+labelID);
		return false;
	}
}
async function createLabelID(mail)
{
	const command = "select max(labelID) from labelbook where mail=$1";
	const result = await query(command,[mail]);
	if(result.rows[0]['max'] === null) return 1;
	else return result.rows[0]['max']+1;
}

async function insertLabel(mail,label,labelType,labelStatus)
{
	const labelID = await createLabelID(mail);
	console.log('insertLabel start : mail=' + mail+',labelID='+labelID+',label='+label);
	
	const command = "insert into labelbook values ($1,$2,$3,$4,$5);";
	
	const result = await query(command,[mail,labelID,label,labelType,labelStatus]);
	console.log('insertLabel completed : mail=' + mail+',labelID='+labelID+',label='+label);
	return labelID;
	
}


async function getLabelList(mail)
{
	console.log('getLabelList start : mail=' + mail);
	
	const command = "select labelID,label,labelType,labelStatus from labelbook where mail=$1 and labelstatus<>$2;";
	
	const result = await query(command,[mail,status.Deleted]);
	console.log('getLabelList completed : mail=' + mail);
	return result.rows;
}


async function deleteLabel(mail,labelID)
{
	console.log('deleteLabel start : mail=' + mail+',labelID='+labelID);
	
	const command = "update labelbook set labelStatus=$1 where mail=$2 and labelID=$3;";
	
	const result = await query(command,[status.Deleted,mail,labelID]);
	console.log('deleteLabel completed : mail=' + mail+',labelID='+labelID);
}


async function changeLabelStatus(mail,labelID,status)
{
	console.log('changeLabelStatus start : mail=' + mail+',labelID='+labelID+',after='+after);
	
	const command = "update labelbook set labelStatus="+after+" where mail='"+mail+"' and labelID="+labelID+";";
	
	const result = await query(command);
	console.log('changeLabelStatus completed : mail=' + mail+',labelID='+labelID+',after='+after);
}

async function setDefault(mail)
{
	await insertLabel(mail,'anon',type.Non,status.Default);
	await insertLabel(mail,'mail',type.Mail,status.Available);
}

async function changeDefault(mail,labelID)
{
	console.log('changeDefault start : mail=' + mail+',labelID='+labelID);
	
	const command1 = "update labelbook set labelStatus=$1 where mail=$2 and labelStatus=$3;";
	const result1 = await query(command1,[status.Available,mail,status.Default]);
	
	const command2 = "update labelbook set labelStatus=$1 where mail=$2 and labelID=$3;";
	const result2 = await query(command2,[status.Default,mail,labelID]);
	
	console.log('changeDefault completed : mail=' + mail+',labelID='+labelID);
}
const queryLabel = 
{
	check:checkLabel,
	insert:insertLabel,
	getList:getLabelList,
	del:deleteLabel,
	changeLabelStatus:changeLabelStatus,
	changeDefault : changeDefault,
	setDefault : setDefault
};

module.exports = queryLabel;