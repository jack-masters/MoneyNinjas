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

          .task-complete-btn {
              background-color: #65cc31;
              color: white;
              border: none;
              padding: 10px 20px;
              border-radius: 5px;
              cursor: pointer;
              font-size: 14px;
          }

          .task-del-btn {
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
            <input type="submit" value="Login">
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
   <script src="https://code.jquery.com/jquery-3.6.3.min.js"></script>
   <script src="/socket.io/socket.io.js"></script>
   <script>
        const socket = io();
        var settings = [{authID: "${authID}", childrenData: null}];

        socket.on("connect", () => {
            socket.emit("setupParentRoom", settings[0].authID)
        })

        socket.on("newChildDataDict", (dict) => {
            settings[0].childrenData = dict
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
            document.getElementById(childID + "-taskcreate").addEventListener("submit", function(e) {
                e.preventDefault()
                socket.emit("parentCreateTask", settings[0].authID, childID, document.getElementById(childID + "-taskcreate").elements["taskname"].value, document.getElementById(childID + "-taskcreate").elements["coinsamn"].value)
            });
        }

        function setupCreateLogin(childID) {
            document.getElementById(childID + "-login").addEventListener("submit", function(e) {
                e.preventDefault()
                socket.emit("parentCreateLogin", settings[0].authID, childID)
            });
        }

        function closePopup() {
            document.getElementById('popup-overlay').style.display = 'none';
        }

        function deleteTask(childID, taskID) {
            socket.emit("parentTaskDelete", settings[0].authID, childID, taskID)
        }

        function completeTask(childID, taskID) {
            socket.emit("parentTaskComplete", settings[0].authID, childID, taskID)
        }

        function UpdateChildren() {
            var childrenDivEle = document.getElementById("children")
            if (settings[0].childrenData == null) {
                $('#children').children().remove();
                let htmlcode = "<div style='background-color: #fff;'><p>NO KIDS TO SHOW</p></div><br>";

                childrenDivEle.insertAdjacentHTML("beforeend", htmlcode);
            } else { 
                $('#children').children().remove();
                for (const [key, value] of Object.entries(settings[0].childrenData)) {
                    let htmlcode = "<div class='login'><h2>Name: " + value.Name +"</h2><h3>Age: " + value.Age +"</h3><h3>Coins: " + value.Coins +"</h3><h2>Create New Task</h2><form id='" + key +"-taskcreate'><input type='text' name='taskname' placeholder='Task Name' minlength='2' required><br><input type='number' name='coinsamn' placeholder='Ammount Of Coins To Reward' required><br><input type='submit' value='Create Task'/></form><br><form id='" + key +"-login'><input type='submit' value='Create Login'/></form><br><br><div id='" + key +"-tasks-show'></div></div><br>";
                    childrenDivEle.insertAdjacentHTML("beforeend", htmlcode);
                    setupCreateTask(key)
                    setupCreateLogin(key)

                    let childID = key;
                    let childValues = value

                    if (!settings[0].childrenData[childID]?.childdata?.tasks) {
                        let htmlcodeNoTasks = "<div style='background-color: #fff;'><p>NO TASKS TO SHOW</p></div><br>";

                        document.getElementById(childID + "-tasks-show").insertAdjacentHTML("beforeend", htmlcodeNoTasks);
                    } else {
                        for (const [key, value] of Object.entries(settings[0].childrenData[childID].childdata.tasks)) {
                            let ChildApproveText = childValues.Name + " has not set this task to completed."
                            if (value.childapproved == false || value.childapproved == null) { ChildApproveText = childValues.Name + " has not set this task to completed." } else { ChildApproveText = childValues.Name + " has set this task to completed!" }

                            let htmlCodeTasks = "<div id='" + key +"-task-id-"+ childID + "' style='background-color: #808080;'><h3>Name: "+ value.taskname +"</h3> <h3>Coins: "+ value.coinsamount +"</h3> <h3> " + ChildApproveText +" </h3> <button class='task-complete-btn' id='" + key +"-task-id-"+ childID + "-complete'>Completed</button><button class='task-del-btn' id='" + key +"-task-id-"+ childID + "-delete'>Delete</button></div>"
                            document.getElementById(childID + "-tasks-show").insertAdjacentHTML("beforeend", htmlCodeTasks);

                            document.getElementById(key + '-task-id-' + childID + '-complete').setAttribute("onclick", "completeTask('" + childID + "', '" + key + "')");
                            document.getElementById(key + '-task-id-' + childID + '-delete').setAttribute("onclick", "deleteTask('" + childID + "', '" + key + "')"); 
                        }       
                    }
                }
            }
        }
    </script>
</html>
    `;
  
}