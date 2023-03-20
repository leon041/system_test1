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
		console.log('=== post delete  === ');
		
		// thread check and match
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
		// post check
		if(req.body.postid == void 0 || req.body.postid == null)
		{
			return await res.redirect('/connected/public/html/thread.html');
		}
		const check_post = await queryPost.check(req.session.teamCode,req.session.threadID,req.body.postid);
		if(!check_post)
		{
			return await res.redirect('/connected/public/html/thread.html');
		}
		
		// delete
		await queryPost.del(req.session.teamCode,req.session.threadID,req.body.postid);
		res.redirect('/connected/public/html/thread.html');
	}
	catch(e)
	{
		throw e;
	}
});

module.exports = router;