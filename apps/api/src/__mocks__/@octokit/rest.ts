export class Octokit {
  rest = {
    users: {
      getAuthenticated: jest.fn().mockResolvedValue({
        data: { login: 'testuser' }
      })
    },
    repos: {
      createForAuthenticatedUser: jest.fn().mockResolvedValue({
        data: { html_url: 'https://github.com/testuser/test-repo', name: 'test-repo' }
      })
    },
    git: {
      createBlob: jest.fn().mockResolvedValue({
        data: { sha: 'mocksha123' }
      }),
      createTree: jest.fn().mockResolvedValue({
        data: { sha: 'treesha123' }
      }),
      createCommit: jest.fn().mockResolvedValue({
        data: { sha: 'commitsha123' }
      }),
      updateRef: jest.fn().mockResolvedValue({
        data: { ref: 'refs/heads/main' }
      })
    }
  };

  constructor(options?: any) {
    // Mock constructor
  }
}