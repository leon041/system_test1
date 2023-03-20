const express = require('express');
const bodyParser = require('body-parser');

const queryAdmin = require('../../../config/query-admin');
const queryTeamUser = require('../../../config/query-teamuser');

const router = express.Router();
router.use(bodyParser.urlencoded({extended: true}));
router.use(bodyParser.json());

router.get('/',async (req,res) =>
{
	try
	{
		const adminlist = await queryAdmin.getList(req.session.teamCode);
		const teamuserlist = await queryTeamUser.getList(req.session.teamCode);
		res.json({adminlist:adminlist,teamuserlist:teamuserlist});
	}
	catch(e)
	{
		throw e;
	}
});

module.exports = router;