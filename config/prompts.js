// Collection of prompts for different documentation generation scenarios
export const prompts = {
    // Generic code documentation prompt
    code: {
        name: 'Code Documentation',
        description: 'Generates documentation for any code files',
        template: (fileContents) => `
            You are an expert technical writer specialized in software documentation, with deep knowledge across multiple programming languages, frameworks, and paradigms.

            Your task is to generate **clear, professional, and well-structured Markdown documentation** for the following code files.

            ## INPUT FILES:
            ${fileContents.map(file => `
            File: ${file.name}
            \`\`\`
            ${file.content}
            \`\`\`
            `).join('\n')}

            ## OUTPUT INSTRUCTIONS:
            Produce a **single Markdown (.md) document** that includes:

            1️⃣ **Code Overview Section**
            - Purpose and high-level description of each file
            - Main functionality and core concepts
            - Architecture and design patterns used

            2️⃣ **Dependencies & Setup Section**
            - Required libraries, frameworks, and tools
            - Environment setup and configuration
            - Installation instructions if applicable

            3️⃣ **Detailed Implementation Section**
            For each major component/class/function:
            - Purpose and functionality
            - Parameters, return values, and types
            - Usage examples and code snippets
            - Important implementation details

            4️⃣ **Usage Guide Section**
            - How to use the code
            - Common use cases and examples
            - Configuration options if any

            5️⃣ **Best Practices Section**
            - Code organization and structure
            - Error handling and edge cases
            - Performance considerations
            - Maintainability tips

            ## FORMATTING REQUIREMENTS:
            ✅ Use clear Markdown headers and structure
            ✅ Include relevant code snippets with proper syntax highlighting
            ✅ Use lists and tables where appropriate
            ✅ Maintain a professional and concise tone
            ✅ Link to relevant external documentation when appropriate

            If multiple files are provided, explain their relationships and interactions.
        `,
    },

    // Test automation documentation prompt
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
        template: (fileContents) => `
            You are an expert technical writer specialized in **API documentation**.

            Your task is to analyze the provided code files and generate clear, structured **Markdown API documentation** for all API endpoints defined or referenced.  

            ## INPUT FILES:
            ${fileContents.map(file => `
            File: ${file.name}
            \`\`\`typescript
            ${file.content}
            \`\`\`
            `).join('\n')}

            ## YOUR OUTPUT:
            Produce a **single, clean Markdown (.md) document** that includes:

            1️⃣ **Overview**
            - High-level description of the API (purpose, domain, main functionalities).
            - Mention overall architecture (REST, GraphQL, WebSocket, etc.) if detected.

            2️⃣ **Endpoint Documentation**
            For each endpoint found:
            - **Method & Path** (e.g., 'GET /users/{id}')
            - **Summary**: short description of the purpose.
            - **Request Parameters**:
            - Path, query, header, body (describe type, required/optional, example values).
            - **Request Body**:
            - For POST/PUT/PATCH: schema or main fields.
            - **Response**
            - Status codes, body schema/structure, and example if available.
            - **Authentication & Authorization**
            - Indicate if token, API key, or other security is required.
            - **Related functions/files** (e.g., controller, service, resolver names)

            3️⃣ **Error Handling**
            - List common error responses (status codes, messages, conditions).

            4️⃣ **How to Use**
            - Example cURL or HTTP request examples for each main endpoint.

            5️⃣ **Additional Notes**
            (Optional but encouraged)
            - Deprecation notes, rate limits, known limitations.

            ## FORMATTING REQUIREMENTS:
            ✅ Use Markdown headers ('#', '##', '###')  
            ✅ Include code examples in fenced blocks (\`\`\`) with language  
            ✅ Use lists for endpoints and parameters
            ✅ Use tables for parameters when useful  
            ✅ Keep tone professional and concise  
            ✅ Use consistent language across sections (e.g., always use “Request Body” not “Input”)

            If multiple files are provided, **merge their information into a unified API documentation** showing how components work together.

            ---

            ### 🚀 Example (shortened)

            # API Documentation: User Service

            ## Overview
            REST API for managing users, including registration, authentication, and profile management.

            ## Endpoints
              
            ### POST /api/users/register
            **Summary**: Register a new user.

            **Request Body**
            | Field    | Type   | Required | Description        |
            |----------|--------|----------|--------------------|
            | email    | string | yes      | User email        |
            | password | string | yes      | User password    |

            **Response**
            - 201 Created: User registered
            - 400 Bad Request: Validation error

            **Example**
            \`\`\`
            curl -X POST /api/users/register -d '{ "email": "test@example.com", "password": "secret" }'
            \`\`\`

            ### GET /api/users/{id}
            **Summary**: Retrieve user details by ID.
            ...
        `,
    },

    // Placeholder for component documentation prompt
    component: {
        name: 'Component Documentation',
        description: 'Template for generating component documentation',
        template: (fileContents) => `
            You are an expert technical writer specialized in software **component documentation**.

            Your task is to analyze the provided code files and generate clear, structured **Markdown documentation** for each identified component.


            ## INPUT FILES:
            ${fileContents.map(file => `
            File: ${file.name}
            \`\`\`typescript
            ${file.content}
            \`\`\`
            `).join('\n')}

            ## YOUR OUTPUT:
            Produce a **single Markdown (.md) document** that includes:

            ---

            1️⃣ **Overview**
            - Brief summary of what the file(s) implement and the types of components included (e.g., React components, Angular components, Vue SFCs, backend modules, etc.).

            ---

            2️⃣ **Component Blocks**
            For each identified component:
            - **Component Name**
            - Name or identifier from the code.
            
            - **Description**
            - Short summary of the component's purpose and behavior.
            
            - **Props / Inputs**
            - Table listing prop/input name, type, required/optional, default value, description.

            - **Events / Outputs**
            - If applicable, list emitted events or output bindings, including description and payload.

            - **Slots / Children / Content**
            - For UI components, describe any slots or child content supported.

            - **Usage Example**
            - Provide a minimal code example (JSX, HTML, template, or usage snippet).

            - **Dependencies**
            - Mention other components, hooks, services, or modules used internally.

            ---

            3️⃣ **Best Practices / Notes**
            (Optional but encouraged)
            - Tips for usage, known limitations, performance considerations, or accessibility notes.

            ---

            ## FORMATTING REQUIREMENTS:
            ✅ Use Markdown headers ('#', '##', '###')  
            ✅ For each component, use **clearly separated sections**  
            ✅ Use tables for props, events, etc., where applicable  
            ✅ Provide code examples fenced with correct language blocks (e.g., \`\`\`jsx\`, \`\`\`html\`, etc.)  
            ✅ Use professional, concise language  
            ✅ Link related documentation if referenced in comments

            ---

            ## SPECIAL INSTRUCTIONS:
            - If multiple components are found **in one file**, generate individual documentation blocks per component.
            - If components are **spread across multiple files**, merge into a unified document, grouping by file if useful.

            ---

            ### 🚀 Example (shortened)

            # Component Documentation: Button and ButtonGroup

            ## Overview
            This file provides a 'Button' and 'ButtonGroup' React component for building accessible, styled buttons.

            ---

            ## Component: Button

            ### Description
            A reusable button component with customizable variants, sizes, and click handlers.

            ### Props
            | Name     | Type     | Required | Default  | Description          |
            |----------|----------|----------|----------|----------------------|
            | variant  | string   | no       | 'primary' | Button style variant |
            | disabled | boolean  | no       | false    | Disable the button   |
            | onClick  | function | no       | -        | Click event handler  |

            ### Usage Example
            \`\`\`jsx
            <Button variant="secondary" onClick={handleClick}>Save</Button>
            \`\`\`

            ---

            ## Component: ButtonGroup

            ### Description
            Groups multiple buttons horizontally or vertically.

            ### Props
            | Name   | Type    | Required | Default | Description        |
            |--------|---------|----------|---------|--------------------|
            | stacked| boolean | no       | false   | Stack buttons vertically |

            ### Usage Example
            \`\`\`jsx
            <ButtonGroup>
            <Button>Yes</Button>
            <Button>No</Button>
            </ButtonGroup>
            \`\`\`

            ---

            ## Best Practices
            - Use semantic 'type' attributes for buttons ('submit', 'button', 'reset').
            - Ensure 'aria-label' for icon-only buttons.

        `,
    }
};
