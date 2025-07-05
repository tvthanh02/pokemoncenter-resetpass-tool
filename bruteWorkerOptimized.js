const bruteForceOptimized = require('./modules/bruteForceOptimized');

process.on('message', async (msg) => {
  if (msg.type === 'start') {
    const { email, dobList } = msg;
    await bruteForceOptimized(
      email,
      (logLine) => process.send({ type: 'log', logLine }),
      () => !global.shouldStop,
      dobList
    );
    process.send({ type: 'done' });
    process.exit(0);
  } else if (msg.type === 'stop') {
    global.shouldStop = true;
  }
}); 