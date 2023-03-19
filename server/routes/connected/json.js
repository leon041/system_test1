const express = require('express');
const router = express.Router();
const path = require('path');
const queryTeam = require(path.join(__dirname,'../../config/query-team'));
const queryThread = require(path.join(__dirname,'../../config/query-thread'));
const queryPost= require(path.join(__dirname,'../../config/query-post'));
const queryLabel= require(path.join(__dirname,'../../config/query-label'));

router.get('/label.json',async (req,res) =>
{
	try
	{
		const labellist = await queryLabel.getList(req.session.mail);
		res.json({labellist:labellist,labeltype:queryLabel.type,labelstatus:queryLabel.status});
	}
	catch(e)
	{
		throw e;
	}
});

router.get('/team.json',async (req,res) =>
{
	try
	{
		const title = await queryTeam.getTitle(req.session.teamCode);
		const threadlist = await queryThread.getList(req.session.teamCode);
		const labellist = await queryLabel.getList(req.session.mail);
		res.json({labellist:labellist,title:title,threadlist:threadlist});
	}
	catch(e)
	{
		throw e;
	}
});

router.get('/thread.json',async (req,res) =>
{
	try
	{
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
		const info = await queryThread.getInfo(req.session.teamCode,req.session.threadID);
		const postlist = await queryPost.getList(req.session.teamCode,req.session.threadID);
		const labellist = await queryLabel.getList(req.session.mail);
		
		if(!(await queryPost.checkMail(req.session.teamCode,req.session.threadID,req.session.mail)))
		{
			await queryPost.insert(req.session.teamCode,req.session.threadID,'$>',req.session.mail, 1 ,req.session.threadHash);
		}
		const userthreadid =await queryPost.getUserThreadID(req.session.teamCode,req.session.threadID,req.session.mail,req.session.threadHash);
		res.json({info:info,labellist:labellist,postlist:postlist,userthreadid:userthreadid});
	}
	catch(e)
	{
		throw e;
	}
});

module.exports = router;