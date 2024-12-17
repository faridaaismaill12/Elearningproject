// pages/api/users/profile.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized. Token is required.' });
  }

  try {
    // Make a request to the backend to fetch the user's profile data
    const response = await axios.get('http:/localhost:4000/api/users/viewmyprofile/', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const profileData = response.data;

    // Send the profile data to the frontend
    res.status(200).json(profileData);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile data' });
  }
}
