import { GitHubSVG } from './github';
import { LangGraphLogoSVG } from './langgraph';

export const Icons = {
  github: GitHubSVG,
  langgraph: LangGraphLogoSVG,
  google: ({ className }: { className?: string }) => (
    <svg className={className} role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <title>Google</title>
      <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.02 1.02-2.6 1.98-4.66 1.98-3.57 0-6.45-2.84-6.45-6.35s2.88-6.35 6.45-6.35c1.96 0 3.33.74 4.3 1.69l2.5-2.5C18.16 3.84 15.76 3 12.48 3c-5.21 0-9.48 4.22-9.48 9.42s4.27 9.42 9.48 9.42c5.08 0 9.02-3.47 9.02-9.13 0-.64-.07-1.25-.16-1.83z" fill="currentColor"/>
    </svg>
  ),
  file: ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  spinner: ({ className }: { className?: string }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  ),
};