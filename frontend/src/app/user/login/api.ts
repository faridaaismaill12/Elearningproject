const API_BASE_URL = 'http://localhost:4000/user/login';

export async function loginUser(data: { email: string; passwordHash: string }) {
    try {
        const response = await fetch(`${API_BASE_URL}/users/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message || 'Login failed');
        }

        return result; // Success response from server
    } catch (error) {
        console.error('Login API call failed', error);
        return { success: false, message: 'Unable to login' };
    }
}
