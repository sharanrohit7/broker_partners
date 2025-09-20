# Contributing Guide

Welcome! 🎉

This document explains how we work with branches, pull requests (PRs), and reviews in this repository.

Please follow this workflow to keep our history clean and ensure safe releases.

---

## 🔹 Branch Structure

We maintain **three main branches**:

* **`main`** → Production branch

  * Only merges from `staging`
  * Requires PR + 1 review

* **`staging`** → Pre-production/testing branch

  * Only merges from `dev`
  * Requires PR + 1 review

* **`dev`** → Active development branch

  * All features start here
  * Requires PR, but no review needed (self-merge allowed)

---

## 🔹 Typical Flow

```
feature branch → dev → staging → main
```

* Developers branch from `dev` and self-merge into `dev`.
* QA happens in `staging`, requires review.
* Stable changes move to `main` after review.

---

## 🔹 Step-by-Step Workflow

### Start a New Feature/Fix

```bash
git checkout dev
git pull origin dev
git checkout -b feature/your-feature-name
```

### Make Changes & Commit

```bash
git add .
git commit -m "Add: short description of your change"
git push origin feature/your-feature-name
```

### Create PR → `dev`

On GitHub, open a PR:

* **Base branch:** `dev`
* **Compare branch:** `feature/your-feature-name`

You may merge it yourself once checks pass (no review needed).

### Promote to `staging`

When tested locally and stable in `dev`:

```bash
git checkout feature/your-feature-name
git pull origin dev
```

Open PR:

* **Base branch:** `staging`
* **Compare branch:** `feature/your-feature-name`

Requires **1 reviewer approval**.

### Release to `main`

Once `staging` passes QA:

Open PR:

* **Base branch:** `main`
* **Compare branch:** `staging`

Requires **1 reviewer approval** before merge.

---

## 🔹 Best Practices

* Branch naming:

  * `feature/...` → new features
  * `bugfix/...` → non-urgent fixes
  * `hotfix/...` → urgent fixes for `staging`/`main`
* Keep PRs small and focused.
* Always sync with the latest `dev` before creating a PR.
* Write clear commit messages and PR descriptions.
* Resolve all conversations before merging.

---

✅ Follow this process to ensure smooth collaboration, easier reviews, and safe releases.
