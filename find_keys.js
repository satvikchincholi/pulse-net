const fs = require('fs');
const lines = fs.readFileSync('C:/Users/satvik/.gemini/antigravity-ide/brain/d1278611-cac7-4b21-8487-f8b2ccc3bf56/.system_generated/logs/transcript.jsonl', 'utf-8').split('\n').filter(Boolean);
for (const line of lines) {
  try {
    const j = JSON.parse(line);
    if (j.type === 'USER_INPUT') {
      console.log(`--- STEP ${j.step_index} ---`);
      console.log(j.content);
    }
  } catch (e) {}
}
