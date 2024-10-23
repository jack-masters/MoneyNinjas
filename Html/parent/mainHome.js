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
      <link type="text/css" rel="stylesheet" href="${url}/public/login.css" />]
      <script src="${url}/public/parent/main.js">
        changeSettingsAuth("${authID}")
      </script>
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
</html>
    `;
  
}