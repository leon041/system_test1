const express = require('express');
const router = express.Router();
const path = require('path');
const bodyParser = require('body-parser');
const queryAdmin = require('../config/query-admin');
const queryUser = require('../config/query-user');
const queryTeam = require('../config/query-team');
const queryTeamUser = require('../config/query-teamuser');
const queryLabel = require('../config/query-label');
const constant = require('../config/constant');

router.use(bodyParser.urlencoded({extended: true}));
router.use(bodyParser.json());
router.use('/',express.static(path.join(__dirname,'./first/')));
router.get('/' , async (req,res) =>
{
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
		const teamCode = req.session.teamCode;
		const user_check = await queryUser.check(mail);
		const team_check = await queryTeam.check(teamCode);
		const admin_list = await queryAdmin.getList(teamCode);
		if(!user_check)
		{
			// first meet this mail
			return await res.redirect('/');
		}
		if(team_check)
		{
			return await res.status(403).send('error happend. this team has already registered.');
		}
		if(admin_list.length !== 0)
		{
			return await res.status(403).send('error happend. this team has already registered.');
		}
		
		
		res.redirect('/first/welcome.html');
		
	}
	catch(e)
	{
		throw e;
	}
});

router.post('/post',async (req,res) =>
{
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
		const teamCode = req.session.teamCode;
		const user_check = await queryUser.check(mail);
		const team_check = await queryTeam.check(teamCode);
		const admin_list = await queryAdmin.getList(teamCode);
		if(!user_check)
		{
			// first meet this mail
			return await res.redirect('/');
		}
		if(team_check)
		{
			return await res.status(403).send('error happend. this team has already registered.');
		}
		if(admin_list.length !== 0)
		{
			return await res.status(403).send('error happend. this team has already registered.');
		}
		
		if(req.body.password == void 0 || req.body.password == null)
		{
			return await res.status(403).send('error happend. you have to send password');
		}
		if(req.body.title == void 0 || req.body.title == null)
		{
			return await res.status(403).send('error happend. you have to send title');
		}
		await queryTeam.insert(req.session.teamCode,req.body.title);
		await queryTeamUser.insert(teamCode,mail);
		await queryAdmin.insert(req.session.teamCode,req.session.mail,req.body.password);
		await queryLabel.insert(req.session.mail,'admin',constant.labeltype.Admin,constant.labelstatus.Available);
		res.redirect('/');
	}
	catch(err)
	{
		throw err;
	}
});

module.exports = router;