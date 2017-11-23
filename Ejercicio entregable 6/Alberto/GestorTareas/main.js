const express = require("express");
const mysql = require("mysql");
const path = require("path");
const bodyParser = require("body-parser");
const config = require("./config");
const daoTasks = require("./dao_tasks");
const taskUtils = require("./task_utils");

const app = express();

let pool = mysql.createPool({
    database: config.mysqlConfig.database,
    host: config.mysqlConfig.host,
    user: config.mysqlConfig.user,
    password: config.mysqlConfig.password
});

let daoT = new daoTasks.DAOTasks(pool);
const ficherosEstaticos = path.join(__dirname, "public");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(ficherosEstaticos));

app.get("/", (request, response) => {
    response.redirect("/tasks");
})

app.get("/tasks", (request, response) => {
    daoT.getAllTasks("usuario@ucm.es", (err, taskList) => {
        if (err) {
            console.log(err);
            response.end();
        } else {
            response.status(200);
            response.render("tasks", { taskList: taskList });
            /*console.log(tasks);
            response.end();*/
        }
    });
});

app.get("/deleteCompleted", (request, response) => {
    let usuario = "usuario@ucm.es";

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



app.use(bodyParser.urlencoded({ extended: false }));

app.post("/addTask", (request, response) => {
    let usuario = "usuario@ucm.es";

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