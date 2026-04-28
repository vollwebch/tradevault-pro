const SDK_PATH = '/home/z/.bun/install/global/node_modules/z-ai-web-dev-sdk/dist/index.js';
const { default: ZAI } = await import(SDK_PATH);
const fs = await import('fs');

const zai = await ZAI.create();

const videos = [
  {
    id: '01_intro',
    prompt: 'Professional animated infographic showing a modern trading desk with multiple screens displaying stock candlestick charts. Clean dark theme with blue accent colors. Camera slowly pans across trading screens showing charts going up and down. Professional cinematic corporate animation style, smooth motion, high quality data visualization.'
  },
  {
    id: '02_mtfa', 
    prompt: 'Animated educational infographic showing five stock charts arranged left to right getting progressively more detailed: a daily chart labeled 1D, a 4 hour chart labeled 4H, a 1 hour chart labeled 1H, a 5 minute chart labeled 5M, and a 1 minute chart labeled 1M. Each chart shows the same stock price but at increasing zoom levels with more candlesticks visible. Blue and white color scheme, dark background, smooth camera animation zooming from left to right through each timeframe.'
  },
  {
    id: '03_vix',
    prompt: 'Animated financial infographic showing a large VIX volatility gauge meter. The gauge goes from a green zone on the left labeled UNDER 18 LONG SAFE to a yellow middle zone labeled 18-25 CAUTION to a red zone on the right labeled ABOVE 25 NO LONGS. An animated needle sweeps across the gauge. Below are two panels: left panel shows a green upward chart with BUY text, right panel shows a red downward chart with AVOID text. Professional dark theme financial data visualization style, smooth animation.'
  },
  {
    id: '04_qqq',
    prompt: 'Animated split screen financial comparison. Left panel shows a NASDAQ QQQ ETF chart with green candles going upward labeled QQQ UP. Right panel shows an NVIDIA stock chart also going upward in green with an arrow pointing from left to right showing correlation labeled 78 PERCENT. Then QQQ turns red going down, and NVIDIA also turns red. Labels appear: QQQ DOWN equals NVDA DOWN. Professional dark trading chart animation style.'
  },
  {
    id: '05_setup1',
    prompt: 'Animated stock chart education showing a clean uptrend with higher highs and higher lows on a dark background. Price pulls back to a horizontal VWAP line drawn as a dashed blue line. A green arrow labeled BUY appears at the VWAP bounce. A green dashed line above shows TAKE PROFIT at 2R, and a red dashed line below shows STOP LOSS. Price bounces off VWAP and moves up to the take profit level. Professional minimalist trading chart animation with clear labels.'
  },
  {
    id: '06_setup2',
    prompt: 'Animated stock market opening chart showing a significant gap up: previous close shown as a dotted line, and the opening price is much higher creating a visible gap. The first 5 minutes of trading show high volume volatility candles. Then price breaks above the morning high with a green arrow and BUY signal appearing. Price continues rising to a take profit level. Clear labels: GAP, FIRST 5 MIN, BREAKOUT, ENTRY, TAKE PROFIT. Professional dark trading education animation style.'
  },
  {
    id: '07_setup3',
    prompt: 'Animated two-panel financial infographic. Left panel shows a VIX index chart with a dramatic red spike upward labeled VIX SPIKE PLUS 3. An arrow points to the next day. Right panel shows the next day where a stock chart initially dips red then strongly reverses upward in a V-shape recovery pattern. A large green BUY arrow appears at the bottom of the V reversal. Labels show: 69 PERCENT WIN RATE, PLUS 2 PERCENT AVERAGE RETURN. Professional dark theme trading education animation.'
  },
  {
    id: '08_setup4',
    prompt: 'Animated financial infographic showing short selling setup. Top section shows VIX above 18 in red and QQQ chart in red going down. Main section shows a stock chart below a VWAP line. Price bounces weakly up to VWAP with small candles and short volume bars, then breaks down below the bounce low. A red downward arrow labeled SHORT appears at the breakdown. Price drops to a take profit target below. Labels: 85 PERCENT WIN RATE. Professional dark trading education animation style.'
  },
  {
    id: '09_risk',
    prompt: 'Animated financial risk management infographic on dark background. A large thermometer gauge fills from green SAFE ZONE at bottom through yellow CAUTION in middle to red DANGER at top with percentage labels. Next to it, a position sizing calculator shows: CAPITAL times RISK PERCENT divided by STOP LOSS equals POSITION SIZE with animated numbers. Below, a chart shows three trades: one green winner at 2R, one red loser at 1R, one green winner at 1.5R with net positive result highlighted. Professional data visualization animation.'
  },
  {
    id: '10_checklist',
    prompt: 'Animated checklist on dark background with blue accent color. Ten checklist items appear one by one from top to bottom, each with a checkmark icon that animates in green when appearing. Items: VIX Level Check, Daily Trend Analysis, Key Levels Identification, VWAP and Support Resistance, Economic Calendar Review, QQQ Pre-Market Check, Position Size Calculation, Daily Loss Limit, Available Setups Review, Mental State Check. Professional corporate checklist animation style with smooth transitions.'
  }
];

