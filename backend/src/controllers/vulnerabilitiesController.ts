import { Request, Response } from 'express';
import pool from '../db';

const VULNERABILITIES = [
  { id: 'vuln_001', name: 'Unpatched RDP', severity: 'critical', cvss: 9.8, asset_type: 'internal', patch_cost: 5000, patch_days: 1 },
  { id: 'vuln_002', name: 'SQL Injection', severity: 'high', cvss: 8.5, asset_type: 'web_app', patch_cost: 15000, patch_days: 3 },
  { id: 'vuln_003', name: 'Weak Passwords', severity: 'high', cvss: 7.5, asset_type: 'all', patch_cost: 8000, patch_days: 2 },
  { id: 'vuln_004', name: 'Outdated SSL/TLS', severity: 'medium', cvss: 6.5, asset_type: 'payment', patch_cost: 10000, patch_days: 2 },
  { id: 'vuln_005', name: 'Missing MFA', severity: 'high', cvss: 8.0, asset_type: 'all', patch_cost: 20000, patch_days: 5 },
  { id: 'vuln_006', name: 'Unencrypted Backups', severity: 'medium', cvss: 6.0, asset_type: 'data', patch_cost: 12000, patch_days: 3 },
  { id: 'vuln_007', name: 'Open Ports', severity: 'medium', cvss: 5.5, asset_type: 'infrastructure', patch_cost: 3000, patch_days: 1 },
  { id: 'vuln_008', name: 'No Network Segmentation', severity: 'high', cvss: 7.8, asset_type: 'all', patch_cost: 50000, patch_days: 7 },
  { id: 'vuln_009', name: 'Phishing Susceptibility', severity: 'high', cvss: 7.0, asset_type: 'all', patch_cost: 25000, patch_days: 14 },
  { id: 'vuln_010', name: 'No EDR Solution', severity: 'critical', cvss: 9.0, asset_type: 'all', patch_cost: 75000, patch_days: 7 },
  { id: 'vuln_011', name: 'Misconfigured Firewall', severity: 'high', cvss: 8.2, asset_type: 'infrastructure', patch_cost: 8000, patch_days: 2 },
  { id: 'vuln_012', name: 'No DLP System', severity: 'medium', cvss: 6.8, asset_type: 'data', patch_cost: 40000, patch_days: 10 },
];

const HARDENING_OPTIONS = [
  { id: 'hard_001', name: 'Firewall Rules Tightening', layer: 'perimeter', cost: 10000, effectiveness: 20, days: 1 },
  { id: 'hard_002', name: 'IDS/IPS Deployment', layer: 'perimeter', cost: 50000, effectiveness: 35, days: 5 },
  { id: 'hard_003', name: 'WAF Implementation', layer: 'perimeter', cost: 30000, effectiveness: 30, days: 3 },
  { id: 'hard_004', name: 'Network Segmentation', layer: 'network', cost: 80000, effectiveness: 40, days: 7 },
  { id: 'hard_005', name: 'VPN Hardening', layer: 'network', cost: 15000, effectiveness: 25, days: 2 },
  { id: 'hard_006', name: 'DLP System', layer: 'network', cost: 60000, effectiveness: 30, days: 10 },
  { id: 'hard_007', name: 'EDR Deployment', layer: 'endpoint', cost: 100000, effectiveness: 45, days: 7 },
  { id: 'hard_008', name: 'Antivirus Update', layer: 'endpoint', cost: 20000, effectiveness: 20, days: 1 },
  { id: 'hard_009', name: 'Patch Management', layer: 'endpoint', cost: 25000, effectiveness: 30, days: 3 },
  { id: 'hard_010', name: 'Full Disk Encryption', layer: 'data', cost: 35000, effectiveness: 35, days: 5 },
  { id: 'hard_011', name: 'MFA Implementation', layer: 'data', cost: 40000, effectiveness: 40, days: 5 },
  { id: 'hard_012', name: 'PAM Solution', layer: 'data', cost: 70000, effectiveness: 35, days: 7 },
  { id: 'hard_013', name: 'SIEM Deployment', layer: 'operations', cost: 150000, effectiveness: 50, days: 14 },
  { id: 'hard_014', name: 'SOC Setup', layer: 'operations', cost: 200000, effectiveness: 55, days: 14 },
  { id: 'hard_015', name: 'Security Awareness Training', layer: 'people', cost: 30000, effectiveness: 25, days: 7 },
];

export const getVulnerabilities = async (req: Request, res: Response) => {
  try {
    const { asset_type } = req.query;
    const vulns = asset_type
      ? VULNERABILITIES.filter(v => v.asset_type === asset_type || v.asset_type === 'all')
      : VULNERABILITIES;
    res.json({ success: true, data: vulns });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching vulnerabilities', error });
  }
};

export const scanAsset = async (req: Request, res: Response) => {
  try {
    const { assetId } = req.params;
    const assetResult = await pool.query(
      'SELECT * FROM bank_infrastructure WHERE id = $1',
      [assetId]
    );

    if (assetResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Asset not found' });
    }

    const asset = assetResult.rows[0];
    const relevantVulns = VULNERABILITIES.filter(
      v => v.asset_type === asset.asset_type || v.asset_type === 'all'
    );

    // Higher exposure = more vulnerabilities found
    const exposureFactor = asset.exposure / 100;
    const foundVulns = relevantVulns.filter(
      () => Math.random() < exposureFactor
    );

    res.json({
      success: true,
      data: {
        asset_name: asset.asset_name,
        security_level: asset.security_level,
        vulnerabilities_found: foundVulns,
        risk_score: foundVulns.reduce((sum, v) => sum + v.cvss, 0) / foundVulns.length || 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error scanning asset', error });
  }
};

export const applyPatch = async (req: Request, res: Response) => {
  try {
    const { asset_id, vulnerability_id, session_id } = req.body;

    const vuln = VULNERABILITIES.find(v => v.id === vulnerability_id);
    if (!vuln) {
      return res.status(404).json({ success: false, message: 'Vulnerability not found' });
    }

    // Improve asset security level
    await pool.query(
      `UPDATE bank_infrastructure 
       SET security_level = LEAST(100, security_level + $1)
       WHERE id = $2`,
      [Math.floor(vuln.cvss * 2), asset_id]
    );

    // Log the patch event
    await pool.query(
      `INSERT INTO event_log (session_id, event_type, severity, message, metadata)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        session_id,
        'patch_applied',
        'low',
        `Patched vulnerability: ${vuln.name}`,
        JSON.stringify({ vulnerability_id, asset_id, cost: vuln.patch_cost })
      ]
    );

    res.json({
      success: true,
      data: {
        vulnerability: vuln.name,
        cost: vuln.patch_cost,
        security_improvement: Math.floor(vuln.cvss * 2),
        days_to_implement: vuln.patch_days
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error applying patch', error });
  }
};

export const getHardeningOptions = async (req: Request, res: Response) => {
  try {
    const { layer } = req.query;
    const options = layer
      ? HARDENING_OPTIONS.filter(h => h.layer === layer)
      : HARDENING_OPTIONS;
    res.json({ success: true, data: options });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching hardening options', error });
  }
};