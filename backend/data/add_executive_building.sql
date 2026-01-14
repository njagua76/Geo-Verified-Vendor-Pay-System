-- Add Executive Building (SUP007) to the database
INSERT OR IGNORE INTO suppliers (name, supplier_id, latitude, longitude, mpesa_phone_number, contact_person, contact_email, address, created_at, updated_at)
VALUES ('Executive Building Mugutha', 'SUP007', -1.1231552725673162, 36.963508053527995, '+254722789012', 'Henry Kipchoge', 'henry@executive-mugutha.com', 'Executive Building, Mugutha, Ruiru', datetime('now'), datetime('now'));

-- Show all suppliers
SELECT supplier_id, name, latitude, longitude FROM suppliers;

