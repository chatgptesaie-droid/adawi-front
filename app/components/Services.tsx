import { Headphones, CreditCard, Truck, PackageSearch } from "lucide-react";

const services = [
  {
    icon: Headphones,
    title: "Assistance client",
    subtitle: "24h/24 et 7j/7",
    description: "Notre équipe dédiée vous accompagne à tout moment.",
  },
  {
    icon: CreditCard,
    title: "Paiement sécurisé",
    subtitle: "Transactions cryptées",
    description: "Vos données bancaires sont protégées par SSL.",
  },
  {
    icon: Truck,
    title: "Livraison rapide",
    subtitle: "Et gratuite",
    description: "Frais de livraison payé à la réception de la commande.",
  },
  {
    icon: PackageSearch,
    title: "Suivi en temps réel",
    subtitle: "De vos commandes",
    description: "Suivez votre colis étape par étape.",
  },
];

export default function Services() {
  return (
    <section className="bg-[#FAFAF8] px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {services.map(({ icon: Icon, title, subtitle, description }, i) => (
            <div
              key={i}
              className="group flex flex-col gap-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md p-6 transition-shadow duration-200"
            >
              {/* Icône */}
              <div className="w-12 h-12 rounded-xl bg-[#8B5E3C]/10 flex items-center justify-center shrink-0">
                <Icon className="w-6 h-6 text-[#8B5E3C]" />
              </div>

              {/* Texte */}
              <div>
                <h3 className="text-sm font-bold text-[#1A1A1A] mb-0.5">{title}</h3>
                <p className="text-xs font-semibold text-[#C9A96E] mb-2">{subtitle}</p>
                <p className="text-xs text-[#6B6B6B] leading-relaxed">{description}</p>
              </div>

              {/* Trait décoratif au hover */}
              <div className="w-8 h-0.5 bg-[#C9A96E] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
