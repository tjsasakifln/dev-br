import { Worker } from 'bullmq';
import OpenAI from 'openai';
import { prisma } from '../lib/prisma';
import { redisConnection } from '../lib/queue';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface ValidationResult {
  valid: boolean;
  reason?: string;
}

const validateGeneratedCode = async (generatedFiles: Record<string, string>): Promise<ValidationResult> => {
  try {
    const packageJson = generatedFiles['package.json'];
    const serverFile = generatedFiles['server.js'] || generatedFiles['index.js'];
    
    if (!packageJson) {
      return { valid: false, reason: 'package.json não encontrado' };
    }
    
    if (!serverFile) {
      return { valid: false, reason: 'Arquivo principal do servidor não encontrado' };
    }

    const systemPrompt = `Você é um agente de QA automatizado. Sua tarefa é realizar uma verificação de sanidade estática em um projeto Node.js. Analise os arquivos fornecidos e responda APENAS com um objeto JSON. Não adicione nenhum outro texto.`;

    const userPrompt = `Analise os seguintes arquivos:

PACKAGE.JSON:
${packageJson}

SERVIDOR PRINCIPAL:
${serverFile}

Verifique:
1. Existem erros de sintaxe óbvios?
2. As dependências importadas no servidor correspondem às listadas no package.json?
3. A estrutura básica do projeto está correta?

Responda com o seguinte formato JSON:
{"valid": boolean, "reason": "uma breve explicação se não for válido"}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.1,
      max_tokens: 200,
    });

    const aiResponse = response.choices[0]?.message?.content;
    
    if (!aiResponse) {
      return { valid: false, reason: 'Falha na validação: resposta vazia da IA' };
    }

    try {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : aiResponse;
      const validationResult = JSON.parse(jsonString) as ValidationResult;
      
      return validationResult;
    } catch (parseError) {
      console.error('Erro ao fazer parse da validação:', parseError);
      return { valid: false, reason: 'Erro interno na validação' };
    }
  } catch (error) {
    console.error('Erro durante validação:', error);
    return { valid: false, reason: 'Erro interno na validação' };
  }
};

const processProject = async (projectId: string) => {
  console.log(`[Worker] Iniciando geração para projeto: ${projectId}`);
  
  try {
    // Buscar o projeto completo do banco de dados
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new Error(`Projeto ${projectId} não encontrado`);
    }

    // Buscar o template react-express-base
    const template = await prisma.template.findUnique({
      where: { name: 'react-express-base' }
    });

    if (!template) {
      throw new Error('Template react-express-base não encontrado');
    }

    // Atualizar status para IN_PROGRESS
    await prisma.project.update({
      where: { id: projectId },
      data: { status: 'IN_PROGRESS' },
    });
    
    console.log(`[Worker] Gerando aplicação completa com IA para: "${project.prompt}"`);
    
    // Construir o prompt de sistema para chain-of-thought reasoning
    const systemPrompt = `Você é um engenheiro de software sênior especialista em desenvolvimento full-stack. Sua tarefa é modificar um projeto completo React + Express baseado na descrição do usuário.

CONTEXTO:
Você receberá um template base de uma aplicação full-stack e uma descrição do usuário de como ela deve ser modificada.

PROCESSO DE RACIOCÍNIO:
1. Analise a descrição do usuário para entender os requisitos
2. Examine a estrutura atual do projeto fornecida no template
3. Identifique quais arquivos precisam ser modificados ou criados
4. Considere as dependências e integrações entre frontend e backend
5. Mantenha a estrutura existente quando possível

REGRAS IMPORTANTES:
- Sua resposta DEVE ser um único objeto JSON válido contendo toda a estrutura de arquivos
- Mantenha todos os arquivos existentes, mesmo que não modificados
- Use as melhores práticas para React + TypeScript + Express
- Garanta que o código seja funcional e completo
- Mantenha consistência na nomenclatura e estrutura
- Adicione apenas as dependências necessárias no package.json

FORMATO DA RESPOSTA:
{
  "package.json": "conteúdo do arquivo...",
  "server.js": "conteúdo do arquivo...",
  "client/src/App.tsx": "conteúdo do arquivo...",
  ... (todos os outros arquivos)
}`;

    // Preparar o contexto do template para a IA
    const templateContext = `ESTRUTURA ATUAL DO PROJETO:

${JSON.stringify(template.files, null, 2)}

ARQUIVOS NO TEMPLATE:
${Object.keys(template.files as Record<string, unknown>).join('\n- ')}`;

    const userPrompt = `${templateContext}

DESCRIÇÃO DO USUÁRIO:
${project.prompt}

Com base na descrição do usuário acima, modifique os arquivos do template fornecido para implementar os recursos solicitados. Sua resposta deve ser um JSON válido contendo a estrutura completa de arquivos atualizada.`;

    // Chamar a API da OpenAI
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 4000,
    });

    const aiResponse = response.choices[0]?.message?.content;
    
    if (!aiResponse) {
      throw new Error('IA não retornou resposta válida');
    }
    
    // Parse da resposta da IA para garantir que é um JSON válido
    let generatedFiles;
    try {
      // Extrair JSON da resposta caso venha com texto adicional
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : aiResponse;
      generatedFiles = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('Erro ao fazer parse da resposta da IA:', parseError);
      throw new Error('IA não retornou JSON válido');
    }
    
    // Validar o código gerado antes de finalizar
    console.log(`[Worker] Validando código gerado para projeto: ${projectId}`);
    
    const validationResult = await validateGeneratedCode(generatedFiles);
    
    if (validationResult.valid) {
      // Salvar a estrutura de arquivos no banco de dados
      await prisma.project.update({
        where: { id: projectId },
        data: { 
          status: 'COMPLETED',
          generatedCode: generatedFiles
        },
      });
      
      console.log(`[Worker] Geração concluída para projeto: ${projectId}`);
      console.log(`[Worker] Arquivos gerados: ${Object.keys(generatedFiles).length}`);
    } else {
      // Marcar como falhado com a razão da validação
      await prisma.project.update({
        where: { id: projectId },
        data: { 
          status: 'FAILED',
          failureReason: validationResult.reason
        },
      });
      
      console.log(`[Worker] Validação falhou para projeto: ${projectId} - ${validationResult.reason}`);
      throw new Error(`Validação falhou: ${validationResult.reason}`);
    }
  } catch (error) {
    console.error(`[Worker] Erro na geração do projeto ${projectId}:`, error);
    await prisma.project.update({
      where: { id: projectId },
      data: { 
        status: 'FAILED',
        failureReason: error instanceof Error ? error.message : 'Erro desconhecido'
      },
    });
    throw error;
  }
};

export const generationWorker = new Worker('generationQueue', async (job) => {
  const { projectId } = job.data;
  await processProject(projectId);
}, { 
  connection: redisConnection,
});

console.log("Generation Worker is running...");