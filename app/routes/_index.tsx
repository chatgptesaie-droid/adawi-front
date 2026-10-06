import type { MetaFunction } from "@remix-run/node";
import TopBanner from "~/components/TopBanner";
import Header from "~/components/CompactHeader";
import Hero from "~/components/Hero";
import NewProducts from "~/components/NewProducts";
import Services from "~/components/Services";
import Testimonials from "~/components/Testimonials";
import Newsletter from "~/components/Newsletter";
import Footer from "~/components/Footer";

export const meta: MetaFunction = () => {
  return [
    { title: "Adawi - L'élégance est une attitude" },
    { name: "description", content: "Découvrez notre collection de vêtements élégants. Matériaux durables, fabriqué au Togo, livraison rapide." },
  ];
};

export default function Index() {
  return (
    <div className="min-h-screen bg-white">
      <TopBanner />
      <Header />
      <Hero />
      <div className="bg-gray-200">
        <br />
        <br />
      </div>
      <NewProducts />
      <Services />
      <Testimonials />
      <br className="bg-white"/>
      <Newsletter />
      <Footer />
    </div>
  );
}
