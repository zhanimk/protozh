export const groupAthletesByDivision = (athletes, divisions) => {
    const grouped = {};
    divisions.forEach(div => {
        const divKey = `${div.gender} / ${div.ageGroup}`;
        if (!grouped[divKey]) grouped[divKey] = {};
        div.weights.forEach(weight => {
            if (!grouped[divKey][weight]) grouped[divKey][weight] = [];
        });
    });
    athletes.forEach(athlete => {
        const divKey = `${athlete.gender} / ${athlete.ageGroup}`;
        if (grouped[divKey] && grouped[divKey][athlete.weight] !== undefined) {
             grouped[divKey][athlete.weight].push(athlete);
        }
    });
    for (const divKey in grouped) {
        for (const weight in grouped[divKey]) {
            grouped[divKey][weight].sort((a, b) => a.name.localeCompare(b.name));
        }
    }
    return grouped;
};
