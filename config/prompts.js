// Collection of prompts for different documentation generation scenarios
export const prompts = {
    // Default documentation prompt for test automation scripts
    testAutomation: {
        name: 'Test Automation Documentation',
        description: 'Generates documentation for test automation scripts',
        template: (fileContents) => `
            You are an expert technical writer specialized in software documentation, particularly in **test automation frameworks** like Playwright, Cypress, Selenium, and others.

            Your task is to generate **clear, professional, and well-structured Markdown documentation** for the following test automation script files.

            ## INPUT FILES:
            ${fileContents.map(file => `
            File: ${file.name}
            \`\`\`typescript
            ${file.content}
            \`\`\`
            `).join('\n')}

            ## OUTPUT INSTRUCTIONS:
            Produce a **single Markdown (.md) document** that includes:

            1️⃣ **File Overview Section**
            - Purpose and high-level description of each script.
            - Key functionalities and what features it validates.

            2️⃣ **Dependencies & Prerequisites Section**
            - Mention required frameworks, libraries, environment setup, configuration files, and external tools.

            3️⃣ **Detailed Test Description Section**
            For each test case or function:
            - Describe **what it tests, why it matters, and expected outcomes.**
            - Include information about selectors, assertions, data inputs, or mocks if relevant.

            4️⃣ **Execution & Usage Guide Section**
            - Explain how to run the scripts (CLI commands, CI/CD context, browser configs, etc.).
            - Provide sample command-line instructions or integration notes.

            5️⃣ **Best Practices or Recommendations Section**
            (Optional but encouraged)
            - Include comments on improvements, potential flakiness, or maintainability tips.

            ## FORMATTING REQUIREMENTS:
            ✅ Use Markdown with headers ('#', '##', '###')  
            ✅ Include code snippets fenced with backticks and language  
            ✅ Use lists and tables where useful  
            ✅ Keep tone **professional and concise**, avoid unnecessary verbosity  
            ✅ Add links to relevant documentation if mentioned in the code

            If multiple files are provided, **explain how they relate to each other**.

            ---
            ### 🚀 Example (shortened)

            # File: login.spec.ts

            ## Overview
            Automated tests for login functionality, validating positive and negative login flows.

            ## Dependencies
            - Playwright 1.30+
            - .env with TEST_USER and TEST_PASS

            ## Test Cases
            ### test('valid login redirects to dashboard')
            - Tests that a user with valid credentials is redirected to /dashboard.
            - Uses data from fixtures/user.json.

            ## How to Run
            npx playwright test login.spec.ts

            ## Recommendations
            Consider parameterizing URLs for different environments.
        `,
    },

    // Placeholder for API documentation prompt
    api: {
        name: 'API Documentation',
        description: 'Template for generating API documentation',
        template: () => `// To be implemented`
    },

    // Placeholder for component documentation prompt
    component: {
        name: 'Component Documentation',
        description: 'Template for generating component documentation',
        template: () => `// To be implemented`
    }
};
