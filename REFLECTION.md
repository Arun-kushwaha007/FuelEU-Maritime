# REFLECTION.md  
Reflection on Using AI Agents in the FuelEU Maritime Project  
  
This document explains how AI agents supported the development of the FuelEU Maritime compliance dashboard and backend, and what I learned from using them.  
  
## What I Learned Using AI Agents  
  
Using AI shifted my development approach from a purely manual coding workflow to a conversational and iterative reasoning workflow. I realized that AI works best when I already understand the problem and simply need guidance in structuring a solution, narrowing down a bug, or validating an architectural decision.  
  
For example, I initially tried asking AI to generate full modules, but the results often violated the hexagonal architecture or mixed concerns. I then changed my approach and asked the agents focused questions, such as:  
  
* "Explain why Prisma cannot find DATABASE_URL here."  
* "Show the minimal patch that prevents re-render loops in RoutesTab."  
* "How can I reset DB state so tests do not influence each other."  
* "How do I implement the ports layer to properly separate Prisma from core business logic?"  
  
This resulted in cleaner and more predictable outcomes. I learned to treat AI responses as suggestions, not final answers. I also developed the habit of verifying every change with tests, actual runtime behavior, and code review.  
  
**Key architectural insight:** The most valuable AI interaction was when I asked for help implementing proper dependency inversion through the ports pattern. The agent helped me understand that `core/ports/repository.ts` should define interfaces, while `adapters/outbound/postgres/repository.ts` implements them, keeping Prisma isolated in the infrastructure layer. This took multiple iterations to get right, but the final structure properly separates concerns.  
  
## Efficiency Gains Compared to Manual Coding  
  
AI significantly reduced setup and debugging time. Some examples:  
  
* Configuring Prisma with correct ESM support and switching to the `tsx` runtime would have taken multiple hours of searching and experimentation. With AI guidance I completed the migration under one hour.  
* Configuring Vitest and Vite aliases to work consistently was finished in 15 minutes instead of experimenting between stackoverflow threads and trial builds.  
* The Knowledge Sidebar feature benefitted from a clear prompt. The agent generated a structure that I refined manually. This saved design time and maintained consistent UI patterns.  
* Stabilizing the banking and pooling test suite required both reasoning and experimentation. However, AI helped identify the main issue: tests depending on changing DB state. Once that was clear, the fix was straightforward.  
* **Implementing hexagonal architecture:** AI helped me refactor from direct Prisma usage in route handlers to a proper ports-and-adapters pattern. This involved creating the `ports/` layer with repository interfaces and the `outbound/postgres/` adapter with implementations. Without AI guidance, understanding and implementing this pattern would have taken significantly longer.  
* **Test debugging:** When integration tests failed with ECONNREFUSED errors, AI quickly identified that tests were trying to connect to `http://localhost:4000` instead of using the `app` instance directly with Supertest. This saved hours of debugging.  
  
The main productivity gain was not code generation speed but the reduction of context switching. AI helped me stay focused on one problem at a time.  
  
## Challenges When Using AI Agents  
  
AI frequently produced code that looked correct but contained subtle logical or architectural issues. Examples include:  
  
* Incorrect assumptions about Prisma model field names.  
* Suggestions that ignored the project's hexagonal boundaries.  
* Re-render fixes that addressed symptoms but not causes.  
* Test fixes that worked once but were not deterministic.  
* **Initial architecture suggestions:** Early AI responses suggested placing Prisma client directly in route handlers, which violated hexagonal architecture principles. I had to explicitly constrain prompts with "no framework code in core" to get proper separation.  
* **Test path issues:** AI initially suggested using `request("http://localhost:4000")` for integration tests, which required a running server. It took follow-up prompts to get the correct pattern of using `request(app)` directly.  
  
I learned that AI is good at explaining error messages, summarizing code, and proposing restructuring steps. It is weaker at domain correctness, data consistency, and architectural discipline. I needed to cross-check every output.  
  
The learning curve involved adjusting my prompts. When I provided complete context, clear constraints, and expected outcomes, I received higher-quality answers. When I asked broad questions, I received generic output.  
  
## Improvements for Future Work  
  
If I repeat this workflow on another project, I will:  
  
* Always specify architectural constraints inside the prompt (for example, "do not modify core domain", "no side effects in pure functions", "Prisma must be wrapped in repository pattern").  
* Request small step-by-step patches instead of large rewrites.  
* Include real file paths and relevant code snippets in every prompt.  
* Maintain a small library of reusable prompts for debugging, refactoring, and testing patterns.  
* Use different agents for different tasks. Some are better at refactoring, others at debugging, others at producing structured patches.  
* **Explicitly request architecture diagrams:** When implementing complex patterns like hexagonal architecture, asking AI to generate Mermaid diagrams helped visualize the dependency flow and catch violations early.  
* **Iterative refinement:** For critical architectural decisions, I'll use multiple AI agents to cross-validate approaches before implementing.  
  
## Final Takeaway  
  
AI did not reduce the need for engineering judgment. It accelerated the feedback cycle. The quality of the final system depended on how well I reviewed, tested, and constrained the outputs. The best results occurred when I treated AI as a reasoning and diagnostic tool, not an automatic code generator.  
  
The project required careful verification, particularly in numerical logic for compliance balance and deterministic database state for tests. AI helped identify issues faster, but the correctness came from manual verification and a clear architectural approach.  
  
**Most importantly:** The hexagonal architecture implementation demonstrates that AI is most valuable when you already understand the design pattern you want to implement. AI helped me execute the pattern correctly (creating ports, implementing adapters, ensuring proper dependency flow), but I had to provide the architectural vision and validate that the implementation matched the specification. The final structure with `core/ports/`, `adapters/outbound/postgres/`, and proper dependency inversion only emerged after multiple iterations and explicit architectural constraints in my prompts.

