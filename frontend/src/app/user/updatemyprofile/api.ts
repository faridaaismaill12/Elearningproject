const API_BASE_URL = 'http://localhost:4000/user/updatemyprofile';

export async function updateProfile(userId: string, data: Partial<UpdateUserDto>, token: string) {
    try {
        const response = await fetch(`${API_BASE_URL}/users/update/${userId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`, // Include JWT token for authorization
            },
            body: JSON.stringify(data),
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message || 'Failed to update profile');
        }

        return result; // Success response
    } catch (error: any) {
        console.error('Update Profile API call failed:', error.message);
        return { success: false, message: error.message || 'Unable to update profile' };
    }
}

// Interface for UpdateUserDto fields
export interface UpdateUserDto {
    userId?: string;
    name?: string;
    email?: string;
    passwordHash?: string;
    role?: 'student' | 'admin' | 'instructor';
    profilePictureUrl?: string;
    birthday?: Date;
    enrolledCourses?: string[];
    studentLevel?: 'beginner' | 'average' | 'advanced';
    bio?: string;
    preferences?: Record<string, any>;
    isActive?: boolean;
    lastLogin?: Date;
    lastChangedPassword?: Date;
}
