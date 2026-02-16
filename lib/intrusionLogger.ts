// Simple logging utility for intrusion attempts
import fs from 'fs';
import path from 'path';

export function logIntrusionAttempt({ route, method, reason, ip }: { route: string; method: string; reason: string; ip?: string }) {
  const logPath = path.join(process.cwd(), 'intrusion.log');
  const logEntry = `[${new Date().toISOString()}] [${ip || 'unknown'}] [${method}] [${route}] - ${reason}\n`;
  fs.appendFileSync(logPath, logEntry);
}
