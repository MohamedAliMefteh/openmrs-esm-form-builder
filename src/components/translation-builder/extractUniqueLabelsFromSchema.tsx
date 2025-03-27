import type { Schema } from '@types';
export function extractUniqueLabelsFromSchema(schema: Schema): string[] {
  const labels: Set<string> = new Set();

  const normalizeLabel = (label: string) => label.trim().replace(/\s+/g, ' ');

  schema?.pages.forEach((page) => {
    if (page.label) labels.add(normalizeLabel(page.label));

    page.sections.forEach((section) => {
      if (section.label) labels.add(normalizeLabel(section.label));

      const extractLabelsFromQuestions = (questions: any[]) => {
        questions.forEach((question) => {
          if (question.label) labels.add(normalizeLabel(question.label));

          if (question.questionOptions?.answers) {
            question.questionOptions.answers.forEach((answer: any) => {
              if (answer.label) labels.add(normalizeLabel(answer.label));
            });
          }

          if (question.questions) {
            extractLabelsFromQuestions(question.questions);
          }
        });
      };

      extractLabelsFromQuestions(section.questions);
    });
  });

  return Array.from(labels).sort((a, b) => a.localeCompare(b));
}
