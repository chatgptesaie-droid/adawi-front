import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { X } from "lucide-react";

interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  is_banned: boolean;
  is_active: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

interface ViewUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

export default function ViewUserModal({ isOpen, onClose, user }: ViewUserModalProps) {
  if (!user) return null;

  const formatDate = (date: string) =>
    new Date(date).toLocaleString("fr-FR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-30 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-6 text-left shadow-xl transition-all">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <Dialog.Title className="text-lg font-bold text-gray-900">
                    Détails de l’utilisateur
                  </Dialog.Title>
                  <button
                    type="button"
                    className="rounded-md text-gray-400 hover:text-gray-600"
                    onClick={onClose}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Infos utilisateur */}
                <div className="space-y-3">
                  <p>
                    <span className="font-medium">Nom complet :</span>{" "}
                    {user.full_name}
                  </p>
                  <p>
                    <span className="font-medium">Email :</span> {user.email}
                  </p>
                  <p>
                    <span className="font-medium">Rôle :</span> {user.role}
                  </p>
                  <p>
                    <span className="font-medium">Statut :</span>{" "}
                    {user.is_banned
                      ? "Banni"
                      : user.is_active
                      ? "Actif"
                      : "Inactif"}
                  </p>
                  <p>
                    <span className="font-medium">Créé le :</span>{" "}
                    {formatDate(user.created_at)}
                  </p>
                  <p>
                    <span className="font-medium">Dernière mise à jour :</span>{" "}
                    {formatDate(user.updated_at)}
                  </p>
                  {user.is_deleted && (
                    <p className="text-red-600">
                      Compte supprimé le : {user.deleted_at ? formatDate(user.deleted_at) : "—"}
                    </p>
                  )}
                </div>

                {/* Bouton fermer */}
                <div className="mt-6 text-right">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 bg-adawi-gold text-white rounded-lg hover:bg-adawi-gold/90 transition-colors"
                  >
                    Fermer
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
