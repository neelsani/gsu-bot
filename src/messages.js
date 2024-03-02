import { rateMyProf } from "./reddit";

const colRat =(rat) => {
    if (rat >= 3.333) {
        return `\x1b[2;32m${rat}\x1b[0m`

    } else if (rat >=1.66) {
        return `\x1b[2;33m${rat}\x1b[0m`

    }  else {
        return `\x1b[2;31m${rat}\x1b[0m`
    }
}
const colDiff =(diff) => {
    let rat = 5 -diff
    if (rat >= 3) {
        return `\x1b[2;32m${diff}\x1b[0m`

    } else if (rat >=1.66) {
        return `\x1b[2;33m${diff}\x1b[0m`

    }  else {
        return `\x1b[2;31m${diff}\x1b[0m`
    }
}
export const createProfessorField = async (name, crnId, seatsAvailable, maximumEnrollment, start, end) => {
    let rat = seatsAvailable / maximumEnrollment;
    let ratStr = seatsAvailable + "/" + maximumEnrollment;
    let val = "err";
    const fireEmoji = "🔥";
    const warning = "⚠️"
    let avgrat;
    let diff;
    let numrat;
    let per;
    let rmp = await rateMyProf(name)
    //let rmp = null
    if (rmp){
     avgrat = colRat(rmp[2])
     diff = colDiff(rmp[1])
     numrat =rmp[0]
     if (rmp[3]==100){
        per = "✨"+Math.round(rmp[3])
     }else {
        per = Math.round(rmp[3])
     }
    }
    
    if (rat > (.75)) {
        val = `\`\`\`ansi
CRN: ${crnId}
Seats: \x1b[2;32m${ratStr}\x1b[0m
Start: ${start}
End: ${end}${rmp ? "\nRating: "+avgrat+ "\nDifficulty: "+diff :"\nRating: "+"N/A"+ "\nDifficulty: "+"N/A"}${rmp ? "\nOverall: "+per+ "%": "\nOverall: "+"N/A"}
\`\`\``;
    } else if (rat >= 1 / 3) {
        val = `\`\`\`ansi
CRN: ${crnId}
Seats: \x1b[2;33m${ratStr}\x1b[0m ${warning}
Start: ${start}
End: ${end}${rmp ? "\nRating: "+avgrat+ "\nDifficulty: "+diff :"\nRating: "+"N/A"+ "\nDifficulty: "+"N/A"}${rmp ? "\nOverall: "+per+ "%": "\nOverall: "+"N/A"}
\`\`\``;
    } else {
        val = `\`\`\`ansi
CRN: ${crnId}
Seats: \x1b[2;31m${ratStr}\x1b[0m ${fireEmoji}
Start: ${start}
End: ${end}${rmp ? "\nRating: "+avgrat+ "\nDifficulty: "+diff :"\nRating: "+"N/A"+ "\nDifficulty: "+"N/A"}${rmp ? "\nOverall: "+per+ "%": "\nOverall: "+"N/A"}
\`\`\``;
    }
   
    return {
        name: name,
        value: val,
        inline: true
    };
}

export const createProfessorField1 = async (name, crnId, seatsAvailable, maximumEnrollment, start, end, subject, coursenum) => {
    let avgrat;
    let diff;
    let numrat;
    let per;
    let rmp = await rateMyProf(name)
    //let rmp = null
    if (rmp){
     avgrat = colRat(rmp[2])
     diff = colDiff(rmp[1])
     numrat =rmp[0]
     if (rmp[3]==100){
        per = "✨"+Math.round(rmp[3])
     } else {
        per = Math.round(rmp[3])
     }
    }
    let rat = seatsAvailable / maximumEnrollment;
    let ratStr = seatsAvailable + "/" + maximumEnrollment;
    let val = "err";
    const fireEmoji = "🔥";
    const warning = "⚠️"
    if (rat > (.75)) {
        val = `\`\`\`ansi
${subject} ${coursenum}        
CRN: ${crnId}
Seats: \x1b[2;32m${ratStr}\x1b[0m
Start: ${start}
End: ${end}${rmp ? "\nRating: "+avgrat+ "\nDifficulty: "+diff :"\nRating: "+"N/A"+ "\nDifficulty: "+"N/A"}${rmp ? "\nOverall: "+per+ "%": "\nOverall: "+"N/A"}
\`\`\``;
    } else if (rat >= 1 / 3) {
        val = `\`\`\`ansi
${subject} ${coursenum}
CRN: ${crnId}
Seats: \x1b[2;33m${ratStr}\x1b[0m ${warning}
Start: ${start}
End: ${end}${rmp ? "\nRating: "+avgrat+ "\nDifficulty: "+diff :"\nRating: "+"N/A"+ "\nDifficulty: "+"N/A"}${rmp ? "\nOverall: "+per+ "%": "\nOverall: "+"N/A"}
\`\`\``;
    } else {
        val = `\`\`\`ansi
${subject} ${coursenum}
CRN: ${crnId}
Seats: \x1b[2;31m${ratStr}\x1b[0m ${fireEmoji}
Start: ${start}
End: ${end}${rmp ? "\nRating: "+avgrat+ "\nDifficulty: "+diff :"\nRating: "+"N/A"+ "\nDifficulty: "+"N/A"}${rmp ? "\nOverall: "+per+ "%": "\nOverall: "+"N/A"}

\`\`\``;
    }
   
    return {
        name: name,
        value: val,
        inline: true
    };
}
