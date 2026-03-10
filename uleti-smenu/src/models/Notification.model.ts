export interface UserNotification {
  id: string;
  employerId: string;
  jobPostId: string;
  type: string;
  message: string;
  isRead: boolean;
  createdAtUtc: string;
}
