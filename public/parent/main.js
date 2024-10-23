import { io } from "https://cdn.socket.io/4.8.0/socket.io.esm.min.js";
const socket = io();
const settings = null;

function changeSettingsAuth(authID) {
    settings = [{authID: authID}];
}

socket.on("connect", () => {
    socket.emit("setupRoom", settings[0].authID)
})

socket.on("newParentSettingsDict", (dict) => {
    settings = JSON.stringify(dict);
})

socket.on('popupShow', (title, description) => {
    document.getElementById('popup-title').innerText = title;
    document.getElementById('popup-description').innerText = description;
    document.getElementById('popup-overlay').style.display = 'flex';  
})

document.addEventListener('DOMContentLoaded', (event) => {
    document.getElementById("signupForm").addEventListener("submit", function(e) {
        e.preventDefault()
            socket.emit("parentCreateSignup", settings[0].authID, document.getElementById("signupForm").elements["firstname"].value, document.getElementById("signupForm").elements["age"].value)
        });
    });

function setupCreateTask(childID) {
    document.getElementById(childID + "-task").addEventListener("submit", function(e) {
        e.preventDefault()
        alert(childID)
    });
}

function setupCreateLogin(childID) {
    document.getElementById(childID + "-login").addEventListener("submit", function(e) {
        e.preventDefault()
        alert(childID)
    });
}

function closePopup() {
    document.getElementById('popup-overlay').style.display = 'none';
}


var childrenDivEle = document.getElementById("children")
if (settings[0].childrenData == null) {
    let htmlcode = "<div style='background-color: #fff;'><p>NO KIDS TO SHOW</p></div><br>";

    childrenDivEle.insertAdjacentHTML("beforeend", htmlcode);
} else {
    let childID = ""

    for (const [key, value] of Object.entries(settings[0].childrenData)) {
        childID = key;
    }
        
    for (const [key, value] of Object.entries(settings[0].childrenData)) {
        let htmlcode = "<div class='login'><h2>Name: " + value.Name +"</h2><h3>Age: " + value.Age +"</h3><h3>Coins: " + value.Coins +"</h3><h2>Create New Task</h2><form id='" + childID +"-task'><input type='text' name='taskname' placeholder='Task Name' minlength='2' required><br><input type='number' name='coinsamn' placeholder='Ammount Of Coins To Reward' required><h3>Approved By Parent: </h3></h2><input type='checkbox' name='parentapprove'><br><input type='submit' value='Create Task'/></form><br><form id='" + childID +"-login'><input type='submit' value='Create Login'/></div> <br>";
        setupCreateTask(childID)
        setupCreateLogin(childID)
        childrenDivEle.insertAdjacentHTML("beforeend", htmlcode);
    }
}