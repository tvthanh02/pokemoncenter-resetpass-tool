const { generateDOBList } = require('./modules/dobList');
const bruteForceUltra = require('./modules/bruteForceUltra');
const bruteForceOptimized = require('./modules/bruteForceOptimized');
const bruteForceBrowser = require('./modules/bruteForceBrowser');

// Test email
const testEmail = 'test@example.com';

// Test DOB ranges
const testRanges = [
  { startYear: 1990, endYear: 1995 },
  { startYear: 1995, endYear: 2000 }
];

async function testPerformance() {
  console.log('🚀 Testing Performance...\n');

  const dobList = generateDOBList(testRanges);
  console.log(`📋 Generated ${dobList.length} DOB combinations\n`);

  // Test Ultra version
  console.log('🔥 Testing ULTRA version...');
  const ultraStart = Date.now();
  await bruteForceUltra(
    testEmail,
    (log) => console.log(`[ULTRA] ${log}`),
    () => false,
    dobList.slice(0, 10) // Test với 10 DOB đầu tiên
  );
  const ultraTime = (Date.now() - ultraStart) / 1000;
  const ultraRate = Math.round(10 / ultraTime * 60);
  console.log(`✅ ULTRA: ${ultraRate} requests/min\n`);

  // Test Optimized version
  console.log('⚡ Testing OPTIMIZED version...');
  const optimizedStart = Date.now();
  await bruteForceOptimized(
    testEmail,
    (log) => console.log(`[OPTIMIZED] ${log}`),
    () => false,
    dobList.slice(0, 10) // Test với 10 DOB đầu tiên
  );
  const optimizedTime = (Date.now() - optimizedStart) / 1000;
  const optimizedRate = Math.round(10 / optimizedTime * 60);
  console.log(`✅ OPTIMIZED: ${optimizedRate} requests/min\n`);

  // Test Original version (chỉ test 3 DOB vì chậm)
  console.log('🐌 Testing ORIGINAL version...');
  const originalStart = Date.now();
  await bruteForceBrowser(
    testEmail,
    (log) => console.log(`[ORIGINAL] ${log}`),
    () => false,
    dobList.slice(0, 3) // Test với 3 DOB đầu tiên
  );
  const originalTime = (Date.now() - originalStart) / 1000;
  const originalRate = Math.round(3 / originalTime * 60);
  console.log(`✅ ORIGINAL: ${originalRate} requests/min\n`);

  // Summary
  console.log('📊 PERFORMANCE SUMMARY:');
  console.log(`🔥 ULTRA: ${ultraRate} requests/min (${ultraTime.toFixed(1)}s for 10 requests)`);
  console.log(`⚡ OPTIMIZED: ${optimizedRate} requests/min (${optimizedTime.toFixed(1)}s for 10 requests)`);
  console.log(`🐌 ORIGINAL: ${originalRate} requests/min (${originalTime.toFixed(1)}s for 3 requests)`);

  const ultraSpeedup = Math.round(ultraRate / originalRate);
  const optimizedSpeedup = Math.round(optimizedRate / originalRate);

  console.log(`\n🚀 ULTRA is ${ultraSpeedup}x faster than ORIGINAL`);
  console.log(`⚡ OPTIMIZED is ${optimizedSpeedup}x faster than ORIGINAL`);
}

// Run test
testPerformance().catch(console.error); 