# Antigravity Skills Directory

This directory contains specialized skills that extend the AI agent's capabilities for developing and maintaining the **Medical Diagnostic AI Application**.

## 📚 Available Skills

| Skill | Purpose | When to Use |
|-------|---------|-------------|
| **cosmic-glass-ui** | Cosmic Glass design system implementation | Creating/modifying UI components |
| **react-component** | React component development patterns | Building new frontend features |
| **fastapi-endpoint** | FastAPI endpoint creation guidelines | Adding new API routes |
| **code-review** | Comprehensive code review framework | Reviewing PRs, checking quality |
| **testing** | Testing strategies (pytest, Playwright) | Writing tests for new features |
| **hipaa-compliance** | HIPAA regulatory compliance | Handling PHI, security features |

## 🏗️ Skill Structure

Each skill folder contains:
```
skill-name/
├── SKILL.md          # Main instruction file (required)
├── scripts/          # Helper scripts (optional)
├── examples/         # Reference implementations (optional)
└── resources/        # Additional documentation (optional)
```

## 🚀 How Skills Work

1. **Discovery**: The agent scans this directory and reads skill metadata
2. **Activation**: Based on your request, relevant skills are activated
3. **Execution**: The agent follows the skill's instructions

## 📝 Creating New Skills

To add a new skill:

1. Create a new directory: `.antigravity/skills/skill-name/`
2. Add a `SKILL.md` file with YAML frontmatter:

```markdown
---
name: skill-name
description: Clear description of what this skill does and when to use it.
---

# Skill Title

[Detailed instructions here...]
```

## 🎯 Project-Specific Context

This skills directory is configured for a **HIPAA-compliant Medical Diagnostic AI Application** with:

- **Backend**: Python 3.11+ / FastAPI
- **Frontend**: React 18+ / TypeScript
- **AI Core**: Gemini 2.0 Flash, Med-PaLM
- **Compliance**: HIPAA, SNOMED CT, ICD-10

All skills are tailored to maintain:
- ✅ Medical data security
- ✅ Regulatory compliance
- ✅ Consistent design patterns
- ✅ High code quality standards
