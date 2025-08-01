import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test.describe('Sign In', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/auth/sign-in')
    })

    test('displays sign in form', async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible()
      await expect(page.getByLabel('Email')).toBeVisible()
      await expect(page.getByLabel('Password')).toBeVisible()
      await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible()
    })

    test('shows OAuth options', async ({ page }) => {
      await expect(page.getByRole('button', { name: /Continue with Google/i })).toBeVisible()
    })

    test('navigates to sign up', async ({ page }) => {
      await page.getByRole('link', { name: 'Sign up' }).click()
      await expect(page).toHaveURL('/auth/signup')
    })

    test('navigates to password reset', async ({ page }) => {
      await page.getByRole('link', { name: 'Forgot your password?' }).click()
      await expect(page).toHaveURL('/auth/reset-password')
    })

    test('validates required fields', async ({ page }) => {
      await page.getByRole('button', { name: 'Sign In' }).click()
      await expect(page.getByLabel('Email')).toBeFocused()
    })
  })

  test.describe('Sign Up', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/auth/signup')
    })

    test('displays sign up form', async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'Join Napoleon AI' })).toBeVisible()
      await expect(page.getByLabel('First name')).toBeVisible()
      await expect(page.getByLabel('Last name')).toBeVisible()
      await expect(page.getByLabel('Work email')).toBeVisible()
      await expect(page.getByLabel('Password')).toBeVisible()
    })

    test('shows password requirements', async ({ page }) => {
      await expect(page.getByText(/Minimum 8 characters/i)).toBeVisible()
    })

    test('navigates to sign in', async ({ page }) => {
      await page.getByRole('link', { name: 'Sign in' }).click()
      await expect(page).toHaveURL('/auth/sign-in')
    })

    test('shows terms and privacy links', async ({ page }) => {
      await expect(page.getByRole('link', { name: 'Terms of Service' })).toBeVisible()
      await expect(page.getByRole('link', { name: 'Privacy Policy' })).toBeVisible()
    })

    test('validates email format', async ({ page }) => {
      await page.getByLabel('Work email').fill('invalid-email')
      await page.getByLabel('Password').fill('ValidPass123!')
      await page.getByRole('button', { name: 'Create Account' }).click()
      await expect(page.getByLabel('Work email')).toHaveAttribute('type', 'email')
    })
  })

  test.describe('Authenticated Flow', () => {
    test('redirects authenticated users from sign in to dashboard', async ({ page }) => {
      // Mock authenticated state
      await page.addInitScript(() => {
        window.localStorage.setItem('__clerk_db_jwt', 'mock-jwt-token')
      })
      
      await page.goto('/auth/sign-in')
      await expect(page).toHaveURL('/dashboard')
    })

    test('redirects authenticated users from sign up to onboarding', async ({ page }) => {
      // Mock authenticated state
      await page.addInitScript(() => {
        window.localStorage.setItem('__clerk_db_jwt', 'mock-jwt-token')
      })
      
      await page.goto('/auth/signup')
      await expect(page).toHaveURL('/onboarding')
    })
  })
})