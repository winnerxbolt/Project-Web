import { cookies } from 'next/headers';
import { findUserById, findSession } from './auth';

/**
 * Middleware function to verify admin authorization
 * Returns user object if admin, null otherwise
 */
export async function requireAdmin() {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session')?.value;
    
    if (!sessionToken) {
      return null;
    }

    const session = await findSession(sessionToken);
    if (!session) {
      return null;
    }

    const user = await findUserById(session.userId);
    
    if (!user || user.role !== 'admin') {
      return null;
    }

    return user;
  } catch (error) {
    console.error('Error in requireAdmin:', error);
    return null;
  }
}
