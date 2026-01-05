const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

export const loginUser = async (email, password) => {
    const response = await fetch(`${BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Login failed');
    }

    return response.json(); // { token, user }
};

export const fetchProtected = async (token, endpoint) => {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    if (!response.ok) {
        throw new Error('Unauthorized or failed fetch');
    }
    return response.json();
};
