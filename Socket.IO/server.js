/* Simplified stock exchange made with Socket.IO pub/sub */
const server_io = require('socket.io')(3000);

/* We measure transactions per second server side */
let transactionsPerSecond = 0;

/* Share valuations */
let shares = {
	'NFLX': 280.48,
	'TSLA': 244.74,
	'AMZN': 1720.26,
	'GOOG': 1208.67,
	'NVDA': 183.03
};

/* Define the server */
server_io.on('connection', function(socket) {
	socket.on('message', (message) => {
		/* Parse JSON and perform the action */
		let json = JSON.parse(message);
		switch (json.action) {
			case 'sub': {
				/* Subscribe to the share's value stream */
				socket.join('shares/' + json.share + '/value');
				break;
			}
			case 'buy': {
				transactionsPerSecond++;

				/* For simplicity, shares increase 0.1% with every buy */
				shares[json.share] *= 1.001;

				/* Value of share has changed, update subscribers */
				server_io.in('shares/' + json.share + '/value').send(JSON.stringify({[json.share]: shares[json.share]}));
				break;
			}
			case 'sell': {
				transactionsPerSecond++;

				/* For simplicity, shares decrease 0.1% with every sale */
				shares[json.share] *= 0.999

				server_io.in('shares/' + json.share + '/value').send(JSON.stringify({[json.share]: shares[json.share]}));
				break;
			}
		}
	});
});

/* Print transactions per second */
let last = Date.now();
setInterval(() => {
	transactionsPerSecond /= ((Date.now() - last) * 0.001)
	console.log("Transactions per second: " + transactionsPerSecond + ", here are the curret shares:");
	console.log(shares);
	console.log("");
	transactionsPerSecond = 0;
	last = Date.now();
}, 1000);