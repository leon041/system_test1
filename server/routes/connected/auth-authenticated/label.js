const express = require('express');
const bodyParser = require('body-parser');

const queryLabel = require('../../../config/query-label');
const queryTeamUser = require('../../../config/query-teamuser');
const status = require('../../../config/constant').labelstatus;

const router = express.Router();
router.use(bodyParser.urlencoded({extended: true}));
router.use(bodyParser.json());

function labelRes(res) { res.redirect('/connected/public/html/user.html'); };
router.post('/add',async (req,res) =>
{
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

module.exports = router;