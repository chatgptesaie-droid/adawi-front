// import { useState } from "react";
// import type { MetaFunction } from "@remix-run/node";
// import { Plus, Search, Filter, Edit, Trash2, Eye, Mail, Phone, MoreVertical } from "lucide-react";
// import AddUserModal from "~/components/admin/AddUserModal";

// export const meta: MetaFunction = () => {
//   return [
//     { title: "Utilisateurs - Adawi Admin" },
//     { name: "description", content: "Gestion des utilisateurs" },
//   ];
// };

// export default function AdminUsers() {
//   const [isAddModalOpen, setIsAddModalOpen] = useState(false);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [filterRole, setFilterRole] = useState("all");

//   // Données simulées des utilisateurs
//   const users = [
//     {
//       id: 1,
//       name: "Kofi Asante",
//       email: "kofi.asante@email.com",
//       phone: "+228 90 12 34 56",
//       role: "Client",
//       status: "Actif",
//       avatar: "https://placehold.co/40x40/DAA520/FFFFFF?text=KA",
//       joinDate: "2024-01-15",
//       lastLogin: "2024-01-20",
//       orders: 12,
//       totalSpent: "450000"
//     },
//     {
//       id: 2,
//       name: "Ama Mensah",
//       email: "ama.mensah@email.com",
//       phone: "+228 91 23 45 67",
//       role: "Client",
//       status: "Actif",
//       avatar: "https://placehold.co/40x40/8B4513/FFFFFF?text=AM",
//       joinDate: "2024-01-10",
//       lastLogin: "2024-01-19",
//       orders: 8,
//       totalSpent: "320000"
//     },
//     {
//       id: 3,
//       name: "Kwame Nkrumah",
//       email: "kwame.nkrumah@email.com",
//       phone: "+228 92 34 56 78",
//       role: "Vendeur",
//       status: "Actif",
//       avatar: "https://placehold.co/40x40/DAA520/FFFFFF?text=KN",
//       joinDate: "2023-12-20",
//       lastLogin: "2024-01-20",
//       orders: 0,
//       totalSpent: "0"
//     },
//     {
//       id: 4,
//       name: "Akosua Osei",
//       email: "akosua.osei@email.com",
//       phone: "+228 93 45 67 89",
//       role: "Client",
//       status: "Inactif",
//       avatar: "https://placehold.co/40x40/8B4513/FFFFFF?text=AO",
//       joinDate: "2023-11-15",
//       lastLogin: "2023-12-10",
//       orders: 3,
//       totalSpent: "125000"
//     },
//     {
//       id: 5,
//       name: "Yaw Boateng",
//       email: "yaw.boateng@email.com",
//       phone: "+228 94 56 78 90",
//       role: "Admin",
//       status: "Actif",
//       avatar: "https://placehold.co/40x40/DAA520/FFFFFF?text=YB",
//       joinDate: "2023-10-01",
//       lastLogin: "2024-01-20",
//       orders: 0,
//       totalSpent: "0"
//     },
//     {
//       id: 6,
//       name: "Efua Adjei",
//       email: "efua.adjei@email.com",
//       phone: "+228 95 67 89 01",
//       role: "Client",
//       status: "Actif",
//       avatar: "https://placehold.co/40x40/8B4513/FFFFFF?text=EA",
//       joinDate: "2024-01-05",
//       lastLogin: "2024-01-18",
//       orders: 15,
//       totalSpent: "680000"
//     }
//   ];

//   const filteredUsers = users.filter(user => {
//     const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                          user.phone.includes(searchTerm);
//     const matchesRole = filterRole === "all" || user.role.toLowerCase() === filterRole.toLowerCase();
//     return matchesSearch && matchesRole;
//   });

//   const getRoleColor = (role: string) => {
//     switch (role) {
//       case "Admin":
//         return "bg-red-100 text-red-800";
//       case "Vendeur":
//         return "bg-blue-100 text-blue-800";
//       case "Client":
//         return "bg-green-100 text-green-800";
//       default:
//         return "bg-gray-100 text-gray-800";
//     }
//   };

