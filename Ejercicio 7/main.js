const express = require("express");
const mysql = require("mysql");
const path = require("path");
const bodyParser = require("body-parser");
const config = require("./config");
const daoTasks = require("./dao_tasks");
const daoUsers = require("./dao_users");
const taskUtils = require("./task_utils");
const session = require("express-session");
const mysqlSession = require("express-mysql-session");

const app = express();

const MySQLStore = mysqlSession(session);
const sessionStore = new MySQLStore({
    database: config.mysqlConfig.database,
    host: config.mysqlConfig.host,
    user: config.mysqlConfig.user,
    password: config.mysqlConfig.password
});

const middlewareSession = session({
    saveUninitialized: false,
    secret: "fop9paBFll24",
    resave: false,
    store: sessionStore
});

app.use(middlewareSession);
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(bodyParser.urlencoded({ extended: false }));

let pool = mysql.createPool({
    database: config.mysqlConfig.database,
    host: config.mysqlConfig.host,
    user: config.mysqlConfig.user,
    password: config.mysqlConfig.password
});

let daoT = new daoTasks.DAOTasks(pool);
let daoU = new daoUsers.DAOUsers(pool);

app.listen(config.port, function (err) {
    if (err) {
        console.log("No se ha podido iniciar el servidor.")
        console.log(err);
    } else {
        console.log(`Servidor escuchando en puerto ${config.port}.`);
    }
});

function restrictLoginTemplate(request, response, next){
    if(request.session.currentUser){
        response.redirect("/tasks");
    }
    else{
        next();
    }
}

app.get("/", restrictLoginTemplate, (request, response) => {
    response.redirect("/login");
})

app.get("/login", restrictLoginTemplate, (request, response) => {
    response.status(200);
    response.render("login", { errorMsg: null });
})

app.post("/login", restrictLoginTemplate, (request, response) => {
    daoU.isUserCorrect(request.body.mail, request.body.pass, (error, successful) => {
        if(error){
            console.log(error);
            return;
        }else{
            response.status(200);            
            if(successful){
                request.session.currentUser = request.body.mail;
                response.redirect("/tasks");
            }else{
                response.render("login", { errorMsg: "Dirección de correo y/o contraseña no válidos"});
            }
        }
    })
})

app.use((request, response, next) =>{
    if(request.session.currentUser){
        response.locals.userEmail = request.session.currentUser;
        next();
    }
    else{
        response.redirect("/login");
    }
});

app.get("/tasks", (request, response) => {
    daoT.getAllTasks(request.session.currentUser, (error, list) =>{
        if(error){
            console.log(error);
            response.status(500);
            response.end();
        }else{
            response.render("tasks", { taskList: list })
            response.end();            
        }
    });
});

app.post("/addTask", (request, response) => {
    let task = taskUtils.createTask(request.body.taskText);
    task.done = false;
    daoT.insertTask(request.session.currentUser, task, (error, success)=>{
        if(error){
            console.log(error);
            response.status(500);
            response.end();
        }else{
            response.redirect("/tasks");
        }
    });
});

app.get("/logout", (request, response) => {
   request.session.destroy();
   response.redirect("/login");
});

app.post("/finish", (request, response) => {
    daoT.markTaskDone(request.body.taskId, (error, success) => {
        if(error){
            console.log(error);
            response.status(500);
            response.end();
        } else {
            response.redirect("/tasks");
        }
    });
});

app.get("/deleteCompleted", (request, response) =>{
    daoT.deleteCompleted(request.session.currentUser, (error, success) =>{
        if(error){
            console.log(error);
            response.status(500);
            response.end();
        } else {
            response.redirect("/tasks");
        }
    });
});

app.get("/imagenUsuario", (request, response) => {
    daoU.getUserImageName(request.session.currentUser, (error, success) =>{
        if(error){
            console.log(error);
            response.status(500);
            response.end();
        }
        else{
            response.status(200);   
            if(success == null){
                response.sendFile(path.join(__dirname, "public/img/NoPerfil.png"));
            }else{
                response.sendFile(path.join(__dirname, "profile_imgs/"+success));
            }
        }
    });
});