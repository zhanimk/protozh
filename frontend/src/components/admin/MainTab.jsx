'use client';

import FormSection from './FormSection';
import DivisionEditCard from './DivisionEditCard';

const MainTab = ({ tournamentData, handleTournamentInputChange, addDivision, updateDivision, removeDivision }) => {
    if (!tournamentData) return null;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column: Tournament Info & Regulations */}
            <div className="space-y-8">
                <FormSection title="Турнир туралы ақпарат">
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="name" className="text-sm text-gray-400">Турнир атауы</label>
                            <input id="name" name="name" type="text" value={tournamentData.name || ''} onChange={handleTournamentInputChange} className="w-full mt-1 bg-navy-900 p-2 rounded-md border border-navy-500 focus:border-gold focus:outline-none"/>
                        </div>
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="date" className="text-sm text-gray-400">Өткізілетін күні</label>
                                <input id="date" name="date" type="date" value={tournamentData.date || ''} onChange={handleTournamentInputChange} className="w-full mt-1 bg-navy-900 p-2 rounded-md border border-navy-500 focus:border-gold focus:outline-none"/>
                            </div>
                            <div>
                                <label htmlFor="location" className="text-sm text-gray-400">Өткізілетін орны</label>
                                <input id="location" name="location" type="text" value={tournamentData.location || ''} onChange={handleTournamentInputChange} className="w-full mt-1 bg-navy-900 p-2 rounded-md border border-navy-500 focus:border-gold focus:outline-none"/>
                            </div>
                        </div>
                    </div>
                </FormSection>

                <FormSection title="Положение (ережелер)">
                     <div>
                        <label htmlFor="regulations" className="text-sm text-gray-400">Жарыс ережелері мен шарттары</label>
                        <textarea id="regulations" name="regulations" value={tournamentData.regulations || ''} onChange={handleTournamentInputChange} rows="12" className="w-full mt-1 bg-navy-900 p-2 rounded-md border border-navy-500 focus:border-gold focus:outline-none" placeholder="Турнирдің толық ережелерін осында енгізіңіз..."></textarea>
                    </div>
                </FormSection>
            </div>

            {/* Right Column: Divisions */}
            <FormSection title="Дивизиондар">
                <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-2">
                    {(tournamentData.divisions || []).map((division) => (
                        <DivisionEditCard
                            key={division.clientId}
                            division={division}
                            onUpdate={(updatedField) => updateDivision(division.clientId, updatedField)}
                            onRemove={() => removeDivision(division.clientId)}
                        />
                    ))}
                </div>
                <button type="button" onClick={addDivision} className="w-full mt-4 px-4 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-500">+ Жаңа дивизион қосу</button>
            </FormSection>
        </div>
    );
};

export default MainTab;
