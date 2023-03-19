const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const queryTeam = require(path.join(__dirname,'../../config/query-team'));
const queryThread = require(path.join(__dirname,'../../config/query-thread'));
const queryLabel = require(path.join(__dirname,'../../config/query-label'));
const queryPost = require(path.join(__dirname,'../../config/query-post'));
const status = require('../../config/constant').labelstatus;
const type = require('../../config/constant').labeltype;


const router = express.Router();
router.use(bodyParser.urlencoded({extended: true}));
router.use(bodyParser.json());

router.post('/createThread',async (req,res) =>
{
	if(req.body.threadTitle == void 0 || req.body.threadTitle == null)
	{
		return await res.redirect('/connected/public/html/home.html');
	}
	if(req.body.labelID == void 0 || req.body.labelID == null)
	{
		return await res.redirect('/connected/public/html/home.html');
	}
	const label_check = await queryLabel.check(req.session.mail,req.body.labelID);
	if(!label_check)
	{
		return await res.redirect('/connected/public/html/home.html');
	}
	await queryThread.insert(req.session.teamCode,req.body.threadTitle,req.session.mail,req.body.labelID);
	res.status(200).redirect('/connected/public/html/home.html');
});

router.post('/post',async (req,res) =>
{
	// thread check and match
	if(req.session.threadID == void 0 || req.session.threadID == null)
	{
		return await res.redirect('/connected/public/html/home.html');
	}
	if(req.session.threadHash == void 0 || req.session.threadHash == null)
	{
		return await res.redirect('/connected/public/html/home.html');
	}
	const check_thread = await queryThread.check(req.session.teamCode,req.session.threadID);
	if(!check_thread)
	{
		return await res.redirect('/connected/public/html/home.html');
	}
	const match_thread = await queryThread.match(req.session.teamCode,req.session.threadID,req.session.threadHash);
	if(!match_thread)
	{
		return await res.redirect('/connected/public/html/home.html');
	}
	
	// post check
	if(req.body.posttext == void 0 || req.body.posttext == null)
	{
		return await res.redirect('/connected/public/html/thread.html');
	}
	if(req.body.labelID == void 0 || req.body.labelID == null)
	{
		return await res.redirect('/connected/public/html/thread.html');
	}
	const label_check = await queryLabel.check(req.session.mail,req.body.labelID) || parseInt(req.body.labelID) == 1;
	if(!label_check)
	{
		return await res.redirect('/connected/public/html/thread.html');
	}
	
	// insert post
	await queryPost.insert(req.session.teamCode,req.session.threadID,req.body.posttext,req.session.mail,req.body.labelID,req.session.threadHash);
	res.redirect('/connected/public/html/thread.html');
});

function labelRes(res) { res.redirect('/connected/public/html/user.html'); };
router.post('/label/add',async (req,res) =>
{
	console.log(' === label add === ');
	try
	{
		
		if(req.body.label == void 0 || req.body.label == null)
		{
			return await labelRes(res);
		}
		if(req.body.labeltype == void 0 || req.body.labeltype == null)
		{
			return await labelRes(res);
		}
		if(req.body.labelstatus == void 0 || req.body.labelstatus == null)
		{
			return await labelRes(res);
		}
		if(req.body.labeltype == type.Admin)
		{
			return await labelRes(res);
		}
		const labelID = await queryLabel.insert(req.session.mail,req.body.label,req.body.labeltype,req.body.labelstatus);
		if(req.body.labelstatus == status.Default)
		{
			
			await queryLabel.changeDefault(req.session.mail,labelID);
		}
		labelRes(res);
	}
	catch(e)
	{
		throw e;
	}
});

router.post('/label/delete',async (req,res) =>
{
	console.log(' === label delete === ');
	try
	{
		if(req.body.labelid == void 0 || req.body.labelid == null)
		{
			return await labelRes(res);
		}
		const label_check = await queryLabel.check(req.session.mail,req.body.labelid);
		if(!label_check)
		{
			return await labelRes(res);
		}
		await queryLabel.del(req.session.mail,req.body.labelid);
		labelRes(res);
	}
	catch(e)
	{
		throw e;
	}
});


module.exports = router;