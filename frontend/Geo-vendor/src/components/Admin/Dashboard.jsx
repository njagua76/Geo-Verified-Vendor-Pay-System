import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { fetchProtected } from '../../api/auth';

export default function Dashboard() {
    const { token, user } = useContext(AuthContext);
    const [data, setData] = useState(null);

    useEffect(() => {
        fetchProtected(token, '/admin/dashboard')
            .then(res => setData(res.data))
            .catch(err => console.error(err));
    }, [token]);

    if (!data) return <p>Loading...</p>;

    return (
        <div>
            <h2>Welcome, {user.email}</h2>
            <p>Total Users: {data.total_users}</p>
            <p>Total Suppliers: {data.total_suppliers}</p>
            <p>Total Transactions: {data.total_transactions}</p>
        </div>
    );
}
