import { test, expect } from '@playwright/test'

/**
 * Smoke E2E covering RaceFlow's core onboarding flow: register a new
 * account, land on Salas, create a room, and confirm the app navigates
 * into that room's live map. Runs against a real backend (BASE_URL), not
 * mocks -- there is no test double for auth-service/realtime-service here.
 */
test.describe('register and create a room', () => {
  test('a new athlete can register and immediately create a training room', async ({ page }) => {
    const uniqueEmail = `e2e-${Date.now()}@raceflow.dev`

    // Target /login directly: once the marketing landing (PR #16) merges,
    // "/" no longer shows the auth form.
    await page.goto('/login')

    // Switch to the registration form
    await page.getByTestId('auth-toggle-mode').click()

    await page.getByTestId('register-name').fill('E2E Athlete')
    await page.getByTestId('login-email').fill(uniqueEmail)
    await page.getByTestId('login-password').fill('E2ePassword123')
    await page.getByTestId('auth-submit').click()

    // Successful registration redirects to /salas
    await expect(page).toHaveURL(/\/salas$/, { timeout: 10_000 })

    await page.getByTestId('create-room').click()

    // Room creation redirects to /sala/{CODE}/mapa with a real 6-char code
    await expect(page).toHaveURL(/\/sala\/[A-Z0-9]{6}\/mapa$/, { timeout: 10_000 })
  })
})
