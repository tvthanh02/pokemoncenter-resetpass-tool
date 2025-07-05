const {
  selectEmailFile,
  writeLog,
  readEmailFile,
  startBruteForce,
  stopBruteForce,
  onLogUpdate,
  onProgressUpdate
} = window.electronAPI;

let isRunning = false;
let logLines = [];

const emailInput = document.getElementById('emailInput');
const chooseFileBtn = document.getElementById('chooseFileBtn');
const fileNameSpan = document.getElementById('fileName');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const clearLogBtn = document.getElementById('clearLogBtn');
const saveLogBtn = document.getElementById('saveLogBtn');
const logDiv = document.getElementById('log');
const statusDiv = document.getElementById('status');
const progressDiv = document.getElementById('progress');

// Year range elements
const selectAllCheckbox = document.getElementById('selectAll');
const yearRangeCheckboxes = [
  document.getElementById('range1900-1920'),
  document.getElementById('range1921-1940'),
  document.getElementById('range1941-1960'),
  document.getElementById('range1961-1980'),
  document.getElementById('range1981-2000'),
  document.getElementById('range2001-2020'),
  document.getElementById('range2021-2025')
];
const totalStatsDiv = document.getElementById('totalStats');

let emailFilePath = null;

// Year range configurations
const yearRanges = [
  { id: 'range1900-1920', start: 1900, end: 1920, combinations: 7812 },
  { id: 'range1921-1940', start: 1921, end: 1940, combinations: 7440 },
  { id: 'range1941-1960', start: 1941, end: 1960, combinations: 7440 },
  { id: 'range1961-1980', start: 1961, end: 1980, combinations: 7440 },
  { id: 'range1981-2000', start: 1981, end: 2000, combinations: 7440 },
  { id: 'range2001-2020', start: 2001, end: 2020, combinations: 7440 },
  { id: 'range2021-2025', start: 2021, end: 2025, combinations: 1860 }
];

// Calculate total combinations
function updateTotalStats() {
  let totalCombinations = 0;
  let selectedRanges = [];

  yearRangeCheckboxes.forEach((checkbox, index) => {
    if (checkbox.checked) {
      totalCombinations += yearRanges[index].combinations;
      selectedRanges.push(yearRanges[index]);
    }
  });

  totalStatsDiv.textContent = `📊 Tổng: ${totalCombinations.toLocaleString()} tổ hợp được chọn`;

  // Update button state
  startBtn.disabled = totalCombinations === 0;

  return { totalCombinations, selectedRanges };
}

// Select all functionality
selectAllCheckbox.addEventListener('change', (e) => {
  yearRangeCheckboxes.forEach(checkbox => {
    checkbox.checked = e.target.checked;
  });
  updateTotalStats();
});

// Individual checkbox functionality
yearRangeCheckboxes.forEach(checkbox => {
  checkbox.addEventListener('change', () => {
    // Update select all checkbox
    const allChecked = yearRangeCheckboxes.every(cb => cb.checked);
    const someChecked = yearRangeCheckboxes.some(cb => cb.checked);
    selectAllCheckbox.checked = allChecked;
    selectAllCheckbox.indeterminate = someChecked && !allChecked;

    updateTotalStats();
  });
});

// Initialize stats
updateTotalStats();

// Thiết lập event listeners cho IPC
onLogUpdate((event, logLine) => {
  logLines.push(logLine);
  logDiv.textContent += logLine + '\n';
  logDiv.scrollTop = logDiv.scrollHeight;
});

const runningEmailsGroup = document.getElementById('runningEmailsGroup');
const runningEmailsDiv = document.getElementById('runningEmails');
let runningEmails = [];

function renderRunningEmails() {
  if (runningEmails.length === 0) {
    runningEmailsGroup.style.display = 'none';
    runningEmailsDiv.innerHTML = '';
    return;
  }
  runningEmailsGroup.style.display = '';
  runningEmailsDiv.innerHTML = '';
  runningEmails.forEach(email => {
    const emailDiv = document.createElement('div');
    emailDiv.style.marginBottom = '4px';
    emailDiv.innerHTML = `<span>${email}</span> <button data-email="${email}" class="stop-email-btn">Dừng thử email này</button>`;
    runningEmailsDiv.appendChild(emailDiv);
  });
  // Gán sự kiện cho nút dừng
  Array.from(document.getElementsByClassName('stop-email-btn')).forEach(btn => {
    btn.onclick = () => {
      const email = btn.getAttribute('data-email');
      window.electronAPI.stopSingleEmail && window.electronAPI.stopSingleEmail(email);
      btn.disabled = true;
      btn.textContent = 'Đã dừng';
    };
  });
}

