import { useEffect, useRef, useCallback } from 'react';
import * as d3 from 'd3';
import { Asset, Incident } from '../../types';

interface NetworkMapProps {
  assets: Asset[];
  incidents: Incident[];
}

const NetworkMap = ({ assets, incidents }: NetworkMapProps) => {
  const svgRef = useRef<SVGSVGElement>(null);

  const getNodeColor = useCallback((asset: Asset) => {
    const incident = incidents.find(i => i.asset_name === asset.asset_name);
    if (incident) return '#ff4444';
    if (asset.security_level >= 80) return '#00ff88';
    if (asset.security_level >= 60) return '#64ffda';
    if (asset.security_level >= 40) return '#ffaa00';
    return '#ff4444';
  }, [incidents]);

  useEffect(() => {
    if (!svgRef.current || assets.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const nodes = assets.map((asset, i) => ({
      id: asset.id,
      name: asset.asset_name,
      type: asset.asset_type,
      criticality: asset.criticality,
      security_level: asset.security_level,
      exposure: asset.exposure,
      color: getNodeColor(asset),
      x: (i % 4) * 180 + 100,
      y: Math.floor(i / 4) * 160 + 100
    }));

    const links = [
      { source: 0, target: 1 },
      { source: 0, target: 2 },
      { source: 1, target: 3 },
      { source: 2, target: 4 },
      { source: 3, target: 5 },
      { source: 4, target: 6 },
      { source: 5, target: 7 },
      { source: 6, target: 8 },
      { source: 7, target: 9 },
    ];

    const validLinks = links.filter(
      l => nodes[l.source] && nodes[l.target]
    );

    svg.selectAll('line')
      .data(validLinks)
      .enter()
      .append('line')
      .attr('x1', d => nodes[d.source].x)
      .attr('y1', d => nodes[d.source].y)
      .attr('x2', d => nodes[d.target].x)
      .attr('y2', d => nodes[d.target].y)
      .attr('stroke', '#233554')
      .attr('stroke-width', 2);

    const nodeGroups = svg.selectAll('g')
      .data(nodes)
      .enter()
      .append('g')
      .attr('transform', d => `translate(${d.x}, ${d.y})`);

    nodeGroups.append('circle')
      .attr('r', d => 20 + d.criticality / 10)
      .attr('fill', d => d.color)
      .attr('opacity', 0.8)
      .attr('stroke', d => d.color)
      .attr('stroke-width', 2);

    nodeGroups.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', d => 30 + d.criticality / 10)
      .attr('fill', 'white')
      .attr('font-size', '11px')
      .text(d => d.name.length > 15 ? d.name.substring(0, 15) + '...' : d.name);

    nodeGroups.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '5px')
      .attr('fill', '#0a0e1a')
      .attr('font-size', '10px')
      .attr('font-weight', 'bold')
      .text(d => d.security_level);

  }, [assets, incidents, getNodeColor]);

  return (
    <div>
      <h2 style={{ color: '#64ffda', marginBottom: '20px' }}>🗺️ Bank Infrastructure Network</h2>

      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
        {[
          { color: '#00ff88', label: 'Secure (80+)' },
          { color: '#64ffda', label: 'Good (60-79)' },
          { color: '#ffaa00', label: 'Weak (40-59)' },
          { color: '#ff4444', label: 'Critical / Under Attack' },
        ].map(item => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: item.color }} />
            <span style={{ color: '#8892b0', fontSize: '0.85rem' }}>{item.label}</span>
          </div>
        ))}
      </div>

      <div style={{ background: '#112240', borderRadius: '12px', padding: '20px', overflowX: 'auto' }}>
        <svg ref={svgRef} width="800" height="500" />
      </div>

      <div style={{ marginTop: '20px', background: '#112240', borderRadius: '12px', padding: '20px' }}>
        <h3 style={{ color: '#64ffda', marginBottom: '15px' }}>Asset Details</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #233554' }}>
              {['Asset', 'Type', 'Criticality', 'Exposure', 'Security Level', 'Status'].map(h => (
                <th key={h} style={{ padding: '10px', color: '#8892b0', textAlign: 'left', fontSize: '0.85rem' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {assets.map(asset => {
              const underAttack = incidents.find(i => i.asset_name === asset.asset_name);
              return (
                <tr key={asset.id} style={{ borderBottom: '1px solid #1a2a3a' }}>
                  <td style={{ padding: '10px', color: 'white' }}>{asset.asset_name}</td>
                  <td style={{ padding: '10px', color: '#8892b0' }}>{asset.asset_type}</td>
                  <td style={{ padding: '10px' }}>
                    <span style={{ color: asset.criticality >= 90 ? '#ff4444' : '#ffaa00' }}>
                      {asset.criticality}
                    </span>
                  </td>
                  <td style={{ padding: '10px', color: '#8892b0' }}>{asset.exposure}%</td>
                  <td style={{ padding: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '80px', height: '6px', background: '#233554', borderRadius: '3px' }}>
                        <div style={{
                          width: `${asset.security_level}%`, height: '100%',
                          background: getNodeColor(asset), borderRadius: '3px'
                        }} />
                      </div>
                      <span style={{ color: 'white' }}>{asset.security_level}</span>
                    </div>
                  </td>
                  <td style={{ padding: '10px' }}>
                    {underAttack ? (
                      <span style={{ color: '#ff4444' }}>⚠️ Under Attack</span>
                    ) : (
                      <span style={{ color: '#00ff88' }}>✅ Secure</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default NetworkMap;