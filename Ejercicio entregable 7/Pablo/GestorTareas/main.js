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

app.use((request, response, next) =>{

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

app.get("/", (request, response) => {
    response.redirect("/login");
})

app.get("/login", (request, response) => {
    response.render("login", { errorMsg: null })
})

app.post("/login", (request, response) => {
    daoU.isUserCorrect(request.body.mail, request.body.pass, (error, successful) => {
        if(error){
            console.log(error);
        }else{
            if(successful){
                request.session.currentUser = request.body.mail;
                response.redirect("/tasks");
            }else{
                response.render("login", { errorMsg: "Dirección de correo y/o contraseña no válidos"});
            }
            //el usuario existe y contraseña correcta si true
            //si false el usuario no existe o contraseña incorrecta
        }
    })
})

app.get("/tasks", (request, response) => {
    daoT.getAllTasks("usuario@ucm.es", (error, list) =>{
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
    daoT.insertTask("usuario@ucm.es", task, (error, success)=>{
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
    daoT.deleteCompleted("usuario@ucm.es", (error, success) =>{
        if(error){
            console.log(error);
            response.status(500);
            response.end();
        } else {
            response.redirect("/tasks");
        }
    });
});