import { useEffect, useState } from "react";
import { GetMyUnreadChatCount } from "../services/chat-service";
import {
  startRealtimeConnection,
  subscribeChatUnreadCount,
} from "../services/realtime-service";

/**
 * Shared unread chat counter used by every authenticated shell (Candidate,
 * Employer, dashboards). It relies on the single role-agnostic backend endpoint
 * and the realtime `ChatUnreadCountUpdated` event so both roles behave identically.
 */
export const useUnreadChatCount = (): number => {
  const [unreadChatCount, setUnreadChatCount] = useState(0);

  useEffect(() => {
    void startRealtimeConnection();

    const loadUnread = async () => {
      try {
        const response = await GetMyUnreadChatCount();
        setUnreadChatCount(response.data.count);
      } catch {
        setUnreadChatCount(0);
      }
    };

    void loadUnread();
    const unsubscribe = subscribeChatUnreadCount((count) => setUnreadChatCount(count));

    return () => {
      unsubscribe();
    };
  }, []);

  return unreadChatCount;
};

export default useUnreadChatCount;
