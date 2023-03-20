const express = require('express');
const session = require('express-session');
const morgan = require('morgan');
const PORT = process.env.PORT || 5000;
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');


const app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(morgan('combined'));

const session_opt={
	secret:'IalCEdrlpIIZMFj68xT47op2u6_pWalryFf2L62xZMRnzvyC2_N19fdz6JLnxlAaBLvsxwuK4N3kb-LG-VyELO5KwNpazARkBrce',
	resave: false,
	saveUninitialized: false,
	cookie: {maxAge: 1000*60*15}
};
app.use(session(session_opt));

app.use('/connected',require('./routes/connected'));
app.use('/connecting',require('./routes/connecting'));
app.use('/first',require('./routes/first'));

app.get('/',(req,res) => { res.redirect('/connected/public/html/home.html'); } );

app.get('/ok',(req,res) =>
{
	res.send('ok');
});



app.listen(PORT, ()=> console.log("listen started:" + PORT));