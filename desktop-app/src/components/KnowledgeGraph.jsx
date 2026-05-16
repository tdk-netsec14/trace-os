// D3 Knowledge Graph with Stitch design tokens, node labels, hover, zoom/pan.
import React, { useEffect, useRef, useCallback } from 'react';
import * as d3 from 'd3';

export default function KnowledgeGraph({ nodes = [], links = [], onNodeClick }) {
  const containerRef = useRef(null);
  const svgRef = useRef(null);

  const draw = useCallback(() => {
    const container = containerRef.current;
    if (!container || !nodes.length) return;

    const width = container.clientWidth || 900;
    const height = container.clientHeight || 600;

    // Clear previous
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    // Zoom group
    const g = svg.append('g');
    svg.call(
      d3.zoom()
        .scaleExtent([0.3, 4])
        .on('zoom', (event) => g.attr('transform', event.transform))
    );

    // Valid links
    const nodeIds = new Set(nodes.map((n) => n.id));
    const validLinks = links.filter((l) => nodeIds.has(l.source) && nodeIds.has(l.target));

    // Simulation
    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(validLinks).id((d) => d.id).distance(100))
      .force('charge', d3.forceManyBody().strength(-180))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius((d) => getRadius(d) + 4));

    // Links
    const link = g.append('g')
      .selectAll('line')
      .data(validLinks)
      .enter().append('line')
      .attr('stroke', '#4A4455')
      .attr('stroke-width', 1)
      .attr('stroke-opacity', 0.4);

    // Node groups
    const nodeGroup = g.append('g')
      .selectAll('g')
      .data(nodes)
      .enter().append('g')
      .style('cursor', 'pointer')
      .call(d3.drag()
        .on('start', (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x; d.fy = d.y;
        })
        .on('drag', (event, d) => { d.fx = event.x; d.fy = event.y; })
        .on('end', (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null; d.fy = null;
        })
      );

    // Node circles
    nodeGroup.append('circle')
      .attr('r', (d) => getRadius(d))
      .attr('fill', (d) => getColor(d))
      .attr('stroke', 'transparent')
      .attr('stroke-width', 2)
      .attr('opacity', 0.85);

    // Node labels
    nodeGroup.append('text')
      .text((d) => d.label || '')
      .attr('dy', (d) => getRadius(d) + 14)
      .attr('text-anchor', 'middle')
      .attr('fill', '#958DA1')
      .attr('font-family', 'JetBrains Mono, monospace')
      .attr('font-size', '10px')
      .attr('opacity', 0.7);

    // Hover effects
    nodeGroup
      .on('mouseover', function (event, d) {
        d3.select(this).select('circle')
          .transition().duration(100)
          .attr('stroke', '#D2BBFF')
          .attr('opacity', 1);
        d3.select(this).select('text')
          .transition().duration(100)
          .attr('fill', '#E8DFEE')
          .attr('opacity', 1);

        // Highlight connected
        const connected = new Set();
        validLinks.forEach((l) => {
          const sid = typeof l.source === 'object' ? l.source.id : l.source;
          const tid = typeof l.target === 'object' ? l.target.id : l.target;
          if (sid === d.id) connected.add(tid);
          if (tid === d.id) connected.add(sid);
        });

        link.attr('stroke-opacity', (l) => {
          const sid = typeof l.source === 'object' ? l.source.id : l.source;
          const tid = typeof l.target === 'object' ? l.target.id : l.target;
          return sid === d.id || tid === d.id ? 0.8 : 0.1;
        }).attr('stroke', (l) => {
          const sid = typeof l.source === 'object' ? l.source.id : l.source;
          const tid = typeof l.target === 'object' ? l.target.id : l.target;
          return sid === d.id || tid === d.id ? '#7C3AED' : '#4A4455';
        });

        nodeGroup.select('circle').attr('opacity', (n) =>
          n.id === d.id || connected.has(n.id) ? 1 : 0.2
        );
      })
      .on('mouseout', function () {
        d3.select(this).select('circle')
          .transition().duration(200)
          .attr('stroke', 'transparent')
          .attr('opacity', 0.85);
        d3.select(this).select('text')
          .transition().duration(200)
          .attr('fill', '#958DA1')
          .attr('opacity', 0.7);
        link.attr('stroke-opacity', 0.4).attr('stroke', '#4A4455');
        nodeGroup.select('circle').attr('opacity', 0.85);
      })
      .on('click', (event, d) => {
        if (onNodeClick) onNodeClick(d);
      });

    // Tick
    simulation.on('tick', () => {
      link
        .attr('x1', (d) => d.source.x).attr('y1', (d) => d.source.y)
        .attr('x2', (d) => d.target.x).attr('y2', (d) => d.target.y);
      nodeGroup.attr('transform', (d) => `translate(${d.x},${d.y})`);
    });

    return () => simulation.stop();
  }, [nodes, links, onNodeClick]);

  useEffect(() => {
    const cleanup = draw();
    return () => { if (cleanup) cleanup(); };
  }, [draw]);

  // Resize observer
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new ResizeObserver(() => draw());
    observer.observe(container);
    return () => observer.disconnect();
  }, [draw]);

  if (!nodes.length) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="text-center">
          <span className="material-symbols-outlined text-text-muted mb-2 block" style={{ fontSize: '40px' }}>hub</span>
          <p className="text-body-md text-text-secondary">No file activity to visualize yet</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full h-full" style={{ minHeight: '600px' }}>
      <svg ref={svgRef} className="w-full h-full bg-base" />
    </div>
  );
}

function getRadius(d) {
  return Math.max(5, Math.min(22, (d.count || 1) * 2 + 3));
}

function getColor(d) {
  if (d.count >= 10) return '#06B6D4'; // High frequency — accent cyan
  if (d.count >= 5) return '#7C3AED';  // Medium — primary purple
  return '#4A4455';                      // Low — outline variant
}
