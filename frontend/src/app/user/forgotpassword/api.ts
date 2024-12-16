export async function forgotPassword(data: { email: string }) {
    try {
        const response = await fetch(`${API_BASE_URL}/users/forgot-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message || 'Forgot Password request failed');
        }

        return result; // Success response
    } catch (error) {
        console.error('Forgot Password API call failed', error);

        // Automatically check if error is an instance of Error
        if (error instanceof Error) {
            return { success: false, message: error.message || 'Unable to process forgot password request' };
        }

        // Handle unknown errors
        return { success: false, message: 'An unknown error occurred' };
    }
}
