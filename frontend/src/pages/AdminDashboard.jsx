import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { biensAPI, demandesAPI, utilisateursAPI, paiementsAPI } from '../apis';
import GestionUtilisateurs from './GestionUtilisateurs';

export default function AdminDashboard() {
    const navigate = useNavigate();
    const [stats, setStats] = useState({ biens: 0, demandes: 0, utilisateurs: 0 });
    const [finances, setFinances] = useState({ flux_entrants: 0, flux_sortants: 0, balance: 0, attente: 0, refuses: 0 });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [biensRes, demandesRes, usersRes, financesRes] = await Promise.all([
                    biensAPI.getAll(),
                    demandesAPI.getAll(),
                    utilisateursAPI.getAll(),
                    paiementsAPI.getStats()
                ]);
                setStats({
                    biens: biensRes.data.length || 0,
                    demandes: demandesRes.data.length || 0,
                    utilisateurs: usersRes.data.length || 0
                });
                setFinances(financesRes.data);
            } catch (err) {
                console.error("Erreur chargement stats admin", err);
            }
        };
        fetchStats();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        navigate('/login');
    };

    const VueEnsemble = () => (
        <div className="flex-1 overflow-y-auto p-8 bg-gray-50/30">
            <div className="mb-8">
                <h2 className="text-3xl font-black text-gray-800">Vue d'Ensemble</h2>
                <p className="text-gray-500">Statistiques globales et santé financière du parc immobilier.</p>
            </div>

            {/* Dashboard Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                    <div className="flex justify-between items-start mb-4">
                        <span className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">🏢</span>
                        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">PROPRIÉTÉS</span>
                    </div>
                    <h3 className="text-sm font-medium text-gray-400 mb-1 uppercase tracking-tight">Total Biens</h3>
                    <p className="text-3xl font-black text-gray-800">{stats.biens}</p>
                </div>
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                    <div className="flex justify-between items-start mb-4">
                        <span className="p-3 bg-orange-50 text-orange-600 rounded-xl group-hover:bg-orange-600 group-hover:text-white transition-colors">📩</span>
                    </div>
                    <h3 className="text-sm font-medium text-gray-400 mb-1 uppercase tracking-tight">Demandes Libres</h3>
                    <p className="text-3xl font-black text-gray-800">{stats.demandes}</p>
                </div>
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                    <div className="flex justify-between items-start mb-4">
                        <span className="p-3 bg-purple-50 text-purple-600 rounded-xl group-hover:bg-purple-600 group-hover:text-white transition-colors">👥</span>
                    </div>
                    <h3 className="text-sm font-medium text-gray-400 mb-1 uppercase tracking-tight">Utilisateurs</h3>
                    <p className="text-3xl font-black text-gray-800">{stats.utilisateurs}</p>
                </div>
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-indigo-100 bg-gradient-to-br from-white to-indigo-50/30 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                    <div className="flex justify-between items-start mb-4">
                        <span className="p-3 bg-green-50 text-green-600 rounded-xl group-hover:bg-green-600 group-hover:text-white transition-colors">💰</span>
                    </div>
                    <h3 className="text-sm font-medium text-gray-400 mb-1 uppercase tracking-tight">Balance Net</h3>
                    <p className="text-3xl font-black text-green-600">{finances.balance} MRU</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                    <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                        <span className="w-1.5 h-6 bg-blue-600 rounded-full mr-3"></span>
                        Flux de Trésorerie
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="p-6 bg-emerald-50 rounded-2xl">
                            <p className="text-xs font-black text-emerald-600 uppercase mb-2">Flux Entrants (Paiements Validés)</p>
                            <p className="text-2xl font-black text-emerald-800">{finances.flux_entrants} MRU</p>
                            <div className="mt-4 w-full bg-emerald-200 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-emerald-600 h-full" style={{ width: '70%' }}></div>
                            </div>
                        </div>
                        <div className="p-6 bg-rose-50 rounded-2xl">
                            <p className="text-xs font-black text-rose-600 uppercase mb-2">Flux Sortants (Charges & Dépenses)</p>
                            <p className="text-2xl font-black text-rose-800">{finances.flux_sortants} MRU</p>
                            <div className="mt-4 w-full bg-rose-200 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-rose-600 h-full" style={{ width: '30%' }}></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                    <h2 className="text-xl font-bold text-gray-800 mb-6">Alertes Trésorerie</h2>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-orange-50 rounded-xl border border-orange-100">
                            <div>
                                <p className="text-sm font-bold text-orange-800">{finances.attente}</p>
                                <p className="text-[10px] text-orange-600 font-bold uppercase">En attente de validation</p>
                            </div>
                            <span className="text-2xl">⏳</span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-red-50 rounded-xl border border-red-100">
                            <div>
                                <p className="text-sm font-bold text-red-800">{finances.refuses}</p>
                                <p className="text-[10px] text-red-600 font-bold uppercase">Paiements Refusés</p>
                            </div>
                            <span className="text-2xl">⚠️</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <aside className="w-64 bg-white shadow-lg flex flex-col">
                <div className="p-6 border-b">
                    <h2 className="text-2xl font-bold text-gray-800">Admin</h2>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    <Link to="/admin" className="block py-2.5 px-4 rounded-lg bg-blue-50 text-blue-700 font-semibold transition-colors">Vue d'ensemble</Link>
                    <Link to="/admin/utilisateurs" className="block py-2.5 px-4 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">Utilisateurs</Link>
                    <Link to="/admin/biens" className="block py-2.5 px-4 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">Biens Immobiliers</Link>
                    <Link to="/admin/demandes" className="block py-2.5 px-4 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">Demandes de Location</Link>
                </nav>
                <div className="p-4 border-t">
                    <button onClick={handleLogout} className="w-full py-2 px-4 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 transition-colors">
                        Déconnexion
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden">
                <header className="bg-white shadow-sm z-10 p-4 flex justify-between items-center">
                    <h1 className="text-xl font-semibold text-gray-800">Tableau de bord Administrateur</h1>
                    <div className="flex items-center space-x-4">
                        <span className="text-sm font-medium text-gray-600">admin@exemple.mr</span>
                        <div className="h-10 w-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold shadow-md">A</div>
                    </div>
                </header>

                <Routes>
                    <Route path="/" element={<VueEnsemble />} />
                    <Route path="utilisateurs" element={<GestionUtilisateurs />} />
                    <Route path="biens" element={<div className="p-8 font-bold">Liste des Biens (En cours)</div>} />
                    <Route path="demandes" element={<div className="p-8 font-bold">Gestion des Demandes (En cours)</div>} />
                </Routes>
            </main>
        </div>
    );
}
