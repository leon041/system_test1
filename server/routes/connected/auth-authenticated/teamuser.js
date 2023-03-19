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
		console.log('=== teamuser add  === ');
		if(req.body.new_mail == void 0 || req.body.new_mail == null)
		{
			return await res.status(403).send('error happend. you have to input new teamuser mail');
		}
		const nmail = req.body.new_mail;
		const check_user = await queryUser.check(nmail);
		if(!check_user)
		{
			// no exisiting user
			await queryUser.insert(nmail);
			await queryLabel.setDefault(nmail);
		}
		// insert new teamuser
		const check_teamuser = await queryTeamUser.check(req.session.teamCode,nmail);
		if(check_teamuser)
		{
			return await res.redirect('/connected/auth/authenticated/html/admin.html');
		}
		await queryTeamUser.insert(req.session.teamCode,nmail);
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
		console.log('=== teamuser delete  === ');
		if(req.body.del_mail == void 0 || req.body.del_mail == null)
		{
			return await res.status(403).send('error happend. you have to input teamuser mail you want to delete');
		}
		const dmail = req.body.del_mail;
		// delete teamuser
		const check_teamuser = await queryTeamUser.check(req.session.teamCode,dmail);
		if(!check_teamuser)
		{
			return await res.redirect('/connected/auth/authenticated/html/admin.html');
		}
		const check_admin = await queryAdmin.check(req.session.teamCode,dmail);
		if(check_admin)
		{
			return await res.send('error happend. admin user can not delete from teamuser list');
		}
		await queryTeamUser.del(req.session.teamCode,dmail);
		res.redirect('/connected/auth/authenticated/html/admin.html');
	}
	catch(e)
	{
		throw e;
	}
});

module.exports = router;