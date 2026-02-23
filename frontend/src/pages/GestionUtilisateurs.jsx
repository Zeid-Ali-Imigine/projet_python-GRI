import React, { useState, useEffect } from 'react';
import api, { utilisateursAPI } from '../apis';

export default function GestionUtilisateurs() {
    const [utilisateurs, setUtilisateurs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await utilisateursAPI.getAll();
            setUtilisateurs(res.data);
            setLoading(false);
        } catch (err) {
            console.error("Erreur chargement utilisateurs", err);
            setLoading(false);
        }
    };

    const handleToggleStatus = async (user) => {
        try {
            const action = user.is_active ? 'bloquer' : 'debloquer';
            await api.post(`utilisateurs/${user.id}/${action}/`);
            fetchUsers();
        } catch (err) {
            alert("Erreur lors de la modification du statut.");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Voulez-vous vraiment supprimer cet utilisateur ?")) {
            try {
                await api.delete(`utilisateurs/${id}/`);
                fetchUsers();
            } catch (err) {
                alert("Erreur lors de la suppression.");
            }
        }
    };

    const filteredUsers = utilisateurs.filter(u =>
        u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.last_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="p-8">Chargement...</div>;

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-gray-800">Gestion des Utilisateurs</h2>
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Rechercher un utilisateur..."
                        className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 w-64"
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Identité</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Rôle</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Statut</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredUsers.map(user => (
                            <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="font-medium text-gray-800">{user.first_name} {user.last_name}</div>
                                    <div className="text-sm text-gray-500">@{user.username} | {user.email}</div>
                                </td>
                                <td className="px-6 py-4 text-sm">
                                    <span className={`px-3 py-1 rounded-full font-medium ${user.role === 'admin' ? 'bg-purple-50 text-purple-700' :
                                            user.role === 'owner' ? 'bg-orange-50 text-orange-700' :
                                                'bg-blue-50 text-blue-700'
                                        }`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${user.is_active ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                                        }`}>
                                        {user.is_active ? 'Actif' : 'Bloqué'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm font-medium space-x-3">
                                    <button
                                        onClick={() => handleToggleStatus(user)}
                                        className={`${user.is_active ? 'text-orange-600 hover:text-orange-900' : 'text-green-600 hover:text-green-900'}`}
                                    >
                                        {user.is_active ? 'Bloquer' : 'Débloquer'}
                                    </button>
                                    <button
                                        onClick={() => handleDelete(user.id)}
                                        className="text-red-600 hover:text-red-900"
                                    >
                                        Supprimer
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
