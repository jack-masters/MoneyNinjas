export function ChildLoginPage(url) {
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
          </head>
          <body>
            <div class="login">
            <h1>Login</h1>
            <form action="${url}/child/auth" method="post">
              <input type="text" name="loginid" placeholder="Login ID  Eg: 12345678" id="loginid" maxlength="8" minlength="8" required>
              <input type="submit" value="Login">
            </form>
          </div>
          <br>
          <br>
          <br>
          <br>
          <br>
          <br>
          <div class="login">
          <h1>SignUp</h1>
          <form action="${url}/child/signup" method="post">
            <input type="text" name="firstname" placeholder="Firstname  Eg: Jack" id="firstname" maxlength="15"  minlength="2" required>
            <br>
            <input type="text" name="age" placeholder="Age  Eg: 5" id="age" maxlength="3" minlength="1" required>
            <br>
            <input type="text" name="parentid" placeholder="Parent ID  Eg: 123456" id="parentid" maxlength="6" minlength="6" required>
            <input type="submit" value="Login">
          </form>
        </div>
          </body>
        </html>
    `;
}
