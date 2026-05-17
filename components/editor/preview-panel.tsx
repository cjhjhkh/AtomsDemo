"use client";

import React, { useState, useEffect } from 'react';
import { useStore } from '@/lib/store/use-store';
import { Code2, MonitorPlay, Info, Copy, Check, Save, File, Folder } from 'lucide-react';

export function PreviewPanel() {
  const { currentPreview, isPreviewLoading, updateCurrentPreviewCode } = useStore();
  const [activeTab, setActiveTab] = useState<'preview' | 'code' | 'info'>('preview');
  const [copied, setCopied] = useState(false);
  const [activeFile, setActiveFile] = useState<string>('');
  const [files, setFiles] = useState<Record<string, string>>({});
  const [editedFiles, setEditedFiles] = useState<Record<string, string>>({});

  useEffect(() => {
    if (currentPreview) {
      if (typeof currentPreview.fullCode === 'object' && currentPreview.fullCode !== null) {
        setFiles(currentPreview.fullCode as Record<string, string>);
        setEditedFiles(currentPreview.fullCode as Record<string, string>);
        // 设置默认选中的文件
        const keys = Object.keys(currentPreview.fullCode);
        if (keys.length > 0 && !keys.includes(activeFile)) {
          setActiveFile(keys.includes('index.html') ? 'index.html' : keys[0]);
        }
      } else {
         const code = currentPreview.fullCode || currentPreview.previewHtml || '';
         setFiles({ 'index.html': code });
         setEditedFiles({ 'index.html': code });
         setActiveFile('index.html');
      }
    }
  }, [currentPreview]); // Only re-run when currentPreview object identity changes

  const handleCopy = async () => {
    if (editableCode) {
      await navigator.clipboard.writeText(editableCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSaveCode = () => {
    if(!currentPreview) return;
    
    // 如果是单文件模式，更新 html；如果是多文件模式，需要合成为一个 HTML 或只保留在 fullCode（简单处理，因为目前 iframe 只支持接收单文件 previewHtml）
    // 这里简单地把 index.html 贴回 previewHtml 以便可以立刻显示效果，或者我们直接通过回调更新状态。
    let newPreviewHtml = currentPreview.previewHtml;
    if (editedFiles['index.html']) {
        newPreviewHtml = editedFiles['index.html'];
    }

    useStore.getState().setCurrentPreview({
        ...currentPreview,
        previewHtml: newPreviewHtml,
        fullCode: editedFiles
    });
    
    setActiveTab('preview');
  };

  const editableCode = editedFiles[activeFile] || '';

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditedFiles(prev => ({
        ...prev,
        [activeFile]: e.target.value
    }));
  };

  return (
    <div className="flex flex-col h-full w-full bg-card glass-card relative">
      <div className="flex items-center justify-between p-2 border-b border-white/5 bg-background/50">
        <div className="flex items-center space-x-1">
          <button 
            onClick={() => setActiveTab('preview')}
            className={`flex items-center gap-2 px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'preview' ? 'bg-white/10 text-foreground' : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
            }`}
          >
            <MonitorPlay className="w-4 h-4" />
            Preview
          </button>
          <button 
            onClick={() => setActiveTab('code')}
            className={`flex items-center gap-2 px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'code' ? 'bg-white/10 text-foreground' : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
            }`}
          >
            <Code2 className="w-4 h-4" />
            Code
          </button>
          <button 
            onClick={() => setActiveTab('info')}
            className={`flex items-center gap-2 px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'info' ? 'bg-white/10 text-foreground' : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
            }`}
          >
            <Info className="w-4 h-4" />
            Info
          </button>
        </div>
        
        {activeTab === 'code' && currentPreview && (
          <div className="flex items-center space-x-2 mr-2">
            <button 
              onClick={handleSaveCode}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              Apply
            </button>
            <button 
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md text-muted-foreground hover:bg-white/5 hover:text-foreground transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 relative overflow-hidden bg-white/5">
        {isPreviewLoading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/50 backdrop-blur-sm z-10">
            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
            <p className="mt-4 text-glow font-medium animate-pulse text-primary">Generating your app...</p>
          </div>
        ) : !currentPreview ? (
          <div className="h-full flex items-center justify-center p-8 text-center text-muted-foreground">
            <div className="max-w-md space-y-4">
              <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <MonitorPlay className="w-8 h-8 text-white/20" />
              </div>
              <p className="text-lg text-foreground">No Preview Available</p>
              <p className="text-sm">Describe your desired application in the chat to see it generated here.</p>
            </div>
          </div>
        ) : (
          <div className="h-full w-full relative flex flex-col">
            <div className={`flex-1 w-full ${activeTab === 'preview' ? 'block' : 'hidden'}`}>
              <iframe
                title="Preview"
                srcDoc={currentPreview.previewHtml}
                className="w-full h-full bg-white border-none"
                sandbox="allow-scripts allow-forms allow-same-origin"
              />
            </div>
            
            <div className={`flex-1 w-full flex ${activeTab === 'code' ? 'flex' : 'hidden'}`}>
                {/* File Explorer Sidebar */}
                <div className="w-48 bg-gray-950/50 border-r border-white/5 flex flex-col">
                    <div className="p-3 text-xs font-semibold text-muted-foreground flex items-center uppercase tracking-wider">
                        <Folder className="w-3.5 h-3.5 mr-2" />
                        Files
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {Object.keys(editedFiles).map((filename) => (
                           <button
                             key={filename}
                             onClick={() => setActiveFile(filename)}
                             className={`w-full flex items-center px-4 py-2 text-sm text-left ${activeFile === filename ? 'bg-primary/20 text-primary border-l-2 border-primary' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200 border-l-2 border-transparent'}`}
                           >
                             <File className="w-3.5 h-3.5 mr-2 opacity-70" />
                             <span className="truncate">{filename}</span>
                           </button> 
                        ))}
                    </div>
                </div>

                {/* Code Editor */}
              <textarea
                value={editableCode}
                onChange={handleCodeChange}
                className="flex-1 w-full text-sm font-mono text-gray-300 bg-gray-950 p-4 border-none outline-none resize-none"
                spellCheck="false"
              />
            </div>
            
            <div className={`h-full w-full overflow-y-auto p-6 space-y-8 ${activeTab === 'info' ? 'block' : 'hidden'}`}>
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">{currentPreview.appName || 'Untitled App'}</h2>
                <p className="text-muted-foreground">{currentPreview.description}</p>
              </div>
              
              {currentPreview.techStack && currentPreview.techStack.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-foreground uppercase tracking-widest mb-3">Tech Stack</h3>
                  <div className="flex flex-wrap gap-2">
                    {currentPreview.techStack.map((tech, i) => (
                      <span key={i} className="px-3 py-1 rounded-full text-xs font-medium bg-primary/20 text-primary border border-primary/20">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {currentPreview.suggestions && currentPreview.suggestions.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-foreground uppercase tracking-widest mb-3">Suggestions</h3>
                  <ul className="space-y-2">
                    {currentPreview.suggestions.map((suggestion, i) => (
                      <li key={i} className="flex gap-3 text-sm text-muted-foreground p-3 rounded-lg bg-white/5">
                        <span className="text-primary mt-0.5">•</span>
                        <span>{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
