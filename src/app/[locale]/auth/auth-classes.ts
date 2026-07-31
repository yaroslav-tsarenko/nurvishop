// Shared Tailwind class strings for the auth pages (converted from auth.module.css).
// Kept in one place because login / register / forgot-password / reset-password
// all render the same visual shell.

export const authPage =
  "relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-8 " +
  "[background:linear-gradient(135deg,#eff6ff_0%,#f0f4ff_30%,#faf5ff_70%,#fdf2f8_100%)] " +
  "[[data-theme=dark]_&]:[background:linear-gradient(135deg,#0a0a1a_0%,#0f0f23_30%,#1a0f2e_70%,#0a0a1a_100%)] " +
  "before:pointer-events-none before:absolute before:-left-1/2 before:-top-1/2 before:h-[200%] before:w-[200%] before:content-[''] " +
  "before:[background:radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.08)_0%,transparent_50%),radial-gradient(circle_at_70%_80%,rgba(139,92,246,0.06)_0%,transparent_50%)] " +
  "[[data-theme=dark]_&]:before:[background:radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.06)_0%,transparent_50%),radial-gradient(circle_at_70%_80%,rgba(139,92,246,0.04)_0%,transparent_50%)]";

export const authCard =
  "relative w-full max-w-[420px] rounded-2xl border border-white/60 bg-white/80 p-10 backdrop-blur-[20px] " +
  "shadow-[0_20px_60px_-10px_rgba(0,0,0,0.08),0_8px_20px_-6px_rgba(0,0,0,0.04),0_0_0_1px_rgba(0,0,0,0.03)] " +
  "[[data-theme=dark]_&]:border-white/[0.08] [[data-theme=dark]_&]:bg-[rgba(17,17,17,0.8)] " +
  "[[data-theme=dark]_&]:shadow-[0_20px_60px_-10px_rgba(0,0,0,0.4),0_8px_20px_-6px_rgba(0,0,0,0.3),0_0_0_1px_rgba(255,255,255,0.05)] " +
  "max-[480px]:px-5 max-[480px]:py-7";

export const authHeader = "mb-8 text-center";

export const logoIcon =
  "mb-5 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-accent text-white shadow-accent";

export const authTitle =
  "mb-2 text-[1.75rem] font-extrabold tracking-tight text-ink max-[480px]:text-2xl";

export const authSubtitle = "text-[0.9375rem] leading-[1.5] text-muted";

export const form = "flex flex-col gap-4";

export const inputGroup = "flex flex-col gap-1.5";

export const inputLabel = "text-[0.8125rem] font-medium text-muted";

export const inputWrapper = "group relative flex items-center";

export const inputIcon =
  "pointer-events-none absolute left-3 z-[1] text-subtle transition-colors group-focus-within:text-accent";

export const input =
  "w-full rounded-lg border border-line bg-surface py-2.5 pl-10 pr-3 text-sm text-ink outline-none transition-[border-color,box-shadow] " +
  "placeholder:text-subtle hover:border-line-hover focus:border-accent focus:shadow-[0_0_0_3px_var(--color-accent-light)]";

export const inputWithToggle = "pr-10";

export const inputToggle =
  "absolute right-2 flex items-center justify-center rounded-sm border-0 bg-transparent p-1 text-subtle transition-colors hover:text-muted";

export const forgotPasswordLink =
  "block text-right text-[0.8125rem] font-medium text-accent no-underline transition-opacity hover:opacity-80";

export const submitButton = "mt-2";

export const magicLinkSent =
  "rounded-md border border-line bg-mist p-6 text-center [&_svg]:mx-auto [&_svg]:mb-3 [&_svg]:block [&_svg]:text-accent " +
  "[&_p]:m-0 [&_p]:text-[0.9375rem] [&_p]:leading-[1.5] [&_p]:text-muted";

export const authFooter =
  "mt-7 text-center text-sm text-muted [&_a]:font-semibold [&_a]:text-accent [&_a]:no-underline [&_a]:transition-opacity hover:[&_a]:opacity-80";

export const termsText =
  "m-0 text-[0.8125rem] leading-[1.5] text-subtle [&_a]:text-accent [&_a]:no-underline hover:[&_a]:underline";
