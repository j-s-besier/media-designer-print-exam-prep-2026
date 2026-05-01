import { loadAttempt } from "../server/storage";
import { gradeAttempt } from "../server/grading";

const attemptId = process.argv[2];

if (!attemptId) {
  console.error("Usage: npm run grade -- <attempt-id>");
  process.exit(1);
}

const attempt = await loadAttempt(attemptId);
const result = await gradeAttempt(attempt);
console.log(JSON.stringify(result, null, 2));
