const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const queryAdmin = require('../../config/query-admin');

const crypto = require('crypto');

const router = express.Router();
router.use(bodyParser.urlencoded({extended: true}));
router.use(bodyParser.json());

router.use('/authenticated/*',async (req,res,next) =>
{
	console.log('=== authetication === ');
	try
	{
		console.log(req.session);
		if(req.session.token == void 0 || req.session.token == null)
		{
			return await res.status(401).redirect('/connected/public/html/auth.html');
		}
		const matchToken = await queryAdmin.matchToken(await req.session.teamCode,await req.session.mail,await req.session.token);
		if(!matchToken)
		{
			console.log('failure to authenticate');
			return await res.status(401).redirect('/connected/public/html/auth.html');
		}
		console.log('success to authenticate');
		req.session.token = await queryAdmin.updateToken(req.session.teamCode,req.session.mail);
		next();
	}
	catch(e)
	{
		next(e);
	}
});

router.use('/authenticated/',express.static(path.join(__dirname,'./auth-authenticated/admin')));

router.use('/authenticated/teamuser/',require(path.join(__dirname,'./auth-authenticated/teamuser')));

router.use('/authenticated/admin/',require(path.join(__dirname,'./auth-authenticated/admin')));

router.use('/authenticated/changePassword',require(path.join(__dirname,'./auth-authenticated/changePassword')));

router.use('/authenticated/post',require(path.join(__dirname,'./auth-authenticated/post')));

router.use('/authenticated/thread',require(path.join(__dirname,'./auth-authenticated/thread')));

router.use('/authenticated/admin.json',require(path.join(__dirname,'./auth-authenticated/admin-json')));

router.use('/authenticated/label',require(path.join(__dirname,'./auth-authenticated/label')));

router.post('/authenticated/logout',async (req,res,next) =>
{
	try
	{
		console.log('=== logout === ');
		req.session.token = void 0;
		await queryAdmin.updateToken(req.session.teamCode,req.session.mail);
		res.redirect('/');
	}
	catch
	{
		throw e;
	}
});

router.post('/login',async (req,res) =>
{
	try
	{
		console.log('=== login === ');
		if(req.body.password == void 0 || req.body.password == null)
		{
			return await res.status(401).redirect('/connected/public/html/auth.html');
		}
		const match = await queryAdmin.match(req.session.teamCode,req.session.mail,req.body.password);
		if(!match)
		{
			console.log('failure to authenticate ');
			return await res.status(401).redirect('/connected/public/html/auth.html');
		}
		console.log('success to authenticate');
		req.session.token =await queryAdmin.updateToken(req.session.teamCode,req.session.mail);
		return await res.status(200).redirect('/connected/auth/authenticated/html/admin.html');
	}
	catch(e)
	{
		throw e;
	}
});

router.get('/isAdmin', async (req,res) =>
{
	if(req.session.token == void 0 || req.session.token == null)
	{
		return await res.json({result:'false'});
	}
	const matchToken = await queryAdmin.matchToken(await req.session.teamCode,await req.session.mail,await req.session.token);
	if(!matchToken)
	{
		return await res.json({result:'false'});
	}
	
	req.session.token = await queryAdmin.updateToken(req.session.teamCode,req.session.mail);
	return await res.json({result:'true'});
	
});

module.exports = router;