const results = [];

// Create all tasks first
console.log('=== CREATING ALL VIDEO TASKS ===');
for (const v of videos) {
  try {
    const task = await zai.video.generations.create({
      prompt: v.prompt,
      quality: 'quality',
      duration: 10,
      fps: 30,
      size: '1344x768'
    });
    console.log(`Created: ${v.id} -> Task: ${task.id} (${task.task_status})`);
    results.push({ id: v.id, taskId: task.id, status: task.task_status });
  } catch(e) {
    console.log(`ERROR creating ${v.id}: ${e.message}`);
    results.push({ id: v.id, taskId: null, status: 'CREATE_ERROR', error: e.message });
  }
}

// Save task IDs
fs.writeFileSync('/home/z/my-project/download/videos/task_ids.json', JSON.stringify(results, null, 2));

// Poll all results
console.log('\n=== POLLING FOR RESULTS ===');
for (const r of results) {
  if (!r.taskId) continue;
  
  let result = null;
  let pollCount = 0;
  const maxPolls = 80;
  
  while (pollCount < maxPolls) {
    result = await zai.async.result.query(r.taskId);
    
    if (result.task_status === 'SUCCESS') {
      const videoUrl = result.video_result?.[0]?.url || result.video_url || result.url || result.video;
      r.success = true;
      r.url = videoUrl;
      r.finalStatus = 'SUCCESS';
      console.log(`SUCCESS: ${r.id} -> ${videoUrl || 'no URL'}`);
      break;
    }
    
    if (result.task_status === 'FAIL') {
      r.success = false;
      r.finalStatus = 'FAIL';
      console.log(`FAILED: ${r.id}`);
      break;
    }
    
    pollCount++;
    if (pollCount % 8 === 0) {
      console.log(`  Polling ${r.id}: ${pollCount}/${maxPolls}...`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 8000));
  }
  
  if (pollCount >= maxPolls) {
    r.success = false;
    r.finalStatus = 'TIMEOUT';
    console.log(`TIMEOUT: ${r.id}`);
  }
}

// Save final results
fs.writeFileSync('/home/z/my-project/download/videos/results.json', JSON.stringify(results, null, 2));

// Summary
console.log('\n=== FINAL SUMMARY ===');
const success = results.filter(r => r.success);
const failed = results.filter(r => !r.success);
console.log(`Successful: ${success.length}/${results.length}`);
if (success.length > 0) {
  for (const r of success) {
    console.log(`  ${r.id}: ${r.url}`);
  }
}
if (failed.length > 0) {
  console.log(`Failed:`);
  for (const r of failed) {
    console.log(`  ${r.id}: ${r.finalStatus} - ${r.error || ''}`);
  }
}
