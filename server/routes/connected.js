const express = require('express');
const router = express.Router();
const path = require('path');
const queryUser = require('../config/query-user');
const queryLabel = require('../config/query-label');
const queryTeam = require('../config/query-team');
const queryTeamUser = require('../config/query-teamuser');
const queryThread = require('../config/query-thread');


router.use(commonFunc);

router.use('/public',express.static(path.join(__dirname,'./connected/public')));

router.use('/auth',require(path.join(__dirname,'./connected/auth')));
router.use('/db',require(path.join(__dirname,'./connected/db')));
router.use('/json',require(path.join(__dirname,'./connected/json')));

router.post('/thread',threadConnection);

async function commonFunc(req,res,next)
{
	console.log(' ===== common middle of connected router ===== ');
	// common middle 
	// exist ? 
	if(req.session.mail == void 0 || req.session.mail == null)
	{
		return await res.redirect('/connecting');
	}
	if(req.session.teamCode == void 0 || req.session.teamCode == null)
	{
		return await res.redirect('/connecting');
	}
	try
	{
		// check 
		const mail = req.session.mail;
		const user_check = await queryUser.check(mail);
		if(!user_check)
		{
			// first met user
			await queryUser.insert(mail);
			await queryLabel.setDefault(mail);
		}
		const teamCode = req.session.teamCode;
		const team_check = await queryTeam.check(teamCode);
		if(!team_check)
		{
			await res.redirect('/first');
		}
		
		
		const teamuser_check = await queryTeamUser.check(teamCode,mail);
		if(!teamuser_check)
		{
			// this mail is not allowed to access by this team admin.
			return res.status(403).send('error happend. you have no permittion to enter this team s chat page.');
		}
		if(req.session.userHash == void 0 || req.session.userHash == null)
		{
			const userHash = await queryUser.getHash(mail);
			req.session.userHash = userHash;
		}
		if(req.session.teamHash == void 0 || req.session.teamHash == null)
		{
			const teamHash = await queryTeam.getHash(teamCode);
			req.session.teamHash = teamHash;
		}
		
		
		const user_match = await queryUser.match(mail,req.session.userHash);
		if(!user_match)
		{
			return res.status(403).send('error happend. you send wrong your mail');
		}
		const team_match = await queryTeam.match(teamCode,req.session.teamHash);
		if(!team_match)
		{
			return res.status(403).send('error happend. you send wrong your teamCode');
		}
		
	}
	catch(e)
	{
		next(e);
	}
	next();
}
async function threadConnection(req,res)
{
	try
	{
		console.log(' === threadConnection === ');
		console.log(req.body);
		if(req.body.threadID == void 0 || req.body.threadID == null)
		{
			return await res.redirect('/connected/public/html/home.html');
		}
		const check_thread = await queryThread.check(req.session.teamCode,req.body.threadID);
		if(!check_thread)
		{
			return await res.redirect('/connected/public/html/home.html');
		}
		req.session.threadID = req.body.threadID;
		req.session.threadHash = await queryThread.getHash(req.session.teamCode,req.body.threadID);
		
		res.redirect('/connected/public/html/thread.html');
	}
	catch(e)
	{
		throw e;
	}
}

module.exports = router;