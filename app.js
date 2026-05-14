import {
    db,
    auth,
    provider,
    signInWithPopup
} from "./firebase.js";

import {
    collection,
    addDoc,
    getDocs,
    query,
    where,
    updateDoc,
    doc
} from 
"https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

let loggedInUser = null;

const grades = [
    {name:"A+", value:10},
    {name:"A", value:9},
    {name:"B+", value:8},
    {name:"B", value:7},
    {name:"C+", value:6},
    {name:"C", value:5},
    {name:"D", value:4},
    {name:"F", value:0}
];

const subjects = [
    {name:"Computer Algorithms", theory:3, practical:1},
    {name:"Computer Networks", theory:3, practical:1},
    {name:"Compiler Design", theory:3, practical:1},
    {name:"IOT / DSD", theory:2, practical:1},
    {name:"Cloud / BDA / Blockchain", theory:3, practical:0},
    {name:"AIA Practical", theory:0, practical:2},
    {name:"MDM", theory:2, practical:1}
];

const tableBody = document.getElementById("tableBody");
const resultDiv = document.getElementById("result");

const gradeOptions = grades.map(
    g => `<option value="${g.value}">${g.name}</option>`
).join("");

function createDropdown(id){
    return `<select id="${id}">${gradeOptions}</select>`;
}

subjects.forEach((sub,index)=>{
    tableBody.innerHTML += `
    <tr>
        <td>${sub.name}</td>
        <td>${sub.theory > 0 ? createDropdown(`theory${index}`) : "N/A"}</td>
        <td>${sub.practical > 0 ? createDropdown(`practical${index}`) : "N/A"}</td>
    </tr>
    `;
});

document.getElementById("loginBtn")
.addEventListener("click", async ()=>{

    try{
        const res = await signInWithPopup(auth, provider);
        const user = res.user;

        if(!user.email.endsWith("@sggs.ac.in")){
            alert("Only college email allowed");
            return;
        }

        loggedInUser = user;

        document.getElementById("userInfo").innerHTML =
            `Logged in as: ${user.email}`;

    }catch(error){
        console.log(error);
    }
});

document.getElementById("calculateBtn")
.addEventListener("click", calculateSGPA);

async function calculateSGPA(){

    if(!loggedInUser){
        alert("Login first");
        return;
    }

    const regNo = loggedInUser.email
        .split("@")[0]
        .toUpperCase();

    let totalCredits = 0;
    let totalPoints = 0;
    let gradesData = {};

    subjects.forEach((sub,index)=>{

        if(sub.theory > 0){
            const grade = parseInt(
                document.getElementById(`theory${index}`).value
            );

            totalPoints += grade * sub.theory;
            totalCredits += sub.theory;

            gradesData[`theory${index}`] = grade;
        }

        if(sub.practical > 0){
            const grade = parseInt(
                document.getElementById(`practical${index}`).value
            );

            totalPoints += grade * sub.practical;
            totalCredits += sub.practical;

            gradesData[`practical${index}`] = grade;
        }
    });

    const sgpa = totalPoints / totalCredits;

    resultDiv.innerHTML = `Your SGPA: ${sgpa.toFixed(2)}`;

    try{
        const studentsRef = collection(db,"students");

        const q = query(
            studentsRef,
            where("regNo","==",regNo)
        );

        const snapshot = await getDocs(q);

        if(!snapshot.empty){
            const existingDoc = snapshot.docs[0];

            await updateDoc(
                doc(db,"students",existingDoc.id),
                {
                    grades: gradesData,
                    sgpa: sgpa.toFixed(2),
                    updatedAt: new Date()
                }
            );
        }
        else{
            await addDoc(studentsRef,{
                regNo,
                email: loggedInUser.email,
                grades: gradesData,
                sgpa: sgpa.toFixed(2),
                createdAt: new Date()
            });
        }

    }catch(error){
        console.log(error);
    }
}