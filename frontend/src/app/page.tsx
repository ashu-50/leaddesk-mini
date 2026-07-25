import { SiteFooter } from '@/components/layout/site-footer';
import { SiteHeader } from '@/components/layout/site-header';
import { ContactSection } from '@/features/landing/components/contact-section';
import { FeatureGrid } from '@/features/landing/components/feature-grid';
import { Hero } from '@/features/landing/components/hero';
import { Pipeline } from '@/features/landing/components/pipeline';
import { Testimonials } from '@/features/landing/components/testimonials';

/**
 * The public website. Rendered on the server with no client JavaScript beyond
 * the theme toggle, the scroll reveals and the form itself.
 */
export default function HomePage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main id="content" className="flex-1">
        <Hero />
        <Pipeline />
        <FeatureGrid />
        <Testimonials />
        <ContactSection />
      </main>
      <SiteFooter />
    </div>
  );
}
