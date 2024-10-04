const port = 9002;
const URL = "https://money-ninjas.jack-masters.co.uk";

const config = {
    authRequired: false,

    
    auth0Logout: true,
    secret: "Xiqwuehr725y9u32rjiof239r-238rjcoj_EiSHZ5M5q9ueJdrKKYUt23845jifj20r0efkl2GVOjH6xdfcESASDJjdisofjksdfo3o2fbsjh23189hf893I",
    baseURL: URL,
    clientID: "cXn9dnYcFgOL274PSl0vajMnVTdYe8wW",
    issuerBaseURL: "https://dev-a76hg03tiporhjoo.us.auth0.com",
    attemptSilentLogin: false,
    routes: {
        login: false,
    },
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

import express, { json, request, response } from "express";
import { Server } from 'socket.io';
import session from "express-session";
import crypto from "crypto-js";
import { makeUpperLowerNumberCode, makeUpperNumberCode} from "./functions/CodeFunctions.js";
import { v4 as uuid } from "uuid";
import { HomeLoginPage } from "./Html/login/HomeLogin.js";
import { mainParentHomePage } from "./Html/parent/mainHome.js";
import { mainChildHomePage } from "./Html/child/mainHome.js";
import { ChildLoginPage } from "./Html/login/ChildLogin.js";
import { initializeApp } from "firebase/app";
import * as fs from 'fs';
import * as https from 'https';
import {getDatabase,ref,onValue,set,get,child,remove} from "firebase/database";
import cookieParser from "cookie-parser";
import pkg from "express-openid-connect";
const { auth, requiresAuth } = pkg;

const httpsoptions = {
    key: fs.readFileSync("HttpCert/server.key"),
    cert: fs.readFileSync("HttpCert/server.cert"),
};

const app = express();
const server = https.createServer(httpsoptions, app)
const socketio = new Server(server)

app.use("/public", express.static("./public"));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(auth(config));

const firebaseConfig = {
    // ...
    // The value of `databaseURL` depends on the location of the database
    databaseURL:
        "https://moneycounter-64156-default-rtdb.europe-west1.firebasedatabase.app",
};

const firebaseapp = initializeApp(firebaseConfig);

async function childCheckLoggedIn(request, response, next) {
    const sessionToken = request.cookies["child_session_token"];

    if (!sessionToken) {
        return response.redirect("/login");
    }

    const db = getDatabase();
    const starCountRef = ref(db, "sessions/" + sessionToken);
    onValue(starCountRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            if (data.expiresAt < new Date()) {
                return response.redirect("/login");
            } else {
                next();
            }
        } else {
            return response.redirect("/login");
        }
    });

    next();
}

async function createNewSocketParentAuthID(parentID) {

}

async function createNewSocketChildAuthID(childID) {

}


socketio.on('connection', (socket) => {
    console.log("User Connected To Service.")
    socket.on('disconnect', () => {
        console.log('User Disconnected To Service.');
    });

    socket.on('addTask', (authID, data) => {

    })
})

app.get("/", (request, response) => {
    if (request.oidc.isAuthenticated()) {
        response.redirect("/parent/portal");
    } else {
        const sessionToken = request.cookies["child_session_token"];

        if (!sessionToken) {
            return response.redirect("/login");
        }

        const db = getDatabase();
        const starCountRef = ref(db, "sessions/" + sessionToken);
        onValue(starCountRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                if (data.expiresAt < new Date()) {
                    return response.redirect("/login");
                } else {
                    return response.redirect("/child/portal");
                }
            } else {
                return response.redirect("/login");
            }
        });
    }
});

app.get("/login", (request, response) => {
    response.send(HomeLoginPage(URL));
});

app.get("/parent/login", (request, response) =>
    response.oidc.login({
        returnTo: "/parent/portal",
        authorizationParams: {
            redirect_uri: `${URL}/callback`,
            prompt: "login",
        },
    }),
);

app.get("/parent/portal", requiresAuth(), (request, response) => {
    let dict = null;
    const db = getDatabase();
    const starCountRef = ref(db, "data/parent/" + request.oidc.user.sub + "/children");
    onValue(starCountRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            dict = data;
        } else {
            dict = null;
        }
    });

    response.send(mainParentHomePage(URL, request.oidc.user, dict));
});

app.get("/parent/codeCreated", requiresAuth(), (request, response) => {
    let dict = null;
    const db = getDatabase();
    const starCountRef = ref(db, "data/parent/" + request.oidc.user.sub + "/children");
    onValue(starCountRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            dict = data;
        } else {
            dict = null;
        }
    });

    response.send(mainParentHomePage(URL, request.oidc.user, dict, {popupShow: true, popupTitle: "", popupMessage: "Your code has been created successfully"}));
})

