import { Worker } from 'bullmq';
import OpenAI from 'openai';
import { prisma } from '../lib/prisma';
import { redisConnection } from '../lib/queue';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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
  } catch (error) {
    console.error(`[Worker] Erro na geração do projeto ${projectId}:`, error);
    await prisma.project.update({
      where: { id: projectId },
      data: { status: 'FAILED' },
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