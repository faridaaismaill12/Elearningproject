const API_BASE_URL = "http://localhost:4000/user/deletemyprofile";

export async function deleteProfile(userId: string, token: string) {
    try {
        const response = await fetch(`${API_BASE_URL}/users/delete/${userId}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message || "Failed to delete profile");
        }

        return result; // Success response
    } catch (error: any) {
        console.error("Delete profile API call failed:", error.message);
        return { success: false, message:  "Unable to delete profile" };
    }
}
