import { Hero } from "@/components/site/Hero";
import { TrustSignals } from "@/components/site/TrustSignals";
import { TwoPaths } from "@/components/site/TwoPaths";
import { Features } from "@/components/site/Features";
import { HowItWorks } from "@/components/site/HowItWorks";
import { DemoPreview } from "@/components/site/DemoPreview";
import { IndustryLinks } from "@/components/site/IndustryLinks";
import { PricingCards } from "@/components/site/PricingCards";
import { FAQ } from "@/components/site/FAQ";
import { getContent } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function Home() {
  const content = await getContent([
    "hero.title",
    "hero.subtitle",
    "hero.cta",
    "features.title",
    "features.subtitle",
    "pricing.title",
    "pricing.subtitle"
  ]);

  return (
    <>
      <Hero
        title={content["hero.title"]}
        subtitle={content["hero.subtitle"]}
        cta={content["hero.cta"]}
      />
      <TrustSignals />
      <TwoPaths />
      <Features
        title={content["features.title"]}
        subtitle={content["features.subtitle"]}
      />
      <HowItWorks />
      <DemoPreview />
      <IndustryLinks />
      <PricingCards
        title={content["pricing.title"]}
        subtitle={content["pricing.subtitle"]}
      />
      <FAQ />
    </>
  );
}
