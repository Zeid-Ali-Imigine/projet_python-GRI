import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { biensAPI, paiementsAPI, demandesAPI } from '../apis';

export default function OwnerDashboard() {
    const navigate = useNavigate();
    const [biens, setBiens] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        flux_entrants: 0,
        flux_sortants: 0,
        balance: 0,
        attente: 0,
        refuses: 0
    });
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [newBien, setNewBien] = useState({
        adresse: '',
        superficie: '',
        type_bien: 'appartement',
        loyer_estime: '',
        statut: 'disponible'
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = () => {
        setLoading(true);
        Promise.all([biensAPI.getAll(), paiementsAPI.getStats()])
            .then(([biensRes, statsRes]) => {
                setBiens(biensRes.data);
                setStats(statsRes.data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Erreur chargement données", err);
                setLoading(false);
            });
    };

    const handleAddBien = async (e) => {
        e.preventDefault();
        try {
            // Dans un vrai cas on récupère l'ID de l'utilisateur sur le backend via request.user
            // On s'assure juste ici de ne pas envoyer d'ID propriétaire si le backend le gère
            await biensAPI.create({
                ...newBien,
                proprietaire: 1 // Placeholder, idéalement géré par le backend via perform_create
            });
            setShowAddModal(false);
            setNewBien({ adresse: '', superficie: '', type_bien: 'appartement', loyer_estime: '', statut: 'disponible' });
            fetchData();
            alert("Bien ajouté avec succès !");
        } catch (err) {
            console.error(err);
            alert("Erreur lors de l'ajout du bien.");
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        navigate('/login');
    };

    const DemandesEntrantesView = () => {
        const [demandes, setDemandes] = useState([]);
        const [loadDemandes, setLoadDemandes] = useState(true);

        useEffect(() => {
            fetchDemandes();
        }, []);

        const fetchDemandes = () => {
            demandesAPI.getAll()
                .then(res => {
                    setDemandes(res.data);
                    setLoadDemandes(false);
                })
                .catch(err => {
                    console.error(err);
                    setLoadDemandes(false);
                });
        };

        const handleDemandeAction = async (id, action) => {
            try {
                if (action === 'accepter') await demandesAPI.accepter(id);
                else await demandesAPI.refuser(id);
                alert(`Demande ${action === 'accepter' ? 'acceptée' : 'refusée'} avec succès.`);
                fetchDemandes();
            } catch (err) {
                alert("Erreur lors du traitement de la demande.");
            }
        };

        return (
            <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-gray-50/50">
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-800">Demandes de Location</h2>
                    <p className="text-gray-500">Gérez les candidats intéressés par vos propriétés.</p>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div className="space-y-6">
                        {loadDemandes ? (
                            <div className="text-center py-10"><div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div></div>
                        ) : demandes.length === 0 ? (
                            <p className="text-gray-400 italic text-center py-12">Aucune demande de location reçue pour le moment.</p>
                        ) : (
                            demandes.map(d => (
                                <div key={d.id} className="p-6 rounded-2xl border border-gray-100 hover:border-blue-100 transition-colors bg-gray-50/10">
                                    <div className="flex flex-col md:flex-row justify-between gap-6">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg">
                                                    {d.nom ? d.nom[0] : 'C'}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-gray-800 text-lg">{d.prenom} {d.nom}</h4>
                                                    <p className="text-sm text-gray-500 italic">{d.telephone || 'Pas de numéro'}</p>
                                                </div>
                                                <span className={`ml-auto md:ml-0 text-[10px] font-black uppercase px-2 py-1 rounded-md ${d.statut === 'acceptee' ? 'bg-green-100 text-green-700' :
                                                    d.statut === 'refusee' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                                                    }`}>
                                                    {d.statut}
                                                </span>
                                            </div>
                                            <div className="bg-white p-4 rounded-xl border border-gray-50 mb-4">
                                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Propriété visée</p>
                                                <p className="text-gray-700 font-semibold">{d.adresse_bien}</p>
                                            </div>
                                            {d.message && (
                                                <div className="bg-blue-50/30 p-4 rounded-xl border border-blue-50">
                                                    <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-1">Message du candidat</p>
                                                    <p className="text-gray-600 text-sm leading-relaxed">"{d.message}"</p>
                                                </div>
                                            )}
                                        </div>
                                        {d.statut === 'attente' && (
                                            <div className="flex flex-col gap-2 justify-center">
                                                <button
                                                    onClick={() => handleDemandeAction(d.id, 'accepter')}
                                                    className="px-6 py-3 bg-green-600 text-white rounded-xl font-bold shadow-lg shadow-green-100 hover:bg-green-700 transition"
                                                >
                                                    Accepter le candidat
                                                </button>
                                                <button
                                                    onClick={() => setSelectedRequest(d)}
                                                    className="px-6 py-3 bg-blue-50 text-blue-600 rounded-xl font-bold hover:bg-blue-100 transition"
                                                >
                                                    Détails
                                                </button>
                                                <button
                                                    onClick={() => handleDemandeAction(d.id, 'refuser')}
                                                    className="px-6 py-3 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition"
                                                >
                                                    Refuser
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const GestionRevenus = () => {
        const [history, setHistory] = useState([]);
        const [loadingHist, setLoadingHist] = useState(true);

        useEffect(() => {
            fetchHistory();
        }, []);

        const fetchHistory = () => {
            paiementsAPI.getAll()
                .then(res => {
                    setHistory(res.data);
                    setLoadingHist(false);
                })
                .catch(err => {
                    console.error(err);
                    setLoadingHist(false);
                });
        };

        const handleAction = async (id, action) => {
            try {
                if (action === 'valider') await paiementsAPI.valider(id);
                else await paiementsAPI.refuser(id);
                alert(`Paiement ${action === 'valider' ? 'accepté' : 'refusé'} avec succès.`);
                fetchHistory();
            } catch (err) {
                alert("Erreur lors de l'action.");
            }
        };

        return (
            <div className="flex-1 overflow-y-auto p-8 bg-gray-50/50">
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-800">Gestion des Revenus</h2>
                    <p className="text-gray-500">Validez les paiements reçus via Bankily, Masrivi ou Sedad.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
                            <span className="w-2 h-6 bg-orange-500 rounded-full mr-3"></span>
                            Paiements en attente de vérification
                        </h3>
                        <div className="space-y-4">
                            {history.filter(p => p.statut === 'attente').length === 0 ? (
                                <p className="text-gray-400 italic text-center py-8">Aucun paiement en attente.</p>
                            ) : (
                                history.filter(p => p.statut === 'attente').map(p => (
                                    <div key={p.id} className="p-5 rounded-2xl bg-orange-50/30 border border-orange-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-bold text-gray-800">{p.montant} MRU</span>
                                                <span className="text-xs px-2 py-1 bg-orange-100 text-orange-600 rounded-full font-bold uppercase">{p.mode_paiement}</span>
                                            </div>
                                            <p className="text-sm text-gray-600 font-medium">Par: {p.nom_locataire || 'Locataire'}</p>
                                            <p className="text-xs text-gray-400">Numéro: {p.numero_expediteur || 'Inconnu'}</p>
                                        </div>
                                        <div className="flex gap-2 w-full md:w-auto">
                                            <button
                                                onClick={() => setSelectedPayment(p)}
                                                className="flex-1 md:flex-none px-4 py-2 bg-blue-100 text-blue-600 rounded-xl font-bold text-sm hover:bg-blue-200 transition"
                                            >
                                                Détails
                                            </button>
                                            <button
                                                onClick={() => handleAction(p.id, 'valider')}
                                                className="flex-1 md:flex-none px-4 py-2 bg-green-600 text-white rounded-xl font-bold text-sm hover:bg-green-700 transition shadow-sm"
                                            >
                                                Accepter
                                            </button>
                                            <button
                                                onClick={() => handleAction(p.id, 'refuser')}
                                                className="flex-1 md:flex-none px-4 py-2 bg-red-100 text-red-600 rounded-xl font-bold text-sm hover:bg-red-200 transition"
                                            >
                                                Refuser
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
                            <span className="w-2 h-6 bg-blue-500 rounded-full mr-3"></span>
                            Historique des transactions
                        </h3>
                        <div className="space-y-3">
                            {history.filter(p => p.statut !== 'attente').length === 0 ? (
                                <p className="text-gray-400 italic text-center py-8">Aucun historique disponible.</p>
                            ) : (
                                history.filter(p => p.statut !== 'attente').slice(0, 10).map(p => (
                                    <div key={p.id} className="p-4 rounded-xl border border-gray-50 flex justify-between items-center bg-gray-50/20">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${p.statut === 'valide' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                                {p.statut === 'valide' ? '✓' : '✕'}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-800">{p.montant} MRU</p>
                                                <p className="text-xs text-gray-500">{p.date_paiement}</p>
                                            </div>
                                        </div>
                                        <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-md ${p.statut === 'valide' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                            {p.statut === 'valide' ? 'Reçu' : 'Refusé'}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const MesBiensView = () => (
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl shadow-xl p-6 text-white transform hover:scale-[1.02] transition-transform">
                    <h3 className="text-sm font-medium opacity-80 mb-1">Revenus Totaux</h3>
                    <p className="text-4xl font-black">{stats.flux_entrants} MRU</p>
                    <div className="mt-4 flex items-center text-xs bg-white/20 w-fit px-2 py-1 rounded-full">
                        <span className="mr-1">Flux entrant validé</span>
                    </div>
                </div>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Paiements en attente</h3>
                    <p className="text-4xl font-black text-orange-500">{stats.attente}</p>
                    <div className="mt-4 flex items-center text-xs bg-orange-100 text-orange-600 w-fit px-2 py-1 rounded-full font-bold">
                        À vérifier
                    </div>
                </div>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Dépenses Totales</h3>
                    <p className="text-4xl font-black text-red-500">{stats.flux_sortants} MRU</p>
                    <p className="text-xs text-gray-400 mt-4">Balance: <span className={stats.balance >= 0 ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>{stats.balance} MRU</span></p>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">Mes Biens Immobiliers</h2>
                        <p className="text-sm text-gray-500">Gérez vos propriétés et leurs statuts en temps réel.</p>
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white rounded-xl shadow-lg font-bold hover:bg-blue-700 transition-all hover:shadow-blue-200 active:scale-95"
                    >
                        + Ajouter une unité
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead>
                            <tr className="text-left border-b border-gray-50">
                                <th className="pb-4 font-bold text-gray-400 text-xs uppercase tracking-wider">Propriété</th>
                                <th className="pb-4 font-bold text-gray-400 text-xs uppercase tracking-wider">Catégorie</th>
                                <th className="pb-4 font-bold text-gray-400 text-xs uppercase tracking-wider">État</th>
                                <th className="pb-4 font-bold text-gray-400 text-xs uppercase tracking-wider text-right">Loyer Mensuel</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr><td colSpan="4" className="text-center py-10"><div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div></td></tr>
                            ) : biens.length === 0 ? (
                                <tr><td colSpan="4" className="text-center py-10 text-gray-400 italic">Aucun bien enregistré pour le moment.</td></tr>
                            ) : (
                                biens.map(bien => (
                                    <tr key={bien.id} className="group hover:bg-gray-50/50 transition-colors">
                                        <td className="py-5">
                                            <div className="flex items-center">
                                                <div className="w-10 h-10 rounded-lg bg-gray-100 mr-4 flex items-center justify-center text-gray-400 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                                                    🏢
                                                </div>
                                                <span className="text-sm font-bold text-gray-800">{bien.adresse}</span>
                                            </div>
                                        </td>
                                        <td className="py-5 text-sm text-gray-500 font-medium">{bien.type_bien}</td>
                                        <td className="py-5">
                                            <span className={`px-3 py-1 text-[10px] font-black uppercase rounded-full ${bien.statut === 'loue' ? 'bg-green-100 text-green-700' :
                                                bien.statut === 'disponible' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                                                }`}>
                                                {bien.statut === 'loue' ? 'Loué' : bien.statut}
                                            </span>
                                        </td>
                                        <td className="py-5 text-right font-black text-gray-800">{bien.loyer_estime} MRU</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    return (
        <div className="flex h-screen bg-gray-50 relative">
            {/* Overlay mobile */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-20 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}

            <aside className={`fixed md:relative w-64 h-full bg-white shadow-lg flex flex-col z-30 transition-transform duration-300 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
                <div className="p-6 border-b flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-blue-600">Espace Propriétaire</h2>
                    <button className="md:hidden text-gray-500" onClick={() => setIsSidebarOpen(false)}>✕</button>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    <Link to="/proprietaire" onClick={() => setIsSidebarOpen(false)} className="block py-2.5 px-4 rounded-lg bg-blue-50 text-blue-700 font-semibold transition-colors">Mes Biens</Link>
                    <Link to="/proprietaire/revenus" onClick={() => setIsSidebarOpen(false)} className="block py-2.5 px-4 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">Revenus et Paiements</Link>
                    <Link to="/proprietaire/charges" onClick={() => setIsSidebarOpen(false)} className="block py-2.5 px-4 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">Charges et Dépenses</Link>
                    <Link to="/proprietaire/demandes" onClick={() => setIsSidebarOpen(false)} className="block py-2.5 px-4 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">Demandes Entrantes</Link>
                </nav>
                <div className="p-4 border-t">
                    <button onClick={handleLogout} className="w-full py-2 px-4 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 transition-colors">
                        Déconnexion
                    </button>
                </div>
            </aside>

            <main className="flex-1 flex flex-col overflow-hidden">
                <header className="bg-white shadow-sm z-10 p-4 flex justify-between items-center">
                    <div className="flex items-center">
                        <button
                            className="mr-4 p-2 rounded-lg bg-gray-100 md:hidden"
                            onClick={() => setIsSidebarOpen(true)}
                        >
                            ☰
                        </button>
                        <h1 className="text-xl font-semibold text-gray-800">Espace Propriétaire</h1>
                    </div>
                    <div className="hidden sm:flex items-center space-x-4">
                        <span className="text-sm font-medium text-gray-600">contact@immobilier.mr</span>
                        <div className="h-10 w-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold shadow-md">P</div>
                    </div>
                </header>

                <Routes>
                    <Route path="/" element={<MesBiensView />} />
                    <Route path="revenus" element={<GestionRevenus />} />
                    <Route path="charges" element={<div className="p-8 font-bold text-gray-400 italic">Module de gestion des charges bientôt disponible...</div>} />
                    <Route path="demandes" element={<DemandesEntrantesView />} />
                </Routes>
            </main>

            {/* Modal Ajouter un bien */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 animate-fade-in-up">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">Ajouter une Nouvelle Propriété</h2>
                        <form onSubmit={handleAddBien} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Adresse Complète</label>
                                <input
                                    type="text"
                                    value={newBien.adresse}
                                    onChange={e => setNewBien({ ...newBien, adresse: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="Ex: Tevragh Zeina, Villa 123"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Superficie (m²)</label>
                                <input
                                    type="number"
                                    value={newBien.superficie}
                                    onChange={e => setNewBien({ ...newBien, superficie: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Loyer Estimé (MRU)</label>
                                <input
                                    type="number"
                                    value={newBien.loyer_estime}
                                    onChange={e => setNewBien({ ...newBien, loyer_estime: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Type de Bien</label>
                                <select
                                    value={newBien.type_bien}
                                    onChange={e => setNewBien({ ...newBien, type_bien: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    <option value="appartement">Appartement</option>
                                    <option value="maison">Maison</option>
                                    <option value="commercial">Local Commercial</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Statut Initial</label>
                                <select
                                    value={newBien.statut}
                                    onChange={e => setNewBien({ ...newBien, statut: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    <option value="disponible">Disponible</option>
                                    <option value="maintenance">Maintenance</option>
                                </select>
                            </div>
                            <div className="md:col-span-2 flex gap-3 mt-6">
                                <button type="submit" className="flex-1 py-4 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition">Confirmer</button>
                                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition">Annuler</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Modal Détails Demande */}
            {selectedRequest && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-8 animate-fade-in-up max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800">Détails de la Demande</h2>
                                <p className="text-gray-500">Reçue le {new Date(selectedRequest.date_demande).toLocaleDateString()}</p>
                            </div>
                            <span className={`px-4 py-1 rounded-full text-xs font-black uppercase ${selectedRequest.statut === 'acceptee' ? 'bg-green-100 text-green-700' :
                                selectedRequest.statut === 'refusee' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                                }`}>
                                {selectedRequest.statut}
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                                <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-4">Informations Candidat</h3>
                                <div className="space-y-3">
                                    <p className="text-sm"><strong>Nom Complet:</strong> {selectedRequest.nom_candidat}</p>
                                    <p className="text-sm"><strong>Nom (Saisi):</strong> {selectedRequest.prenom} {selectedRequest.nom}</p>
                                    <p className="text-sm"><strong>Téléphone:</strong> {selectedRequest.telephone || 'Non fourni'}</p>
                                </div>
                            </div>
                            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                                <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-4">Propriété Visée</h3>
                                <div className="space-y-3">
                                    <p className="text-sm"><strong>Adresse:</strong> {selectedRequest.adresse_bien}</p>
                                    <p className="text-sm"><strong>ID Bien:</strong> #{selectedRequest.bien}</p>
                                </div>
                            </div>
                        </div>

                        <div className="mb-8">
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-2">Message du Candidat</h3>
                            <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 text-gray-700 italic">
                                "{selectedRequest.message || 'Aucun message fourni.'}"
                            </div>
                        </div>

                        {selectedRequest.documents_justificatifs && (
                            <div className="mb-8">
                                <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-2">Documents</h3>
                                <a
                                    href={selectedRequest.documents_justificatifs}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center text-blue-600 hover:underline font-bold"
                                >
                                    📄 Voir le document justificatif
                                </a>
                            </div>
                        )}

                        <div className="flex gap-3">
                            {selectedRequest.statut === 'attente' && (
                                <button
                                    onClick={() => { handleDemandeAction(selectedRequest.id, 'accepter'); setSelectedRequest(null); }}
                                    className="flex-1 py-4 bg-green-600 text-white rounded-xl font-bold shadow-lg shadow-green-200 hover:bg-green-700 transition"
                                >
                                    Accepter le candidat
                                </button>
                            )}
                            <button
                                onClick={() => setSelectedRequest(null)}
                                className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition"
                            >
                                Fermer
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Détails Paiement */}
            {selectedPayment && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8 animate-fade-in-up">
                        <div className="text-center mb-8">
                            <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4 ${selectedPayment.statut === 'valide' ? 'bg-green-100 text-green-600' :
                                selectedPayment.statut === 'refuse' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'
                                }`}>
                                <span className="text-3xl font-bold">{selectedPayment.montant}</span>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800">Détails du Paiement</h2>
                            <p className="text-gray-500">Paiement via {selectedPayment.mode_paiement}</p>
                        </div>

                        <div className="space-y-4 mb-8 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                            <div className="flex justify-between border-b border-gray-100 pb-2">
                                <span className="text-gray-500 text-sm font-medium">Locataire</span>
                                <span className="font-bold text-gray-800">{selectedPayment.nom_locataire}</span>
                            </div>
                            <div className="flex justify-between border-b border-gray-100 pb-2">
                                <span className="text-gray-500 text-sm font-medium">Propriété</span>
                                <span className="font-bold text-gray-800 text-right text-xs truncate max-w-[150px]">{selectedPayment.adresse_bien}</span>
                            </div>
                            <div className="flex justify-between border-b border-gray-100 pb-2">
                                <span className="text-gray-500 text-sm font-medium">Expéditeur</span>
                                <span className="font-bold text-gray-800">{selectedPayment.numero_expediteur}</span>
                            </div>
                            <div className="flex justify-between border-b border-gray-100 pb-2">
                                <span className="text-gray-500 text-sm font-medium">Date</span>
                                <span className="font-bold text-gray-800">{new Date(selectedPayment.date_paiement).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500 text-sm font-medium">Statut Actuel</span>
                                <span className={`font-black uppercase text-xs ${selectedPayment.statut === 'valide' ? 'text-green-600' :
                                    selectedPayment.statut === 'refuse' ? 'text-red-600' : 'text-orange-600'
                                    }`}>
                                    {selectedPayment.statut}
                                </span>
                            </div>
                        </div>

                        {selectedPayment.recu_document && (
                            <div className="mb-8">
                                <a
                                    href={selectedPayment.recu_document}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="w-full flex items-center justify-center p-4 bg-blue-50 text-blue-600 rounded-xl font-bold hover:bg-blue-100 transition border border-dashed border-blue-200"
                                >
                                    📄 Voir le reçu de paiement
                                </a>
                            </div>
                        )}

                        <div className="flex gap-3">
                            {selectedPayment.statut === 'attente' && (
                                <button
                                    onClick={() => { handleAction(selectedPayment.id, 'valider'); setSelectedPayment(null); }}
                                    className="flex-1 py-4 bg-green-600 text-white rounded-xl font-bold shadow-lg shadow-green-200 hover:bg-green-700 transition"
                                >
                                    Valider
                                </button>
                            )}
                            <button
                                onClick={() => setSelectedPayment(null)}
                                className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition"
                            >
                                Fermer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
