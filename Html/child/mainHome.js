export function mainChildHomePage(url, AuthID) {
  
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

          .task-completed-btn {
              background-color: #65cc31;
              color: white;
              border: none;
              padding: 10px 20px;
              border-radius: 5px;
              cursor: pointer;
              font-size: 14px;
          }

          .task-notcompleted-btn {
              background-color: #f44336;
              color: white;
              border: none;
              padding: 10px 20px;
              border-radius: 5px;
              cursor: pointer;
              font-size: 14px;
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

        <h1 id="welcomemsg"></h1>
        <h2 id="coinsamt"></h2>

        <div  id="tasks">

        </div>
   </body>
   <script src="https://code.jquery.com/jquery-3.6.3.min.js"></script>
   <script src="/socket.io/socket.io.js"></script>
   <script>
        const socket = io();
        var settings = [{authID: "${AuthID}", childrenData: null}];

        socket.on("connect", () => {
            socket.emit("setupChildRoom", settings[0].authID)
        })

        socket.on("newChildDataDict", (dict) => {
            console.log(dict);
            settings[0].childrenData = dict
            UpdateData();
        })

        socket.on('popupShow', (title, description) => {
            document.getElementById('popup-title').innerText = title;
            document.getElementById('popup-description').innerText = description;
            document.getElementById('popup-overlay').style.display = 'flex';  
        })

        function closePopup() {
            document.getElementById('popup-overlay').style.display = 'none';
        }

        function checkCompletedSend(taskID) {
            if (document.getElementById(taskID + '-task-id-completed').innerHTML == "Set This Task To Completed") {
                document.getElementById(taskID + '-task-id-completed').setAttribute("class", "task-notcompleted-btn");
                document.getElementById(taskID + '-task-id-completed').innerHTML = "Set This Task To Not Completed"
                socket.emit("changeChildTaskCompleted", settings[0].authID, taskID, true)
            } else if (document.getElementById(taskID + '-task-id-completed').innerHTML == "Set This Task To Not Completed") {
                document.getElementById(taskID + '-task-id-completed').setAttribute("class", "task-completed-btn");
                document.getElementById(taskID + '-task-id-completed').innerHTML = "Set This Task To Completed"
                socket.emit("changeChildTaskCompleted", settings[0].authID, taskID, false)
            }
        }

        function UpdateData() {
            document.getElementById("welcomemsg").innerHTML = "Welcome, " + settings[0].childrenData.Name
            document.getElementById("coinsamt").innerHTML = settings[0].childrenData.Coins
            var tasksDivEle = document.getElementById("tasks")
            if (!settings[0].childrenData?.childdata?.tasks) {
                $('#tasks').children().remove();
                let htmlcode = "<div style='background-color: #fff;'><p>NO TASKS TO SHOW</p></div><br>";

                tasksDivEle.insertAdjacentHTML("beforeend", htmlcode);
            } else {
                $('#tasks').children().remove();
                for (const [key, value] of Object.entries(settings[0].childrenData.childdata.tasks)) {
                    let htmlcode = "<br> <div class='login'><h2>TaskName: " + value.taskname +"</h2><h3>Awarded Coins: " + value.coinsamount +"</h3></div> <button class='task-completed-btn' id='" + key + "-task-id-completed'>Set This Task To Completed</button> <br>";
                    
                    tasksDivEle.insertAdjacentHTML("beforeend", htmlcode);
                    document.getElementById(key + '-task-id-completed').setAttribute("onclick", "checkCompletedSend('" + key + "')");
                    if (settings[0].childrenData.childdata.tasks[key].childapproved == false) {
                        document.getElementById(key + '-task-id-completed').setAttribute("class", "task-completed-btn");
                        document.getElementById(key + '-task-id-completed').innerHTML = "Set This Task To Completed"
                    } else {
                        document.getElementById(key + '-task-id-completed').setAttribute("class", "task-notcompleted-btn");
                        document.getElementById(key + '-task-id-completed').innerHTML = "Set This Task To Not Completed"
                    }
                }
            }
        }
   </script>
</html>
    `;
  
}