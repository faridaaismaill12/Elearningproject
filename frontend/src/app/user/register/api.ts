
const API_BASE_URL = 'http://localhost:5000';
export async function registerUser(data: any) {
    try {
        const response = await fetch(`${API_BASE_URL}/users/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        const result = await response.json();
        return result; // success or error response
    } catch (error) {
        console.error('API call failed', error);
        return { success: false, message: 'Unable to register' };
    }
}

