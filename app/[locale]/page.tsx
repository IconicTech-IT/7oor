import { GsapStackSections } from "@/components/home/gsap-stack-sections";
import { HeroSection } from "@/components/home/hero-section";
import { CategoriesSection } from "@/components/home/categories-section";
import { FeaturedSection } from "@/components/home/featured-section";
import { ServicesSection } from "@/components/home/services-section";
import { CtaSection } from "@/components/home/cta-section";
import { getCategoryTree } from "@/lib/data/categories";
import { getFeaturedProducts } from "@/lib/data/products";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [categories, featuredProducts] = await Promise.all([
    getCategoryTree(),
    getFeaturedProducts(8),
  ]);

  const sections = [
    <HeroSection key="hero" />,
    <CategoriesSection key="categories" categories={categories} />,
    <FeaturedSection key="featured" products={featuredProducts} />,
    <ServicesSection key="services" />,
    <CtaSection key="cta" />,
  ];

  return <GsapStackSections sections={sections} />;
}