app.get("/child/login", (request, response) => {
    response.send(ChildLoginPage(URL));
});

app.get("/child/portal", async (request, response) => {
    try {
        const db = getDatabase();

        const sessionToken = request.cookies["child_session_token"];
        const getChildSession = ref(db, "sessions/" + sessionToken + "/userID");
        const sessionSnapshot = await get(getChildSession);
        const ChildSessionData = sessionSnapshot.val();
        
        if (!ChildSessionData) {
            return response.send("error0");
        }


        const ChildParentID = ref(db, "data/child/" + ChildSessionData + "/parentID");
        const parentSnapshot = await get(ChildParentID);
        const ChildParentDataone = parentSnapshot.val();

        if (!ChildParentDataone) {
            return response.send("error1");
        }


        const childrenData = ref(db, "data/parent/" + ChildParentDataone + "/children/" + ChildSessionData);
        const childrenSnapshot = await get(childrenData);
        const childrenDatatwo = childrenSnapshot.val();

        if (!childrenDatatwo) {
            return response.send("error2");
        }


        const childTasks = ref(db, "data/parent/" + ChildParentDataone + "/children/" + ChildSessionData + "/childdata/tasks");
        const tasksSnapshot = await get(childTasks);
        const childcheckdata = tasksSnapshot.val();


        return response.send(
            mainChildHomePage(URL, [
                { tasks: childcheckdata ? childcheckdata : null, user: {username: childrenDatatwo.Name, userID: ChildSessionData, coins: childrenDatatwo.Coins} }
            ])
        );
    } catch (error) {
        console.error("Error occurred while fetching child portal data:", error);
        return response.status(500).send("An error occurred while loading the portal.");
    }
});


app.post("/child/signup", (request, response) => {
    let firstname = request.body.firstname;
    let age = request.body.age;
    let loginid = request.body.parentid;
    if (firstname && age && loginid) {
        const dbRef = ref(getDatabase(firebaseapp));
        get(child(dbRef, `login/child/codes/` + loginid))
            .then((snapshot) => {
                if (snapshot.exists()) {
                    const data = snapshot.val();
                    if (data.Name.toLowerCase() == firstname.toLowerCase() && Number(data.Age) == Number(age)) {
                        const db = getDatabase(firebaseapp);
                        const childUserID = uuid();
                        set(ref(db,"/data/parent/" + data.ParentID + "/children/" + childUserID), {
                            Name: firstname,
                            Age: age,
                            Coins: 0
                        });

                        set(ref(db,"/data/child/" + childUserID), {
                            parentID: data.ParentID,
                        });

                        const sessionToken = uuid();
                        const expiresAtNum = new Date(Date.now() + 8 * 3600000);
                        set(ref(db, "sessions/" + sessionToken), {
                            expiresAt: expiresAtNum,
                            userID: childUserID,
                        });

                        response.cookie("child_session_token", sessionToken, {
                            maxAge: expiresAtNum,
                        });

                        remove(ref(db, `login/child/codes/` + loginid));

                        response.redirect("/child/portal");
                    }
                } else {
                    response.send("idk random eroor");
                }
            })
            .catch((error) => {
                console.error(error);
            });
    }
});

app.post("/child/auth", (request, response) => {
    let loginid = request.body.loginid;
    if (loginid) {
        const dbRef = ref(getDatabase(firebaseapp));
        get(child(dbRef, `login/child/codes/` + loginid))
            .then((snapshot) => {
                if (snapshot.exists()) {
                    const data = snapshot.val();
                    const db = getDatabase();
                    if (data.LoginCode == true) {
                        
                        const sessionToken = uuid();
                        const expiresAtNum = new Date(Date.now() + 8 * 3600000);
                        set(ref(db, "sessions/" + sessionToken), {
                            expiryDate: expiresAtNum,
                            userID: data.ChildID,
                        });

                        response.cookie("child_session_token", sessionToken, {
                            maxAge: expiresAtNum,
                        });

                        remove(ref(db, `login/child/codes/` + loginid));

                        response.redirect("/child/portal");
                    }
                } else {
                    response.send("idk random eroor");
                }
            })
            .catch((error) => {
                console.error(error);
            });
    }
});

app.post("/parent/create/child/signup", (request, response) => {
    const newCode = makeUpperNumberCode(6)
    
    const db = getDatabase();
    set(ref(db, "login/child/codes/" + newCode), {
        Name: request.body.firstname,
        Age: Number(request.body.age),
        LoginCode: false,
        ParentID: request.oidc.user.sub
    });

    let dict = null;
    const starCountRef = ref(db, "data/parent/" + request.oidc.user.sub + "/children");
    onValue(starCountRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            dict = data;
        } else {
            dict = null;
        }
    });

    response.send(mainParentHomePage(URL, request.oidc.user, dict, [{popupShow: true, popupTitle: "Signup Code Created.", popupMessage: `
        Code: ${newCode}
        Name: ${request.body.firstname}
        Age: ${request.body.age}
    `, popupReturnURL: URL + "/parent/portal"}]));
})

