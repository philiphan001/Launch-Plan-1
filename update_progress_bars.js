const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'client/src/pages/FinancialProjections.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Transportation
content = content.replace(
  /(style={{ width: `\${Math\.min\(locationCostData\.transportation), 100\)}%` }})/,
  'style={{ width: `${Math.min(locationCostData.transportation / 25, 100)}%` }}'
);

// Healthcare
content = content.replace(
  /(style={{ width: `\${Math\.min\(locationCostData\.healthcare), 100\)}%` }})/,
  'style={{ width: `${Math.min(locationCostData.healthcare / 25, 100)}%` }}'
);

// Personal insurance
content = content.replace(
  /(style={{ width: `\${Math\.min\(locationCostData\.personal_insurance), 100\)}%` }})/,
  'style={{ width: `${Math.min(locationCostData.personal_insurance / 25, 100)}%` }}'
);

// Entertainment
content = content.replace(
  /(style={{ width: `\${Math\.min\(locationCostData\.entertainment), 100\)}%` }})/,
  'style={{ width: `${Math.min(locationCostData.entertainment / 25, 100)}%` }}'
);

// Services
content = content.replace(
  /(style={{ width: `\${Math\.min\(locationCostData\.services), 100\)}%` }})/,
  'style={{ width: `${Math.min(locationCostData.services / 25, 100)}%` }}'
);

// Housing (in case it wasn't updated elsewhere)
content = content.replace(
  /(style={{ width: `\${Math\.min\(locationCostData\.housing), 100\)}%` }})/,
  'style={{ width: `${Math.min(locationCostData.housing / 25, 100)}%` }}'
);

fs.writeFileSync(filePath, content);
console.log('All progress bars updated successfully');
