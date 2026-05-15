// Knowledge Graph page — cinematic file relationship visualization.
import React, { useEffect, useState } from 'react';
import { getActivities, getDecisions, getFocusSessions } from '../services/api';
import KnowledgeGraph from '../components/KnowledgeGraph';
import { SkeletonCard } from '../components/LoadingSkeleton';

function formatDate(ts) {
  if (!ts) return '';
  return new Date(ts).toLocaleString([], { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function GraphPage() {
  const [graph, setGraph] = useState({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const [activities, decisions, focusSessions] = await Promise.all([
          getActivities(300),
          getDecisions(50),
          getFocusSessions()
        ]);

        const nodeMap = new Map();
        const linkSet = new Set();

        const addLink = (source, target, label) => {
          if (source && target && source !== target) {
            // keep it consistent so we don't have duplicate opposite links if they are symmetric
            // but for directed, we keep it as is. Here we'll treat them as directed.
            const linkId = `${source}->${target}:${label}`;
            linkSet.add(JSON.stringify({ source, target, label }));
          }
        };

        // 1. Process Activities into Files, Commits, Commands
        activities.forEach((a) => {
          if (!a.filePath && a.type !== 'command' && a.type !== 'commit') return;

          let id, type, label, subLabel;
          
          if (a.type === 'commit') {
            id = `commit_${a.id}`;
            type = 'commit';
            label = a.content ? a.content.split('\n')[0] : 'Commit';
            subLabel = formatDate(a.createdAt);
          } else if (a.type === 'command') {
            id = `cmd_${a.id}`;
            type = 'command';
            label = a.content || 'Command';
            subLabel = formatDate(a.createdAt);
          } else if (a.filePath) {
            id = a.filePath;
            type = 'file';
            label = a.filePath.split(/[/\\]/).pop();
            const parts = a.filePath.split(/[/\\]/);
            subLabel = parts.length > 1 ? parts.slice(0, -1).join('/') : '';
          } else {
            return;
          }

          if (!nodeMap.has(id)) {
            nodeMap.set(id, { id, type, label, subLabel, count: 0, lastAccess: 0, types: new Set(), data: a });
          }

          const node = nodeMap.get(id);
          node.count += 1;
          node.lastAccess = Math.max(node.lastAccess, a.createdAt || 0);
          if (type === 'file') node.types.add(a.type);
        });

        // Co-editing links for files (window: 5 mins)
        const fileActivities = activities.filter(a => a.filePath && a.type !== 'commit' && a.type !== 'command');
        const windowMs = 5 * 60 * 1000;
        for (let i = 0; i < fileActivities.length; i++) {
          for (let j = i + 1; j < Math.min(i + 15, fileActivities.length); j++) {
            if (Math.abs((fileActivities[i].createdAt || 0) - (fileActivities[j].createdAt || 0)) > windowMs) break;
            if (fileActivities[i].filePath !== fileActivities[j].filePath) {
              // symmetric link, let's sort to avoid double
              const [s, t] = [fileActivities[i].filePath, fileActivities[j].filePath].sort();
              addLink(s, t, 'related to');
            }
          }
        }

        // 2. Process Decisions
        decisions.forEach((d) => {
          const id = `decision_${d.id}`;
          nodeMap.set(id, {
            id, type: 'decision', label: d.title, subLabel: formatDate(d.createdAt), data: d
          });
          
          if (d.filesAffected) {
            try {
              const files = JSON.parse(d.filesAffected);
              files.forEach(f => {
                if (nodeMap.has(f)) addLink(id, f, 'decided in');
              });
            } catch (e) {}
          }
        });

        // 3. Process Focus Sessions
        focusSessions.forEach((s) => {
          const id = `focus_${s.id}`;
          nodeMap.set(id, {
            id, type: 'focus', label: s.taskName, subLabel: formatDate(s.startedAt), data: s
          });
          
          if (s.filesTouched) {
            s.filesTouched.forEach(f => {
              if (nodeMap.has(f)) addLink(id, f, 'modified');
            });
          }
        });

        const nodes = Array.from(nodeMap.values()).map((n) => ({
          ...n,
          types: Array.from(n.types || [])
        }));

        const links = Array.from(linkSet).map((l) => JSON.parse(l));

        setGraph({ nodes, links });
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, []);

  if (loading) return <div className="page-enter"><SkeletonCard lines={8} className="min-h-[500px]" /></div>;

  return (
    <div className="page-enter h-full flex flex-col">
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div>
          <h1 className="text-headline-lg text-on-surface">Knowledge Graph</h1>
          <p className="text-body-sm text-text-secondary mt-1">
            Visualize relationships between your code, decisions, commits, and activities
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="input flex items-center gap-2 w-64 bg-[#121826] border-[#1E293B]">
            <span className="material-symbols-outlined text-text-muted" style={{ fontSize: '18px' }}>search</span>
            <input type="text" className="bg-transparent border-none outline-none text-body-sm w-full text-white" placeholder="Search nodes..." />
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px] flex-1 min-h-0">
        <div className="card overflow-hidden relative flex-1 min-h-[600px] border border-[#1E293B] bg-[#0B1020] shadow-xl">
          <KnowledgeGraph
            nodes={graph.nodes}
            links={graph.links}
            onNodeClick={(node) => setSelectedNode(node)}
          />
          
          {/* Legend */}
          <div className="absolute bottom-4 right-4 flex flex-col gap-2.5 bg-[#121826]/90 backdrop-blur border border-[#1E293B] p-3 rounded-xl shadow-lg z-10 pointer-events-none">
            <span className="text-[10px] text-text-muted uppercase tracking-wider font-semibold mb-1">Node Types</span>
            <LegendItem color="#3B82F6" icon="description" label="File" />
            <LegendItem color="#A855F7" icon="diamond" label="Decision" />
            <LegendItem color="#10B981" icon="commit" label="Commit" />
            <LegendItem color="#F97316" icon="terminal" label="Command" />
            <LegendItem color="#06B6D4" icon="timer" label="Focus" />
            <LegendItem color="#64748B" icon="link" label="External" />
          </div>
        </div>

        {/* Right Side Panel */}
        <div className="flex flex-col gap-4 overflow-y-auto min-h-0">
          {selectedNode ? (
            <div className="card flex-1 bg-[#121826] border-[#1E293B] shadow-2xl animate-fade-in-right transform transition-all duration-300">
              <div className="card-header flex items-center justify-between border-b border-[#1E293B] pb-3 mb-4">
                <span className="text-headline-sm text-white truncate font-semibold" title={selectedNode.label}>
                  {selectedNode.label}
                </span>
                <button className="text-text-muted hover:text-white transition-colors" onClick={() => setSelectedNode(null)}>
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
                </button>
              </div>
              
              <div className="card-body space-y-5">
                <div className="flex items-center gap-3">
                  <span className="text-label-caps text-[#64748B] w-24">Type</span>
                  <div className="flex items-center gap-1.5 text-body-sm text-white">
                    <span className="w-2 h-2 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.5)]" style={{ backgroundColor: getNodeColor(selectedNode.type) }} />
                    <span className="capitalize">{selectedNode.type}</span>
                  </div>
                </div>

                {(selectedNode.type === 'file' || selectedNode.subLabel) && (
                  <div className="flex items-start gap-3">
                    <span className="text-label-caps text-[#64748B] w-24 mt-0.5">Path/Meta</span>
                    <span className="text-code-sm font-mono text-[#94A3B8] break-all flex-1">{selectedNode.subLabel || selectedNode.id}</span>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <span className="text-label-caps text-[#64748B] w-24">Created</span>
                  <span className="text-body-sm text-[#94A3B8]">
                    {formatDate(selectedNode.data?.createdAt || selectedNode.data?.startedAt || selectedNode.lastAccess)}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-label-caps text-[#64748B] w-24">Events</span>
                  <span className="text-body-sm text-[#94A3B8]">{selectedNode.count || 1} events</span>
                </div>

                <div className="pt-3 border-t border-[#1E293B]">
                  <span className="text-[10px] text-[#64748B] uppercase tracking-wider font-semibold mb-2 block">Summary</span>
                  <p className="text-body-sm text-[#cbd5e1] leading-relaxed">
                    {selectedNode.data?.summary || selectedNode.data?.description || selectedNode.data?.content || 'No summary available.'}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#1E293B]">
                  <span className="text-[10px] text-[#64748B] uppercase tracking-wider font-semibold mb-2 block">
                    Connected To ({graph.links.filter(l => l.source.id === selectedNode.id || l.target.id === selectedNode.id).length})
                  </span>
                  <div className="space-y-1.5 max-h-[200px] overflow-y-auto custom-scrollbar pr-1">
                    {graph.links.map((l, i) => {
                      const isSource = l.source.id === selectedNode.id;
                      const isTarget = l.target.id === selectedNode.id;
                      if (!isSource && !isTarget) return null;
                      
                      const other = isSource ? l.target : l.source;
                      return (
                        <div key={i} className="flex items-center justify-between group p-1.5 rounded hover:bg-[#161D2E] transition-colors cursor-pointer" onClick={() => setSelectedNode(other)}>
                          <div className="flex items-center gap-2 truncate">
                            <span className="material-symbols-outlined text-text-muted" style={{ fontSize: '14px', color: getNodeColor(other.type) }}>
                              {getNodeIcon(other.type)}
                            </span>
                            <span className="text-code-sm text-[#94A3B8] truncate group-hover:text-white transition-colors">
                              {other.label}
                            </span>
                          </div>
                          <span className="text-[9px] text-[#64748B] flex-shrink-0 ml-2 italic">{l.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-4 border-t border-[#1E293B]">
                  <div className="grid grid-cols-2 gap-2">
                    <button className="btn-secondary py-2 text-xs bg-[#161D2E] hover:bg-[#1E293B] border-[#1E293B] text-white transition-colors">
                      <span className="material-symbols-outlined mr-1.5" style={{ fontSize: '14px' }}>open_in_new</span>
                      Open
                    </button>
                    <button className="btn-secondary py-2 text-xs bg-[#161D2E] hover:bg-[#1E293B] border-[#1E293B] text-white transition-colors">
                      <span className="material-symbols-outlined mr-1.5" style={{ fontSize: '14px' }}>content_copy</span>
                      Copy Path
                    </button>
                    <button className="btn-secondary py-2 text-xs col-span-2 bg-[#161D2E] hover:bg-[#1E293B] border-[#1E293B] text-white transition-colors">
                      <span className="material-symbols-outlined mr-1.5" style={{ fontSize: '14px' }}>history</span>
                      View Full History
                    </button>
                  </div>
                </div>

              </div>
            </div>
          ) : (
            <div className="card h-full flex items-center justify-center bg-[#121826] border-[#1E293B] shadow-lg">
              <div className="text-center p-6">
                <span className="material-symbols-outlined text-[#334155] mb-3 block" style={{ fontSize: '32px' }}>touch_app</span>
                <p className="text-body-sm text-[#64748B]">Click a node to view its full details, connected paths, and actions.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function LegendItem({ color, icon, label }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="material-symbols-outlined" style={{ color, fontSize: '14px' }}>{icon}</span>
      <span className="text-[11px] text-text-secondary font-medium tracking-wide">{label}</span>
    </div>
  );
}

function getNodeColor(type) {
  switch (type) {
    case 'file': return '#3B82F6'; // Blue
    case 'decision': return '#A855F7'; // Purple
    case 'commit': return '#10B981'; // Green
    case 'command': return '#F97316'; // Orange
    case 'focus': return '#06B6D4'; // Cyan
    default: return '#64748B'; // Gray
  }
}

function getNodeIcon(type) {
  switch (type) {
    case 'file': return 'description';
    case 'decision': return 'diamond';
    case 'commit': return 'commit';
    case 'command': return 'terminal';
    case 'focus': return 'timer';
    default: return 'link';
  }
}
