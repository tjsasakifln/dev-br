import { OpenSWELogoSVG } from './openswe';
import { GitHubSVG } from './github';
import { LangGraphLogoSVG } from './langgraph';

export const Icons = {
  openswe: OpenSWELogoSVG,
  github: GitHubSVG,
  langgraph: LangGraphLogoSVG,
  google: ({ className }: { className?: string }) => (
    <svg className={className} role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <title>Google</title>
      <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.02 1.02-2.6 1.98-4.66 1.98-3.57 0-6.45-2.84-6.45-6.35s2.88-6.35 6.45-6.35c1.96 0 3.33.74 4.3 1.69l2.5-2.5C18.16 3.84 15.76 3 12.48 3c-5.21 0-9.48 4.22-9.48 9.42s4.27 9.42 9.48 9.42c5.08 0 9.02-3.47 9.02-9.13 0-.64-.07-1.25-.16-1.83z" fill="currentColor"/>
    </svg>
  ),
};