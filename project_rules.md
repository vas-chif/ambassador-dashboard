# Beauty Shop Project Rules (Adapted)

> **IMPORTANT**: These rules are adapted from the "ProfessioneSiCura" guidelines for the "MariaBBC Beauty Shop" project.
> **Core Principle**: strict engineering standards, security-first, and cost optimization.

## 1. Fundamental Rules

- **Package Manager**: **YARN ONLY**. Never use `npm install`.
- **Navigation**: Use JWT/Auth State for permission checks where possible to save Firestore reads.
- **Logging**: Use `useSecureLogger` (to be created). **NO `console.log` in production**.
- **Security**:
  - Auto-logout (15 min) for Admin Dashboard (critical for data safety).
  - GDPR Compliance (Audit logs).
- **Cost Optimization & UX**:
  - Cache static and semi-static data (Profile, Layouts, Products, Articles) in `localStorage` or Pinia with persistence.
  - Pattern Stale-While-Revalidate: render immediately from local cache for instant UX, revalidate with Firestore in background.
  - Read data on-demand, not auto-sync loops.

## 2. Code & Architecture

- **Language**: TypeScript Strict Mode.
- **Vue Style**:
  - Composition API `<script setup lang="ts">`.
  - **File Order**:
    1. `<script setup>`
    2. `<template>`
    3. `<style>`
- **Documentation**:
  - **File Headers**: Mandatory JSDoc header in every file.
  - **Comments**: English for code comments, Italian allowed for docs/chat.
- **Project Structure** (Adapted for Single Quasar App):
  - `src/types/`: Centralized TypeScript Interfaces (No inline types in stores/components).
  - `src/shared/`: Reusable logic (logging, utils).
  - `src/modules/admin/`: Admin specific pages/components.
  - `src/modules/ambassador/`: Ambassador specific pages/components.
  - `src/stores/`: Pinia stores.

## 3. UI/UX "User Friendly" Mandate

- **Product Upload**: Must be extremely simple (Wizard style, Drag & Drop).
- **Ambassador Editor**: Intuitive Drag & Drop grid system.
- **Responsiveness**: Mobile-first for Public pages, Desktop-optimized for Admin.

## 4. Development Workflow

- **Branch Strategy (Strict 2-Branches)**:
  - `dev`: Active development, features, testing and staging.
  - `main`: Production only. Releases only via controlled merge from `dev`. No direct commits to `main`.
- **Pre-Commit**: Check `yarn lint` and `npx vue-tsc --noEmit`.
- **Environment**: Strict separation of `.env.development` and `.env.production`.
