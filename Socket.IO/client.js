const SocketIO = require('socket.io-client');

/* By default we use 10% active traders, 90% passive watchers */
const numClients = 500;
const tradersFraction = 0.1;

let shares = [
	'NFLX',
	'TSLA',
	'AMZN',
	'GOOG',
	'NVDA'
];

function establishConnections(remainingClients) {

	if (!remainingClients) {
		return;
	}

	/* Current value of our share */
	let value;

	let socket = SocketIO('http://localhost:3000');
	socket.on('connect', () => {
		/* Randomly select one share this client will be interested in */
		let shareOfInterest = shares[parseInt(Math.random() * shares.length)];

		/* Subscribe to the share we are interested in */
		socket.send(JSON.stringify({action: 'sub', share: shareOfInterest}));

		/* Is this client going to be an active trader, or a passive watcher? */
		if (remainingClients <= numClients * tradersFraction) {
			/* If so, then buy and sell shares every 1ms, driving change in the stock market */
			setInterval(() => {
				/* For simplicity we just randomly buy/sell */
				if (Math.random() < 0.5) {
					socket.send(JSON.stringify({action: 'buy', share: shareOfInterest}));
				} else {
					socket.send(JSON.stringify({action: 'sell', share: shareOfInterest}));
				}
			}, 1);
		}

		establishConnections(remainingClients - 1);
	});

	socket.on('message', (message) => {
		let json = JSON.parse(message);

		/* Keep track of our one share value (even though current strategy doesn't care for value) */
		for (let share in json) {
			value = json[share];
		}
	});

	socket.on('disconnect', () => {
		console.log("We did not expect any client to disconnect, exiting!");
		process.exit();
	});
}

establishConnections(numClients);