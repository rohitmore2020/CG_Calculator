import {
    db,
    auth,
    provider,
    signInWithPopup,
    onAuthStateChanged
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

// Function to handle UI switch with animation
function switchToCalculator(user) {
    loggedInUser = user;
    document.getElementById("userInfo").innerHTML = `Logged in as: ${user.email}`;

    const loginSection = document.getElementById("loginSection");
    const calcSection = document.getElementById("calculatorSection");

    loginSection.classList.add("fade-out");
    setTimeout(() => {
        loginSection.style.display = "none";
        calcSection.style.display = "block";
        
        setTimeout(() => {
            calcSection.classList.add("fade-in");
        }, 50);
    }, 400); // Wait for fade-out transition
}

// Listen for auth state changes (Persistent login)
onAuthStateChanged(auth, (user) => {
    if (user && user.email.endsWith("@sggs.ac.in")) {
        // User is already logged in, skip login screen
        switchToCalculator(user);
    }
});

document.getElementById("loginBtn")
.addEventListener("click", async ()=>{

    const errorMsg = document.getElementById("loginError");
    const loginBtn = document.getElementById("loginBtn");
    
    errorMsg.style.display = "none";
    errorMsg.innerText = "";
    
    // Add loading state
    loginBtn.classList.add("loading");
    loginBtn.innerHTML = "Signing in...";

    try{
        const res = await signInWithPopup(auth, provider);
        const user = res.user;

        if(!user.email.endsWith("@sggs.ac.in")){
            errorMsg.innerText = "Only SGGS college email (@sggs.ac.in) is allowed.";
            errorMsg.style.display = "block";
            // Remove loading state
            loginBtn.classList.remove("loading");
            loginBtn.innerHTML = `<svg class="google-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg> Sign in with Google`;
            return;
        }

        switchToCalculator(user);

    }catch(error){
        console.log(error);
        if(error.code !== 'auth/popup-closed-by-user') {
            errorMsg.innerText = "An error occurred during sign in.";
            errorMsg.style.display = "block";
        }
        // Remove loading state
        loginBtn.classList.remove("loading");
        loginBtn.innerHTML = `<svg class="google-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg> Sign in with Google`;
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