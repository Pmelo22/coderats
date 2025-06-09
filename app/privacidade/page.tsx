import { Metadata } from 'next'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Shield, Lock, Database, Eye, Mail, Calendar } from "lucide-react"
import Link from "next/link"
import AdminNotices from "@/components/AdminNotices"

export const metadata: Metadata = {
  title: 'Política de Privacidade - CodeRats',
  description: 'Conheça como tratamos seus dados pessoais, nossa política de privacidade em conformidade com a LGPD e como protegemos suas informações.',
  keywords: 'política de privacidade, lgpd, proteção de dados, privacidade, segurança, informações pessoais',
  openGraph: {
    title: 'Política de Privacidade - CodeRats',
    description: 'Conheça como tratamos seus dados pessoais, nossa política de privacidade em conformidade com a LGPD e como protegemos suas informações.',
    type: 'website',
  },
}

export default function PrivacidadePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Admin Notices */}
      <AdminNotices location="privacidade" />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Política de Privacidade</h1>
        </div>

        <div className="space-y-8">
          {/* Introdução */}
          <div>
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-6 w-6 text-emerald-400" />
                  Sobre Esta Política
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-300 leading-relaxed">
                  O CodeRats respeita sua privacidade e está comprometido em proteger seus dados pessoais. 
                  Esta Política de Privacidade explica como coletamos, usamos, armazenamos e protegemos suas 
                  informações quando você usa nossa plataforma.
                </p>
                <p className="text-gray-300 leading-relaxed">
                  Esta política está em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei 13.709/2018) 
                  e outras legislações aplicáveis de proteção de dados.
                </p>
                <div className="bg-emerald-900/30 border border-emerald-700 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-5 w-5 text-emerald-400" />
                    <span className="font-semibold text-emerald-400">Última atualização:</span>
                  </div>
                  <p className="text-sm text-gray-300">15 de Janeiro de 2024</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Dados que Coletamos */}
          <div>
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-6 w-6 text-emerald-400" />
                  Quais Dados Coletamos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-emerald-400 mb-2">1. Dados do GitHub (Públicos)</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-300 text-sm ml-4">
                    <li>Nome de usuário e informações básicas do perfil</li>
                    <li>Repositórios públicos e suas estatísticas</li>
                    <li>Commits, pull requests e issues públicas</li>
                    <li>Linguagens de programação utilizadas</li>
                    <li>Seguidores, seguindo e estrelas públicas</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-emerald-400 mb-2">2. Dados de Uso da Plataforma</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-300 text-sm ml-4">
                    <li>Endereço IP (anonimizado)</li>
                    <li>Informações do navegador e dispositivo</li>
                    <li>Páginas visitadas e tempo de permanência</li>
                    <li>Preferências e configurações da conta</li>
                  </ul>
                </div>

                <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4">
                  <p className="text-sm text-blue-200">
                    <Lock className="h-4 w-4 inline mr-2" />
                    <strong>Importante:</strong> Não temos acesso a seus repositórios privados, 
                    senhas ou qualquer informação confidencial do GitHub.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Como Utilizamos */}
          <div>
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-6 w-6 text-emerald-400" />
                  Como Utilizamos Seus Dados
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-emerald-400 mb-2">Finalidades do Tratamento:</h4>
                  <ul className="list-disc list-inside space-y-2 text-gray-300 text-sm ml-4">
                    <li><strong>Cálculo do ranking:</strong> Analisar contribuições públicas para criar classificações justas</li>
                    <li><strong>Exibição de perfil:</strong> Mostrar suas estatísticas e conquistas publicamente</li>
                    <li><strong>Melhorias da plataforma:</strong> Analítica agregada para aprimorar funcionalidades</li>
                    <li><strong>Comunicação:</strong> Notificações importantes sobre mudanças na plataforma</li>
                    <li><strong>Suporte técnico:</strong> Resolver problemas e responder dúvidas</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-emerald-400 mb-2">Base Legal (LGPD):</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-300 text-sm ml-4">
                    <li>Consentimento do titular dos dados</li>
                    <li>Legítimo interesse para melhorias da plataforma</li>
                    <li>Execução de contrato ou procedimentos preliminares</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Compartilhamento e Proteção */}
          <div>
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-6 w-6 text-emerald-400" />
                  Compartilhamento e Proteção
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-emerald-400 mb-2">Não Compartilhamos com Terceiros</h4>
                  <p className="text-gray-300 text-sm">
                    Seus dados não são vendidos, alugados ou compartilhados com terceiros para fins comerciais. 
                    As únicas exceções são quando exigido por lei ou para proteção dos direitos da plataforma.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-emerald-400 mb-2">Medidas de Segurança</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-300 text-sm ml-4">
                    <li>Criptografia de dados em trânsito e em repouso</li>
                    <li>Acesso restrito apenas a pessoal autorizado</li>
                    <li>Monitoramento contínuo de segurança</li>
                    <li>Backup seguro e redundante dos dados</li>
                    <li>Auditoria regular dos sistemas</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-emerald-400 mb-2">Retenção de Dados</h4>
                  <p className="text-gray-300 text-sm">
                    Mantemos seus dados apenas pelo tempo necessário para as finalidades descritas nesta política 
                    ou conforme exigido por lei. Você pode solicitar a exclusão de seus dados a qualquer momento.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Direitos do Titular */}
          <div>
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-6 w-6 text-emerald-400" />
                  Seus Direitos (LGPD)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-300 text-sm">
                  Conforme a LGPD, você tem os seguintes direitos sobre seus dados pessoais:
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h5 className="font-medium text-emerald-400">✓ Confirmação de tratamento</h5>
                    <p className="text-gray-400 text-xs">Saber se tratamos seus dados</p>
                  </div>
                  
                  <div className="space-y-2">
                    <h5 className="font-medium text-emerald-400">✓ Acesso aos dados</h5>
                    <p className="text-gray-400 text-xs">Consultar quais dados temos</p>
                  </div>
                  
                  <div className="space-y-2">
                    <h5 className="font-medium text-emerald-400">✓ Correção de dados</h5>
                    <p className="text-gray-400 text-xs">Corrigir dados incompletos/incorretos</p>
                  </div>
                  
                  <div className="space-y-2">
                    <h5 className="font-medium text-emerald-400">✓ Exclusão dos dados</h5>
                    <p className="text-gray-400 text-xs">Solicitar remoção dos dados</p>
                  </div>
                  
                  <div className="space-y-2">
                    <h5 className="font-medium text-emerald-400">✓ Portabilidade</h5>
                    <p className="text-gray-400 text-xs">Transferir dados para outro fornecedor</p>
                  </div>
                  
                  <div className="space-y-2">
                    <h5 className="font-medium text-emerald-400">✓ Oposição ao tratamento</h5>
                    <p className="text-gray-400 text-xs">Opor-se ao uso dos dados</p>
                  </div>
                </div>

                <div className="bg-emerald-900/30 border border-emerald-700 rounded-lg p-4">
                  <p className="text-sm text-emerald-200">
                    Para exercer qualquer desses direitos, entre em contato conosco através do email 
                    <strong> contato@coderats.dev</strong> ou pela página de contato.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Alterações na Política */}
          <div>
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-6 w-6 text-emerald-400" />
                  Alterações nesta Política
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-300 text-sm">
                  Podemos atualizar esta Política de Privacidade periodicamente para refletir mudanças em 
                  nossas práticas ou por outros motivos operacionais, legais ou regulamentares.
                </p>
                <p className="text-gray-300 text-sm">
                  Quando fizermos alterações materiais, notificaremos você através da plataforma ou por email. 
                  Recomendamos que revise esta política regularmente.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Contato */}
          <div>
            <Card className="bg-emerald-900/20 border-emerald-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-6 w-6 text-emerald-400" />
                  Entre em Contato
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-300 text-sm">
                  Se você tiver dúvidas sobre esta Política de Privacidade ou quiser exercer seus direitos 
                  sobre seus dados pessoais, entre em contato conosco:
                </p>
                
                <div className="space-y-2">
                  <p className="text-sm"><strong>Email:</strong> contato@coderats.dev</p>
                  <p className="text-sm"><strong>Responsável pelos dados:</strong> Equipe CodeRats</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button size="lg" asChild>
                    <Link href="/contato">
                      Página de Contato
                    </Link>
                  </Button>
                  <Button variant="outline" size="lg" asChild>
                    <a href="mailto:contato@coderats.dev">
                      Enviar Email
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
