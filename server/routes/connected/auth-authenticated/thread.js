const express = require('express');
const bodyParser = require('body-parser');

const queryPost = require('../../../config/query-post');
const queryThread = require('../../../config/query-thread');

const router = express.Router();
router.use(bodyParser.urlencoded({extended: true}));
router.use(bodyParser.json());

router.post('/delete',async (req,res) =>
{
	try
	{
		console.log('=== thread delete  === ');
		
		console.log(req.body);
		// thread check and match
		if(req.body.threadid == void 0 || req.body.threadid == null)
		{
			return await res.redirect('/connected/public/html/home.html');
		}
		const check_thread = await queryThread.check(req.session.teamCode,req.body.threadid);
		if(!check_thread)
		{
			return await res.redirect('/connected/public/html/home.html');
		}
		// delete
		await queryPost.delByThread(req.session.teamCode,req.body.threadid);
		await queryThread.del(req.session.teamCode,req.body.threadid);
		res.redirect('/connected/public/html/home.html');
	}
	catch(e)
	{
		throw e;
	}
});

module.exports = router;