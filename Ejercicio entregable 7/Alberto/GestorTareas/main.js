const express = require("express");
const mysql = require("mysql");
const path = require("path");
const bodyParser = require("body-parser");
const config = require("./config");
const daoTasks = require("./dao_tasks");
const daoUsers = require("./dao_users");
const taskUtils = require("./task_utils");
const session = require("express-session");

const app = express();

let pool = mysql.createPool({
    database: config.mysqlConfig.database,
    host: config.mysqlConfig.host,
    user: config.mysqlConfig.user,
    password: config.mysqlConfig.password
});

const mysqlSession = require("express-mysql-session");
const MySQLStore = mysqlSession(session);
const sessionStore = new MySQLStore({
    host: "91.121.109.58",
    user: "usuariop1",
    password: "accesop1",
    database: "tareas"
});

const middlewareSession = session({
    saveUninitialized: false,
    secret: "ultrasecretkey",
    resave: false,
    store: sessionStore
});

let daoT = new daoTasks.DAOTasks(pool);
let daoU = new daoUsers.DAOUsers(pool);
const ficherosEstaticos = path.join(__dirname, "public");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

//Middlewares
function usuarioConectado(request, response, next) {
    if (request.session.currentUser) {
        response.locals.userEmail = request.session.currentUser;
        next()
    } else {
        response.redirect("/login.html");
    }
}

app.use(middlewareSession);
app.get("/login.html", (request, response) => {
    response.render("login", { errorMsg: null });
});

app.use(express.static(ficherosEstaticos));

app.use(bodyParser.urlencoded({ extended: false }));

app.post("/login", (request, response) => {
    let user = request.body.mail;
    daoU.isUserCorrect(user, request.body.pass, (err, result) => {
        if (err) {
            response.render("login", { errorMsg: err.message });
        } else {
            if (!result) {
                response.render("login", { errorMsg: "Usuario o contraseña incorrectos" });
            } else {
                request.session.currentUser = user;
                response.redirect("/tasks");
            }
        }
    });
});

app.get("/", (request, response) => {
    response.redirect("/login.html");
});

app.use(usuarioConectado);

app.get("/imagenUsuario", (request, response) => {
    daoU.getUserImageName(response.locals.userEmail, (err, imagen) => {
        if (err) {
            console.log(err);
            response.redirect("/login.html");
        } else {
            let ruta;
            if (imagen) {
                ruta = path.join(__dirname, "/profile_images/", imagen);
            } else {
                ruta = path.join(__dirname, "/profile_images/", "NoPerfil.png");
            }
            response.sendFile(ruta);
        }

    });
});

app.get("/logout", (request, response) => {
    request.session.destroy();
    response.redirect("/login.html");
});


app.get("/tasks", (request, response) => {
    daoT.getAllTasks(response.locals.userEmail, (err, taskList) => {
        if (err) {
            console.log(err);
            response.end();
        } else {
            response.status(200);
            response.render("tasks", { taskList: taskList, userEmail: response.locals.userEmail });
            /*console.log(tasks);
            response.end();*/
        }
    });
});

app.get("/deleteCompleted", (request, response) => {
    let usuario = response.locals.userEmail;

    daoT.deleteCompleted(usuario, err => {
        if (err) {
            console.log(err);
            response.end();
        } else {
            response.redirect("/tasks");
        }
    })
});

app.get("/finish", (request, response) => {
    let id = Number(request.query.id);
    daoT.markTaskDone(id, err => {
        if (err) {
            console.log(err);
            response.end();
        } else {
            response.redirect("/tasks");
            //response.end();
        }
    })
});
//app.use(bodyParser.urlencoded({ extended: false }));

app.post("/addTask", (request, response) => {
    let usuario = response.locals.userEmail;

    let task = createTask(request.body.taskText);

    daoT.insertTask(usuario, task, err => {
        if (err) {
            console.log(err);
            response.end();
        } else {
            response.redirect("/tasks");
        }
    })
});

//Funciones
function createTask(text) {
    let exp = /@[A-Z]+/ig;

    let tags = text.match(exp);

    let task = { text: "", tags: [] };

    task.text = text.replace(exp, "").trim();
    if (tags !== null) {
        tags.forEach(tag => task.tags.push(tag.replace("@", "")));
    }
    return task;
}

app.listen(config.port, function(err) {
    if (err) {
        console.log("No se ha podido iniciar el servidor.")
        console.log(err);
    } else {
        console.log(`Servidor escuchando en puerto ${config.port}.`);
    }
});