import { Hero } from "@/components/site/Hero";
import { TrustSignals } from "@/components/site/TrustSignals";
import { TwoPaths } from "@/components/site/TwoPaths";
import { Features } from "@/components/site/Features";
import { HowItWorks } from "@/components/site/HowItWorks";
import { DemoPreview } from "@/components/site/DemoPreview";
import { TopConsultants } from "@/components/site/TopConsultants";
import { MentorCTA } from "@/components/site/MentorCTA";
import { IndustryLinks } from "@/components/site/IndustryLinks";
import { PricingCards } from "@/components/site/PricingCards";
import { FAQ } from "@/components/site/FAQ";
import { db } from "@/lib/db";
import { getContent } from "@/lib/content";

export const dynamic = "force-dynamic";

async function getTopConsultants() {
  const approved = await db.consultant.findMany({
    where: { status: "approved" },
    include: {
      _count: { select: { bookings: true } },
      bookings: {
        where: { review: { isNot: null } },
        select: { review: { select: { rating: true } } }
      }
    }
  });

  const withStats = approved.map(c => {
    const ratings = c.bookings.map(b => b.review!.rating);
    const rating = ratings.length
      ? ratings.reduce((s, r) => s + r, 0) / ratings.length
      : 0;
    return {
      id: c.id,
      displayName: c.displayName,
      bio: c.bio,
      photoUrl: c.photoUrl,
      hourlyRate: c.hourlyRate,
      rating,
      reviewCount: ratings.length,
      bookingCount: c._count.bookings,
      createdAt: c.createdAt
    };
  });

  const withRating = withStats
    .filter(c => c.rating > 0)
    .sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);

  const withoutRating = withStats
    .filter(c => c.rating === 0)
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

  return [...withRating, ...withoutRating].slice(0, 5);
}

export default async function Home() {
  const [consultants, content] = await Promise.all([
    getTopConsultants(),
    getContent([
      "hero.title",
      "hero.subtitle",
      "hero.cta",
      "features.title",
      "features.subtitle",
      "pricing.title",
      "pricing.subtitle"
    ])
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
      <TopConsultants consultants={consultants} />
      <MentorCTA />
      <IndustryLinks />
      <PricingCards
        title={content["pricing.title"]}
        subtitle={content["pricing.subtitle"]}
      />
      <FAQ />
    </>
  );
}