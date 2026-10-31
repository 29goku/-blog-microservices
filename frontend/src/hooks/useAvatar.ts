import { useEffect, useState } from 'react';
import { userAPI } from '../api/client';

// Fires after a successful avatar upload so every mounted useAvatar
// instance (profile page, header badge, etc.) refetches in sync.
export const AVATAR_UPDATED_EVENT = 'avatar:updated';

export function useAvatar(userId: number | null): string | null {
  const [avatarSrc, setAvatarSrc] = useState<string | null>(null);

  useEffect(() => {
    let objectUrl: string | null = null;
    let cancelled = false;

    const revoke = () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
        objectUrl = null;
      }
    };

    const load = async () => {
      if (!userId) {
        revoke();
        if (!cancelled) setAvatarSrc(null);
        return;
      }
      try {
        const user = await userAPI.getById(userId);
        if (!user.avatarUrl) {
          revoke();
          if (!cancelled) setAvatarSrc(null);
          return;
        }
        const url = await userAPI.getAvatarBlobUrl(userId);
        if (cancelled) {
          if (url) URL.revokeObjectURL(url);
          return;
        }
        revoke();
        objectUrl = url;
        setAvatarSrc(url);
      } catch {
        if (!cancelled) setAvatarSrc(null);
      }
    };

    load();
    window.addEventListener(AVATAR_UPDATED_EVENT, load);

    return () => {
      cancelled = true;
      window.removeEventListener(AVATAR_UPDATED_EVENT, load);
      revoke();
    };
  }, [userId]);

  return avatarSrc;
}
