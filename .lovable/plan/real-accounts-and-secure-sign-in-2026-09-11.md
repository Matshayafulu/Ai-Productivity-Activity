# Real accounts and secure sign-in

Today the app accepts any email plus a 6-character password and remembers you only in this browser. This plan replaces that with real accounts, without changing how the app looks or works.

## What changes for users

- **Sign in page** (current home page): same layout, styling and validation, but now checks a real password. Wrong details show a clear error message.
- **Create account**: a new tab/toggle on the same page for name, work email, password and confirm password, with strength and match checks, plus a success message.
- **Stay signed in**: your session persists across refresh and devices, not just this browser.
- **Sign out**: the existing profile menu item ends the real session and returns you to the sign-in page.
- **Protected pages**: every tool page (Dashboard, Email, Notes, Planner, Research, THANDI, Staff, Activity) stays reachable only when signed in; signed-out visitors land on the sign-in page instead of a blank flash.
- **Your name and email** in the header and profile menu come from your real account.

Everything else — design, sidebar, header, help, footer, availability, activity tracker, staff directory and all AI tools — stays exactly as it is.

## Technical approach

1. **Enable Lovable Cloud** (accounts + database). Turn on email/password sign-in.
2. **Profiles table** with `id` referencing the auth user, `full_name`, `email`, created timestamp; row-level security so a user reads/updates only their own row; a trigger creates the profile automatically on signup.
3. **Auth wiring**
   - Single `onAuthStateChange` subscriber in `src/routes/__root.tsx` that invalidates the router on identity changes.
   - `src/lib/app-store.tsx`: keep all existing state (availability, staff, messages, activities, chat) in local storage; replace only the `user` field so it is derived from the live session/profile, and change `login`/`logout` to call the auth service. Activity logging for sign-in/sign-out is preserved.
4. **Route protection** — move the tool pages under the managed `_authenticated` layout, or keep the existing `/app` guard and switch its check from the local flag to the verified session, whichever preserves current URLs. Current URLs (`/app`, `/app/email`, …) stay unchanged.
5. **Sign-in page** (`src/routes/index.tsx`): keep markup and validation; add a Sign in / Create account toggle, wire submit to real auth, map errors ("invalid credentials", "email already registered", "check your inbox to confirm") to inline messages and toasts.
6. Signup confirmation: default is an emailed confirmation link. If you prefer new users to be signed in immediately, say so and it will be configured that way.

## Scope note

No existing page, component or style is removed. Only the auth-related parts of the store, the sign-in page and the route guard are touched.
