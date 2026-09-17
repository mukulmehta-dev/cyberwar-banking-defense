INSERT INTO bank_infrastructure 
  (asset_name, asset_type, criticality, exposure, security_level, data_sensitivity, value_if_breached)
VALUES
  ('Customer Portal', 'web_app', 85, 90, 60, 80, 50000000),
  ('Core Banking System', 'core_banking', 100, 20, 75, 100, 100000000),
  ('Payment Gateway', 'payment', 95, 70, 70, 90, 80000000),
  ('SWIFT Network Interface', 'payment', 100, 40, 80, 95, 90000000),
  ('ATM Network', 'infrastructure', 80, 60, 65, 70, 40000000),
  ('Mobile Banking App', 'web_app', 75, 95, 55, 75, 35000000),
  ('Trading System', 'trading', 90, 30, 72, 85, 70000000),
  ('Employee VPN', 'internal', 70, 50, 50, 60, 20000000),
  ('Data Warehouse', 'data', 85, 15, 68, 100, 60000000),
  ('AML/KYC Compliance System', 'compliance', 80, 10, 78, 90, 45000000);