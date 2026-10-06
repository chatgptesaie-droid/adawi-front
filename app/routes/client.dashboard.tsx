import type { MetaFunction } from "@remix-run/node";
import ClientLayout from "~/components/client/ClientLayout";
import { Package, Clock, CheckCircle, XCircle } from "lucide-react";

export const meta: MetaFunction = () => {
  return [
    { title: "Mon Espace - Adawi" },
    { name: "description", content: "Espace client Adawi" },
  ];
};

// export default function ClientDashboard() {
//   // Données d'exemple - à remplacer par de vraies données
// //   const stats = {
// //     totalOrders: 12,
// //     pendingOrders: 2,
// //     completedOrders: 8,
// //     cancelledOrders: 2,
// //   };

// //   const recentOrders = [
// //     {
// //       id: "CMD-001",
// //       date: "2024-01-15",
// //       status: "En cours",
// //       total: "89.99FCFA",
// //       items: 3
// //     },
// //     {
// //       id: "CMD-002", 
// //       date: "2024-01-10",
// //       status: "Livré",
// //       total: "156.50FCFA",
// //       items: 5
// //     },
// //     {
// //       id: "CMD-003",
// //       date: "2024-01-05",
// //       status: "En préparation",
// //       total: "45.00FCFA",
// //       items: 2
// //     }
// //   ];

//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case "Livré": return "text-green-600 bg-green-50";
//       case "En cours": return "text-blue-600 bg-blue-50";
//       case "En préparation": return "text-yellow-600 bg-yellow-50";
//       case "Annulé": return "text-red-600 bg-red-50";
//       default: return "text-gray-600 bg-gray-50";
//     }
//   };

//   return (
//     <ClientLayout userName="John Doe">
//       <div className="space-y-6">
//         {/* Welcome Section */}
//         <div>
//           <h1 className="text-2xl font-bold text-adawi-brown mb-2">
//             Tableau de bord
//           </h1>
//           <p className="text-gray-600">
//             Gérez vos commandes et votre profil en toute simplicité
//           </p>
//         </div>

//         {/* Stats Cards */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
//           <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
//             <div className="flex items-center justify-between mb-4">
//               <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
//                 Total Commandes
//               </h3>
//               <span className="p-2 bg-blue-50 text-blue-600 rounded-lg">
//                 <Package className="w-5 h-5" />
//               </span>
//             </div>
//             {/* <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p> */}
//           </div>

//           <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
//             <div className="flex items-center justify-between mb-4">
//               <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
//                 En Attente
//               </h3>
//               <span className="p-2 bg-yellow-50 text-yellow-600 rounded-lg">
//                 <Clock className="w-5 h-5" />
//               </span>
//             </div>
//             {/* <p className="text-2xl font-bold text-gray-900">{stats.pendingOrders}</p> */}
//           </div>

//           <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
//             <div className="flex items-center justify-between mb-4">
//               <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
//                 Livrées
//               </h3>
//               <span className="p-2 bg-green-50 text-green-600 rounded-lg">
//                 <CheckCircle className="w-5 h-5" />
//               </span>
//             </div>
//             {/* <p className="text-2xl font-bold text-gray-900">{stats.completedOrders}</p> */}
//           </div>

//           <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
//             <div className="flex items-center justify-between mb-4">
//               <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
//                 Annulées
//               </h3>
//               <span className="p-2 bg-red-50 text-red-600 rounded-lg">
//                 <XCircle className="w-5 h-5" />
//               </span>
//             </div>
//             {/* <p className="text-2xl font-bold text-gray-900">{stats.cancelledOrders}</p> */}
//           </div>
//         </div>

//         {/* Recent Orders */}
//         <div className="bg-white rounded-xl shadow-sm border border-gray-200">
//           <div className="p-6 border-b border-gray-200">
//             <h2 className="text-lg font-semibold text-adawi-brown">
//               Commandes Récentes
//             </h2>
//           </div>
//           <div className="p-6">
//             {/* <div className="space-y-4">
//               {recentOrders.map((order) => (
//                 <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
//                   <div className="flex items-center space-x-4">
//                     <div>
//                       <p className="font-medium text-gray-900">{order.id}</p>
//                       <p className="text-sm text-gray-500">{order.date}</p>
//                     </div>
//                     <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
//                       {order.status}
//                     </span>
//                   </div>
//                   <div className="text-right">
//                     <p className="font-medium text-gray-900">{order.total}</p>
//                     <p className="text-sm text-gray-500">{order.items} article(s)</p>
//                   </div>
//                 </div>
//               ))}
//             </div> */}
//           </div>
//         </div>
//       </div>
//     </ClientLayout>
//   );
// }
