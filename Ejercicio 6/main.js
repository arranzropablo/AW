const express = require("express");
const mysql = require("mysql");
const path = require("path");
const bodyParser = require("body-parser");
const config = require("./config");
const daoTasks = require("./dao_tasks");
const taskUtils = require("./task_utils");

const app = express();


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

app.listen(config.port, function (err) {
    if (err) {
        console.log("No se ha podido iniciar el servidor.")
        console.log(err);
    } else {
        console.log(`Servidor escuchando en puerto ${config.port}.`);
    }
});

app.get("/", (request, response) => {
    response.redirect("/tasks");
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