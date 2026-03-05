'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const initialDivision = {
  clientId: Date.now(),
  gender: 'Ерлер',
  ageGroup: '',
  duration: 5,
  weights: ''
};

export default function CreateTournamentForm() {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [regulations, setRegulations] = useState('');
  const [divisions, setDivisions] = useState([initialDivision]);

  const handleDivisionChange = (clientId, field, value) => {
    setDivisions(divisions.map(div => 
      div.clientId === clientId ? { ...div, [field]: value } : div
    ));
  };

  const addDivision = () => {
    setDivisions([...divisions, { ...initialDivision, clientId: Date.now() }]);
  };

  const removeDivision = (clientId) => {
    setDivisions(divisions.filter(div => div.clientId !== clientId));
  };

  const handleCreateTournament = async (e) => {
    e.preventDefault();
    if (divisions.length === 0) {
        alert('Кем дегенде бір дивизион қосыңыз.');
        return;
    }
    setIsProcessing(true);
    try {
      const processedDivisions = divisions.map(({ clientId, ...div }) => ({
        ...div,
        weights: div.weights.split(',').map(w => w.trim()).filter(w => w)
      }));

      const docRef = await addDoc(collection(db, 'tournaments'), {
        name,
        date,
        location,
        regulations,
        divisions: processedDivisions,
        createdAt: new Date().toISOString(),
      });
      router.push(`/admin/tournaments/${docRef.id}`);
    } catch (error) {
      console.error('Турнирді құру қатесі: ', error);
      alert('Турнирді құру кезінде қате пайда болды.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleCreateTournament} className="p-6 space-y-8 bg-navy-800 rounded-lg border border-navy-600">
      
      {/* --- Негізгі ақпарат --- */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gold">1. Негізгі ақпарат</h2>
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-300">Турнир атауы</label>
          <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full bg-navy-700 border border-navy-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-gold focus:border-gold" required placeholder="Мысалы, Almaty Grappling Championship" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-300">Күні</label>
                <input type="date" id="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-1 block w-full bg-navy-700 border border-navy-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-gold focus:border-gold" required />
            </div>
            <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-300">Өткізілетін орны</label>
                <input type="text" id="location" value={location} onChange={(e) => setLocation(e.target.value)} className="mt-1 block w-full bg-navy-700 border border-navy-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-gold focus:border-gold" required placeholder="Мысалы, Алматы қ., Baluan Sholaq Arena" />
            </div>
        </div>
      </div>

      {/* --- Положение --- */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gold">2. Положение (ережелер)</h2>
        <div>
          <label htmlFor="regulations" className="block text-sm font-medium text-gray-300">Жарыс ережелері мен шарттары</label>
          <textarea id="regulations" value={regulations} onChange={(e) => setRegulations(e.target.value)} rows="8" className="mt-1 block w-full bg-navy-700 border border-navy-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-gold focus:border-gold" placeholder="Турнирдің толық ережелерін осында енгізіңіз..."></textarea>
        </div>
      </div>

      {/* --- Дивизиондар --- */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-gold">3. Дивизиондар және салмақ дәрежелері</h2>
        {divisions.map((division, index) => (
          <div key={division.clientId} className="bg-navy-900/50 p-4 rounded-lg border border-navy-600 space-y-4 relative">
            <h3 className="font-semibold text-lg text-gray-200">Дивизион #{index + 1}</h3>
             {divisions.length > 1 && (
              <button type="button" onClick={() => removeDivision(division.clientId)} className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition-colors">&times;</button>
            )}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300">Жынысы</label>
                <select value={division.gender} onChange={(e) => handleDivisionChange(division.clientId, 'gender', e.target.value)} className="mt-1 block w-full bg-navy-700 border border-navy-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-gold focus:border-gold">
                  <option>Ерлер</option>
                  <option>Әйелдер</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">Жас тобы</label>
                <input type="text" value={division.ageGroup} onChange={(e) => handleDivisionChange(division.clientId, 'ageGroup', e.target.value)} placeholder="Мысалы, 2005-2007 ж.т." className="mt-1 block w-full bg-navy-700 border border-navy-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-gold focus:border-gold" required />
              </div>
               <div>
                <label className="block text-sm font-medium text-gray-300">Белдесу уақыты (мин)</label>
                <input type="number" value={division.duration} onChange={(e) => handleDivisionChange(division.clientId, 'duration', e.target.value)} placeholder="Мысалы, 5" className="mt-1 block w-full bg-navy-700 border border-navy-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-gold focus:border-gold" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">Салмақ дәрежелері (үтір арқылы)</label>
              <input type="text" value={division.weights} onChange={(e) => handleDivisionChange(division.clientId, 'weights', e.target.value)} placeholder="60, 65, 70, 75, 80, 85, 90, +90" className="mt-1 block w-full bg-navy-700 border border-navy-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-gold focus:border-gold" required />
              <p className="text-xs text-gray-400 mt-1">Салмақтарды үтірмен бөліп жазыңыз. Мысалы: 70, 77, 84, 92, +92</p>
            </div>
          </div>
        ))}
        <button type="button" onClick={addDivision} className="px-4 py-2 border border-dashed border-gray-500 text-gray-300 rounded-lg hover:bg-navy-700 hover:text-white transition-colors">
          + Дивизион қосу
        </button>
      </div>

      {/* --- Құру батырмасы --- */}
      <div className="flex justify-end pt-6 border-t border-navy-600">
        <button type="submit" disabled={isProcessing} className="px-8 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-500 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed">
          {isProcessing ? 'Құрылуда...' : 'Турнирді құру'}
        </button>
      </div>
    </form>
  );
}
