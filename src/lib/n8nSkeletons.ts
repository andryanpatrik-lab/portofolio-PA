import dailyReport from "../../public/n8n/daily-report.json";
import healthMonitor from "../../public/n8n/health-monitor.json";
import errorNotifier from "../../public/n8n/error-notifier.json";
import spamNotification from "../../public/n8n/spam-notification.json";

/** Sanitised n8n workflow skeleton: node types, positions, and connections only (no parameters, credentials, or code). */
export type Skeleton = {
  name: string;
  nodes: { id: string; name: string; type: string; typeVersion: number; position: [number, number] }[];
  connections: Record<string, { main: { node: string; type: string; index: number }[][] }>;
};

export const n8nSkeletons: Record<string, Skeleton> = {
  "daily-report": dailyReport as unknown as Skeleton,
  "health-monitor": healthMonitor as unknown as Skeleton,
  "error-notifier": errorNotifier as unknown as Skeleton,
  "spam-notification": spamNotification as unknown as Skeleton,
};
