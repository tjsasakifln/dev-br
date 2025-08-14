import { Project } from '@/types'

interface ProjectListProps {
  projects: Project[]
}

/**
 * Componente que renderiza uma lista de projetos em formato de grid
 * @param projects - Array de projetos para exibir
 */
export function ProjectList({ projects }: ProjectListProps) {
  /**
   * Retorna as classes CSS para o status badge baseado no status do projeto
   */
  const getStatusBadgeClasses = (status: string): string => {
    switch (status) {
      case 'Concluído':
        return 'bg-green-100 text-green-800'
      case 'Em Desenvolvimento':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <div
          key={project.id}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {project.name}
            </h3>
            <span
              className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeClasses(project.status)}`}
            >
              {project.status}
            </span>
          </div>
          
          {project.description && (
            <p className="text-gray-600 text-sm mb-4">
              {project.description}
            </p>
          )}
          
          <div className="flex justify-between items-center text-sm text-gray-500">
            <span>
              {new Date(project.created_at).toLocaleDateString('pt-BR')}
            </span>
            {project.pr_url && (
              <a
                href={project.pr_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800"
              >
                Ver PR
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}