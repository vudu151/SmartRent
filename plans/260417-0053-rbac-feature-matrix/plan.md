# Plan: Feature Matrix - Role Based Module Allocation
Created: 2026-04-17
Status: ðŸŸ¡ In Progress

## Overview
Implement strict feature filtering, UI segregation, and Logic scoping for 4 user roles: `SUPER_ADMIN`, `TENANT_MANAGER`, `GUARD`, `TENANT`.

## Tech Stack
- Frontend: React + TailwindCSS (Material Tailwind)
- Backend: Spring Boot + Spring Security
- Database: MySQL
- Core Mechanism: `tenantId` mapping and `@PreAuthorize`

## Phases

| Phase | Name | Status | Progress |
|-------|------|--------|----------|
| 01 | Cáº¥u trÃºc dá»¯ liá»‡u Database (Kiá»ƒm tra láº¡i) | âœ… Complete | 100% |
| 02 | Háº¡n cháº¿ dá»¯ liá»‡u vÄ© mÃ´ (Super Admin vs Manager) | â¬œ Pending | 0% |
| 03 | Thu gá»n giao diá»‡n Guard (Báº£o vá»‡) | â¬œ Pending | 0% |
| 04 | Portal (Guest / Tenant) Sync | â¬œ Pending | 0% |
| 05 | Testing & Validation | â¬œ Pending | 0% |

## Quick Commands
- Start Phase 1: `/code phase-01`
- Check progress: `/next`
- Save context: `/save-brain`




