import { GitHubService } from './github.service';

describe('GitHubService', () => {
  let githubService: GitHubService;

  beforeEach(() => {
    githubService = new GitHubService();
  });

  describe('convertGeneratedCodeToFiles', () => {
    it('should convert a flat object to file array', () => {
      const generatedCode = {
        'package.json': '{"name": "test"}',
        'src/App.tsx': 'export default function App() { return <div>Hello</div>; }',
        'README.md': '# Test Project',
      };

      const result = (githubService as any).convertGeneratedCodeToFiles(generatedCode);

      expect(result).toEqual([
        { path: 'package.json', content: '{"name": "test"}' },
        { path: 'src/App.tsx', content: 'export default function App() { return <div>Hello</div>; }' },
        { path: 'README.md', content: '# Test Project' },
      ]);
    });

    it('should convert nested objects to file paths', () => {
      const generatedCode = {
        src: {
          components: {
            'Button.tsx': 'export const Button = () => <button />;',
          },
          'App.tsx': 'export default function App() { return <div>Hello</div>; }',
        },
        'package.json': '{"name": "test"}',
      };

      const result = (githubService as any).convertGeneratedCodeToFiles(generatedCode);

      expect(result).toEqual([
        { path: 'src/components/Button.tsx', content: 'export const Button = () => <button />;' },
        { path: 'src/App.tsx', content: 'export default function App() { return <div>Hello</div>; }' },
        { path: 'package.json', content: '{"name": "test"}' },
      ]);
    });

    it('should handle empty object', () => {
      const generatedCode = {};
      const result = (githubService as any).convertGeneratedCodeToFiles(generatedCode);
      expect(result).toEqual([]);
    });
  });
});