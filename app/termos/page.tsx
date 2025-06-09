import { Metadata } from 'next'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, FileText, AlertTriangle, Mail, Scale, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import AdminNotices from '@/components/AdminNotices';

export const metadata: Metadata = {
  title: 'Termos de Serviço - CodeRats',
  description: 'Conheça os termos de uso da plataforma CodeRats, suas responsabilidades como usuário e nossas políticas de uso.',
  keywords: 'termos de serviço, termos de uso, condições de uso, política de uso, responsabilidades, coderats',
  openGraph: {
    title: 'Termos de Serviço - CodeRats',
    description: 'Conheça os termos de uso da plataforma CodeRats, suas responsabilidades como usuário e nossas políticas de uso.',
    type: 'website',
  },
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white">
      <AdminNotices location="home" />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Termos de Serviço</h1>
        </div>

        <div className="space-y-8">
          {/* Introdução */}
          <div>
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scale className="h-6 w-6 text-emerald-400" />
                  Sobre Estes Termos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-300 leading-relaxed">
                  Ao utilizar o CodeRats, você concorda com os seguintes termos e condições. 
                  Leia atentamente antes de usar nossa plataforma.
                </p>
                <div className="bg-emerald-900/30 border border-emerald-700 rounded-lg p-4">
                  <p className="text-sm text-emerald-200">
                    <strong>Última atualização:</strong> 15 de Janeiro de 2025
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>          {/* Aceitação dos Termos */}
          <div>
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-6 w-6 text-emerald-400" />
                  1. Aceitação dos Termos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-300">
                  Ao acessar e utilizar o CodeRats ("Serviço"), você aceita estar vinculado por estes 
                  Termos de Serviço ("Termos"). Se você não concorda com qualquer parte destes termos, 
                  então você não tem permissão para acessar o Serviço.
                </p>
                <p className="text-gray-300">
                  Estes termos se aplicam a todos os visitantes, usuários e outras pessoas que acessam 
                  ou usam o Serviço.
                </p>
              </CardContent>
            </Card>
          </div>          {/* Descrição do Serviço */}
          <div>
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-6 w-6 text-emerald-400" />
                  2. Descrição do Serviço
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-300">
                  O CodeRats é uma plataforma que permite:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-300">
                  <li>Visualizar rankings de desenvolvedores baseados em atividade do GitHub</li>
                  <li>Consultar perfis públicos de usuários do GitHub</li>
                  <li>Acessar informações estatísticas sobre repositórios e contribuições</li>
                  <li>Ler conteúdo educativo sobre desenvolvimento de software</li>
                </ul>
                <p className="text-gray-300">
                  O serviço utiliza exclusivamente dados públicos disponibilizados através da API do GitHub.
                </p>
              </CardContent>
            </Card>
          </div>          {/* Uso Aceitável */}
          <div>
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-6 w-6 text-emerald-400" />
                  3. Uso Aceitável
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-300">
                  Você concorda em NÃO usar o Serviço:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-300">
                  <li>Para qualquer propósito ilegal ou não autorizado</li>
                  <li>Para violar qualquer lei internacional, federal, estadual ou local</li>
                  <li>Para transmitir ou procurar transmitir qualquer material que contenha vírus ou código malicioso</li>
                  <li>Para assediar, abusar, insultar, prejudicar, difamar, caluniar, depreciar, intimidar ou discriminar</li>
                  <li>Para tentar obter acesso não autorizado a qualquer parte do Serviço</li>
                </ul>
                <div className="bg-red-900/30 border border-red-700 rounded-lg p-4">
                  <p className="text-sm text-red-200">
                    <strong>Aviso:</strong> Violações destes termos podem resultar na suspensão imediata do acesso ao serviço.
                  </p>
                </div>
              </CardContent>
            </Card>          </div>

          {/* Privacidade */}
          <div>
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-6 w-6 text-emerald-400" />
                  4. Privacidade
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-300">
                  Sua privacidade é importante para nós. Por favor, revise nossa Política de Privacidade, 
                  que também rege seu uso do Serviço, para entender nossas práticas.
                </p>
                <Button variant="outline" asChild>
                  <Link href="/privacidade">
                    Ver Política de Privacidade
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Propriedade Intelectual */}
          <div>
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-6 w-6 text-emerald-400" />
                  5. Propriedade Intelectual
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-300">
                  O Serviço e seu conteúdo original, recursos e funcionalidades são e permanecerão 
                  propriedade exclusiva do CodeRats e seus licenciadores.
                </p>
                <p className="text-gray-300">
                  Nossos direitos autorais e marcas registradas não podem ser usados em conexão 
                  com qualquer produto ou serviço sem nossa permissão prévia por escrito.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Limitação de Responsabilidade */}
          <div>
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-6 w-6 text-emerald-400" />
                  6. Limitação de Responsabilidade
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-300">
                  Em nenhum caso o CodeRats, nem seus diretores, funcionários, parceiros, agentes, 
                  fornecedores ou afiliados, serão responsáveis por qualquer dano indireto, 
                  incidental, especial, consequencial ou punitivo.
                </p>
                <p className="text-gray-300">
                  O Serviço é fornecido "como está" e "conforme disponível". Não garantimos que o 
                  serviço será ininterrupto, livre de erros ou seguro.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Modificações */}
          <div>
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-6 w-6 text-emerald-400" />
                  7. Modificações dos Termos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-300">
                  Reservamos o direito, a nosso exclusivo critério, de modificar ou substituir estes 
                  Termos a qualquer momento. Se uma revisão for material, tentaremos 
                  fornecer pelo menos 30 dias de aviso antes de qualquer novo termo entrar em vigor.
                </p>
                <p className="text-gray-300">
                  O que constitui uma mudança material será determinado a nosso exclusivo critério.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Rescisão */}
          <div>
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-6 w-6 text-emerald-400" />
                  8. Rescisão
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-300">
                  Podemos encerrar ou suspender seu acesso imediatamente, sem aviso prévio ou 
                  responsabilidade, por qualquer motivo, incluindo, sem limitação, se você 
                  violar os Termos de Serviço.
                </p>
                <p className="text-gray-300">
                  Após a rescisão, seu direito de usar o Serviço cessará imediatamente.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Lei Aplicável */}
          <div>
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scale className="h-6 w-6 text-emerald-400" />
                  9. Lei Aplicável
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-300">
                  Estes Termos serão interpretados e regidos de acordo com as leis do Brasil, 
                  sem consideração a seus conflitos de disposições legais.
                </p>
                <p className="text-gray-300">
                  Nossa falha em fazer cumprir qualquer direito ou disposição destes Termos não será 
                  considerada uma renúncia a esses direitos.
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
                  Dúvidas sobre os Termos?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-300">
                  Se você tiver alguma dúvida sobre estes Termos de Serviço, entre em contato conosco:
                </p>
                
                <div className="space-y-2">
                  <p className="text-sm"><strong>Email:</strong> contato@coderats.dev</p>
                  <p className="text-sm"><strong>Responsável:</strong> Equipe CodeRats</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button size="lg" asChild>
                    <Link href="/contato">
                      Página de Contato
                    </Link>
                  </Button>
                  <Button variant="outline" size="lg" asChild>
                    <Link href="/privacidade">
                      Política de Privacidade
                    </Link>
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
