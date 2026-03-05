'use client';

import { useState, useEffect } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function AthleteRegistrationForm({ tournamentId, divisions, onAthleteAdded, showFeedback }) {
    const [name, setName] = useState('');
    const [yob, setYob] = useState('');
    const [club, setClub] = useState('');
    const [selectedDivisionClientId, setSelectedDivisionClientId] = useState('');
    const [selectedWeight, setSelectedWeight] = useState('');
    
    const [availableWeights, setAvailableWeights] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // When divisions data is loaded, set the first division as selected by default
    useEffect(() => {
        if (divisions && divisions.length > 0 && !selectedDivisionClientId) {
            setSelectedDivisionClientId(divisions[0].clientId);
        }
    }, [divisions, selectedDivisionClientId]);

    // When the selected division changes, update the available weights
    useEffect(() => {
        const selectedDiv = divisions.find(d => d.clientId === selectedDivisionClientId);
        if (selectedDiv) {
            const weights = Array.isArray(selectedDiv.weights) ? selectedDiv.weights : [];
            setAvailableWeights(weights);
            // If the current selected weight is not in the new list, reset it
            if (!weights.includes(selectedWeight)) {
                setSelectedWeight(weights[0] || '');
            }
        } else {
            setAvailableWeights([]);
            setSelectedWeight('');
        }
    }, [selectedDivisionClientId, divisions, selectedWeight]);

    const handleAddAthlete = async (e) => {
        e.preventDefault();
        if (!name || !yob || !selectedDivisionClientId || !selectedWeight) {
            showFeedback('error', "Барлық маңызды өрістерді толтырыңыз.");
            return;
        }
        setIsSubmitting(true);

        const division = divisions.find(d => d.clientId === selectedDivisionClientId);
        const athleteToSave = { 
            name, 
            yob, 
            club, 
            gender: division.gender, 
            ageGroup: division.ageGroup, 
            weight: selectedWeight 
        };

        try {
            const docRef = await addDoc(collection(db, 'tournaments', tournamentId, 'athletes'), athleteToSave);
            onAthleteAdded({ id: docRef.id, ...athleteToSave });
            showFeedback('success', `Спортшы ${name} сәтті тіркелді!`);
            // Reset form fields for next entry
            setName('');
            setYob('');
            setClub('');
            // Keep division and weight for faster entry
        } catch (error) {
            console.error("Спортшыны қосу қатесі:", error);
            showFeedback('error', "Спортшыны қосу кезінде қате пайда болды.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-navy-800 rounded-xl p-6 border border-navy-600 h-full">
            <h3 className="font-semibold text-gold mb-4">Жаңа спортшыны тіркеу</h3>
            <form onSubmit={handleAddAthlete} className="space-y-4">
                {/* Division & Weight selection */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm text-gray-400">Дивизион</label>
                        <select 
                            value={selectedDivisionClientId} 
                            onChange={(e) => setSelectedDivisionClientId(e.target.value)} 
                            className="w-full mt-1 bg-navy-900 p-2 rounded-md border border-navy-500 focus:border-gold focus:outline-none"
                            disabled={divisions.length === 0}
                        >
                           {divisions.length === 0 && <option>Алдымен дивизион қосыңыз</option>}
                           {divisions.map(div => <option key={div.clientId} value={div.clientId}>{`${div.gender} / ${div.ageGroup}`}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-sm text-gray-400">Салмақ</label>
                        <select 
                            value={selectedWeight} 
                            onChange={(e) => setSelectedWeight(e.target.value)} 
                            disabled={availableWeights.length === 0} 
                            className="w-full mt-1 bg-navy-900 p-2 rounded-md border border-navy-500 focus:border-gold focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {availableWeights.length === 0 && <option>Салмақ жоқ</option>}
                            {availableWeights.map(w => <option key={w} value={w}>{w}</option>)}
                        </select>
                    </div>
                </div>
                
                {/* Athlete details */}
                <div>
                    <label className="text-sm text-gray-400">Аты-жөні</label>
                    <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Мысалы: Ибрагимов Әли" className="w-full mt-1 bg-navy-900 p-2 rounded-md border border-navy-500 focus:border-gold focus:outline-none" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm text-gray-400">Туған жылы</label>
                        <input type="number" value={yob} onChange={(e) => setYob(e.target.value)} placeholder="2010" className="w-full mt-1 bg-navy-900 p-2 rounded-md border-navy-500 focus:border-gold focus:outline-none" required />
                    </div>
                    <div>
                        <label className="text-sm text-gray-400">Клуб</label>
                        <input value={club} onChange={(e) => setClub(e.target.value)} placeholder="Qazaqstan" className="w-full mt-1 bg-navy-900 p-2 rounded-md border border-navy-500 focus:border-gold focus:outline-none"/>
                    </div>
                </div>

                <button type="submit" disabled={divisions.length === 0 || isSubmitting} className="w-full px-4 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-500 disabled:bg-gray-500 disabled:cursor-not-allowed">
                    {isSubmitting ? 'Тіркелуде...' : '+ Спортшыны тіркеу'}
                </button>
            </form>
        </div>
    );
}