onProgressUpdate((event, data) => {
  if (data.completed) {
    statusDiv.textContent = 'Hoàn thành!';
    startBtn.disabled = false;
    stopBtn.disabled = true;
    isRunning = false;
    runningEmails = [];
    renderRunningEmails();
    if (typeof data.rate === 'number') {
      document.getElementById('speedInfo').textContent = `Tốc độ trung bình: ${data.rate} requests/phút`;
    }
  } else {
    statusDiv.textContent = `Đang xử lý: ${data.email} (${data.current}/${data.total})`;
    progressDiv.textContent = `Đã xử lý ${data.current}/${data.total} email.`;
    if (typeof data.rate === 'number') {
      document.getElementById('speedInfo').textContent = `Tốc độ hiện tại: ${data.rate} requests/phút`;
    }
  }
});

chooseFileBtn.onclick = async () => {
  const filePath = await selectEmailFile();
  if (filePath) {
    emailFilePath = filePath;
    fileNameSpan.textContent = filePath.split(/[\\/]/).pop();
    emailInput.value = '';
  }
};

clearLogBtn.onclick = () => {
  logLines = [];
  logDiv.textContent = '';
  statusDiv.textContent = '';
  progressDiv.textContent = '';
};

saveLogBtn.onclick = async () => {
  if (logLines.length === 0) return;
  await writeLog(logLines.join('\n'));
};

stopBtn.onclick = async () => {
  await stopBruteForce();
  isRunning = false;
  stopBtn.disabled = true;
  startBtn.disabled = false;
  statusDiv.textContent = 'Đã dừng.';
};

const concurrencyInput = document.getElementById('concurrencyInput');
const cpuInfo = document.getElementById('cpuInfo');

window.electronAPI.getCpuCount && window.electronAPI.getCpuCount().then(cpuInfoObj => {
  if (cpuInfoObj && typeof cpuInfoObj === 'object') {
    concurrencyInput.value = cpuInfoObj.recommendedConcurrency;
    cpuInfo.textContent = `(CPU: ${cpuInfoObj.cpuCount} core, gợi ý: ${cpuInfoObj.recommendedConcurrency})`;
  } else if (typeof cpuInfoObj === 'number') {
    concurrencyInput.value = cpuInfoObj;
    cpuInfo.textContent = `(CPU: ${cpuInfoObj} core)`;
  }
});

startBtn.onclick = async () => {
  // Get selected year ranges
  const { totalCombinations, selectedRanges } = updateTotalStats();

  if (totalCombinations === 0) {
    statusDiv.textContent = 'Vui lòng chọn ít nhất một khoảng năm!';
    return;
  }

  let emails = [];
  if (emailFilePath) {
    const content = await readEmailFile(emailFilePath);
    emails = content.split(/\r?\n/).map(e => e.trim()).filter(Boolean);
  } else {
    emails = emailInput.value.split(/\r?\n/).map(e => e.trim()).filter(Boolean);
  }

  if (emails.length === 0) {
    statusDiv.textContent = 'Vui lòng nhập hoặc chọn file email!';
    return;
  }

  // Log selected ranges
  const rangeInfo = selectedRanges.map(range =>
    `${range.start}-${range.end} (${range.combinations.toLocaleString()} tổ hợp)`
  ).join(', ');

  logLines.push(`🎯 Selected ranges: ${rangeInfo}`);
  logLines.push(`📊 Total combinations: ${totalCombinations.toLocaleString()}`);
  logLines.push(`📧 Emails to process: ${emails.length}`);
  logDiv.textContent = logLines.join('\n');

  isRunning = true;
  startBtn.disabled = true;
  stopBtn.disabled = false;
  statusDiv.textContent = 'Đang bắt đầu...';
  progressDiv.textContent = '';

  runningEmails = [...emails];
  renderRunningEmails();
  const concurrency = parseInt(concurrencyInput.value) || 1;
  await startBruteForce(emails, selectedRanges, concurrency);
}; 