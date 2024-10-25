const port = 2894;
const URL = "https://money-ninjas.jack-masters.co.uk";

const config = {
    authRequired: false,


    auth0Logout: true,
    secret: "Xiqwuehr725y9u32rjiof239r-238rjcoj_EiSHZ5M5q9ueJdrKKYUt23845jifj20r0efkl2GVOjH6xdfcESASDJjdisofjksdfo3o2fbsjh23189hf893I",
    baseURL: URL,
    clientID: "cXn9dnYcFgOL274PSl0vajMnVTdYe8wW",
    issuerBaseURL: "https://login.money-ninjas.jack-masters.co.uk",
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
import { makeUpperLowerNumberCode, makeUpperNumberCode, makeLowerNumberCode } from "./functions/CodeFunctions.js";
import { v4 as uuid } from "uuid";
import { HomeLoginPage } from "./Html/login/HomeLogin.js";
import { mainParentHomePage } from "./Html/parent/mainHome.js";
import { mainChildHomePage } from "./Html/child/mainHome.js";
import { ChildLoginPage } from "./Html/login/ChildLogin.js";
import { initializeApp } from "firebase/app";
import * as fs from 'fs';
import * as https from 'https';
import { getDatabase, ref, onValue, set, get, child, remove, update } from "firebase/database";
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
//app.use("/favicon.ico", express.static("./public/money-ninjas-logo.ico"));
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

function createNewSocketParentAuthID(parentID) {
    const db = getDatabase(firebaseapp);
    const AuthID = makeLowerNumberCode(64);
    set(ref(db, "socket/auth/" + AuthID), {
        ID: parentID,
        Type: "Parent"
    });

    return AuthID
}

function createNewSocketChildAuthID(childID, parentID) {
    const db = getDatabase(firebaseapp);
    const AuthID = makeLowerNumberCode(64);
    set(ref(db, "socket/auth/" + AuthID), {
        ID: childID,
        ParentID: parentID,
        Type: "Child"
    });

    return AuthID
}


socketio.on('connection', (socket) => {
    console.log("User Connected To Service.")
    socket.on('disconnect', () => {
        console.log('User Disconnected To Service.');

    });

    socket.on('setupParentRoom', (authID) => {
        const db = getDatabase();
        const IDData = ref(db, "socket/auth/" + authID);
        onValue(IDData, (snapshot) => {
            const SnapIDdata = snapshot.val();
            if (SnapIDdata) {
                console.log(SnapIDdata.ID)
                socket.join(SnapIDdata.ID) // use socketio.to(CHILDID/PARENTID).emit(whatevr idk)
                const db = getDatabase();
                const childrenData = ref(db, "data/parent/" + SnapIDdata.ID + "/children");
                onValue(childrenData, (snapshot) => {
                    const childData = snapshot.val();
                    if (childData) {
                        socketio.to(SnapIDdata.ID).emit("newChildDataDict", childData)
                    }
                });
            }
        });
    })

    socket.on('setupChildRoom', (authID) => {
        const db = getDatabase();
        const IDData = ref(db, "socket/auth/" + authID);
        onValue(IDData, (snapshot) => {
            const SnapIDdata = snapshot.val();
            if (SnapIDdata) {
                socket.join(SnapIDdata.ID) // use socketio.to(CHILDID/PARENTID).emit(whatevr idk)
                const db = getDatabase();
                const childrenData = ref(db, "data/parent/" + SnapIDdata.ParentID + "/children/" + SnapIDdata.ID);
                onValue(childrenData, (snapshot) => {
                    const childData = snapshot.val();
                    if (childData) {
                        socketio.to(SnapIDdata.ID).emit("newChildDataDict", childData)
                    }
                });
            }
        });
    })

    socket.on('parentCreateSignup', (authID, firstname, age) => {
        const db = getDatabase();

        const starCountRef = ref(db, "socket/auth/" + authID);
        onValue(starCountRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const newCode = makeUpperNumberCode(6)
                const db = getDatabase();
                set(ref(db, "login/child/codes/" + newCode), {
                    Name: firstname,
                    Age: Number(age),
                    LoginCode: false,
                    ParentID: data.ID
                });

                socketio.to(data.ID).emit("popupShow", "Signup Code Created!", `
                    Code: ${newCode}
                    Name: ${firstname}
                    Age: ${age}
                `)
            }
        });
    })

    socket.on('parentCreateLogin', (authID, childID) => {
        const db = getDatabase();
        const starCountRef = ref(db, "socket/auth/" + authID);
        onValue(starCountRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const dbRef = ref(getDatabase(firebaseapp));
                const parentID = data.ID;
                get(child(dbRef, "data/parent/" + data.ID + "/children/" + childID))
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

                                socketio.to(parentID).emit("popupShow", "Login Code Created!", `
                                Name: ${data.Name}
                                Code: ${newCode}
                            `)
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
            }
        });
    })

    socket.on('parentCreateTask', (authID, childID, taskname, coinsamn) => {
        const db = getDatabase();

        const parentDataRef = ref(db, "socket/auth/" + authID);
        onValue(parentDataRef, (snapshot) => {
            const Parentdata = snapshot.val();
            if (Parentdata) {
                const dbRef = ref(getDatabase(firebaseapp));
                get(child(dbRef, "data/parent/" + Parentdata.ID + "/children/" + childID))
                    .then((snapshot) => {
                        if (snapshot.exists()) {
                            const data = snapshot.val();
                            const db = getDatabase(firebaseapp);
                            if (data) {
                                const taskID = uuid();
                                set(ref(db, "data/parent/" + Parentdata.ID + "/children/" + childID + "/childdata/tasks/" + taskID), {
                                    taskname: taskname,
                                    coinsamount: coinsamn,
                                    childapproved: false,
                                });

                                socketio.to(Parentdata.ID).emit("popupShow", "Task Created For: " + data.Name, `
                                Sucsessfully Created Task!

                                Task Name: ${taskname}
                                Coins Awarded: ${coinsamn}
                            `)
                            } else {
                                const db = getDatabase();
                                const starCountRef = ref(db, "socket/auth/" + authID);
                                onValue(starCountRef, (snapshot) => {
                                    const data = snapshot.val();
                                    if (data) {
                                        socketio.to(data.ID).emit("popupShow", "Error: 1903", `
                                        Error While Creating Task.
                                    `)
                                    }
                                });
                            }
                        } else {
                            const db = getDatabase();
                            const starCountRef = ref(db, "socket/auth/" + authID);
                            onValue(starCountRef, (snapshot) => {
                                const data = snapshot.val();
                                if (data) {
                                    socketio.to(data.ID).emit("popupShow", "Error: 1903", `
                                    Error While Creating Task.
                                `)
                                }
                            });
                        }
                    })
                    .catch((error) => {
                        const db = getDatabase();
                        const starCountRef = ref(db, "socket/auth/" + authID);
                        onValue(starCountRef, (snapshot) => {
                            const data = snapshot.val();
                            if (data) {
                                socketio.to(data.ID).emit("popupShow", "Error: 1903", `
                                Error While Creating Task.

                                Error Message: ${error}
                            `)
                            }
                        });
                    });
            }
        });
    })

    socket.on('parentTaskComplete', (authID, childID, taskID) => {
        const db = getDatabase();
        const parentAuthData = ref(db, "socket/auth/" + authID);
        onValue(parentAuthData, (snapshot) => {
            const authData = snapshot.val();
            if (authData) {
                const parentChildrenData = ref(getDatabase(firebaseapp));
                get(child(parentChildrenData, "data/parent/" + authData.ID + "/children/" + childID)).then((snapshot) => {
                    if (snapshot.exists()) {
                        const Childdata = snapshot.val();
                        if (Childdata) {
                            const parentChildTaskData = ref(getDatabase(firebaseapp));
                            get(child(parentChildTaskData, "data/parent/" + authData.ID + "/children/" + childID + "/childdata/tasks/" + taskID)).then((snapshot) => {
                                if (snapshot.exists()) {
                                    const Taskdata = snapshot.val();
                                    if (Taskdata) {
                                        const db = getDatabase();
                                        remove(ref(db, "data/parent/" + authData.ID + "/children/" + childID + "/childdata/tasks/" + taskID));

                                        let coinsAmnt = Number(Childdata.Coins) + Number(Taskdata.coinsamount)
                                        update(ref(db, "data/parent/" + authData.ID + "/children/" + childID), {
                                            Coins: coinsAmnt,
                                        });

                                        socketio.to(authData.ID).emit("popupShow", "Task Completed: " + Taskdata.taskname, `
                                            Sucsessfully Set Task To Completed!

                                            Given Child ${Taskdata.coinsamount} Coins.
                                        `)

                                        const dbnew = getDatabase();
                                        const parentchildData = ref(dbnew, "data/parent/" + authData.ID + "/children");
                                        onValue(parentchildData, (snapshot) => {
                                            const parchildData = snapshot.val();
                                            if (parchildData) {
                                                socketio.to(authData.ID).emit("newChildDataDict", parchildData)
                                            }
                                        });
                                        const childrenData = ref(dbnew, "data/parent/" + authData.ID + "/children/" + childID);
                                        onValue(childrenData, (snapshot) => {
                                            const childData = snapshot.val();
                                            if (childData) {
                                                socketio.to(childID).emit("newChildDataDict", childData)
                                            }
                                        });
                                    }
                                }
                            })
                        }
                    }
                })
            }
        });
    })

    socket.on('parentTaskDelete', (authID, childID, taskID) => {
        const db = getDatabase();
        const parentAuthData = ref(db, "socket/auth/" + authID);
        onValue(parentAuthData, (snapshot) => {
            const authData = snapshot.val();
            if (authData) {
                const parentChildrenData = ref(getDatabase(firebaseapp));
                get(child(parentChildrenData, "data/parent/" + authData.ID + "/children/" + childID)).then((snapshot) => {
                    if (snapshot.exists()) {
                        const Childdata = snapshot.val();
                        if (Childdata) {
                            const parentChildTaskData = ref(getDatabase(firebaseapp));
                            get(child(parentChildTaskData, "data/parent/" + authData.ID + "/children/" + childID + "/childdata/tasks/" + taskID)).then((snapshot) => {
                                if (snapshot.exists()) {
                                    const Taskdata = snapshot.val();
                                    if (Taskdata) {
                                        remove(ref(db, "data/parent/" + authData.ID + "/children/" + childID + "/childdata/tasks/" + taskID));

                                        socketio.to(authData.ID).emit("popupShow", "Task Deleted: " + Taskdata.taskname, `
                                            Sucsessfully Deleted Task!
                                        `)

                                        const dbnew = getDatabase();
                                        const parentchildData = ref(dbnew, "data/parent/" + authData.ID + "/children");
                                        onValue(parentchildData, (snapshot) => {
                                            const parchildData = snapshot.val();
                                            if (parchildData) {
                                                socketio.to(authData.ID).emit("newChildDataDict", parchildData)
                                            }
                                        });
                                        const childrenData = ref(dbnew, "data/parent/" + authData.ID + "/children/" + childID);
                                        onValue(childrenData, (snapshot) => {
                                            const childData = snapshot.val();
                                            if (childData) {
                                                socketio.to(childID).emit("newChildDataDict", childData)
                                            }
                                        });
                                    }
                                }
                            })
                        }
                    }
                })
            }
        });
    })

    socket.on('changeChildTaskCompleted', (authID, taskID, set) => {
        const db = getDatabase();

        const starCountRef = ref(db, "socket/auth/" + authID);
        onValue(starCountRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const dbRef = ref(getDatabase(firebaseapp));
                get(child(dbRef, "data/parent/" + data.ParentID + "/children/" + data.ID))
                    .then((snapshot) => {
                        if (snapshot.exists()) {
                            const childdata = snapshot.val();
                            if (childdata) {
                                const dbRef = ref(getDatabase(firebaseapp));
                                get(child(dbRef, "data/parent/" + data.ParentID + "/children/" + data.ID + "/childdata/tasks/" + taskID))
                                    .then((snapshot) => {
                                        if (snapshot.exists()) {
                                            const taskdata = snapshot.val();
                                            if (taskdata) {
                                                if (taskdata.childapproved != set) {
                                                    update(ref(db, "data/parent/" + data.ParentID + "/children/" + data.ID + "/childdata/tasks/" + taskID), {
                                                        childapproved: set,
                                                    });

                                                    const dbnew = getDatabase();
                                                    const parentchildData = ref(dbnew, "data/parent/" + childdata.ParentID + "/children");
                                                    onValue(parentchildData, (snapshot) => {
                                                        const parchildData = snapshot.val();
                                                        if (parchildData) {
                                                            socketio.to(authData.ID).emit("newChildDataDict", parchildData)
                                                        }
                                                    });
                                                    const childrenData = ref(dbnew, "data/parent/" + childdata.ParentID + "/children/" + childdata.ID);
                                                    onValue(childrenData, (snapshot) => {
                                                        const childData = snapshot.val();
                                                        if (childData) {
                                                            socketio.to(childID).emit("newChildDataDict", childData)
                                                        }
                                                    });
                                                }
                                            }
                                        }
                                    })
                            }
                        }
                    })
            }
        });
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
    const authID = createNewSocketParentAuthID(request.oidc.user.sub)
    response.send(mainParentHomePage(URL, authID));
});

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
            return response.send(mainChildHomePage(URL));
        }

        const ChildParentID = ref(db, "data/child/" + ChildSessionData + "/parentID");
        const parentSnapshot = await get(ChildParentID);
        const ChildParentDataone = parentSnapshot.val();

        if (!ChildParentDataone) {
            return response.send(mainChildHomePage(URL));
        }

        const authID = createNewSocketChildAuthID(ChildSessionData, ChildParentDataone)


        return response.send(mainChildHomePage(URL, authID));
    } catch (error) {
        return response.redirect("/login")
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
                        set(ref(db, "/data/parent/" + data.ParentID + "/children/" + childUserID), {
                            Name: firstname,
                            Age: age,
                            Coins: 0
                        });

                        set(ref(db, "/data/child/" + childUserID), {
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