//   const getStatusColor = (status: string) => {
//     return status === "Actif" 
//       ? "bg-green-100 text-green-800" 
//       : "bg-red-100 text-red-800";
//   };

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//         <div>
//           <h1 className="text-2xl font-bold text-adawi-brown">Gestion des Utilisateurs</h1>
//           <p className="text-gray-600">Gérez vos clients, vendeurs et administrateurs</p>
//         </div>
        
//         <button
//           onClick={() => setIsAddModalOpen(true)}
//           className="flex items-center px-4 py-2 bg-adawi-gold text-white rounded-lg hover:bg-adawi-gold/90 transition-colors"
//         >
//           <Plus className="w-5 h-5 mr-2" />
//           Ajouter un utilisateur
//         </button>
//       </div>

//       {/* Stats Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//         <div className="bg-white rounded-lg border border-gray-200 p-4">
//           <div className="flex items-center">
//             <div className="p-2 bg-blue-100 rounded-lg mr-3">
//               <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
//               </svg>
//             </div>
//             <div>
//               <p className="text-2xl font-bold text-gray-900">{users.length}</p>
//               <p className="text-sm text-gray-600">Total Utilisateurs</p>
//             </div>
//           </div>
//         </div>

//         <div className="bg-white rounded-lg border border-gray-200 p-4">
//           <div className="flex items-center">
//             <div className="p-2 bg-green-100 rounded-lg mr-3">
//               <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
//               </svg>
//             </div>
//             <div>
//               <p className="text-2xl font-bold text-gray-900">{users.filter(u => u.role === "Client").length}</p>
//               <p className="text-sm text-gray-600">Clients</p>
//             </div>
//           </div>
//         </div>

//         <div className="bg-white rounded-lg border border-gray-200 p-4">
//           <div className="flex items-center">
//             <div className="p-2 bg-yellow-100 rounded-lg mr-3">
//               <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
//               </svg>
//             </div>
//             <div>
//               <p className="text-2xl font-bold text-gray-900">{users.filter(u => u.role === "Vendeur").length}</p>
//               <p className="text-sm text-gray-600">Vendeurs</p>
//             </div>
//           </div>
//         </div>

//         <div className="bg-white rounded-lg border border-gray-200 p-4">
//           <div className="flex items-center">
//             <div className="p-2 bg-red-100 rounded-lg mr-3">
//               <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
//               </svg>
//             </div>
//             <div>
//               <p className="text-2xl font-bold text-gray-900">{users.filter(u => u.role === "Admin").length}</p>
//               <p className="text-sm text-gray-600">Administrateurs</p>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Filters and Search */}
//       <div className="bg-white rounded-lg border border-gray-200 p-4">
//         <div className="flex flex-col sm:flex-row gap-4">
//           {/* Search */}
//           <div className="flex-1">
//             <div className="relative">
//               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
//               <input
//                 type="text"
//                 placeholder="Rechercher par nom, email ou téléphone..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-gold focus:border-transparent outline-none"
//               />
//             </div>
//           </div>
          
//           {/* Role Filter */}
//           <div className="sm:w-48">
//             <select
//               value={filterRole}
//               onChange={(e) => setFilterRole(e.target.value)}
//               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-gold focus:border-transparent outline-none"
//             >
//               <option value="all">Tous les rôles</option>
//               <option value="client">Clients</option>
//               <option value="vendeur">Vendeurs</option>
//               <option value="admin">Administrateurs</option>
//             </select>
//           </div>
          
//           {/* Filter Button
//           <button className="flex items-center text-black px-4 py-2 border border-red-300 rounded-lg hover:bg-gray-50 transition-colors">
//             <Filter className="w-5 h-5 mr-2" />
//             Plus de filtres
//           </button> */}
//         </div>
//       </div>

