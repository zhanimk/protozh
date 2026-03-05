'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { doc, getDoc, updateDoc, collection, getDocs, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { generateDocument } from '@/lib/generatePdf';
import { groupAthletesByDivision } from '@/lib/utils';

import MainTab from '@/components/admin/MainTab';
import AthletesTab from '@/components/admin/AthletesTab';
import GridsTab from '@/components/admin/GridsTab';
import ConfirmModal from '@/components/common/ConfirmModal';
import EditAthleteModal from '@/components/admin/EditAthleteModal';
import TabButton from '@/components/common/TabButton';
import SaveButton from '@/components/common/SaveButton';

export default function TournamentEditPage() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('main');
  const [tournamentData, setTournamentData] = useState(null);
  const [athletes, setAthletes] = useState([]);
  const [groupedAthletes, setGroupedAthletes] = useState({});
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [error, setError] = useState(null);
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [athleteToDelete, setAthleteToDelete] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [athleteToEdit, setAthleteToEdit] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (!id) return;
    let isMounted = true;
    const fetchTournamentAndAthletes = async () => {
      setLoading(true);
      try {
        const docRef = doc(db, 'tournaments', id);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) {
             if(isMounted) setError('Бұл ID-мен турнир табылмады.'); 
             return;
        }
        
        const data = { id: docSnap.id, ...docSnap.data() };
        // Ensure divisions have a client-side ID for UI mapping
        data.divisions = (data.divisions || []).map((div, index) => ({
             ...div,
             weights: Array.isArray(div.weights) ? div.weights : (div.weights || '').split(',').map(w=>w.trim()).filter(Boolean),
             clientId: `div-${index}-${Date.now()}` 
        }));
        if(isMounted) setTournamentData(data);

        const athletesRef = collection(db, 'tournaments', id, 'athletes');
        const athletesSnapshot = await getDocs(athletesRef);
        const athletesList = athletesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        if(isMounted) setAthletes(athletesList);

      } catch (err) {
        console.error("Деректерді жүктеу қатесі:", err);
        if(isMounted) setError('Деректерді жүктеу кезінде қате пайда болды.');
      } finally {
        if(isMounted) {
            setLoading(false);
            setHasUnsavedChanges(false);
        }
      }
    };
    fetchTournamentAndAthletes();
    return () => { isMounted = false };
  }, [id]);

  useEffect(() => {
    if (tournamentData && tournamentData.divisions) {
        setGroupedAthletes(groupAthletesByDivision(athletes, tournamentData.divisions));
    } else {
        setGroupedAthletes({});
    }
}, [athletes, tournamentData]);

  const showFeedback = (type, text) => {
    setFeedbackMessage({ type, text });
    setTimeout(() => setFeedbackMessage({ type: '', text: '' }), 4000);
  };

  const handleTournamentInputChange = (e) => {
    setTournamentData({ ...tournamentData, [e.target.name]: e.target.value });
    setHasUnsavedChanges(true);
  };
  const addDivision = () => {
    const newDivision = { clientId: `div-${Date.now()}`, gender: 'Ерлер', ageGroup: '', duration: 5, weights: [] };
    setTournamentData({ ...tournamentData, divisions: [...tournamentData.divisions, newDivision] });
    setHasUnsavedChanges(true);
  };
  const updateDivision = (clientId, updatedData) => {
    setTournamentData({ 
        ...tournamentData, 
        divisions: tournamentData.divisions.map(d => d.clientId === clientId ? { ...d, ...updatedData } : d) 
    });
    setHasUnsavedChanges(true);
  };
  const removeDivision = (clientId) => {
    setTournamentData({ ...tournamentData, divisions: tournamentData.divisions.filter(d => d.clientId !== clientId) });
    setHasUnsavedChanges(true);
  };
  const handleSaveChanges = async () => {
    setIsProcessing(true);
    try {
      const { id, ...dataToSave } = tournamentData;
      // Clean data for Firestore
      dataToSave.divisions = dataToSave.divisions.map(({ clientId, ...div }) => {
          let weightsArray = div.weights;
          if (typeof weightsArray === 'string') {
              weightsArray = weightsArray.split(',').map(w => w.trim()).filter(Boolean);
          }
          return { ...div, weights: weightsArray };
      });
      
      if (dataToSave.grids) {
        dataToSave.grids = JSON.parse(JSON.stringify(dataToSave.grids));
      }

      await updateDoc(doc(db, 'tournaments', id), dataToSave);
      showFeedback('success', 'Өзгерістер сақталды!');
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error("Турнирді жаңарту қатесі:", error);
      showFeedback('error', "Сақтау кезінде қате пайда болды.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAthleteAdded = (newAthlete) => {
      setAthletes(prev => [...prev, newAthlete]);
  };

  const handleUpdateAthlete = async (athleteId, updatedData) => {
    try {
      const athleteRef = doc(db, 'tournaments', id, 'athletes', athleteId);
      await updateDoc(athleteRef, updatedData);
      setAthletes(athletes.map(a => a.id === athleteId ? { ...a, ...updatedData } : a));
      showFeedback('success', 'Спортшы сәтті жаңартылды!');
    } catch (error) {
      console.error("Спортшыны жаңарту қатесі:", error);
      showFeedback('error', 'Спортшыны жаңарту кезінде қате пайда болды.');
    } finally {
      closeEditModal();
    }
  };

  const handleConfirmDeleteAthlete = async () => {
    if (!athleteToDelete) return;
    try {
      await deleteDoc(doc(db, 'tournaments', id, 'athletes', athleteToDelete.id));
      setAthletes(athletes.filter(athlete => athlete.id !== athleteToDelete.id));
      showFeedback('success', 'Спортшы сәтті жойылды.');
    } catch (error) {
      console.error("Спортшыны жою қатесі:", error);
      showFeedback('error', "Спортшыны жою кезінде қате пайда болды.");
    } finally {
      closeDeleteModal();
    }
  };

    const handleGenerateGrids = () => {
        if (!groupedAthletes) {
            showFeedback('error', 'Спортшылар жүктелмеді.');
            return;
        }

        const newGrids = {};
        for (const divisionKey in groupedAthletes) {
            newGrids[divisionKey] = {};
            for (const weightKey in groupedAthletes[divisionKey]) {
                let athletesInCategory = [...groupedAthletes[divisionKey][weightKey]]; // Make a copy
                const matches = [];
                
                if (athletesInCategory.length % 2 !== 0) {
                    const byeAthlete = athletesInCategory.pop();
                    matches.push({
                        round: 1,
                        white: byeAthlete,
                        red: { id: 'BYE', name: '— BYE —' },
                        winner: byeAthlete, // Automatically wins
                    });
                }

                for (let i = 0; i < athletesInCategory.length; i += 2) {
                    matches.push({
                        round: 1,
                        white: athletesInCategory[i],
                        red: athletesInCategory[i+1],
                        winner: null,
                    });
                }
                newGrids[divisionKey][weightKey] = { status: 'pending', champion: null, matches };
            }
        }

        setTournamentData(prev => ({ ...prev, grids: newGrids }));
        setHasUnsavedChanges(true);
        showFeedback('success', 'Сеткалар генерацияланды! Сақтауды ұмытпаңыз.');
    };

    const handleSetWinner = (divisionKey, weightKey, matchIndex, winnerSide) => {
        setTournamentData(prev => {
            const newTournamentData = JSON.parse(JSON.stringify(prev));
            const match = newTournamentData.grids[divisionKey][weightKey].matches[matchIndex];
            const winnerAthlete = match[winnerSide];

            if (match.winner && match.winner.id === winnerAthlete.id) {
                match.winner = null; // Unset winner
            } else {
                match.winner = winnerAthlete; // Set winner
            }

            setHasUnsavedChanges(true);
            return newTournamentData;
        });
    };

    const handleAdvanceWinners = () => {
        setTournamentData(prev => {
            const newTournamentData = JSON.parse(JSON.stringify(prev));
            let anyGridAdvanced = false;

            for (const divisionKey in newTournamentData.grids) {
                for (const weightKey in newTournamentData.grids[divisionKey]) {
                    const grid = newTournamentData.grids[divisionKey][weightKey];
                    if (grid.status === 'finished' || !grid.matches || grid.matches.length === 0) continue;

                    const maxRound = Math.max(...grid.matches.map(m => m.round));
                    const lastRoundMatches = grid.matches.filter(m => m.round === maxRound);
                    
                    if (lastRoundMatches.length > 0 && lastRoundMatches.every(m => m.winner)) {
                        const winners = lastRoundMatches.map(m => m.winner);
                        if (winners.length === 1) {
                            grid.status = 'finished';
                            grid.champion = winners[0];
                            anyGridAdvanced = true;
                        } else if (winners.length > 1) {
                            const nextRoundMatches = [];
                            let currentWinners = [...winners];

                            if (currentWinners.length % 2 !== 0) {
                                const byeWinner = currentWinners.pop();
                                nextRoundMatches.push({
                                    round: maxRound + 1,
                                    white: byeWinner,
                                    red: { id: 'BYE', name: '— BYE —' },
                                    winner: byeWinner,
                                });
                            }

                            for (let i = 0; i < currentWinners.length; i += 2) {
                                nextRoundMatches.push({
                                    round: maxRound + 1,
                                    white: currentWinners[i],
                                    red: currentWinners[i+1],
                                    winner: null,
                                });
                            }
                            grid.matches.push(...nextRoundMatches);
                            anyGridAdvanced = true;
                        }
                    }
                }
            }

            if (anyGridAdvanced) {
                showFeedback('success', 'Келесі раунд генерацияланды! Сақтауды ұмытпаңыз.');
                setHasUnsavedChanges(true);
            } else {
                showFeedback('info', 'Келесі раундты генерациялау үшін алдымен барлық ағымдағы матчтардың жеңімпаздарын көрсетіңіз.');
            }
            return newTournamentData;
        });
    };

  const openDeleteModal = (athlete) => { setAthleteToDelete(athlete); setIsDeleteModalOpen(true); };
  const closeDeleteModal = () => { setAthleteToDelete(null); setIsDeleteModalOpen(false); };
  const openEditModal = (athlete) => { setAthleteToEdit(athlete); setIsEditModalOpen(true); };
  const closeEditModal = () => { setAthleteToEdit(null); setIsEditModalOpen(false); };
  
  const handleGeneratePdf = () => {
    if (hasUnsavedChanges) {
        alert('PDF құру алдында өзгерістерді сақтаңыз.');
        return;
    }
    generateDocument(tournamentData, athletes);
  };

  if (loading) return <div className="p-6 text-center">Деректер жүктелуде...</div>;
  if (error) return <div className="p-6 text-center text-red-500">{error}</div>;
  if (!tournamentData) return null;

  return (
    <>
      <div className="p-6">
          <div className="flex justify-between items-start mb-6">
              <div>
                  <h1 className="text-2xl font-bold text-gold">{tournamentData.name}</h1>
                  <p className="text-gray-400">Турнирді басқару</p>
              </div>
              <div className="flex items-center gap-4">
                  {feedbackMessage.text && (
                      <div className={`px-4 py-2 rounded-lg text-white ${feedbackMessage.type === 'success' ? 'bg-green-600' : 'bg-red-500'} transition-opacity`}>
                          {feedbackMessage.text}
                      </div>
                  )}
                  <button type="button" onClick={handleGeneratePdf} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-500 flex items-center gap-2"><span className="text-lg">📄</span> PDF</button>
                  <SaveButton hasUnsavedChanges={hasUnsavedChanges} isProcessing={isProcessing} handleSaveChanges={handleSaveChanges} />
              </div>
          </div>

        <div className="mb-6 border-b border-navy-600">
            <div className="flex items-center gap-2">
                <TabButton active={activeTab === 'main'} onClick={() => setActiveTab('main')}>Негізгі</TabButton>
                <TabButton active={activeTab === 'athletes'} onClick={() => setActiveTab('athletes')}>Спортшылар</TabButton>
                <TabButton active={activeTab === 'grids'} onClick={() => setActiveTab('grids')}>Сеткалар</TabButton>
                <TabButton active={activeTab === 'live'} onClick={() => setActiveTab('live')}>Табло</TabButton>
            </div>
        </div>

        <div className="space-y-8">
            {activeTab === 'main' && 
                <MainTab 
                    tournamentData={tournamentData}
                    handleTournamentInputChange={handleTournamentInputChange}
                    addDivision={addDivision}
                    updateDivision={updateDivision}
                    removeDivision={removeDivision}
                />
            }
            {activeTab === 'athletes' && 
                <AthletesTab 
                    tournamentId={id}
                    divisions={tournamentData.divisions}
                    athletes={athletes}
                    groupedAthletes={groupedAthletes}
                    onAthleteAdded={handleAthleteAdded}
                    showFeedback={showFeedback}
                    openEditModal={openEditModal}
                    openDeleteModal={openDeleteModal}
                />
            }
            {activeTab === 'grids' && 
                <GridsTab 
                    tournamentData={tournamentData}
                    handleGenerateGrids={handleGenerateGrids}
                    handleAdvanceWinners={handleAdvanceWinners}
                    handleSetWinner={handleSetWinner}
                />
            }
            {activeTab === 'live' && (
                 <div className="text-center py-16 bg-navy-800 rounded-lg border border-navy-600">
                    <h3 className="text-2xl font-bold text-gold">Бұл мүмкіндік әзірленуде</h3>
                    <p className="text-gray-400 mt-2">Жақында бұл жерде таблоны басқаруға болады.</p>
                </div>
            )}
        </div>
      </div>

      <ConfirmModal isOpen={isDeleteModalOpen} onClose={closeDeleteModal} onConfirm={handleConfirmDeleteAthlete} title="Спортшыны жоюды растау">
        {athleteToDelete && <p>Сенімдісіз бе? <span className="font-bold text-gold">{`"${athleteToDelete.name}"`}</span> спортшысын жойғыңыз келе ме?</p>}
      </ConfirmModal>

      <EditAthleteModal isOpen={isEditModalOpen} onClose={closeEditModal} onSave={handleUpdateAthlete} athlete={athleteToEdit} />
    </>
  );
}
