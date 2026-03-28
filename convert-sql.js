const fs = require('fs');

const inputFile = '/Users/monxmacmini/Desktop/V2/farpnwpyhosting_v1.sql';
const outputFile = '/Users/monxmacmini/Desktop/V2/import_to_supabase.sql';

console.log('Đang đọc file MySQL cũ...');
let sqlContent = fs.readFileSync(inputFile, 'utf-8');

const tables = ['campaigns', 'free_vouchers', 'vouchers'];
const insertBlocks = [];

for (const tableName of tables) {
  const marker = `INSERT INTO \`${tableName}\``;
  const startIndex = sqlContent.indexOf(marker);
  if (startIndex === -1) {
    console.log(`Không tìm thấy dữ liệu cho bảng ${tableName}`);
    continue;
  }
  
  // Tìm điểm kết thúc của chuỗi INSERT INTO: là cụm `);` nằm cuối dòng
  const regexEnd = /\);\r?\n/g;
  regexEnd.lastIndex = startIndex;
  const match = regexEnd.exec(sqlContent);
  
  if (match) {
    insertBlocks.push(sqlContent.substring(startIndex, match.index + 2)); // Lấy đến dấu ;
  } else {
    // Nếu trúng bảng cuối cùng của file
    const lastIndex = sqlContent.lastIndexOf(';');
    insertBlocks.push(sqlContent.substring(startIndex, lastIndex + 1));
  }
}

console.log(`Tìm thấy ${insertBlocks.length} khối lệnh INSERT. Tiến hành chuyển đổi...`);

let validCampaignIds = new Set();

let processedBlocks = insertBlocks.map((block, index) => {
  let tableName = tables[index];
  let processed = block;
  // Bỏ backtick bảng và cột
  processed = processed.replace(/`/g, '"');
  // Xử lý escape quote của html/string
  processed = processed.replace(/\\'/g, "''");
  // Thay thế dấu ngắt dòng MySQL
  processed = processed.replace(/\\r\\n/g, '\n');
  processed = processed.replace(/\\n/g, '\n');
  // Chuyển date rỗng thành rỗng
  processed = processed.replace(/'0000-00-00 00:00:00'/g, 'NULL');
  processed = processed.replace(/'0000-00-00'/g, 'NULL');

  // Lưu lại các ID campaign hợp lệ
  if (tableName === 'campaigns') {
    const regex = /\((\d+),\s*'/g;
    let m;
    while ((m = regex.exec(processed)) !== null) {
      validCampaignIds.add(m[1]);
    }
  }

  // Lọc các voucher mồ côi
  if (tableName === 'vouchers') {
    const valuesIndex = processed.indexOf('VALUES');
    // Cắt tới hết chữ VALUES\n (hoặc VALUES)
    const headerEnd = processed.indexOf('\n', valuesIndex) + 1;
    const header = processed.substring(0, headerEnd);
    const body = processed.substring(headerEnd);
    
    let lines = body.split('\n');
    let validLines = [];
    
    for (let line of lines) {
      if (!line.trim()) continue;
      const match = line.match(/^\((\d+),\s*(\d+)/);
      if (match) {
        if (validCampaignIds.has(match[2])) {
          validLines.push(line);
        }
      } else {
        // Giữ lại các dòng không phải data nếu có
        if (line.trim() === ';') validLines.push(line);
      }
    }
    
    // Đảm bảo dòng cuối cùng kết thúc bằng dấu chấm phẩy
    if (validLines.length > 0) {
      let lastIndex = validLines.length - 1;
      validLines[lastIndex] = validLines[lastIndex].replace(/,$/, ';');
    }
    
    processed = header + validLines.join('\n');
  }

  return processed;
});

fs.writeFileSync(outputFile, processedBlocks.join('\n\n'));
console.log(`\n✅ Sửa lỗi dấu ; trong body html thành công! Đã lưu tại:`);
console.log(outputFile);
