/* NOTE: ws as client cannot even remotely stress uWebSockets.js,
 * however we don't care for ultra correctness here as
 * Socket.IO is so pointlessly slow anyways, we simply do not care */
const WebSocket = require('ws');

/* By default we use 10% active traders, 90% passive watchers */
const numClients = 125;
const tradersFraction = 0.1;

/* 125 * 4 = 500, even though 4 instances cannot stress the server fully */
console.log("RUN 4 INSTANCES OF THIS CLIENT");

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

	let socket = new WebSocket('ws://localhost:9001');
	socket.onopen = () => {
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
	};

	socket.onmessage = (e) => {
		let json = JSON.parse(e.data);

		/* Keep track of our one share value (even though current strategy doesn't care for value) */
		for (let share in json) {
			value = json[share];
		}
	};

	socket.onclose = () => {
		console.log("We did not expect any client to disconnect, exiting!");
		process.exit();
	}
}

establishConnections(numClients);