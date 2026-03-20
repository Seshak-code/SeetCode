import { getUser } from '../services/databaseService.js';

export async function login(req, res) {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Missing credentials' });

    const user = await getUser(username, password);
    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // In a real app we'd attach a JWT, but here we just return the user id
    return res.json({ id: user.id, username: user.username });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Auth failed' });
  }
}
