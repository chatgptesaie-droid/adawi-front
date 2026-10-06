import type { MetaFunction } from "@remix-run/node";
import { useState } from "react";
import TopBanner from "~/components/TopBanner";
import Header from "~/components/CompactHeader";
import Footer from "~/components/Footer";
import {
  Users,
  Sparkles,
  Scissors,
  Headphones,
  Truck,
  Heart,
  Star,
  MapPin,
  Mail,
  Linkedin,
  Award,
  Target,
  Eye,
  Zap
} from "lucide-react";

export const meta: MetaFunction = () => {
  return [
    { title: "Notre Équipe - Adawi" },
    { name: "description", content: "Découvrez l'équipe passionnée qui fait d'Adawi une référence mode au Togo. Stylistes, conseillers et experts à votre service." },
  ];
};

export default function Equipe() {
  const [activeTeamMember, setActiveTeamMember] = useState<string | null>(null);

  const toggleTeamMember = (memberId: string) => {
    setActiveTeamMember(activeTeamMember === memberId ? null : memberId);
  };

  const leadership = [
    {
      id: "ceo",
      name: "Amina ADAWI",
      role: "Fondatrice & Directrice Générale",
      image: "https://img.freepik.com/photos-premium/jeune-femme-africaine-gerant-boutique-ligne-startup-petite-entreprise-pme-utilisant-smartphone-tablette-recevant-verifiant-commande-achat-ligne_1091882-7716.jpg",
      bio: "Passionnée de mode depuis son plus jeune âge, Amina a fondé Adawi avec la vision de démocratiser l'élégance au Togo. Diplômée en management et stylisme, elle dirige l'entreprise avec passion et innovation.",
      experience: "15 ans d'expérience",
      speciality: "Vision stratégique & Développement",
      quote: "La mode est un langage universel qui permet à chacun d'exprimer sa personnalité unique."
    },
    {
      id: "creative-director",
      name: "Kofi MENSAH",
      role: "Directeur Créatif",
      image: "https://i0.wp.com/zimprofiles.com/wp-content/uploads/2023/05/Feli-Nandi-005.jpg?resize=1082%2C1536&ssl=1",
      bio: "Styliste reconnu avec une formation internationale, Kofi supervise toutes les collections et tendances. Son œil artistique et sa connaissance des tendances mondiales font de lui un pilier créatif.",
      experience: "12 ans d'expérience",
      speciality: "Création & Tendances",
      quote: "Chaque vêtement raconte une histoire, notre rôle est de vous aider à écrire la vôtre."
    }
  ];

  const teamMembers = [
    {
      id: "stylist1",
      name: "Fatou DIALLO",
      role: "Styliste Senior",
      department: "Style & Conseil",
      image: "/styliste1.png",
      bio: "Experte en morphologie et colorimétrie, Fatou accompagne nos clients dans leurs choix vestimentaires avec bienveillance et professionnalisme.",
      skills: ["Conseil morphologique", "Colorimétrie", "Styling événementiel"]
    },
    {
      id: "stylist2",
      name: "David AGBEKO",
      role: "Styliste Homme",
      department: "Style & Conseil",
      image: "/styliste.png",
      bio: "Spécialisé dans la mode masculine, David maîtrise parfaitement les codes du vestiaire masculin moderne et classique.",
      skills: ["Mode masculine", "Costume sur-mesure", "Accessoires"]
    },
    {
      id: "seamstress",
      name: "Akosua TETTEH",
      role: "Cheffe Couturière",
      department: "Atelier",
      image: "/placeholder.svg?height=250&width=250",
      bio: "Maître artisan avec 20 ans d'expérience, Akosua dirige notre atelier de retouches avec une précision et un savoir-faire exceptionnels.",
      skills: ["Retouches haute couture", "Ajustements", "Réparations textiles"]
    },
    {
      id: "customer-service",
      name: "Esi KOFFI",
      role: "Responsable Service Client",
      department: "Relation Client",
      image: "/placeholder.svg?height=250&width=250",
      bio: "Esi veille à ce que chaque client vive une expérience exceptionnelle. Son écoute et sa réactivité font d'elle une ambassadrice parfaite de nos valeurs.",
      skills: ["Relation client", "Résolution de problèmes", "Formation équipe"]
    },
    {
      id: "logistics",
      name: "Kwame ASANTE",
      role: "Responsable Logistique",
      department: "Opérations",
      image: "/placeholder.svg?height=250&width=250",
      bio: "Kwame coordonne toute notre chaîne logistique pour garantir des livraisons rapides et sécurisées partout au Togo.",
      skills: ["Gestion des stocks", "Logistique", "Optimisation des livraisons"]
    },
    {
      id: "visual-merchandiser",
      name: "Adjoa OWUSU",
      role: "Visual Merchandiser",
      department: "Marketing",
      image: "/placeholder.svg?height=250&width=250",
      bio: "Adjoa crée des mises en scène produits qui racontent une histoire et inspirent nos clients à travers nos vitrines et notre boutique.",
      skills: ["Merchandising visuel", "Photographie", "Direction artistique"]
    }
  ];

  const departments = [
    {
      name: "Style & Conseil",
      icon: Sparkles,
      color: "bg-purple-100 text-purple-800",
      description: "Nos experts vous accompagnent pour révéler votre style unique",
      count: 4
    },
    {
      name: "Atelier Couture",
      icon: Scissors,
      color: "bg-green-100 text-green-800",
      description: "Artisans qualifiés pour des retouches et ajustements parfaits",
      count: 3
    },
    {
      name: "Service Client",
      icon: Headphones,
      color: "bg-blue-100 text-blue-800",
      description: "Une équipe dédiée à votre satisfaction et votre accompagnement",
      count: 5
    },
    {
      name: "Logistique",
      icon: Truck,
      color: "bg-adawi-gold/20 text-adawi-brown",
      description: "Gestion des stocks et livraisons pour un service optimal",
      count: 6
    }
  ];

  const values = [
    {
      icon: Heart,
      title: "Passion",
      description: "Nous vivons et respirons la mode avec une passion contagieuse qui se ressent dans chaque interaction."
    },
    {
      icon: Star,
      title: "Excellence",
      description: "Nous visons l'excellence dans tout ce que nous faisons, du conseil client à la qualité de nos produits."
    },
    {
      icon: Users,
      title: "Bienveillance",
      description: "Nous créons un environnement bienveillant où chacun peut s'épanouir et exprimer son potentiel."
    },
    {
      icon: Zap,
      title: "Innovation",
      description: "Nous restons à l'avant-garde des tendances et innovations pour offrir le meilleur à nos clients."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <TopBanner />
      <Header />

      <main className="bg-gradient-to-br from-adawi-beige via-white to-adawi-beige-dark">
        {/* Hero Section */}
        <section className="bg-adawi-beige py-16 px-4 sm:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-adawi-gold rounded-full mb-6">
              <Users className="w-10 h-10 text-white" />
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-adawi-brown mb-4 tracking-tight">
              Notre Équipe
            </h1>
            <p className="text-xl text-black max-w-2xl mx-auto leading-relaxed">
              Découvrez les visages passionnés qui font d'Adawi une référence mode au Togo. Une équipe unie par l'amour de la mode et l'excellence du service.
            </p>
          </div>
        </section>

        {/* Leadership */}
        <section className="py-16 px-4 sm:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-adawi-brown mb-4">
                Direction
              </h2>
              <p className="text-xl text-black">
                Les visionnaires qui guident Adawi vers l'excellence
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-12">
              {leadership.map((leader) => (
                <div key={leader.id} className="bg-white rounded-2xl shadow-lg border border-adawi-gold/20 overflow-hidden hover:shadow-xl transition-all duration-300">
                  <div className="aspect-square bg-gray-100 overflow-hidden">
                    <img
                      src={leader.image}
                      alt={leader.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-8">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-2xl font-bold text-adawi-brown mb-1">
                          {leader.name}
                        </h3>
                        <p className="text-adawi-gold font-medium">
                          {leader.role}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-black">
                          {leader.experience}
                        </p>
                        <p className="text-xs text-black">
                          {leader.speciality}
                        </p>
                      </div>
                    </div>
                    
                    <p className="text-black mb-4 leading-relaxed">
                      {leader.bio}
                    </p>
                    
                    <blockquote className="border-l-4 border-adawi-gold pl-4 italic text-adawi-brown">
                      "{leader.quote}"
                    </blockquote>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Départements */}
        <section className="py-16 px-4 sm:px-6 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-adawi-brown mb-4">
                Nos Départements
              </h2>
              <p className="text-xl text-adawi-brown-light">
                Une organisation structurée pour vous servir au mieux
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {departments.map((dept, index) => {
                const Icon = dept.icon;
                return (
                  <div key={index} className="bg-adawi-beige/30 rounded-2xl p-6 text-center hover:bg-adawi-beige/50 transition-all duration-300 hover:scale-105">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-adawi-gold rounded-full mb-4">
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-adawi-brown mb-2">
                      {dept.name}
                    </h3>
                    <p className="text-sm text-black mb-3">
                      {dept.description}
                    </p>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${dept.color}`}>
                      {dept.count} membres
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Équipe */}
        <section className="py-16 px-4 sm:px-6 bg-adawi-beige/20">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-adawi-brown mb-4">
                Rencontrez l'Équipe
              </h2>
              <p className="text-xl text-black">
                Les talents qui donnent vie à l'expérience Adawi
              </p>
            </div>

            <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-8">
              {teamMembers.map((member) => (
                <div key={member.id} className="bg-white rounded-2xl shadow-lg border border-adawi-gold/20 overflow-hidden hover:shadow-xl transition-all duration-300">
                  <div className="aspect-square bg-gray-100 overflow-hidden">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <div className="mb-4">
                      <h3 className="text-xl font-semibold text-adawi-brown mb-1">
                        {member.name}
                      </h3>
                      <p className="text-black font-medium text-sm mb-1">
                        {member.role}
                      </p>
                      <p className="text-xs text-black">
                        {member.department}
                      </p>
                    </div>
                    
                    <p className="text-sm text-black mb-4 leading-relaxed">
                      {member.bio}
                    </p>
                    
                    <button
                      onClick={() => toggleTeamMember(member.id)}
                      className="w-full bg-adawi-beige/50 text-adawi-brown py-2 px-4 rounded-full font-medium hover:bg-adawi-gold hover:text-white transition-all duration-300 text-sm"
                    >
                      {activeTeamMember === member.id ? 'Masquer les compétences' : 'Voir les compétences'}
                    </button>
                    
                    {activeTeamMember === member.id && (
                      <div className="mt-4 p-4 bg-adawi-beige/20 rounded-xl">
                        <h4 className="text-sm font-semibold text-adawi-brown mb-2">Compétences :</h4>
                        <ul className="space-y-1">
                          {member.skills.map((skill, index) => (
                            <li key={index} className="text-xs text-black flex items-center">
                              <Star className="w-3 h-3 text-adawi-gold mr-2 flex-shrink-0" />
                              {skill}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Valeurs */}
        <section className="py-16 px-4 sm:px-6 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-adawi-brown mb-4">
                Nos Valeurs
              </h2>
              <p className="text-xl text-black">
                Les principes qui nous unissent et nous guident au quotidien
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => {
                const Icon = value.icon;
                return (
                  <div key={index} className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-adawi-gold/20 rounded-full mb-6">
                      <Icon className="w-8 h-8 text-adawi-gold" />
                    </div>
                    <h3 className="text-xl font-semibold text-adawi-brown mb-4">
                      {value.title}
                    </h3>
                    <p className="text-black leading-relaxed">
                      {value.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="py-16 px-4 sm:px-6 bg-adawi-beige/30">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12">
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-adawi-gold/20">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-adawi-gold rounded-full mb-6">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-adawi-brown mb-4">
                  Notre Mission
                </h3>
                <p className="text-black  leading-relaxed">
                  Démocratiser l'élégance et rendre la mode accessible à tous au Togo, en offrant des produits de qualité, des conseils personnalisés et un service d'exception qui révèle la beauté unique de chaque personne.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-lg border border-adawi-gold/20">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-adawi-gold rounded-full mb-6">
                  <Eye className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-adawi-brown mb-4">
                  Notre Vision
                </h3>
                <p className="text-black leading-relaxed">
                  Devenir la référence mode incontournable en Afrique de l'Ouest, reconnue pour son expertise, son innovation et son impact positif sur la confiance en soi de nos clients.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Rejoindre l'équipe */}
        <section className="py-16 px-4 sm:px-6 bg-gradient-to-r from-adawi-gold to-adawi-brown">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Rejoignez Notre Équipe
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Vous partagez notre passion pour la mode et l'excellence ? Nous sommes toujours à la recherche de talents pour enrichir notre équipe.
            </p>
            
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm">
                <Award className="w-8 h-8 text-white mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-white mb-2">Environnement Stimulant</h3>
                <p className="text-white/90 text-sm">Évoluez dans un cadre dynamique et créatif</p>
              </div>
              
              <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm">
                <Users className="w-8 h-8 text-white mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-white mb-2">Équipe Bienveillante</h3>
                <p className="text-white/90 text-sm">Intégrez une équipe soudée et passionnée</p>
              </div>
              
              <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm">
                <Star className="w-8 h-8 text-white mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-white mb-2">Développement Personnel</h3>
                <p className="text-white/90 text-sm">Formations et évolutions de carrière</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              
              
              <a
                href="mailto:rh@adawi.com"
                className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold hover:bg-white hover:text-adawi-brown transition-all duration-300 hover:shadow-xl transform hover:scale-105"
              >
                Candidature Spontanée
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
