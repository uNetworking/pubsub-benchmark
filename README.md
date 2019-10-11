# Simplified stock exchange as pubsub benchmark

This repo implements a simplified stock exchange service using pub/sub support found in Socket.IO and uWebSockets.js. The purpose is to showcase performance differences in the two projects given a real-world example under stressful conditions.

The benchmark is simple; two version are made with virtually identical features and number of lines of code. One made with uWebSockets.js, one made with Socket.IO.

### The server
Holds a set of 5 shares with their respective value. If a share is bought, its value increases by 0.1%. Likewise if a share is sold, its value decreases by 0.1%. Every share is its own "topic" (or "room"); when a share value changes its value is published to all subscribers.

### The client (passive watchers and active traders)
Establishes 500 connections, of which 50 are active traders and 450 are passive watchers. Every connection is interested in only one share, and will only subscribe to, and buy/sell that one share.

Active traders buy/sell their share every 1ms, driving change in the market. Passive watchers do not buy/sell but only watches the value of its share.

### The metrics
Performance is measured in transactions per second, server side. More detailed metrics could be added, however the difference in performance is so grand that it makes little sense to care about the details here. We just want you to get the big picture, and back it up with scientific measures, open source for anyone to confirm or deny. Here is a graph:

