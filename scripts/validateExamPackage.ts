import { validateExamPackage } from "../server/validation";

const examId = process.argv[2] ?? "mediengestalter-printmedien-sommer-2026";

const report = await validateExamPackage(examId, true);
console.log(JSON.stringify(report, null, 2));
if (!report.valid) {
  process.exit(1);
}
