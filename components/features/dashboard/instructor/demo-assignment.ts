interface TestCaseForm {
  input: string;
  expectedOutput: string;
  visible: boolean;
}

interface DemoAssignment {
  title: string;
  instructions: string;
  language: string;
  dueDate: string;
  heartsCount: number;
  heartsRegen: number;
  testCases: TestCaseForm[];
}

function defaultDueDateInTwoWeeks(): string {
  const due = new Date();
  due.setDate(due.getDate() + 14);
  due.setHours(23, 59, 0, 0);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${due.getFullYear()}-${pad(due.getMonth() + 1)}-${pad(due.getDate())}T${pad(due.getHours())}:${pad(due.getMinutes())}`;
}

export function getDemoAssignment(): DemoAssignment {
  return {
    title: "Sum of Two Numbers",
    instructions:
      "Write a program that reads two integers from standard input, each on its own line, and prints their sum to standard output.\n\nExample:\nInput:\n2\n3\n\nOutput:\n5",
    language: "Python",
    dueDate: defaultDueDateInTwoWeeks(),
    heartsCount: 5,
    heartsRegen: 30,
    testCases: [
      { input: "2\n3", expectedOutput: "5", visible: true },
      { input: "10\n15", expectedOutput: "25", visible: true },
      { input: "-4\n4", expectedOutput: "0", visible: false },
    ],
  };
}
