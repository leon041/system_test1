const {Pool} = require('pg');

const connectionString = 'postgres://kw:bLLeHW6ohGUJDH1yvdTO0bErD1IPDE8N@dpg-ce8mhqen6mposnkula7g-a/actdb';
//const connectionString = 'postgres://test_user:test\@KW@localhost:5432/test_user';
const pool = new Pool(
{
	connectionString:connectionString,
	max:5,
	idleTimeoutMillis:1000*10
});

// log pool counts 
function poolCountLog()
{
	console.log('pool count log');
	console.log('  total count : ' ,pool.totalCount);
	console.log('  idle count : ' ,pool.idleCount);
	console.log('  waiting count : ' ,pool.waitingCount);
}
async function query(q,values)
{
	// connection 
	//console.log('db pool connecting...');
	const connect = await pool.connect();
    //poolCountLog();
    
    // query 
    //console.log('query : ' , q);
	const result = await connect.query(q,values);
	
	// release
	//console.log('db pool releasing...');
    connect.release();
    //poolCountLog();

	return result;
}

module.exports = query;
