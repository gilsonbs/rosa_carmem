import { Flower2 } from 'lucide-react'

const PARAGRAPHS = [
  'A Rosa Carmen nasceu muito antes de vender o primeiro presente.',
  'Ela nasceu em um momento de silêncio.',
  'Durante uma imersão na Bahia, em uma jornada de autoconhecimento, eu passava os dias escrevendo, refletindo e tentando compreender tudo o que estava vivendo. Pela primeira vez, consegui enxergar com clareza o quanto eu era privilegiada.',
  'Eu estava ali porque tinha pessoas que acreditavam em mim. Meu marido me incentivava. Meus pais me apoiavam. Eu podia viajar sozinha em busca de mim mesma porque havia uma rede de amor sustentando os meus passos.',
  'Foi então que um pensamento mudou tudo.',
  'Enquanto flutuava em silêncio nas águas de um rio, compreendi que a liberdade que eu vivia naquele momento não tinha começado comigo.',
  'Ela havia começado muito antes.',
  'Começou com duas mulheres que enfrentaram caminhos muito mais difíceis do que os meus. Mulheres que carregaram pesos que eu nunca precisei carregar. Que fizeram escolhas difíceis para que as próximas gerações pudessem sonhar mais alto.',
  'Naquele instante, entendi que hoje eu podia correr porque elas caminharam.',
  'E caminharam por mim.',
  'Ali nasceu o desejo de empreender, porque já não fazia mais sentido permanecer onde eu estava.',
  'Naquele momento, eu ainda não sabia o que construiria. Não existiam flores, cestas ou presentes.',
  'Mas uma certeza já existia.',
  'O nome seria Rosa Carmen.',
  'Uma homenagem às minhas avós. Uma forma de honrar suas histórias, agradecer seus esforços e lembrar, todos os dias, que tudo o que construirmos daqui para frente também pertence, de alguma forma, a elas: mulheres que foram fortaleza em meio à doçura.',
  'Porque, no fim, os presentes passam. Mas o amor que eles representam permanece para sempre.',
  'Hoje, cada presente que sai da Rosa Carmen carrega esse mesmo propósito: celebrar pessoas, demonstrar amor e transformar momentos em memórias que permanecem.',
  'Porque acreditamos que os gestos passam.',
]

function AvoCard({ src, name }: { src: string | null; name: string }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="w-full aspect-[3/4] rounded-2xl overflow-hidden bg-rosa/8 border border-rosa/20">
        {src ? (
          <img
            src={src}
            alt={name}
            className="w-full h-full object-cover object-top grayscale"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-rosa/40">
            <Flower2 size={36} strokeWidth={1} />
            <p className="font-subtitle text-xs uppercase tracking-widest">Foto em breve</p>
          </div>
        )}
      </div>
      <p className="font-title text-2xl text-texto italic">{name}</p>
    </div>
  )
}

export function Sobre() {
  return (
    <>
      {/* Hero */}
      <section className="py-16 px-6 bg-[#FDF0F3] text-center">
        <div className="max-w-2xl mx-auto">
          <p className="font-subtitle text-xs uppercase tracking-[0.2em] text-dourado mb-2">
            Nossa história
          </p>
          <h1 className="font-title text-4xl md:text-5xl text-texto">Sobre a Rosa Carmen</h1>
        </div>
      </section>

      {/* Conteúdo principal */}
      <section className="py-16 px-6 bg-fundo">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">

            {/* Fotos das avós — sticky no desktop */}
            <div className="lg:sticky lg:top-24 flex flex-col gap-8">
              <div className="grid grid-cols-2 gap-6">
                <AvoCard src="/rosa.jpg" name="Rosa" />
                <AvoCard src="/carmen.jpeg" name="Carmen" />
              </div>
              <p className="font-body text-sm text-texto/50 text-center italic leading-relaxed">
                As mulheres que nos nomeiam — e que caminham conosco em cada presente.
              </p>
            </div>

            {/* Texto */}
            <div className="flex flex-col gap-5">
              <h2 className="font-title text-2xl md:text-3xl text-texto leading-snug">
                Nossa história
              </h2>

              <div className="flex flex-col gap-4 font-body text-texto/75 text-base leading-relaxed">
                {PARAGRAPHS.map((p, i) => {
                  const isShort = p.split(' ').length <= 8
                  return (
                    <p
                      key={i}
                      className={isShort ? 'font-title text-lg text-texto italic' : ''}
                    >
                      {p}
                    </p>
                  )
                })}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Citação final */}
      <section className="py-20 px-6 bg-[#FDF0F3]">
        <div className="max-w-2xl mx-auto text-center flex flex-col items-center gap-6">
          <Flower2 size={28} className="text-rosa/50" strokeWidth={1.5} />
          <blockquote className="font-title text-2xl md:text-3xl text-texto italic leading-snug">
            "A vocês, que caminharam antes de nós."
          </blockquote>
        </div>
      </section>
    </>
  )
}
