// Knowledge Graph page — cinematic file relationship visualization.
import React, { useEffect, useState } from 'react';
import { getActivities } from '../services/api';
import KnowledgeGraph from '../components/KnowledgeGraph';
import { SkeletonCard } from '../components/LoadingSkeleton';

export default function GraphPage() {
  const [graph, setGraph] = useState({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const activities = await getActivities(200);
        const fileMap = new Map();
        activities.forEach((a) => {
          if (!a.filePath) return;
          const node = fileMap.get(a.filePath) || { id: a.filePath, count: 0, lastAccess: 0, types: new Set() };
          node.count += 1;
          node.lastAccess = Math.max(node.lastAccess, a.createdAt || 0);
          node.types.add(a.type);
          fileMap.set(a.filePath, node);
        });

        const nodes = Array.from(fileMap.values()).map((n) => ({
          ...n, types: Array.from(n.types),
          label: n.id.split(/[/\\]/).pop() || n.id,
        }));

        const linkSet = new Set();
        const window = 5 * 60 * 1000;
        for (let i = 0; i < activities.length; i++) {
          for (let j = i + 1; j < Math.min(i + 10, activities.length); j++) {
            if (Math.abs((activities[i].createdAt || 0) - (activities[j].createdAt || 0)) > window) break;
            if (activities[i].filePath && activities[j].filePath && activities[i].filePath !== activities[j].filePath) {
              const [s, t] = [activities[i].filePath, activities[j].filePath].sort();
              linkSet.add(JSON.stringify({ source: s, target: t }));
            }
          }
        }

        setGraph({ nodes, links: Array.from(linkSet).map((l) => JSON.parse(l)) });
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, []);

  if (loading) return <div className="page-enter"><SkeletonCard lines={8} className="min-h-[500px]" /></div>;

  return (
    <div className="page-enter">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-headline-lg text-on-surface">Knowledge Graph</h1>
          <p className="text-body-sm text-text-secondary mt-1">
            File relationships based on co-editing patterns
          </p>
        </div>
        <div className="flex items-center gap-3 text-code-sm font-mono text-text-muted">
          <span>{graph.nodes.length} files</span>
          <span>·</span>
          <span>{graph.links.length} connections</span>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
        <div className="card overflow-hidden" style={{ minHeight: '600px' }}>
          <KnowledgeGraph
            nodes={graph.nodes}
            links={graph.links}
            onNodeClick={(node) => setSelectedNode(node)}
          />
        </div>

        {/* Detail Panel */}
        <div className="space-y-4">
          {selectedNode ? (
            <div className="card inner-glow animate-fade-in">
              <div className="card-header flex items-center gap-2">
                <span className="material-symbols-outlined text-primary" style={{ fontSize: '18px' }}>draft</span>
                <span className="text-headline-sm text-on-surface truncate">{selectedNode.label}</span>
              </div>
              <div className="card-body space-y-3">
                <div>
                  <div className="text-label-caps text-text-muted mb-1">FULL PATH</div>
                  <div className="text-code-sm font-mono text-text-secondary break-all">{selectedNode.id}</div>
                </div>
                <div>
                  <div className="text-label-caps text-text-muted mb-1">ACTIVITY</div>
                  <div className="text-body-md text-on-surface">{selectedNode.count} events</div>
                </div>
                {selectedNode.types?.length > 0 && (
                  <div>
                    <div className="text-label-caps text-text-muted mb-1">EVENT TYPES</div>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedNode.types.map((t) => <span key={t} className="chip">{t.replace(/_/g, ' ')}</span>)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="card">
              <div className="card-body text-center py-8">
                <span className="material-symbols-outlined text-text-muted mb-2 block" style={{ fontSize: '28px' }}>touch_app</span>
                <p className="text-body-sm text-text-secondary">Click a node to see details</p>
              </div>
            </div>
          )}

          {/* Legend */}
          <div className="card">
            <div className="card-header">
              <span className="text-label-caps text-text-muted">LEGEND</span>
            </div>
            <div className="card-body space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary" />
                <span className="text-body-sm text-text-secondary">Active files</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-accent" />
                <span className="text-body-sm text-text-secondary">High frequency</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-outline-variant" />
                <span className="text-body-sm text-text-secondary">Co-edit connections</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
