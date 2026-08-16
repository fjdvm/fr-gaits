export const DEFAULT_CODE_TEMPLATES: Record<string, string> = {
  Python: "import sys\n\ndef main():\n    print(\"Hello, World!\")\n\nif __name__ == \"__main__\":\n    main()\n",
  C: "#include <stdio.h>\n\nint main() {\n    printf(\"Hello, World!\\n\");\n    return 0;\n}\n",
  JavaScript: "const fs = require('fs');\n\nfunction main() {\n    console.log(\"Hello, World!\");\n}\n\nmain();\n",
  "C#": "using System;\n\nclass Program {\n    static void Main() {\n        Console.WriteLine(\"Hello, World!\");\n    }\n}\n",
};
