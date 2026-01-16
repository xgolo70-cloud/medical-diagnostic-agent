---
name: code-review
description: Reviews code changes for bugs, style issues, security vulnerabilities, and best practices. Use when reviewing pull requests, checking code quality, or validating implementations for the medical diagnostic application.
---

# Code Review Skill

This skill provides a comprehensive framework for reviewing code in this HIPAA-compliant medical diagnostic application.

## Review Priority Levels

| Level | Category | Description |
|-------|----------|-------------|
| 🔴 Critical | Security/HIPAA | Must fix before merge |
| 🟠 High | Bugs/Logic | Should fix before merge |
| 🟡 Medium | Performance | Should address soon |
| 🟢 Low | Style/Readability | Nice to have |

## Review Checklist

### 1. Security & HIPAA Compliance (🔴 Critical)

- [ ] **No PHI in logs**: Console.log, print statements, or logger calls don't contain patient data
- [ ] **Audit logging**: Data access is properly logged for HIPAA audit trails
- [ ] **Authentication**: Endpoints require proper authentication
- [ ] **Authorization**: User permissions are validated before data access
- [ ] **Input sanitization**: All user inputs are validated and sanitized
- [ ] **SQL injection**: Parameterized queries used, no string concatenation
- [ ] **Secrets management**: No hardcoded API keys, passwords, or tokens

```python
# 🔴 BAD - PHI in logs
logger.info(f"Processing diagnosis for patient: {patient.name}, SSN: {patient.ssn}")

# ✅ GOOD - No PHI in logs
logger.info(f"Processing diagnosis for patient_id: {patient.id}")
```

### 2. Correctness & Logic (🟠 High)

- [ ] **Does what it claims**: Code fulfills the stated requirements
- [ ] **Edge cases handled**: Null values, empty arrays, boundary conditions
- [ ] **Error handling**: Exceptions caught and handled appropriately
- [ ] **Medical accuracy**: Diagnostic logic aligns with medical standards
- [ ] **Ontology compliance**: Uses correct SNOMED CT / ICD-10 codes

### 3. Performance (🟡 Medium)

- [ ] **N+1 queries**: Database queries are optimized
- [ ] **Caching**: Frequently accessed data is cached when appropriate
- [ ] **Async operations**: I/O operations are properly async
- [ ] **Memory leaks**: No obvious memory leak patterns
- [ ] **Large data handling**: Pagination for large datasets

### 4. Code Quality (🟢 Low)

- [ ] **Naming conventions**: Variables and functions have clear, descriptive names
- [ ] **DRY principle**: No unnecessary code duplication
- [ ] **Documentation**: Complex logic is documented
- [ ] **Type safety**: TypeScript/Python types are properly defined
- [ ] **Test coverage**: New code has accompanying tests

## Language-Specific Reviews

### Python (Backend)
```python
# Check for:
- Type hints on all function signatures
- Pydantic models for request/response
- Async/await for I/O operations
- Proper exception handling
- pytest test coverage
```

### TypeScript/React (Frontend)
```typescript
// Check for:
- Proper TypeScript types (no 'any')
- React hooks dependencies
- Memory leak prevention (cleanup in useEffect)
- Accessibility attributes
- Cosmic Glass design compliance
```

## How to Provide Feedback

### Be Specific
```markdown
# 🟠 Issue: Missing null check

**File:** `services/diagnosis.py:45`

**Problem:** 
The `patient_data.lab_results` could be None, causing an AttributeError.

**Suggestion:**
```python
lab_results = patient_data.lab_results or []
for result in lab_results:
    # process
```
```

### Explain the Why
```markdown
# 🔴 Security: PHI Exposure Risk

**File:** `routers/patient.py:23`

**Problem:**
Error message includes patient name which could be logged or displayed.

**Why it matters:**
Under HIPAA, exposing PHI in error messages violates the minimum necessary standard and could result in compliance violations.

**Fix:**
Return generic error message, log patient_id only.
```

### Suggest Alternatives
```markdown
# 🟡 Performance: N+1 Query Pattern

**File:** `services/report.py:67-72`

**Current approach:**
```python
for patient in patients:
    diagnoses = await db.get_diagnoses(patient.id)  # N queries
```

**Suggested approach:**
```python
patient_ids = [p.id for p in patients]
diagnoses = await db.get_diagnoses_batch(patient_ids)  # 1 query
```

**Impact:** Reduces database calls from N+1 to 2.
```

## Review Response Template

```markdown
## Code Review Summary

**PR/Change:** [Description]
**Reviewer:** [Name/AI]
**Date:** [Date]

### 🔴 Critical Issues (X)
1. [Issue description]

### 🟠 High Priority (X)
1. [Issue description]

### 🟡 Medium Priority (X)
1. [Issue description]

### 🟢 Suggestions (X)
1. [Suggestion]

### ✅ Positives
- [What was done well]

### Verdict
[ ] ✅ Approved
[ ] ⚠️ Approved with minor changes
[ ] 🔄 Request changes
[ ] 🔴 Blocked - Critical issues
```
