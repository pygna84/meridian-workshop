import { defineConfig, devices } from '@playwright/test'

const FRONTEND = process.env.E2E_BASE_URL ?? 'http://localhost:3000'
const BACKEND = process.env.E2E_API_URL ?? 'http://localhost:8001'

// We assume the dev servers are already running (./scripts/start.sh or /start
// slash command). Set E2E_AUTOSTART=1 to have Playwright spin them up itself.
const autostart = process.env.E2E_AUTOSTART === '1'

export default defineConfig({
  testDir: './specs',
  fullyParallel: false, // mock data is shared & in-memory; serialize for stability
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [['list'], ['html', { open: 'never' }]],

  use: {
    baseURL: FRONTEND,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    locale: 'en-US',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: autostart
    ? [
        {
          command: 'python main.py',
          cwd: '../../server',
          url: `${BACKEND}/`,
          reuseExistingServer: true,
          timeout: 60_000,
        },
        {
          command: 'npm run dev',
          cwd: '../../client',
          url: FRONTEND,
          reuseExistingServer: true,
          timeout: 60_000,
        },
      ]
    : undefined,
})
