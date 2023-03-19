const express = require('express');
const bodyParser = require('body-parser');
const router = express();
router.use(bodyParser.urlencoded({extended: true}));
router.use(bodyParser.json());
const queryTeamUser = require('../../../config/query-teamuser');
const queryUser = require('../../../config/query-user');
const queryAdmin = require('../../../config/query-admin');
const queryLabel = require('../../../config/query-label');

router.post('/add',async (req,res) =>
{
	try
	{
		console.log('=== admin add  === ');
		if(req.body.add_mail == void 0 || req.body.add_mail == null)
		{
			return await res.status(403).send('error happend. you have to input new admin mail');
		}
		if(req.body.add_pass == void 0 || req.body.add_pass == null)
		{
			return await res.status(403).send('error happend. you have to input new admin pass');
		}
		const addmail = req.body.add_mail;
		const addpass = req.body.add_pass;
		const check_user = await queryUser.check(addmail);
		if(!check_user)
		{
			// no exisiting user
			await queryUser.insert(addmail);
			await queryLabel.setDefault(addmail);
		}
		// insert new admin
		const check_teamuser = await queryTeamUser.check(req.session.teamCode,addmail);
		if(!check_teamuser)
		{
			await queryTeamUser.insert(req.session.teamCode,addmail);
		}
		const check_admin = await queryAdmin.check(req.session.teamCode,addmail);
		if(check_admin)
		{
			return await res.redirect('/connected/auth/authenticated/html/admin.html');
		}
		await queryAdmin.insert(req.session.teamCode,addmail,addpass);
		res.redirect('/connected/auth/authenticated/html/admin.html');
	}
	catch(e)
	{
		throw e;
	}
});

router.post('/delete',async (req,res) =>
{
	try
	{
		console.log('=== admin delete  === ');
		if(req.body.del_mail == void 0 || req.body.del_mail == null)
		{
			return await res.status(403).send('error happend. you have to input new admin mail');
		}
		
		const delmail = req.body.del_mail;
		const check_admin = await queryAdmin.check(req.session.teamCode,delmail);
		if(!check_admin)
		{
			return await res.redirect('/connected/auth/authenticated/html/admin.html');
		}
		const admin_list = await queryAdmin.getList(req.session.teamCode);
		if(admin_list.length == 0)
		{
			return await res.send('serious error happend at authenticated/admin/delete. in this team, admin did not exisit.');
		}
		if(admin_list.length == 1)
		{
			return await res.send('error happend. you can not delete admin because this team has only one admin user');
		}
		await queryAdmin.del(req.session.teamCode,delmail);
		res.redirect('/connected/auth/authenticated/html/admin.html');
	}
	catch(e)
	{
		throw e;
	}
});

module.exports = router;