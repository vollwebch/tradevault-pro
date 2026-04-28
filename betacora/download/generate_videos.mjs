import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
import path from 'path';

const VIDEOS_DIR = '/home/z/my-project/download/videos';

const videoPrompts = [
  {
    id: '01_intro',
    prompt: 'Professional animated infographic showing a modern trading desk with multiple screens displaying stock charts. Clean dark theme with blue accent colors. Camera slowly pans across trading screens showing candlestick charts. Professional corporate animation style, cinematic lighting.'
  },
  {
    id: '02_mtfa',
    prompt: 'Animated educational diagram showing multiple timeframes of a stock chart arranged from left to right: daily chart, 4 hour chart, 1 hour chart, 5 minute chart, and 1 minute chart. Each chart is labeled. The view zooms in from the daily chart progressively to the 1 minute chart showing increasing detail. Clean professional infographic style with blue color scheme.'
  },
  {
    id: '03_vix',
    prompt: 'Animated financial infographic showing the VIX volatility index gauge meter. The gauge goes from green zone (low volatility under 18) on the left to red zone (high volatility above 25) on the right. An animated needle moves across the gauge. Below the gauge, two contrasting panels show: left panel green "LONG: Safe to buy" and right panel red "NO LONG: Too risky". Professional data visualization style, dark background.'
  },
  {
    id: '04_qqq',
    prompt: 'Animated split screen showing NASDAQ QQQ ETF chart on the left side going up with green arrows, and NVIDIA stock chart on the right side following the same upward direction with green arrows. Then the QQQ chart turns red going down, and the NVIDIA chart also turns red. Clear visual correlation between both charts. Professional financial animation style with data labels showing percentages.'
  },
  {
    id: '05_setup1',
    prompt: 'Animated stock chart showing a clean uptrend with higher highs and higher lows. The price pulls back to a VWAP line (shown as horizontal dashed line) and bounces up. Green buy arrow appears at the bounce point. Then a green take profit target appears above, and a small red stop loss appears below the entry. Clean minimalist chart animation with labels. Professional trading education style.'
  },
  {
    id: '06_setup2',
    prompt: 'Animated stock chart showing a market open with a significant gap up (price opens much higher than previous close shown as a dotted line). The first 5 minutes show volatility, then price breaks above the morning high with a green arrow and buy signal. Price continues upward to a take profit level. Professional trading education animation with clear labels for gap, entry, and target.'
  },
  {
    id: '07_setup3',
    prompt: 'Animated financial infographic showing a VIX chart with a dramatic spike upward (labeled +3 points). Next to it, the next day shows a stock chart (NVDA) that initially dips then strongly reverses upward in a V-shape recovery pattern. A large green buy arrow appears at the reversal point. Labels show the sequence: VIX spike day, then reversal day. Professional dark theme trading education style.'
  },
  {
    id: '08_setup4',
    prompt: 'Animated split screen: left side shows VIX above 18 in red zone, and QQQ chart in red going down. Right side shows a stock chart with price below VWAP line. The stock bounces weakly up to VWAP (shown as a small weak bounce with low volume bars) and then breaks down below the bounce low. A red short arrow appears at the breakdown point. Price drops to a take profit target below. Professional dark trading education style.'
  },
  {
    id: '09_risk',
    prompt: 'Animated infographic showing risk management concepts. A progress bar fills from green (safe zone 0-2%) through yellow (caution 2-3%) to red (danger zone approaching 4-5%). Below, a pie chart shows position sizing calculation. On the right, three stop-loss levels are shown on a chart with clear entry, stop loss, and take profit levels. Numbers and percentages animate in. Professional financial education style with dark theme.'
  },
  {
    id: '10_checklist',
    prompt: 'Animated checklist appearing item by item on screen: checkmark icons appear next to each item as they highlight. Items include: VIX level check, daily trend analysis, key levels identification, VWAP calculation, economic calendar review, QQQ pre-market check, position sizing, daily loss limit, available setups, and mental state check. Clean professional checklist animation with blue accent color on dark background.'
  }
];

async function generateVideo(zai, videoDef) {
  console.log(`\n🎬 Generating: ${videoDef.id} - ${videoDef.prompt.substring(0, 60)}...`);
  
  const task = await zai.video.generations.create({
    prompt: videoDef.prompt,
    quality: 'quality',
    duration: 10,
    fps: 30,
    size: '1344x768'
  });
  
  console.log(`   Task ID: ${task.id}`);
  console.log(`   Status: ${task.task_status}`);
  
  return { id: videoDef.id, taskId: task.id, status: task.task_status };
}

async function pollResult(zai, id, taskId) {
  const maxPolls = 90;
  const interval = 8000;
  
  for (let i = 1; i <= maxPolls; i++) {
    const result = await zai.async.result.query(taskId);
    
    if (result.task_status === 'SUCCESS') {
      const videoUrl = result.video_result?.[0]?.url || result.video_url || result.url || result.video;
      console.log(`✅ ${id}: SUCCESS - ${videoUrl ? 'Video URL obtained' : 'No URL found'}`);
      if (videoUrl) {
        console.log(`   URL: ${videoUrl}`);
      }
      return { id, success: true, url: videoUrl, status: 'SUCCESS' };
    }
    
    if (result.task_status === 'FAIL') {
      console.log(`❌ ${id}: FAILED`);
      return { id, success: false, status: 'FAIL' };
    }
    
    if (i % 5 === 0) {
      console.log(`   ⏳ Poll ${i}/${maxPolls}: ${result.task_status}`);
    }
    
    await new Promise(resolve => setTimeout(resolve, interval));
  }
  
  console.log(`⏰ ${id}: TIMEOUT`);
  return { id, success: false, status: 'TIMEOUT' };
}

async function main() {
  console.log('🚀 Initializing Z-AI SDK...');
  const zai = await ZAI.create();
  console.log('✅ SDK ready');
  
  // Phase 1: Create all tasks
  console.log('\n📋 Phase 1: Creating all video generation tasks...');
  const tasks = [];
  for (const vp of videoPrompts) {
    const task = await generateVideo(zai, vp);
    tasks.push(task);
  }
  
  // Save task IDs
  const taskIds = tasks.map(t => ({ id: t.id, taskId: t.taskId }));
  fs.writeFileSync(path.join(VIDEOS_DIR, 'task_ids.json'), JSON.stringify(taskIds, null, 2));
  console.log(`\n💾 Task IDs saved to task_ids.json`);
  console.log(`   Total tasks: ${tasks.length}`);
  
  // Phase 2: Poll all results
  console.log('\n📋 Phase 2: Polling for results...');
  const results = [];
  for (const task of tasks) {
    const result = await pollResult(zai, task.id, task.taskId);
    results.push(result);
  }
  
  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 SUMMARY');
  console.log('='.repeat(50));
  const success = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  console.log(`✅ Successful: ${success.length}`);
  console.log(`❌ Failed: ${failed.length}`);
  
  if (success.length > 0) {
    console.log('\n📹 Video URLs:');
    for (const r of success) {
      console.log(`   ${r.id}: ${r.url}`);
    }
  }
  
  // Save results
  fs.writeFileSync(path.join(VIDEOS_DIR, 'results.json'), JSON.stringify(results, null, 2));
  console.log('\n💾 Results saved to results.json');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
