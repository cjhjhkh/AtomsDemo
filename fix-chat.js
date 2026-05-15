const fs = require('fs');
const path = '/Users/chammy/Desktop/AtomsDemo/atoms-demo/components/chat/chat-area.tsx';
let content = fs.readFileSync(path, 'utf8');
content = content.replace(
  /\`I've generated the app for you\. Please check the preview panel!\`/,
  "\`为您生成了项目：**${data.appName || '未命名应用'}**。\\n\\n${data.description || '请查看右侧预览面板！'}\`"
);
fs.writeFileSync(path, content, 'utf8');
console.log('Fixed chat-area.tsx');
