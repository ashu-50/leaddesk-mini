import { Reveal } from '@/components/shared/reveal';

const TESTIMONIALS = [
  {
    quote:
      'We were forwarding enquiries into a WhatsApp group and losing about one in five. The first week on LeadDesk we replied to all of them.',
    name: 'Lena Vasquez',
    role: 'Operations lead, Atlas Freight',
    metric: '0 lost enquiries',
  },
  {
    quote:
      'I wanted to see who was still waiting without opening four tabs. The board does that in one screen and I have stopped opening the spreadsheet.',
    name: 'Marcus Feld',
    role: 'Founder, Feld & Co',
    metric: '1 screen, not 4 tabs',
  },
  {
    quote:
      'Onboarding a new coordinator took ten minutes. There are three states and a search box — there is nothing else to explain.',
    name: 'Priya Raghunathan',
    role: 'Studio director, Quilt Health',
    metric: '10 minutes to onboard',
  },
];

export function Testimonials() {
  return (
    <section id="customers" className="border-t">
      <div className="mx-auto w-full max-w-6xl px-6 py-20 lg:py-24">
        <Reveal className="flex max-w-2xl flex-col gap-4">
          <p className="eyebrow">Customers</p>
          <h2 className="text-3xl font-semibold text-balance sm:text-4xl">
            Teams that stopped losing enquiries
          </h2>
        </Reveal>

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {TESTIMONIALS.map((testimonial, index) => (
            <Reveal key={testimonial.name} delay={index * 90}>
              <figure className="bg-card flex h-full flex-col gap-5 rounded-xl border p-6">
                <p className="text-muted-foreground tabular font-mono text-[0.6875rem] tracking-[0.18em] uppercase">
                  {testimonial.metric}
                </p>
                <blockquote className="text-pretty">{testimonial.quote}</blockquote>
                <figcaption className="mt-auto flex flex-col gap-0.5 border-t pt-4">
                  <span className="text-sm font-medium">{testimonial.name}</span>
                  <span className="text-muted-foreground text-xs">{testimonial.role}</span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
