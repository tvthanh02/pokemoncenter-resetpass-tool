// Function tạo DOB list dựa trên selected ranges
function generateDOBList(selectedRanges) {
  const dobList = [];
  
  selectedRanges.forEach(range => {
    for (let year = range.start; year <= range.end; year++) {
      for (let month = 1; month <= 12; month++) {
        for (let day = 1; day <= 31; day++) {
          dobList.push({
            year: year.toString(),
            month: month.toString().padStart(2, '0'),
            day: day.toString().padStart(2, '0')
          });
        }
      }
    }
  });
  
  return dobList;
}

// Default DOB list (toàn bộ range 1900-2025) - giữ lại để tương thích
const defaultDOBList = [];
for (let year = 1900; year <= 2025; year++) {
  for (let month = 1; month <= 12; month++) {
    for (let day = 1; day <= 31; day++) {
      defaultDOBList.push({
        year: year.toString(),
        month: month.toString().padStart(2, '0'),
        day: day.toString().padStart(2, '0')
      });
    }
  }
}

module.exports = {
  generateDOBList,
  defaultDOBList
}; 