//       {/* Users Table */}
//       <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
//         <div className="overflow-x-auto">
//           <table className="w-full">
//             <thead className="bg-gray-50 border-b border-gray-200">
//               <tr>
//                 <th className="text-left py-3 px-4 font-medium text-gray-900">Utilisateur</th>
//                 <th className="text-left py-3 px-4 font-medium text-gray-900">Contact</th>
//                 <th className="text-left py-3 px-4 font-medium text-gray-900">Rôle</th>
//                 <th className="text-left py-3 px-4 font-medium text-gray-900">Statut</th>
//                 <th className="text-left py-3 px-4 font-medium text-gray-900">Commandes</th>
//                 <th className="text-left py-3 px-4 font-medium text-gray-900">Total dépensé</th>
//                 <th className="text-left py-3 px-4 font-medium text-gray-900">Dernière connexion</th>
//                 <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-200">
//               {filteredUsers.map((user) => (
//                 <tr key={user.id} className="hover:bg-gray-50">
//                   <td className="py-4 px-4">
//                     <div className="flex items-center">
//                       <img
//                         src={user.avatar}
//                         alt={user.name}
//                         className="w-10 h-10 rounded-full mr-3"
//                       />
//                       <div>
//                         <p className="font-medium text-gray-900">{user.name}</p>
//                         <p className="text-sm text-gray-500">ID: {user.id}</p>
//                       </div>
//                     </div>
//                   </td>
//                   <td className="py-4 px-4">
//                     <div className="space-y-1">
//                       <div className="flex items-center text-sm text-gray-900">
//                         <Mail className="w-4 h-4 mr-2 text-gray-400" />
//                         {user.email}
//                       </div>
//                       <div className="flex items-center text-sm text-gray-500">
//                         <Phone className="w-4 h-4 mr-2 text-gray-400" />
//                         {user.phone}
//                       </div>
//                     </div>
//                   </td>
//                   <td className="py-4 px-4">
//                     <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(user.role)}`}>
//                       {user.role}
//                     </span>
//                   </td>
//                   <td className="py-4 px-4">
//                     <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(user.status)}`}>
//                       {user.status}
//                     </span>
//                   </td>
//                   <td className="py-4 px-4 text-gray-900">
//                     {user.orders} commandes
//                   </td>
//                   <td className="py-4 px-4 text-gray-900">
//                     {parseInt(user.totalSpent).toLocaleString()} F CFA
//                   </td>
//                   <td className="py-4 px-4 text-sm text-gray-500">
//                     {new Date(user.lastLogin).toLocaleDateString('fr-FR')}
//                   </td>
//                   <td className="py-4 px-4">
//                     <div className="flex items-center space-x-2">
//                       <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors" title="Voir détails">
//                         <Eye className="w-4 h-4" />
//                       </button>
//                       <button className="p-2 text-gray-400 hover:text-green-600 transition-colors" title="Modifier">
//                         <Edit className="w-4 h-4" />
//                       </button>
//                       <button className="p-2 text-gray-400 hover:text-red-600 transition-colors" title="Supprimer">
//                         <Trash2 className="w-4 h-4" />
//                       </button>
//                       <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors" title="Plus d'options">
//                         <MoreVertical className="w-4 h-4" />
//                       </button>
//                     </div>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {/* Pagination */}
//       <div className="flex items-center justify-between">
//         <p className="text-sm text-gray-700">
//           Affichage de <span className="font-medium">1</span> à <span className="font-medium">{filteredUsers.length}</span> sur <span className="font-medium">{users.length}</span> utilisateurs
//         </p>
        
//         <div className="flex items-center space-x-2">
//           <button className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
//             Précédent
//           </button>
//           <button className="px-3 py-2 text-sm bg-adawi-gold text-white rounded-lg">
//             1
//           </button>
//           <button className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
//             2
//           </button>
//           <button className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
//             Suivant
//           </button>
//         </div>
//       </div>

//       {/* Add User Modal */}
//       <AddUserModal 
//         isOpen={isAddModalOpen}
//         onClose={() => setIsAddModalOpen(false)}
//       />
//     </div>
//   );
// }