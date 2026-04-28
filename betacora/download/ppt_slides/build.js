const pptxgen = require('pptxgenjs');
const html2pptx = require('/home/z/my-project/skills/ppt/scripts/html2pptx.js');
const path = require('path');

async function main() {
  const pptx = new pptxgen();
  pptx.layout = 'LAYOUT_16x9';
  pptx.author = 'Z.ai';
  pptx.title = 'Plan de Trading Scalping NVDA/TSLA';
  
  const fontConfig = { cjk: 'SimHei', latin: 'Corbel' };
  const dir = '/home/z/my-project/download/ppt_slides';
  
  for (let i = 1; i <= 12; i++) {
    const file = path.join(dir, `slide${String(i).padStart(2,'0')}.html`);
    console.log(`Processing ${file}...`);
    const { warnings } = await html2pptx(file, pptx, { fontConfig });
    if (warnings.length > 0) {
      console.log(`  Warnings: ${warnings.join(', ')}`);
    }
  }
  
  await pptx.writeFile('/home/z/my-project/download/Plan_Trading_Scalping_NVDA_TSLA.pptx');
  console.log('DONE! Saved to /home/z/my-project/download/Plan_Trading_Scalping_NVDA_TSLA.pptx');
}

main().catch(e => { console.error(e); process.exit(1); });
