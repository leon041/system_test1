const express = require('express');
const bodyParser = require('body-parser');

const queryAdmin = require('../../../config/query-admin');

const router = express.Router();
router.use(bodyParser.urlencoded({extended: true}));
router.use(bodyParser.json());

router.post('/',async (req,res) =>
{
	try
	{
		console.log('=== admin password change  === ');
		
		// body check and match
		console.log(req.body);
		if(req.body.cur_pass == void 0 || req.body.cur_pass == null)
		{
			return await res.redirect('/connected/auth/authenticated/html/admin.html');
		}
		if(req.body.new_pass == void 0 || req.body.new_pass == null)
		{
			return await res.redirect('/connected/auth/authenticated/html/admin.html');
		}
		const match_admin = await queryAdmin.match(req.session.teamCode,req.session.mail,req.body.cur_pass);
		if(!match_admin)
		{
			return await res.redirect('/connected/auth/authenticated/html/admin.html');
		}
		
		// delete
		await queryAdmin.changePass(req.session.teamCode,req.session.mail,req.body.new_pass);
			return await res.redirect('/connected/auth/authenticated/html/admin.html');
	}
	catch(e)
	{
		throw e;
	}
});

module.exports = router;