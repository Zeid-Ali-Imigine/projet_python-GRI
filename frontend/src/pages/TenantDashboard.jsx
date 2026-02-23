import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { paiementsAPI, bauxAPI, biensAPI, demandesAPI } from '../apis';

export default function TenantDashboard() {
    const navigate = useNavigate();
    const [paiements, setPaiements] = useState([]);
    const [biens, setBiens] = useState([]);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showDemandeModal, setShowDemandeModal] = useState(false);
    const [selectedBien, setSelectedBien] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [paymentForm, setPaymentForm] = useState({
        montant: '15000',
        mode_paiement: 'bankily',
        numero_expediteur: ''
    });
    const [demandeForm, setDemandeForm] = useState({
        nom: '',
        prenom: '',
        telephone: '',
        message: ''
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchPaiements();
        fetchBiens();
    }, []);

    const fetchPaiements = () => {
        paiementsAPI.getAll()
            .then(res => setPaiements(res.data))
            .catch(err => console.error(err));
    };

    const fetchBiens = () => {
        biensAPI.getAll()
            .then(res => setBiens(res.data.filter(b => b.statut === 'disponible')))
            .catch(err => console.error(err));
    };

    const handleDemandeSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await demandesAPI.create({
                ...demandeForm,
                bien: selectedBien.id
                // Le candidat (User) sera associé côté backend via perform_create ou restera nul
            });
            alert("Demande envoyée avec succès ! Le propriétaire vous contactera bientôt.");
            setShowDemandeModal(false);
            setDemandeForm({ nom: '', prenom: '', telephone: '', message: '' });
        } catch (err) {
            alert("Erreur lors de l'envoi de la demande.");
        } finally {
            setLoading(false);
        }
    };

    const handlePaymentSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Dans un vrai flux, on récupérerait le bail_id dynamiquement. 
            // Ici on simplifie pour la démo avec le premier bail trouvé ou un id fixe.
            const baux = await bauxAPI.getAll();
            if (baux.data.length > 0) {
                await paiementsAPI.create({
                    ...paymentForm,
                    bail: baux.data[0].id
                });
                alert("Paiement soumis avec succès ! En attente de validation par le propriétaire.");
                setShowPaymentModal(false);
                fetchPaiements();
            } else {
                alert("Aucun contrat de bail trouvé pour effectuer un paiement.");
            }
        } catch (err) {
            alert("Erreur lors de la soumission du paiement.");
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        navigate('/login');
    };

    const MonLogement = () => (
        <div className="flex-1 overflow-y-auto p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex overflow-hidden">
                    <div className="w-1/3 bg-gray-200">
                        <div className="h-full w-full bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=400')" }}></div>
                    </div>
                    <div className="w-2/3 p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-1">Mon Appartement Actuel</h3>
                        <p className="text-sm text-gray-500 mb-4">Villa 45, Tevragh Zeina, Nouakchott</p>
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-600">Loyer mensuel :</span>
                            <span className="text-lg font-bold text-gray-900">15 000 MRU</span>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                            <span className="text-sm font-medium text-gray-600">Prochaine échéance :</span>
                            <span className="text-sm font-bold text-orange-500">05 Mars 2026</span>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl shadow-md p-6 text-white flex flex-col justify-center">
                    <h3 className="text-lg font-medium opacity-90 mb-4">Payer le loyer du mois</h3>
                    <button
                        onClick={() => setShowPaymentModal(true)}
                        className="bg-white text-teal-600 font-bold py-3 px-6 rounded-lg shadow-sm hover:bg-gray-50 transition w-full text-center"
                    >
                        Effectuer le paiement (15 000 MRU)
                    </button>
                </div>
            </div>

            {showPaymentModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative animate-fade-in-up">
                        <button onClick={() => setShowPaymentModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Formulaire de Paiement</h2>
                        <form onSubmit={handlePaymentSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Montant (MRU)</label>
                                <input
                                    type="number"
                                    value={paymentForm.montant}
                                    onChange={(e) => setPaymentForm({ ...paymentForm, montant: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-teal-500 focus:outline-none transition-all"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Mode de Paiement</label>
                                <select
                                    value={paymentForm.mode_paiement}
                                    onChange={(e) => setPaymentForm({ ...paymentForm, mode_paiement: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-teal-500 focus:outline-none transition-all"
                                >
                                    <option value="bankily">Bankily (BCM)</option>
                                    <option value="masrivi">Masrivi (BAMIS)</option>
                                    <option value="sedad">Sedad (BMCI)</option>
                                    <option value="espece">Espèce</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Numéro de téléphone (Expéditeur)</label>
                                <input
                                    type="text"
                                    placeholder="Ex: 44 11 22 33"
                                    value={paymentForm.numero_expediteur}
                                    onChange={(e) => setPaymentForm({ ...paymentForm, numero_expediteur: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-teal-500 focus:outline-none transition-all"
                                    required
                                />
                            </div>
                            <p className="text-xs text-gray-400 text-center italic mt-4">
                                Veuillez effectuer le transfert sur le compte du propriétaire avant de soumettre ce formulaire.
                            </p>
                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full py-4 rounded-xl font-bold text-white transition-all shadow-lg ${loading ? 'bg-gray-400' : 'bg-teal-600 hover:bg-teal-700 active:scale-95'}`}
                            >
                                {loading ? 'Traitement...' : 'Confirmer le Paiement'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-bold text-gray-800 mb-4">Historique des derniers paiements</h2>
                <div className="space-y-4">
                    {paiements.length === 0 ? (
                        <p className="text-gray-500 italic">Aucun paiement enregistré.</p>
                    ) : (
                        paiements.slice(0, 5).map((p, i) => (
                            <div key={i} className="flex justify-between items-center p-4 rounded-xl bg-gray-50 border border-gray-100 hover:border-teal-200 transition-colors">
                                <div className="flex items-center space-x-4">
                                    <div className={`p-2 rounded-full ${p.statut === 'valide' ? 'bg-green-100 text-green-600' :
                                        p.statut === 'refuse' ? 'bg-red-100 text-red-600' :
                                            'bg-orange-100 text-orange-600'
                                        }`}>
                                        {p.statut === 'valide' ? (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                        ) : p.statut === 'refuse' ? (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                        ) : (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-800 capitalize">{p.mode_paiement} {p.numero_expediteur ? `(${p.numero_expediteur})` : ''}</p>
                                        <p className="text-sm text-gray-500">{p.date_paiement}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-gray-900">{p.montant} MRU</p>
                                    <p className={`text-xs font-bold uppercase ${p.statut === 'valide' ? 'text-green-600' :
                                        p.statut === 'refuse' ? 'text-red-600' :
                                            'text-orange-600'
                                        }`}>
                                        {p.statut === 'valide' ? 'Validé' : p.statut === 'refuse' ? 'Refusé' : 'En Attente'}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );

    const ParcourirBiens = () => (
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800">Trouver un nouveau logement</h2>
                <p className="text-gray-500">Explorez les propriétés disponibles et envoyez votre candidature.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {biens.length === 0 ? (
                    <p className="col-span-full text-center py-12 text-gray-400 italic">Aucune propriété disponible pour le moment.</p>
                ) : (
                    biens.map(bien => (
                        <div key={bien.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group">
                            <div className="h-48 bg-gray-200 relative overflow-hidden">
                                <div className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&q=80&w=400')" }}></div>
                                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-black text-teal-600 uppercase">
                                    {bien.type_bien}
                                </div>
                            </div>
                            <div className="p-6">
                                <h3 className="font-bold text-gray-800 text-lg mb-1 truncate">{bien.adresse}</h3>
                                <p className="text-teal-600 font-black text-xl mb-4">{bien.loyer_estime} MRU <span className="text-xs text-gray-400 font-normal">/ mois</span></p>
                                <div className="flex items-center text-sm text-gray-500 mb-6 font-medium">
                                    <span className="mr-3">📏 {bien.superficie} m²</span>
                                    <span>👤 Propriétaire: {bien.nom_proprietaire}</span>
                                </div>
                                <button
                                    onClick={() => { setSelectedBien(bien); setShowDemandeModal(true); }}
                                    className="w-full py-3 bg-teal-600 text-white rounded-xl font-bold shadow-lg shadow-teal-100 hover:bg-teal-700 transition active:scale-95"
                                >
                                    Faire une demande
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );

    return (
        <div className="flex h-screen bg-gray-50 relative">
            {/* Overlay mobile */}
            {isSidebarOpen && (
                <div className="fixed inset-0 bg-black/50 z-20 md:hidden" onClick={() => setIsSidebarOpen(false)}></div>
            )}

            <aside className={`fixed md:relative w-64 h-full bg-white shadow-lg flex flex-col z-30 transition-transform duration-300 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
                <div className="p-6 border-b flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-teal-600">Espace Locataire</h2>
                    <button className="md:hidden text-gray-500" onClick={() => setIsSidebarOpen(false)}>✕</button>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    <Link to="/locataire" onClick={() => setIsSidebarOpen(false)} className="block py-2.5 px-4 rounded-lg bg-teal-50 text-teal-700 font-semibold transition-colors">Mon Logement</Link>
                    <Link to="/locataire/explorer" onClick={() => setIsSidebarOpen(false)} className="block py-2.5 px-4 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">Explorer</Link>
                    <Link to="/locataire/paiements" onClick={() => setIsSidebarOpen(false)} className="block py-2.5 px-4 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">Mes Paiements</Link>
                    <Link to="/locataire/contrats" onClick={() => setIsSidebarOpen(false)} className="block py-2.5 px-4 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">Mes Documents</Link>
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
                        <button className="mr-4 p-2 rounded-lg bg-gray-100 md:hidden" onClick={() => setIsSidebarOpen(true)}>☰</button>
                        <h1 className="text-xl font-semibold text-gray-800">Tableau de Bord Locataire</h1>
                    </div>
                    <div className="hidden sm:flex items-center space-x-4">
                        <span className="text-sm font-medium text-gray-600">habitant@nouakchott.mr</span>
                        <div className="h-10 w-10 rounded-full bg-teal-500 text-white flex items-center justify-center font-bold shadow-md">L</div>
                    </div>
                </header>

                <Routes>
                    <Route path="/" element={<MonLogement />} />
                    <Route path="explorer" element={<ParcourirBiens />} />
                    <Route path="paiements" element={<div className="p-8 font-bold">Liste des Paiements (Bientôt)</div>} />
                    <Route path="contrats" element={<div className="p-8 font-bold">Mes Documents et Contrats (Bientôt)</div>} />
                </Routes>
            </main>

            {/* Modal Demande de Location */}
            {showDemandeModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 animate-fade-in-up">
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Demander de Louer</h2>
                        <p className="text-sm text-gray-500 mb-6 font-medium">Propriété: {selectedBien?.adresse}</p>
                        <form onSubmit={handleDemandeSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Prénom</label>
                                <input type="text" value={demandeForm.prenom} onChange={e => setDemandeForm({ ...demandeForm, prenom: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-teal-500 outline-none" required />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Nom</label>
                                <input type="text" value={demandeForm.nom} onChange={e => setDemandeForm({ ...demandeForm, nom: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-teal-500 outline-none" required />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Numéro de téléphone</label>
                                <input type="text" value={demandeForm.telephone} onChange={e => setDemandeForm({ ...demandeForm, telephone: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-teal-500 outline-none" placeholder="Ex: 44 11 22 33" required />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Message optionnel</label>
                                <textarea rows="3" value={demandeForm.message} onChange={e => setDemandeForm({ ...demandeForm, message: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-teal-500 outline-none" placeholder="Dites quelques mots sur vous..."></textarea>
                            </div>
                            <div className="md:col-span-2 flex gap-3 mt-6">
                                <button type="submit" className="flex-1 py-4 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition">Envoyer la demande</button>
                                <button type="button" onClick={() => setShowDemandeModal(false)} className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition">Annuler</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
