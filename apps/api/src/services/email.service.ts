import nodemailer from 'nodemailer';

interface GenerationSuccessData {
  projectName: string;
  repositoryUrl: string;
}

interface GenerationFailedData {
  projectName: string;
  failureReason: string;
}

const transporter = nodemailer.createTransport({
  host: process.env.ETHEREAL_HOST || 'smtp.ethereal.email',
  port: parseInt(process.env.ETHEREAL_PORT || '587'),
  secure: false, // true para 465, false para outras portas
  auth: {
    user: process.env.ETHEREAL_USER,
    pass: process.env.ETHEREAL_PASS,
  },
});

export const sendGenerationSuccessEmail = async (
  to: string, 
  data: GenerationSuccessData
): Promise<void> => {
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Sua aplicação está pronta! 🎉</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f8f9fa;
        }
        .container {
          background-color: white;
          border-radius: 12px;
          padding: 40px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .success-icon {
          font-size: 64px;
          margin-bottom: 20px;
        }
        h1 {
          color: #28a745;
          margin-bottom: 10px;
        }
        .project-name {
          background-color: #e9ecef;
          padding: 15px;
          border-radius: 8px;
          margin: 20px 0;
          font-weight: bold;
        }
        .cta-button {
          display: inline-block;
          background-color: #007bff;
          color: white;
          padding: 15px 30px;
          text-decoration: none;
          border-radius: 8px;
          font-weight: bold;
          margin: 20px 0;
          text-align: center;
        }
        .footer {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #dee2e6;
          font-size: 14px;
          color: #6c757d;
          text-align: center;
        }
        .features {
          background-color: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
        }
        .feature-item {
          margin: 10px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="success-icon">🎉</div>
          <h1>Sua aplicação está pronta!</h1>
          <p>Parabéns! A geração do seu projeto foi concluída com sucesso.</p>
        </div>
        
        <div class="project-name">
          📂 Projeto: ${data.projectName}
        </div>
        
        <div class="features">
          <h3>🚀 O que foi gerado para você:</h3>
          <div class="feature-item">✅ Aplicação React completa com TypeScript</div>
          <div class="feature-item">✅ Backend configurado e funcional</div>
          <div class="feature-item">✅ Docker para execução local</div>
          <div class="feature-item">✅ Repositório GitHub privado criado</div>
          <div class="feature-item">✅ README com instruções detalhadas</div>
        </div>
        
        <div style="text-align: center;">
          <a href="${data.repositoryUrl}" class="cta-button">
            🔗 Acessar Repositório GitHub
          </a>
        </div>
        
        <div style="margin-top: 30px;">
          <h3>📋 Próximos passos:</h3>
          <ol>
            <li><strong>Clone o repositório:</strong> <code>git clone ${data.repositoryUrl}</code></li>
            <li><strong>Instale as dependências:</strong> <code>npm install</code></li>
            <li><strong>Execute localmente:</strong> <code>docker-compose up</code></li>
            <li><strong>Acesse sua aplicação:</strong> http://localhost:3000</li>
          </ol>
        </div>
        
        <div class="footer">
          <p>🤖 Email enviado automaticamente pela plataforma de geração de código.</p>
          <p>Dúvidas? Entre em contato conosco!</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: '"Plataforma de Geração de Código" <noreply@platform.dev>',
    to,
    subject: `🎉 Sua aplicação "${data.projectName}" está pronta!`,
    html: htmlContent,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email de sucesso enviado:', info.messageId);
    
    // Para Ethereal, mostra o link de preview
    if (process.env.NODE_ENV === 'development') {
      console.log('📧 Preview URL:', nodemailer.getTestMessageUrl(info));
    }
  } catch (error) {
    console.error('❌ Erro ao enviar email de sucesso:', error);
    throw error;
  }
};

export const sendGenerationFailedEmail = async (
  to: string, 
  data: GenerationFailedData
): Promise<void> => {
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Problema na geração da sua aplicação</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f8f9fa;
        }
        .container {
          background-color: white;
          border-radius: 12px;
          padding: 40px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .error-icon {
          font-size: 64px;
          margin-bottom: 20px;
        }
        h1 {
          color: #dc3545;
          margin-bottom: 10px;
        }
        .project-name {
          background-color: #e9ecef;
          padding: 15px;
          border-radius: 8px;
          margin: 20px 0;
          font-weight: bold;
        }
        .error-details {
          background-color: #f8d7da;
          border: 1px solid #f5c6cb;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
        }
        .cta-button {
          display: inline-block;
          background-color: #007bff;
          color: white;
          padding: 15px 30px;
          text-decoration: none;
          border-radius: 8px;
          font-weight: bold;
          margin: 20px 0;
          text-align: center;
        }
        .footer {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #dee2e6;
          font-size: 14px;
          color: #6c757d;
          text-align: center;
        }
        .suggestions {
          background-color: #d1ecf1;
          border: 1px solid #bee5eb;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="error-icon">⚠️</div>
          <h1>Problema na geração da aplicação</h1>
          <p>Infelizmente, houve um problema durante a geração do seu projeto.</p>
        </div>
        
        <div class="project-name">
          📂 Projeto: ${data.projectName}
        </div>
        
        <div class="error-details">
          <h3>🔍 Detalhes do erro:</h3>
          <p><strong>Motivo:</strong> ${data.failureReason}</p>
        </div>
        
        <div class="suggestions">
          <h3>💡 Sugestões para resolver:</h3>
          <ul>
            <li>Verifique se a descrição do seu projeto está clara e detalhada</li>
            <li>Evite requisitos muito complexos ou contraditórios</li>
            <li>Certifique-se de que especificou as tecnologias desejadas</li>
            <li>Tente novamente com uma descrição mais específica</li>
          </ul>
        </div>
        
        <div style="text-align: center;">
          <a href="#" class="cta-button">
            🔄 Tentar Novamente
          </a>
        </div>
        
        <div style="margin-top: 30px;">
          <h3>🛠️ Precisa de ajuda?</h3>
          <p>Nossa equipe está aqui para ajudar! Entre em contato conosco:</p>
          <ul>
            <li>📧 Email: suporte@platform.dev</li>
            <li>💬 Chat no site da plataforma</li>
            <li>📚 Consulte nossa documentação</li>
          </ul>
        </div>
        
        <div class="footer">
          <p>🤖 Email enviado automaticamente pela plataforma de geração de código.</p>
          <p>Não desista! A maioria dos problemas são resolvidos facilmente.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: '"Plataforma de Geração de Código" <noreply@platform.dev>',
    to,
    subject: `⚠️ Problema na geração de "${data.projectName}"`,
    html: htmlContent,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email de falha enviado:', info.messageId);
    
    // Para Ethereal, mostra o link de preview
    if (process.env.NODE_ENV === 'development') {
      console.log('📧 Preview URL:', nodemailer.getTestMessageUrl(info));
    }
  } catch (error) {
    console.error('❌ Erro ao enviar email de falha:', error);
    throw error;
  }
};