const express = require('express');
const router = express.Router();
const path = require('path');
const crypto = require('crypto');

const queryUser = require('../config/query-user');
const queryTeam = require('../config/query-team');
const queryTeamUser = require('../config/query-teamuser');

const secret = 'B2zbnpIW0hI5azv8DZC-7rlVIRWsc79J8eCf9vZByKoYpjjwoWUWESMOL5He0tyCM6oF3-yQhqMoB7T8S75_lg2PJmWTrxdN9d7U';
const secret2 = '7Vhw-1CWksWzgmFd42dbam3GEotm7DwVrA1Wo0RdLqCGUQmN60L7o2zBF9vfS7h2yUmQlDDOKMQsFit5taup7G1vqaaBzNMARvod';
function getConnectHash(connectsecret)
{
	return ''+crypto.createHash('sha256').update(connectsecret+secret).digest('hex');
}
function getConnectSecret()
{
	const now = (new Date()).toFormat('YYYY-MM-DD HH24:MI:SS');
	return ''+crypto.createHash('sha256').update(secret2 + now).digest('hex');
}
router.get('/',(req,res) =>
{
	const connectsecret = getConnectHash();
	req.session.connectsecret = connectsecret;
	req.session.connecthash = getConnectHash(connectsecret);
	res.sendFile(path.join(__dirname, './connecting/connect.html'));
});


router.post('/post',(req,res) => 
{
	console.log('connection posted');
	console.log(req.body);
	console.log(req.session);
	if(req.session.connectsecret == void 0 || req.session.connectsecret == null) 
	{
		return res.status(403).send('error happend. you should redirect ');
	}
	if(req.session.connecthash == void 0 || req.session.connecthash == null) 
	{
		return res.status(403).send('error happend. you should redirect ');
	}
	const temp = getConnectHash(req.session.connectsecret);
	if(req.session.connecthash !== temp)
	{
		return res.status(403).send('error happend. you should redirect');
	}
	
	if(req.body.mail == void 0 || req.body.mail == null)
	{
		return res.status(403).send('error happend. you should repost ');
	}
	if(req.body.teamCode == void 0 || req.body.teamCode == null)
	{
		return res.status(403).send('error happend. you should repost ');
	}
	req.session.connectsecret = void 0;
	req.session.connecthash = void 0;
	req.session.mail = req.body.mail;
	req.session.teamCode = req.body.teamCode;
	
	res.redirect('/connected/public/html/home.html');
});

module.exports = router;