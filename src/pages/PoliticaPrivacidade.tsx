import { Shield, Eye, Lock, Users, FileText, MessageCircle, Trash2, RefreshCw } from 'lucide-react'

const WHATSAPP = '5522997394050'
const EMAIL = 'contato@rosacarmen.com.br'

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="flex gap-5">
      <div className="shrink-0 w-10 h-10 rounded-full bg-rosa/10 flex items-center justify-center mt-0.5">
        <Icon size={20} className="text-rosa" />
      </div>
      <div className="flex-1">
        <h2 className="font-title text-xl text-texto mb-3">{title}</h2>
        {children}
      </div>
    </div>
  )
}

function Body({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-body text-texto/70 text-sm leading-relaxed flex flex-col gap-2.5">
      {children}
    </div>
  )
}

function Bullet({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-col gap-2 mt-1">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2.5">
          <span className="w-1.5 h-1.5 rounded-full bg-rosa mt-1.5 shrink-0" />
          {item}
        </li>
      ))}
    </ul>
  )
}

function Divider() {
  return <div className="border-t border-blush/30" />
}

export function PoliticaPrivacidade() {
  const whatsappLink = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent('Olá! Gostaria de exercer meus direitos como titular de dados conforme a LGPD.')}`

  return (
    <>
      {/* Hero */}
      <section className="py-16 px-6 bg-[#FDF0F3] text-center">
        <div className="max-w-2xl mx-auto">
          <p className="font-subtitle text-xs uppercase tracking-[0.2em] text-dourado mb-2">
            Legal
          </p>
          <h1 className="font-title text-4xl md:text-5xl text-texto">Política de Privacidade</h1>
          <p className="font-body text-texto/60 mt-4 text-lg">
            Como coletamos, usamos e protegemos os seus dados, em conformidade com a{' '}
            <strong className="text-texto/80">Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018)</strong>.
          </p>
          <p className="font-body text-texto/40 text-xs mt-3">Última atualização: julho de 2026</p>
        </div>
      </section>

      {/* Conteúdo */}
      <section className="py-16 px-6 bg-fundo">
        <div className="max-w-3xl mx-auto flex flex-col gap-12">

          {/* 1. Controlador */}
          <Section icon={Shield} title="1. Quem é o controlador dos seus dados">
            <Body>
              <p>
                O controlador responsável pelo tratamento dos seus dados pessoais é:
              </p>
              <div className="bg-white rounded-xl p-4 border border-blush/40 flex flex-col gap-1.5 mt-1">
                <p><strong className="text-texto">Rosa Carmen Presentes</strong></p>
                <p>E-mail: <a href={`mailto:${EMAIL}`} className="text-rosa hover:underline">{EMAIL}</a></p>
                <p>WhatsApp: <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="text-rosa hover:underline">(22) 99739-4050</a></p>
                <p>Atuação: Rio das Ostras, Macaé, Barra de São João e Cabo Frio — RJ</p>
              </div>
            </Body>
          </Section>

          <Divider />

          {/* 2. Dados coletados */}
          <Section icon={Eye} title="2. Quais dados coletamos">
            <Body>
              <p>Coletamos apenas os dados estritamente necessários para a prestação dos nossos serviços:</p>
              <div className="flex flex-col gap-4 mt-1">
                <div>
                  <p className="font-medium text-texto mb-1.5">Dados fornecidos por você</p>
                  <Bullet
                    items={[
                      'Nome completo',
                      'Endereço de entrega (rua, número, bairro, cidade, CEP)',
                      'Telefone / WhatsApp',
                      'Endereço de e-mail',
                      'Mensagem personalizada para cartão (opcional)',
                    ]}
                  />
                </div>
                <div>
                  <p className="font-medium text-texto mb-1.5">Dados de pagamento</p>
                  <p>
                    Os dados de cartão, Pix e outras formas de pagamento são processados diretamente pelo{' '}
                    <strong className="text-texto">Mercado Pago</strong>. A Rosa Carmen não armazena nem tem acesso aos dados financeiros completos — apenas ao status da transação.
                  </p>
                </div>
                <div>
                  <p className="font-medium text-texto mb-1.5">Dados de navegação</p>
                  <p>
                    Podemos coletar automaticamente dados técnicos como endereço IP, tipo de navegador e páginas visitadas, para fins de segurança e melhoria do site.
                  </p>
                </div>
              </div>
            </Body>
          </Section>

          <Divider />

          {/* 3. Finalidades */}
          <Section icon={FileText} title="3. Para que usamos seus dados">
            <Body>
              <p>Seus dados são utilizados exclusivamente para as seguintes finalidades:</p>
              <div className="flex flex-col gap-3 mt-2">
                {[
                  {
                    purpose: 'Processamento e entrega do pedido',
                    basis: 'Execução de contrato (Art. 7º, V)',
                  },
                  {
                    purpose: 'Comunicação sobre o status do pedido',
                    basis: 'Execução de contrato (Art. 7º, V)',
                  },
                  {
                    purpose: 'Atendimento ao cliente e resolução de problemas',
                    basis: 'Legítimo interesse (Art. 7º, IX)',
                  },
                  {
                    purpose: 'Cumprimento de obrigações fiscais e legais',
                    basis: 'Cumprimento de obrigação legal (Art. 7º, II)',
                  },
                  {
                    purpose: 'Prevenção a fraudes e segurança da plataforma',
                    basis: 'Legítimo interesse (Art. 7º, IX)',
                  },
                ].map(({ purpose, basis }) => (
                  <div key={purpose} className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-3 pl-3 border-l-2 border-blush/50">
                    <span className="flex-1">{purpose}</span>
                    <span className="text-xs text-rosa font-subtitle font-medium whitespace-nowrap">{basis}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-texto/50 mt-2">
                Não utilizamos seus dados para marketing sem seu consentimento explícito.
              </p>
            </Body>
          </Section>

          <Divider />

          {/* 4. Compartilhamento */}
          <Section icon={Users} title="4. Compartilhamento de dados">
            <Body>
              <p>Seus dados podem ser compartilhados com terceiros apenas nas situações abaixo:</p>
              <div className="flex flex-col gap-3 mt-2">
                <div className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rosa mt-1.5 shrink-0" />
                  <span>
                    <strong className="text-texto">Mercado Pago</strong> — processamento seguro de pagamentos. Sujeito à{' '}
                    <a href="https://www.mercadopago.com.br/privacidade" target="_blank" rel="noopener noreferrer" className="text-rosa hover:underline">
                      política de privacidade do Mercado Pago
                    </a>.
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rosa mt-1.5 shrink-0" />
                  <span>
                    <strong className="text-texto">Supabase</strong> — infraestrutura de banco de dados segura (servidores na América do Sul).
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rosa mt-1.5 shrink-0" />
                  <span>
                    <strong className="text-texto">Autoridades públicas</strong> — quando exigido por lei, decisão judicial ou regulamentação aplicável.
                  </span>
                </div>
              </div>
              <p className="mt-2">
                Não vendemos, alugamos nem cedemos seus dados pessoais a terceiros para fins comerciais.
              </p>
            </Body>
          </Section>

          <Divider />

          {/* 5. Retenção */}
          <Section icon={Lock} title="5. Por quanto tempo guardamos seus dados">
            <Body>
              <p>
                Mantemos seus dados pelo tempo necessário para cumprir as finalidades descritas nesta política, observando os prazos legais:
              </p>
              <Bullet
                items={[
                  'Dados de pedidos: 5 anos (prazo de prescrição civil e obrigações fiscais)',
                  'Dados de contato para atendimento: até 2 anos após o último contato',
                  'Dados de pagamento: conforme determinado pelo Mercado Pago',
                  'Dados de navegação: até 6 meses',
                ]}
              />
              <p className="mt-1">
                Após o término do prazo, os dados são eliminados ou anonimizados de forma segura.
              </p>
            </Body>
          </Section>

          <Divider />

          {/* 6. Direitos dos titulares */}
          <div className="rounded-2xl border border-rosa/30 bg-rosa/5 p-6 flex gap-5">
            <div className="shrink-0 w-10 h-10 rounded-full bg-rosa/15 flex items-center justify-center mt-0.5">
              <Shield size={20} className="text-rosa" />
            </div>
            <div className="flex-1">
              <h2 className="font-title text-xl text-texto mb-1">6. Seus direitos como titular</h2>
              <p className="font-subtitle text-xs uppercase tracking-wider text-rosa mb-4">
                Art. 18 da LGPD
              </p>
              <div className="font-body text-texto/70 text-sm leading-relaxed flex flex-col gap-2.5">
                {[
                  { right: 'Confirmação', desc: 'Saber se tratamos seus dados pessoais' },
                  { right: 'Acesso', desc: 'Obter uma cópia dos dados que possuímos sobre você' },
                  { right: 'Correção', desc: 'Solicitar a correção de dados incompletos, inexatos ou desatualizados' },
                  { right: 'Anonimização ou eliminação', desc: 'Pedir o bloqueio ou exclusão de dados desnecessários ou tratados em desconformidade com a lei' },
                  { right: 'Portabilidade', desc: 'Receber seus dados em formato estruturado para transferência a outro fornecedor' },
                  { right: 'Eliminação com consentimento', desc: 'Revogar o consentimento e solicitar a exclusão dos dados tratados com base nele' },
                  { right: 'Informação sobre compartilhamento', desc: 'Saber com quais entidades seus dados foram compartilhados' },
                  { right: 'Oposição', desc: 'Opor-se a tratamento realizado com base em legítimo interesse, em caso de descumprimento da lei' },
                ].map(({ right, desc }) => (
                  <div key={right} className="flex flex-col sm:flex-row sm:items-start gap-0.5 sm:gap-3">
                    <span className="font-subtitle font-semibold text-rosa text-xs sm:w-44 sm:shrink-0">{right}</span>
                    <span>{desc}</span>
                  </div>
                ))}
                <p className="text-xs text-texto/50 mt-2">
                  Para exercer qualquer desses direitos, entre em contato pelos canais abaixo. Responderemos em até 15 dias.
                </p>
              </div>
            </div>
          </div>

          <Divider />

          {/* 7. Segurança */}
          <Section icon={Lock} title="7. Segurança dos dados">
            <Body>
              <p>
                Adotamos medidas técnicas e organizacionais para proteger seus dados contra acesso não autorizado, perda, alteração ou divulgação indevida:
              </p>
              <Bullet
                items={[
                  'Comunicação criptografada via HTTPS/TLS em todo o site',
                  'Banco de dados com controle de acesso restrito (Supabase)',
                  'Pagamentos processados em ambiente certificado PCI-DSS (Mercado Pago)',
                  'Acesso administrativo protegido por autenticação',
                ]}
              />
              <p className="mt-1">
                Em caso de incidente de segurança que possa afetar seus dados, comunicaremos a você e à Autoridade Nacional de Proteção de Dados (ANPD) nos prazos previstos pela LGPD.
              </p>
            </Body>
          </Section>

          <Divider />

          {/* 8. Cookies */}
          <Section icon={Eye} title="8. Cookies">
            <Body>
              <p>
                Utilizamos cookies técnicos essenciais para o funcionamento do site (como manutenção do carrinho de compras e sessão do usuário). Não utilizamos cookies de rastreamento ou publicidade comportamental.
              </p>
              <p>
                Você pode configurar seu navegador para recusar cookies, mas algumas funcionalidades do site poderão não funcionar corretamente.
              </p>
            </Body>
          </Section>

          <Divider />

          {/* 9. Alterações */}
          <Section icon={RefreshCw} title="9. Alterações nesta política">
            <Body>
              <p>
                Esta política pode ser atualizada periodicamente para refletir mudanças em nossas práticas ou na legislação. A data da última atualização estará sempre indicada no topo da página.
              </p>
              <p>
                Para alterações significativas, notificaremos você pelo e-mail cadastrado ou por aviso em destaque no site.
              </p>
            </Body>
          </Section>

          <Divider />

          {/* 10. Contato */}
          <Section icon={MessageCircle} title="10. Como entrar em contato">
            <Body>
              <p>
                Para dúvidas, solicitações ou exercer seus direitos previstos na LGPD, entre em contato com nossa equipe:
              </p>
              <div className="flex flex-col gap-3 mt-2">
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#1ebe5d] text-white font-subtitle font-medium uppercase tracking-wider text-sm px-7 py-3 rounded-lg transition-colors w-fit"
                >
                  <MessageCircle size={16} />
                  WhatsApp — (22) 99739-4050
                </a>
                <a
                  href={`mailto:${EMAIL}`}
                  className="inline-flex items-center gap-2 text-rosa hover:underline font-body text-sm"
                >
                  {EMAIL}
                </a>
              </div>
              <p className="text-xs text-texto/50 mt-2">
                Caso não esteja satisfeito com nossa resposta, você também pode contatar a{' '}
                <strong className="text-texto/60">Autoridade Nacional de Proteção de Dados (ANPD)</strong> em{' '}
                <a href="https://www.gov.br/anpd" target="_blank" rel="noopener noreferrer" className="text-rosa hover:underline">
                  www.gov.br/anpd
                </a>.
              </p>
            </Body>
          </Section>

        </div>
      </section>
    </>
  )
}
