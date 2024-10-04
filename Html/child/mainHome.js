export function mainChildHomePage(url, settings) {
  
    return `
<!DOCTYPE html>
<html>
   <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width,minimum-scale=1">
      <title>Login</title>
      <script src="https://www.gstatic.com/firebasejs/ui/6.0.1/firebase-ui-auth.js"></script>
      <link type="text/css" rel="stylesheet" href="https://www.gstatic.com/firebasejs/ui/6.0.1/firebase-ui-auth.css" />
      <link type="text/css" rel="stylesheet" href="${url}/public/css/login.css" />
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
      <script src="/socket.io/socket.io.js"></script>
        <script>
            const socket = io();
        </script>
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

        <div  id = "tasks">

        </div>
   </body>
   <script>
    var PageSettings = ${JSON.stringify(settings)}

    if (PageSettings[0].popup.popupShow == true) {
      document.getElementById('popup-title').innerText = PageSettings[0].popup.popupTitle;
      document.getElementById('popup-description').innerText = PageSettings[0].popup.popupMessage;
      document.getElementById('popup-overlay').style.display = 'flex';
    }

    function closePopup() {
        document.getElementById('popup-overlay').style.display = 'none';
        window.location.href = PageSettings[0].popup.popupReturnURL;
    }
   </script>
   <script>
      var childrenData = ${JSON.stringify(settings)}
      var tasksDivEle = document.getElementById("tasks")

      if (childrenData[0].tasks == null) {
        let htmlcode = "<div style='background-color: #fff;'><p>NO TASKS TO SHOW</p></div><br>";

        tasksDivEle.insertAdjacentHTML("beforeend", htmlcode);
      } else {
        for (const [key, value] of Object.entries(childrenData[0].tasks)) {
          let htmlcode = "<br> <div class='login'><h2>TaskName: " + value.taskname +"</h2><h3>Awarded Coins: " + value.coinsamount +"</h3></div> <h3>Needing Parent Approval: " + value.parentapproval + "</h3><br>";

          tasksDivEle.insertAdjacentHTML("beforeend", htmlcode);
        }
      }

      document.getElementById("welcomemsg").innerHTML = "Welcome, " + childrenData[0].user.username
      document.getElementById("coinsamt").innerHTML = childrenData[0].user.coins
   </script>
</html>
    `;
  
}