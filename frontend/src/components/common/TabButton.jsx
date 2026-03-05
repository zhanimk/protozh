'use client';

const TabButton = ({ active, onClick, children }) => (
    <button 
        onClick={onClick} 
        className={`px-4 py-2 font-semibold transition-colors duration-200 ${active ? 'bg-gold text-navy-900' : 'text-gray-300 hover:bg-navy-700'} rounded-md`}>
        {children}
    </button>
);

export default TabButton;
