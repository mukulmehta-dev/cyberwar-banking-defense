import { Request, Response } from 'express';
import pool from '../db';

export const getAllAssets = async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM bank_infrastructure ORDER BY criticality DESC');
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching assets', error });
  }
};

export const getAssetById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM bank_infrastructure WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Asset not found' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching asset', error });
  }
};

export const updateAssetSecurity = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { security_level } = req.body;
    const result = await pool.query(
      'UPDATE bank_infrastructure SET security_level = $1 WHERE id = $2 RETURNING *',
      [security_level, id]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating asset', error });
  }
};