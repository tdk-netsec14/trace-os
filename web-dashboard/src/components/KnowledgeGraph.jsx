import React, { useEffect, useRef, useCallback, useState } from 'react';
import * as d3 from 'd3';

export default function KnowledgeGraph({ nodes = [], links = [], onNodeClick }) {
  const containerRef = useRef(null);
  const svgRef = useRef(null);
  
  // Controls state
  const [isLocked, setIsLocked] = useState(false);
  const zoomBehavior = useRef(null);
  const svgSelection = useRef(null);
  const simulationRef = useRef(null);

  const draw = useCallback(() => {
    const container = containerRef.current;
    if (!container || !nodes.length) return;

    const width = container.clientWidth || 900;
    const height = container.clientHeight || 600;

    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .style('cursor', 'grab');
      
    svgSelection.current = svg;

    const g = svg.append('g');

    // Zoom setup
    zoomBehavior.current = d3.zoom()
      .scaleExtent([0.15, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
        
        // Hide/show labels based on zoom level to reduce clutter
        const k = event.transform.k;
        g.selectAll('.node-sublabel').style('opacity', k > 1.2 ? 1 : 0);
        g.selectAll('.edge-label').style('opacity', k > 0.8 ? 1 : 0);
      });

    svg.call(zoomBehavior.current)
       .on('mousedown.zoom', function() { d3.select(this).style('cursor', 'grabbing'); })
       .on('mouseup.zoom', function() { d3.select(this).style('cursor', 'grab'); });

    const nodeIds = new Set(nodes.map((n) => n.id));
    const validLinks = links.filter((l) => nodeIds.has(l.source) && nodeIds.has(l.target));

    // STABLE PHYSICS ENGINE
    const simulation = d3.forceSimulation(nodes)
      .alphaDecay(0.05) // Faster cooldown
      .velocityDecay(0.6) // High friction, stops bouncing
      .force('link', d3.forceLink(validLinks).id((d) => d.id).distance(d => getLinkDistance(d)).strength(0.5))
      .force('charge', d3.forceManyBody().strength(-300).distanceMax(800))
      .force('collision', d3.forceCollide().radius((d) => getRadius(d) + 20).iterations(3).strength(0.8))
      .force('x', d3.forceX(width / 2).strength(0.05))
      .force('y', d3.forceY(height / 2).strength(0.05));
      
    simulationRef.current = simulation;

    const linkIdBase = `link-${Math.random().toString(36).substr(2, 9)}`;
    const linkGroup = g.append('g').selectAll('g').data(validLinks).enter().append('g').attr('class', 'link-group');

    const path = linkGroup.append('path')
      .attr('id', (d, i) => `${linkIdBase}-${i}`)
      .attr('fill', 'none')
      .attr('stroke', '#4A4455')
      .attr('stroke-width', (d) => getLinkThickness(d))
      .attr('stroke-opacity', 0.4);

    const linkText = linkGroup.append('text')
      .attr('class', 'edge-label')
      .attr('dy', -4)
      .attr('font-size', '9px')
      .attr('font-style', 'italic')
      .style('pointer-events', 'none')
      .style('text-shadow', '0px 1px 3px #0B1020, 0px -1px 3px #0B1020, 1px 0px 3px #0B1020, -1px 0px 3px #0B1020, 0 0 8px #0B1020')
      .style('opacity', 0); // hidden initially based on standard zoom

    linkText.append('textPath')
      .attr('href', (d, i) => `#${linkIdBase}-${i}`)
      .attr('startOffset', '50%')
      .attr('text-anchor', 'middle')
      .attr('fill', '#64748B')
      .text((d) => d.label || '');

    const nodeGroup = g.append('g').selectAll('g').data(nodes).enter().append('g')
      .style('cursor', 'pointer')
      .call(d3.drag()
        .on('start', (event, d) => {
          if (!event.active && !isLocked) simulation.alphaTarget(0.1).restart();
          d.fx = d.x; d.fy = d.y;
        })
        .on('drag', (event, d) => {
          d.fx = event.x; d.fy = event.y;
        })
        .on('end', (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          // If locked, we don't release fx/fy so it stays where dragged
          if (!isLocked) {
             d.fx = null; d.fy = null;
          }
        })
      );

    // Node Glow Layer
    nodeGroup.append('circle')
      .attr('r', (d) => getRadius(d) + 4)
      .attr('fill', 'transparent')
      .attr('stroke', (d) => getNodeColor(d.type))
      .attr('stroke-width', 0)
      .style('filter', (d) => `drop-shadow(0 0 12px ${getNodeColor(d.type)}30)`)
      .attr('class', 'glow-layer');

    // Node Core
    nodeGroup.append('circle')
      .attr('r', (d) => getRadius(d))
      .attr('fill', '#121826')
      .attr('stroke', (d) => getNodeColor(d.type))
      .attr('stroke-width', 2)
      .attr('class', 'core-layer');

    // Node Icon
    nodeGroup.append('text')
      .attr('class', 'material-symbols-outlined')
      .text((d) => getNodeIcon(d.type))
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .attr('fill', (d) => getNodeColor(d.type))
      .style('font-size', (d) => `${Math.max(14, getRadius(d) - 6)}px`)
      .style('pointer-events', 'none');

    // Node Primary Label
    nodeGroup.append('text')
      .text((d) => d.label || '')
      .attr('dy', (d) => getRadius(d) + 16)
      .attr('text-anchor', 'middle')
      .attr('fill', '#E2E8F0')
      .attr('font-family', 'Inter, sans-serif')
      .attr('font-weight', '500')
      .attr('font-size', '11px')
      .style('pointer-events', 'none')
      .style('text-shadow', '0 1px 4px #0B1020');

    // Node Secondary Label
    nodeGroup.append('text')
      .attr('class', 'node-sublabel')
      .text((d) => d.subLabel || '')
      .attr('dy', (d) => getRadius(d) + 28)
      .attr('text-anchor', 'middle')
      .attr('fill', '#64748B')
      .attr('font-family', 'JetBrains Mono, monospace')
      .attr('font-size', '9px')
      .style('pointer-events', 'none')
      .style('opacity', 0); // default hidden until zoomed

    nodeGroup
      .on('mouseover', function (event, d) {
        // Subtle focus animation
        d3.select(this).select('.glow-layer')
          .transition().duration(200)
          .attr('stroke-width', 2)
          .style('filter', `drop-shadow(0 0 16px ${getNodeColor(d.type)}80)`);

        const connected = new Set();
        validLinks.forEach((l) => {
          const sid = typeof l.source === 'object' ? l.source.id : l.source;
          const tid = typeof l.target === 'object' ? l.target.id : l.target;
          if (sid === d.id) connected.add(tid);
          if (tid === d.id) connected.add(sid);
        });

        path.transition().duration(200)
          .attr('stroke-opacity', (l) => {
            const sid = typeof l.source === 'object' ? l.source.id : l.source;
            const tid = typeof l.target === 'object' ? l.target.id : l.target;
            return sid === d.id || tid === d.id ? 0.9 : 0.05;
          })
          .attr('stroke', (l) => {
            const sid = typeof l.source === 'object' ? l.source.id : l.source;
            const tid = typeof l.target === 'object' ? l.target.id : l.target;
            return sid === d.id || tid === d.id ? getNodeColor(d.type) : '#4A4455';
          });

        nodeGroup.transition().duration(200)
          .attr('opacity', (n) => n.id === d.id || connected.has(n.id) ? 1 : 0.15);
      })
      .on('mouseout', function (event, d) {
        d3.select(this).select('.glow-layer')
          .transition().duration(300)
          .attr('stroke-width', 0)
          .style('filter', `drop-shadow(0 0 12px ${getNodeColor(d.type)}30)`);

        path.transition().duration(300)
          .attr('stroke-opacity', 0.4)
          .attr('stroke', '#4A4455');
          
        nodeGroup.transition().duration(300).attr('opacity', 1);
      })
      .on('click', (event, d) => {
        if (onNodeClick) onNodeClick(d);
      })
      .on('dblclick', (event, d) => {
        // Pan and center on double click
        const transform = d3.zoomIdentity.translate(width / 2, height / 2).scale(1.5).translate(-d.x, -d.y);
        svg.transition().duration(750).call(zoomBehavior.current.transform, transform);
      });

    simulation.on('tick', () => {
      path.attr('d', (d) => {
        const dx = d.target.x - d.source.x;
        const dy = d.target.y - d.source.y;
        const dr = Math.sqrt(dx * dx + dy * dy) * 1.5; 
        
        if (d.target.x < d.source.x) {
          return `M${d.target.x},${d.target.y}A${dr},${dr} 0 0,0 ${d.source.x},${d.source.y}`;
        } else {
          return `M${d.source.x},${d.source.y}A${dr},${dr} 0 0,1 ${d.target.x},${d.target.y}`;
        }
      });
      nodeGroup.attr('transform', (d) => `translate(${d.x},${d.y})`);
    });

    // Fit view initially
    setTimeout(() => {
      if (!svgRef.current) return;
      svg.transition().duration(1000).call(
        zoomBehavior.current.transform, 
        d3.zoomIdentity.translate(width/2, height/2).scale(0.8).translate(-width/2, -height/2)
      );
    }, 100);

    return () => simulation.stop();
  }, [nodes, links, onNodeClick, isLocked]);

  useEffect(() => {
    const cleanup = draw();
    return () => { if (cleanup) cleanup(); };
  }, [draw]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new ResizeObserver(() => draw());
    observer.observe(container);
    return () => observer.disconnect();
  }, [draw]);

  const handleZoomIn = () => {
    if (svgSelection.current && zoomBehavior.current) {
      svgSelection.current.transition().duration(300).call(zoomBehavior.current.scaleBy, 1.3);
    }
  };

  const handleZoomOut = () => {
    if (svgSelection.current && zoomBehavior.current) {
      svgSelection.current.transition().duration(300).call(zoomBehavior.current.scaleBy, 0.7);
    }
  };

  const handleFitView = () => {
    if (svgSelection.current && zoomBehavior.current && containerRef.current) {
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      svgSelection.current.transition().duration(750).call(
        zoomBehavior.current.transform, 
        d3.zoomIdentity.translate(w/2, h/2).scale(0.8).translate(-w/2, -h/2)
      );
    }
  };

  const toggleLock = () => {
    const newLockState = !isLocked;
    setIsLocked(newLockState);
    // If unlocking, let nodes float again
    if (!newLockState && simulationRef.current) {
      nodes.forEach(n => { n.fx = null; n.fy = null; });
      simulationRef.current.alpha(0.3).restart();
    } else if (newLockState && simulationRef.current) {
      nodes.forEach(n => { n.fx = n.x; n.fy = n.y; });
    }
  };

  if (!nodes.length) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="text-center">
          <span className="material-symbols-outlined text-[#4A4455] mb-4 block" style={{ fontSize: '48px' }}>hub</span>
          <p className="text-body-md text-text-muted">No knowledge graph data available</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full h-full absolute inset-0 bg-[#0B1020] overflow-hidden">
      <svg ref={svgRef} className="w-full h-full absolute inset-0" />
      
      {/* Floating Toolbar */}
      <div className="absolute left-6 bottom-6 flex flex-col gap-2 bg-[#121826]/90 backdrop-blur border border-[#1E293B] p-2 rounded-xl shadow-2xl z-10">
        <button onClick={handleZoomIn} className="w-8 h-8 rounded-lg flex items-center justify-center text-[#94A3B8] hover:text-white hover:bg-[#1E293B] transition-all" title="Zoom In">
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
        </button>
        <button onClick={handleZoomOut} className="w-8 h-8 rounded-lg flex items-center justify-center text-[#94A3B8] hover:text-white hover:bg-[#1E293B] transition-all" title="Zoom Out">
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>remove</span>
        </button>
        <div className="h-px bg-[#1E293B] my-1 w-6 mx-auto"></div>
        <button onClick={handleFitView} className="w-8 h-8 rounded-lg flex items-center justify-center text-[#94A3B8] hover:text-white hover:bg-[#1E293B] transition-all" title="Fit View">
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>fit_screen</span>
        </button>
        <button onClick={toggleLock} className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${isLocked ? 'text-[#3B82F6] bg-[#3B82F6]/10' : 'text-[#94A3B8] hover:text-white hover:bg-[#1E293B]'}`} title={isLocked ? "Unlock Graph" : "Lock Graph"}>
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>{isLocked ? 'lock' : 'lock_open'}</span>
        </button>
      </div>
    </div>
  );
}

function getRadius(d) {
  return Math.max(16, Math.min(28, 16 + (d.count || 0) * 1.2));
}

function getLinkDistance(d) {
  // Stronger links (like exact edits) should be closer
  if (d.label === 'modified') return 80;
  if (d.label === 'decided in') return 100;
  return 150;
}

function getLinkThickness(d) {
  if (d.label === 'modified') return 2;
  if (d.label === 'decided in') return 1.5;
  return 1;
}

function getNodeColor(type) {
  switch (type) {
    case 'file': return '#3B82F6'; // Blue
    case 'decision': return '#A855F7'; // Purple (adjusted for Neo4j vibe)
    case 'commit': return '#10B981'; // Green
    case 'command': return '#F97316'; // Orange
    case 'focus': return '#06B6D4'; // Cyan
    default: return '#64748B'; // Slate Gray
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
