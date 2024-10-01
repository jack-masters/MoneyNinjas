export function HomeLoginPage(url) {
    return `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width,minimum-scale=1">
            <title>Login</title>
            <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.7.1/css/all.css">
            <link href="${url}/public/css/login.css" rel="stylesheet" type="text/css">
          </head>
          <body>
            <div class="login">
              <h1>Login</h1>
              <div class="row">
                <div class="col-md-3">
                  <a href="${url}/parent/login" style="padding-left:150px;">Parent Login</a>
                  <br>
                  <br>
                  <a href="${url}/child/login" style="padding-left:150px;">Child Login</a>
                </div>
              </div>
              <link   rel="stylesheet" 
                      href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css" 
                      integrity="sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm" 
                      crossorigin="anonymous">
              <script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/js/bootstrap.min.js" 
                      integrity="sha384-JZR6Spejh4U02d8jOt6vLEHfe/JQGiRRSQQxSfFWpi1MquVdAyjUar5+76PVCmYl" 
                      crossorigin="anonymous">
              </script>
            </div>
          </body>
        </html>
    `;
}
