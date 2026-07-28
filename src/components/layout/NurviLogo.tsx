export function NurviLogo({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect width="40" height="40" rx="12" fill="var(--color-accent, #6D5AE6)" />
      {/* friendly rounded "n" */}
      <path
        d="M13.5 28V19.5C13.5 16.6 15.7 14.8 18.6 14.8C21.5 14.8 23.5 16.9 23.5 19.8V28"
        stroke="#FFFFFF"
        strokeWidth="3.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* signature butter pop dot */}
      <circle cx="28.8" cy="13.2" r="3.4" fill="#FFC94D" />
    </svg>
  );
}

// Backwards-compatible alias
export { NurviLogo as AvontLogo };
