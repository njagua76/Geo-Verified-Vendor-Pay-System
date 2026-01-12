// Kenyan Dummy Data with d_ prefix

export const d_suppliers = [
  {
    id: 'd_sup_001',
    name: 'd_Nairobi Hardware Hub',
    supplier_id: 'SUP001',
    latitude: -1.2921,
    longitude: 36.8219,
    mpesa_phone: '+254712345678',
    location: 'CBD, Nairobi',
    status: 'active'
  },
  {
    id: 'd_sup_002',
    name: 'd_Mombasa Building Supplies',
    supplier_id: 'SUP002',
    latitude: -4.0435,
    longitude: 39.6682,
    mpesa_phone: '+254787654321',
    location: 'Port City, Mombasa',
    status: 'active'
  },
  {
    id: 'd_sup_003',
    name: 'd_Kisumu General Store',
    supplier_id: 'SUP003',
    latitude: -0.1022,
    longitude: 34.7617,
    mpesa_phone: '+254701234567',
    location: 'Waterfront, Kisumu',
    status: 'active'
  },
  {
    id: 'd_sup_004',
    name: 'd_Eldoret Farmers Market',
    supplier_id: 'SUP004',
    latitude: 0.5143,
    longitude: 35.2795,
    mpesa_phone: '+254712987654',
    location: 'Town Center, Eldoret',
    status: 'inactive'
  },
  {
    id: 'd_sup_005',
    name: 'd_Nakuru Trade Center',
    supplier_id: 'SUP005',
    latitude: -0.3031,
    longitude: 36.0800,
    mpesa_phone: '+254789456123',
    location: 'Industrial Area, Nakuru',
    status: 'active'
  },
];

export const d_fieldAgents = [
  {
    id: 'd_agent_001',
    name: 'd_John Kipchoge',
    email: 'd_john@example.com',
    phone: '+254712345678',
    role: 'field_agent',
    region: 'd_Nairobi',
    status: 'active',
  },
  {
    id: 'd_agent_002',
    name: 'd_Mary Kamau',
    email: 'd_mary@example.com',
    phone: '+254787654321',
    role: 'field_agent',
    region: 'd_Mombasa',
    status: 'active',
  },
  {
    id: 'd_agent_003',
    name: 'd_Samuel Omondi',
    email: 'd_samuel@example.com',
    phone: '+254701234567',
    role: 'field_agent',
    region: 'd_Kisumu',
    status: 'active',
  },
];

export const d_transactions = [
  {
    id: 'd_txn_001',
    agent: 'd_John Kipchoge',
    supplier: 'd_Nairobi Hardware Hub',
    amount: 5000,
    status: 'success',
    timestamp: '2024-01-07T10:30:00Z',
    distance: 45,
    verified: true,
  },
  {
    id: 'd_txn_002',
    agent: 'd_Mary Kamau',
    supplier: 'd_Mombasa Building Supplies',
    amount: 8500,
    status: 'success',
    timestamp: '2024-01-07T11:15:00Z',
    distance: 32,
    verified: true,
  },
  {
    id: 'd_txn_003',
    agent: 'd_Samuel Omondi',
    supplier: 'd_Kisumu General Store',
    amount: 3200,
    status: 'pending',
    timestamp: '2024-01-07T12:00:00Z',
    distance: 87,
    verified: false,
  },
  {
    id: 'd_txn_004',
    agent: 'd_John Kipchoge',
    supplier: 'd_Nairobi Hardware Hub',
    amount: 12000,
    status: 'failed',
    timestamp: '2024-01-07T09:45:00Z',
    distance: 150,
    verified: false,
  },
  {
    id: 'd_txn_005',
    agent: 'd_Mary Kamau',
    supplier: 'd_Mombasa Building Supplies',
    amount: 6500,
    status: 'success',
    timestamp: '2024-01-07T08:30:00Z',
    distance: 28,
    verified: true,
  },
  {
    id: 'd_txn_006',
    agent: 'd_Samuel Omondi',
    supplier: 'd_Kisumu General Store',
    amount: 4200,
    status: 'success',
    timestamp: '2024-01-07T07:15:00Z',
    distance: 42,
    verified: true,
  },
  {
    id: 'd_txn_007',
    agent: 'd_John Kipchoge',
    supplier: 'd_Nakuru Trade Center',
    amount: 9800,
    status: 'success',
    timestamp: '2024-01-06T16:45:00Z',
    distance: 55,
    verified: true,
  },
  {
    id: 'd_txn_008',
    agent: 'd_Mary Kamau',
    supplier: 'd_Eldoret Farmers Market',
    amount: 2500,
    status: 'failed',
    timestamp: '2024-01-06T15:30:00Z',
    distance: 200,
    verified: false,
  },
];

export const d_users = [
  {
    id: 'd_user_001',
    name: 'd_Admin User',
    email: 'd_admin@example.com',
    role: 'administrator',
  },
  {
    id: 'd_user_002',
    name: 'd_Agent User',
    email: 'd_agent@example.com',
    role: 'field_agent',
  },
];

export const d_stats = {
  totalTransactions: 1254,
  successfulTransactions: 1198,
  failedTransactions: 56,
  totalValue: 2450000,
  averageTransaction: 1950,
  activeSuppliers: 4,
  activeAgents: 3,
};
