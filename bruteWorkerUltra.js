const bruteForceUltra = require('./modules/bruteForceUltra');

process.on('message', async (msg) => {
  if (msg.type === 'start') {
    const { email, dobList, concurrencyControl } = msg;
    await bruteForceUltra(
      email,
      (logLine) => process.send({ type: 'log', logLine }),
      () => !global.shouldStop,
      dobList,
      concurrencyControl
    );
    process.send({ type: 'done' });
    process.exit(0);
  } else if (msg.type === 'stop') {
    global.shouldStop = true;
  }
}); 