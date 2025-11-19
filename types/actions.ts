// Server Action Response Types

export type ActionResponse<T = void> =
  | { success: true; data?: T; [key: string]: any }
  | { success: false; error: string };
