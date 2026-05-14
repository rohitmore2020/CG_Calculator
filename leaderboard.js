import { db } from "./firebase.js";

import {
    collection,
    getDocs
} from 
"https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const leaderboardBody = document.getElementById("leaderboardBody");

async function loadLeaderboard(){

    const snapshot = await getDocs(
        collection(db,"students")
    );

    let students = [];

    snapshot.forEach((doc)=>{
        students.push(doc.data());
    });

    students.sort((a,b)=> b.sgpa - a.sgpa);

    students.forEach((student,index)=>{
        leaderboardBody.innerHTML += `
            <tr>
                <td>${index+1}</td>
                <td>${student.regNo}</td>
                <td>${student.sgpa}</td>
            </tr>
        `;
    });
}

loadLeaderboard();