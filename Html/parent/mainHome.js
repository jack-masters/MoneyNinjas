export function mainParentHomePage(url, authID) {
  
    return `
<!DOCTYPE html>
<html>
   <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width,minimum-scale=1">
      <title>Login</title>
      <script src="https://www.gstatic.com/firebasejs/ui/6.0.1/firebase-ui-auth.js"></script>
      <link type="text/css" rel="stylesheet" href="https://www.gstatic.com/firebasejs/ui/6.0.1/firebase-ui-auth.css" />
      <link type="text/css" rel="stylesheet" href="${url}/public/login.css" />
      <style>
          /* Style for the popup background overlay */
          .popup-overlay {
              position: fixed;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              background: rgba(0, 0, 0, 0.5);
              display: none;
              justify-content: center;
              align-items: center;
          }

          /* Style for the popup box */
          .popup-box {
              background-color: #fff;
              padding: 20px;
              border-radius: 8px;
              box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
              width: 300px;
              text-align: center;
          }

          /* Style for the popup title */
          .popup-title {
              font-size: 18px;
              margin-bottom: 10px;
              font-weight: bold;
          }

          /* Style for the popup description */
          .popup-description {
              font-size: 14px;
              margin-bottom: 20px;
          }

          /* Style for the close button */
          .popup-close {
              background-color: #f44336;
              color: white;
              border: none;
              padding: 10px 20px;
              border-radius: 5px;
              cursor: pointer;
              font-size: 14px;
          }

          .popup-close:hover {
              background-color: #d32f2f;
          }
      </style>
   </head>
   <body>
      <div id="popup-overlay" class="popup-overlay">
          <div class="popup-box">
              <div id="popup-title" class="popup-title"></div>
              <div id="popup-description" class="popup-description"></div>
              <button class="popup-close" onclick="closePopup()">Close</button>
          </div>
      </div>

      <div class="login">
         <h1>Create Signup</h1>
         <form name="signupForm" id="signupForm">
            <input type="text" name="firstname" placeholder="firstname" maxlength="12" minlength="1" required>
            <input type="text" name="age" placeholder="age" maxlength="2" minlength="1" required>
            <input type="submit" value="Login" onClick="SignupCreate();">
         </form>
      </div>
      <br>
      <br>
      <br>
      <h1>Children</h1>
      <div id="children">
         
      </div>
      <br>
      <br>
      <br>
      <br>
   </body>

   <script type="module">
        import { io } from "https://cdn.socket.io/4.8.0/socket.io.esm.min.js";
        const socket = io();
        var settings = [{authID: "${authID}", childrenData: null}];

        socket.on("connect", () => {
            socket.emit("setupParentRoom", settings[0].authID)
        })

        socket.on("newChildDataDict", (dict) => {
            console.log(JSON.stringify(dict));
            settings[0].childrenData = JSON.stringify(dict);
            console.log(JSON.stringify(settings))
            UpdateChildren();
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


        function UpdateChildren() {
            var childrenDivEle = document.getElementById("children")
            if (settings[0].childrenData == null) {
                let htmlcode = "<div style='background-color: #fff;'><p>NO KIDS TO SHOW</p></div><br>";

                childrenDivEle.insertAdjacentHTML("beforeend", htmlcode);
            } else { 
                for (const [key, value] of Object.entries(settings[0].childrenData)) {
                    let htmlcode = "<div class='login'><h2>Name: " + value.Name +"</h2><h3>Age: " + value.Age +"</h3><h3>Coins: " + value.Coins +"</h3><h2>Create New Task</h2><form id='" + key +"-task'><input type='text' name='taskname' placeholder='Task Name' minlength='2' required><br><input type='number' name='coinsamn' placeholder='Ammount Of Coins To Reward' required><h3>Approved By Parent: </h3></h2><input type='checkbox' name='parentapprove'><br><input type='submit' value='Create Task'/></form><br><form id='" + key +"-login'><input type='submit' value='Create Login'/></div> <br>";
                    childrenDivEle.insertAdjacentHTML("beforeend", htmlcode);
                    setupCreateTask(key)
                    setupCreateLogin(key)
                }
            }
        }
    </script>
</html>
    `;
  
}