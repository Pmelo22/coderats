export default function SetupInstructionsPage() {
  const appUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  const callbackUrl = `${appUrl}/api/auth/callback/github`

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Configuração do GitHub OAuth</h1>

        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 mb-8">
          <h2 className="text-xl font-semibold mb-4">Instruções para configurar o GitHub OAuth</h2>

          <ol className="list-decimal pl-5 space-y-4">
            <li>
              <p>Acesse as configurações do seu GitHub em:</p>
              <a
                href="https://github.com/settings/developers"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-400 hover:underline"
              >
                https://github.com/settings/developers
              </a>
            </li>

            <li>
              <p>Clique em "OAuth Apps" e depois em "New OAuth App" ou selecione o app existente para editar</p>
            </li>

            <li>
              <p>Preencha os campos com as seguintes informações:</p>
              <ul className="list-disc pl-5 mt-2 space-y-2">
                <li>
                  <strong>Application name:</strong> GitHub Ranking (ou o nome que preferir)
                </li>
                <li>
                  <strong>Homepage URL:</strong> <code className="bg-gray-900 px-2 py-1 rounded">{appUrl}</code>
                </li>
                <li>
                  <strong>Application description:</strong> Uma aplicação para ranking de contribuições no GitHub
                  (opcional)
                </li>
                <li>
                  <strong>Authorization callback URL:</strong>{" "}
                  <code className="bg-gray-900 px-2 py-1 rounded">{callbackUrl}</code>
                </li>
              </ul>
            </li>

            <li>
              <p>Clique em "Register application" ou "Update application"</p>
            </li>

            <li>
              <p>
                Após registrar, você receberá um <strong>Client ID</strong> e poderá gerar um{" "}
                <strong>Client Secret</strong>
              </p>
            </li>

            <li>
              <p>Adicione essas informações ao seu arquivo .env.local:</p>
              <pre className="bg-gray-900 p-3 rounded mt-2 overflow-x-auto">
                <code>
                  {`GITHUB_CLIENT_ID=seu_client_id_aqui
GITHUB_CLIENT_SECRET=seu_client_secret_aqui
NEXTAUTH_URL=${appUrl}
NEXTAUTH_SECRET=uma_string_aleatoria_segura`}
                </code>
              </pre>
            </li>

            <li>
              <p>Reinicie o servidor de desenvolvimento</p>
            </li>
          </ol>

          <div className="mt-6 p-4 bg-amber-900/30 border border-amber-700/50 rounded">
            <h3 className="font-semibold text-amber-400 mb-2">Importante!</h3>
            <p>
              Certifique-se de que a URL de callback configurada no GitHub corresponda exatamente à URL usada pela sua
              aplicação. Qualquer diferença, mesmo em maiúsculas/minúsculas ou um "/" no final, causará o erro de
              redirecionamento.
            </p>
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h2 className="text-xl font-semibold mb-4">Verificação de Configuração</h2>

          <p className="mb-4">Suas configurações atuais são:</p>

          <ul className="space-y-2">
            <li>
              <strong>URL da Aplicação:</strong> <code className="bg-gray-900 px-2 py-1 rounded">{appUrl}</code>
            </li>
            <li>
              <strong>URL de Callback:</strong> <code className="bg-gray-900 px-2 py-1 rounded">{callbackUrl}</code>
            </li>
            <li>
              <strong>GitHub Client ID configurado:</strong>{" "}
              <code className="bg-gray-900 px-2 py-1 rounded">
                {process.env.GITHUB_CLIENT_ID ? "Sim" : "Não (verifique seu .env.local)"}
              </code>
            </li>
            <li>
              <strong>GitHub Client Secret configurado:</strong>{" "}
              <code className="bg-gray-900 px-2 py-1 rounded">
                {process.env.GITHUB_CLIENT_SECRET ? "Sim" : "Não (verifique seu .env.local)"}
              </code>
            </li>
            <li>
              <strong>NEXTAUTH_SECRET configurado:</strong>{" "}
              <code className="bg-gray-900 px-2 py-1 rounded">
                {process.env.NEXTAUTH_SECRET ? "Sim" : "Não (verifique seu .env.local)"}
              </code>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
