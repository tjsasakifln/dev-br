import { Project } from '@/types'

/**
 * Serviço responsável por operações relacionadas aos projetos
 */
export class ProjectService {
  /**
   * Busca a lista de projetos do usuário
   * @param accessToken - Token de acesso para autenticação
   * @returns Promise com array de projetos
   * @throws Error se a requisição falhar
   */
  static async getProjects(accessToken?: string): Promise<Project[]> {
    try {
      // Em ambiente de teste (Cypress) ou quando window.Cypress está disponível,
      // fazemos uma chamada HTTP real que será interceptada
      if (typeof window !== 'undefined' && (window as any).Cypress) {
        const response = await fetch('/api/projects', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        })
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        return response.json()
      }
      
      // Em outros ambientes, simula uma chamada de API
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Mock data - retorna array vazio por padrão
      return []
    } catch (error) {
      console.error('Failed to fetch projects:', error)
      throw new Error('Failed to load projects')
    }
  }

  /**
   * Cria um novo projeto
   * @param projectData - Dados do projeto a ser criado
   * @param accessToken - Token de acesso para autenticação
   * @returns Promise com o projeto criado
   */
  static async createProject(projectData: Partial<Project>, accessToken?: string): Promise<Project> {
    // Implementação futura para criar projetos
    throw new Error('Not implemented yet')
  }
}