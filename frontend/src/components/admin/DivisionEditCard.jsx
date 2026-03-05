'use client';

const DivisionEditCard = ({ division, onUpdate, onRemove }) => {

  // Wrapper function to handle input changes
  const handleInputChange = (field, value) => {
    // For weights, we join the array back into a string
    const updatedValue = Array.isArray(division[field]) ? value.join(',') : value;
    onUpdate({ ...division, [field]: updatedValue });
  };

  // Convert weights array to a comma-separated string for the input field
  const weightsString = Array.isArray(division.weights) ? division.weights.join(', ') : division.weights;

  return (
    <div className="bg-navy-700/50 p-4 rounded-lg border border-navy-600 space-y-3">
        <div className="flex justify-between items-start">
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Gender Dropdown */}
                <div>
                    <label className="text-xs text-gray-400">Жынысы</label>
                    <select 
                        value={division.gender} 
                        onChange={(e) => handleInputChange('gender', e.target.value)} 
                        className="w-full mt-1 bg-navy-900 p-2 rounded-md border border-navy-500 focus:border-gold focus:outline-none"
                    >
                        <option value="Ерлер">Ерлер</option>
                        <option value="Әйелдер">Әйелдер</option>
                    </select>
                </div>
                {/* Age Group Input */}
                <div>
                    <label className="text-xs text-gray-400">Жас тобы</label>
                    <input 
                        value={division.ageGroup} 
                        onChange={(e) => handleInputChange('ageGroup', e.target.value)} 
                        placeholder="Мысалы: 2010-2011 ж.т." 
                        className="w-full mt-1 bg-navy-900 p-2 rounded-md border border-navy-500 focus:border-gold focus:outline-none" 
                    />
                </div>
                {/* Duration Input */}
                <div>
                    <label className="text-xs text-gray-400">Белдесу (мин)</label>
                    <input 
                        type="number"
                        value={division.duration} 
                        onChange={(e) => handleInputChange('duration', e.target.value)} 
                        placeholder="3" 
                        className="w-full mt-1 bg-navy-900 p-2 rounded-md border border-navy-500 focus:border-gold focus:outline-none"
                    />
                </div>
            </div>
            {/* Remove Button */}
            <button 
                type="button" 
                onClick={onRemove} 
                className="ml-3 text-red-500 hover:text-red-400 font-bold text-2xl leading-none"
            >
                &times;
            </button>
        </div>
        {/* Weights Input */}
        <div>
            <label className="text-xs text-gray-400">Салмақ дәрежелері (үтір арқылы)</label>
            <input 
                value={weightsString} 
                onChange={(e) => handleInputChange('weights', e.target.value.split(',').map(w => w.trim()))} 
                placeholder="60, 65, 70, +70" 
                className="w-full mt-1 bg-navy-900 p-2 rounded-md border border-navy-500 focus:border-gold focus:outline-none"
            />
        </div>
    </div>
  );
};

export default DivisionEditCard;
