import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../apis';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        try {
            // Appel API pour l'authentification avec les vrais credentials
            const res = await api.post('token/', { username, password });
            const accessToken = res.data.access;
            localStorage.setItem('access_token', accessToken);

            // On peut décoder le JWT ou récupérer le profil pour le rôle. Ici on fait une requête 'me' ou on le base sur le nom (simplifié pour le système actuel)
            // Pour l'exemple et la rapidité, on garde la logique de redirection par role implicite depuis le backend, mais on ajoute un endpoint 'profile' plus tard si besoin. 
            // En attendant on se fie au username
            if (username === 'admin') navigate('/admin');
            else if (username.includes('prop')) navigate('/proprietaire');
            else navigate('/locataire');

        } catch (err) {
            setError('Identifiants incorrects ou problème de connexion au serveur.');
        }
    };

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 transform transition-all hover:scale-[1.01]">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">ImmoGestion</h1>
                    <p className="text-sm text-gray-500">Gérez vos biens immobiliers en toute simplicité</p>
                </div>

                {error && (
                    <div className="mb-4 bg-red-50 text-red-600 text-sm p-3 rounded-lg text-center font-medium">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="username">
                            Nom d'utilisateur
                        </label>
                        <input
                            id="username"
                            type="text"
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
                            placeholder="ex: admin"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">
                            Mot de passe
                        </label>
                        <input
                            id="password"
                            type="password"
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <input id="remember" type="checkbox" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                            <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">Se souvenir de moi</label>
                        </div>
                        <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-500">Mot de passe oublié ?</a>
                    </div>

                    <button
                        type="submit"
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                        Se Connecter
                    </button>

                    <div className="text-center mt-6">
                        <span className="text-gray-500 text-sm">Pas encore de compte ? </span>
                        <a href="/register" className="text-blue-600 font-semibold hover:underline text-sm">S'inscrire</a>
                    </div>
                </form>
            </div>
        </div>
    );
}
