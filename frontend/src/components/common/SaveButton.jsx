'use client';

const SaveButton = ({ hasUnsavedChanges, isProcessing, handleSaveChanges }) => {
    const baseClasses = "px-5 py-2 text-white font-semibold rounded-lg disabled:opacity-50 transition-all flex items-center gap-2";
    
    if (hasUnsavedChanges) {
        return (
            <button onClick={handleSaveChanges} disabled={isProcessing} className={`${baseClasses} bg-yellow-500 hover:bg-yellow-400 animate-pulse`}>
              <span className="text-lg">💾</span> {isProcessing ? 'Сақталуда...' : 'Сақтау керек'}
            </button>
        );
    }
    
    return (
        <button disabled className={`${baseClasses} bg-green-600`}>
          <span className="text-lg">✅</span> Сақталды
        </button>
    );
}

export default SaveButton;
