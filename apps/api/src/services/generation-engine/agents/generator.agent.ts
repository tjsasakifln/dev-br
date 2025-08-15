import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { GenerationState } from "../types";
import { openai } from "../utils/llm.config";

const systemPrompt = `Você é um arquiteto de software full-stack especialista. Sua tarefa é receber um prompt de um usuário e um conjunto de ficheiros de template existentes, e gerar uma aplicação completa e pronta para produção.

Você DEVE responder APENAS com um único objeto JSON. Este objeto JSON deve mapear os caminhos dos ficheiros (string) para o seu conteúdo de código completo (string).
NÃO inclua nenhum outro texto, explicações ou formatação markdown fora deste objeto JSON.

Exemplo de Saída:
{
  "src/components/Button.tsx": "export const Button = () => <button>Click me</button>;",
  "src/App.tsx": "import { Button } from './components/Button'; export const App = () => <Button />;"
}`;

export const generatorAgent = async (
  state: GenerationState
): Promise<Partial<GenerationState>> => {
  const newLogs = [
    ...state.agent_logs,
    "Generator Agent: Iniciando geração de código a partir do prompt e template.",
  ];
  console.log(newLogs[newLogs.length - 1]);

  try {
    const humanMessage = new HumanMessage({
      content: [
        {
          type: "text",
          text: `Gere o código para a seguinte aplicação: '${state.prompt}'.`,
        },
        {
          type: "text",
          text: `Utilize os seguintes ficheiros como base e modifique-os ou adicione novos conforme necessário. Ficheiros do Template:\n${JSON.stringify(
            state.template.files,
            null,
            2
          )}`,
        },
      ],
    });

    const response = await openai.invoke([
      new SystemMessage(systemPrompt),
      humanMessage,
    ]);

    const generatedCode = JSON.parse(response.content as string);

    return {
      generated_code: generatedCode,
      agent_logs: [
        ...newLogs,
        "Generator Agent: Código gerado e parseado com sucesso.",
      ],
    };
  } catch (error) {
    console.error("Generator Agent Error:", error);
    return {
      agent_logs: [
        ...newLogs,
        `Generator Agent: Erro ao gerar ou parsear código. Detalhes: ${
          (error as Error).message
        }`,
      ],
      error_message: (error as Error).message,
    };
  }
};