app.post("/parent/create/child/login", (request, response) => {
    let childID = request.query.childid
    const dbRef = ref(getDatabase(firebaseapp));
    get(child(dbRef, "data/parent/" + request.oidc.user.sub + "/children/" + childID))
    .then((snapshot) => {
        if (snapshot.exists()) {
            const data = snapshot.val();
            const db = getDatabase(firebaseapp);
            if (data) {
                const newCode = makeUpperNumberCode(8)

                set(ref(db, "login/child/codes/" + newCode), {
                    LoginCode: true,
                    ChildID: childID
                });

                let dict = null;
                const starCountRef = ref(db, "data/parent/" + request.oidc.user.sub + "/children");
                onValue(starCountRef, (snapshot) => {
                    const data = snapshot.val();
                    if (data) {
                        dict = data;
                    } else {
                        dict = null;
                    }
                });
                
                response.send(mainParentHomePage(URL, request.oidc.user, dict, [{popupShow: true, popupTitle: data.Name + "'s Login Code Created", popupMessage: `
                    Code: ${newCode}
                `, popupReturnURL: URL + "/parent/portal"}]));
            } else {
                response.status(404)
            }
        } else {
            response.send("idk random eroor");
        }
    })
    .catch((error) => {
        console.error(error);
    });
})

app.post("/parent/create/child/task", (request, response) => {
    let childID = request.query.childid
    let taskname = request.body.taskname
    let coinsamn = request.body.coinsamn
    let parentapprove = request.body.parentapprove
    const dbRef = ref(getDatabase(firebaseapp));
    get(child(dbRef, "data/parent/" + request.oidc.user.sub + "/children/" + childID))
    .then((snapshot) => {
        if (snapshot.exists()) {
            const data = snapshot.val();
            const db = getDatabase(firebaseapp);
            if (data) {
                if (parentapprove == undefined) { parentapprove = false } else { parentapprove = true };
                const taskID = uuid();
                set(ref(db, "data/parent/" + request.oidc.user.sub + "/children/" + childID + "/childdata/tasks/" + taskID), {
                    taskname: taskname,
                    coinsamount: coinsamn,
                    parentapproval: parentapprove
                });
        
                let dict = null;
                const starCountRef = ref(db, "data/parent/" + request.oidc.user.sub + "/children");
                onValue(starCountRef, (snapshot) => {
                    const data = snapshot.val();
                    if (data) {
                        dict = data;
                    } else {
                        dict = null;
                    }
                });
                        
                response.send(mainParentHomePage(URL, request.oidc.user, dict, [{popupShow: true, popupTitle: "Task Created For: " + data.Name, popupMessage: `
                    Sucsessfully Created Task!

                    Task Name: ${taskname}
                    Coins Awarded: ${coinsamn}
                `, popupReturnURL: URL + "/parent/portal"}]));
            } else {
                response.send(mainParentHomePage(URL, request.oidc.user, null, [{popupShow: true, popupTitle: "Error", popupMessage: `
                    Error While Creating Task.
                `, popupReturnURL: URL + "/parent/portal"}]));
            }
        } else {
            response.send(mainParentHomePage(URL, request.oidc.user, null, [{popupShow: true, popupTitle: "Error", popupMessage: `
                Error While Creating Task.
            `, popupReturnURL: URL + "/parent/portal"}]));
        }
    })
    .catch((error) => {
        response.send(mainParentHomePage(URL, request.oidc.user, null, [{popupShow: true, popupTitle: "Error", popupMessage: `
            Error While Creating Task.
            Error Message: ${error}
        `, popupReturnURL: URL + "/parent/portal"}]));
    });
})


/// LOGOUT

app.get("/parent/logout", (req, res) => {
    res.oidc.logout({
        returnTo: `${URL}/`,
    });
});

app.get("/child/logout", async (req, res) => {
    // Revoke the session tokens if available
    if (req.cookies.tokenSet) {
        client.revoke(req.cookies.child_session_token);
    }

    // Clear cookies and redirect back to index (which will lead back to login)
    res.clearCookie("child_session_token").redirect("/");
});

const options = {
    key: fs.readFileSync("HttpCert/server.key"),
    cert: fs.readFileSync("HttpCert/server.cert"),
};

server.listen(port, function (req, res) {
    console.log(`Server started at port ${port}`);
});
