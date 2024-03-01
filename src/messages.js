export const createProfessorField = (name, crnId, seatsAvailable, maximumEnrollment, start, end) => {
    let rat = seatsAvailable / maximumEnrollment;
    let ratStr = seatsAvailable + "/" + maximumEnrollment;
    let val = "err";
    const fireEmoji = "🔥";
    const warning = "⚠️"
    if (rat > (.75)) {
        val = `\`\`\`ansi
CRN: ${crnId}
Seats: \x1b[2;32m${ratStr}\x1b[0m
Start: ${start}
End: ${end}
\`\`\``;
    } else if (rat >= 1 / 3) {
        val = `\`\`\`ansi
CRN: ${crnId}
Seats: \x1b[2;33m${ratStr}\x1b[0m ${warning}
Start: ${start}
End: ${end}
\`\`\``;
    } else {
        val = `\`\`\`ansi
CRN: ${crnId}
Seats: \x1b[2;31m${ratStr}\x1b[0m ${fireEmoji}
Start: ${start}
End: ${end}
\`\`\``;
    }
   
    return {
        name: name,
        value: val,
        inline: true
    };
}
