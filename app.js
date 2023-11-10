const express = require("express");
const { open } = require("sqlite");
const path = require("path");
const sqlite3 = require("sqlite3");

const dbPath = path.join(__dirname, "todoApplication.db");

const app = express();
app.use(express.json());

const format = require("date-fns/format");
const isMatch = require("date-fns/isMatch");
const isValid = require("date-fns/isValid");
let db = null;
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const convertSnakeCaseToCamelCase = (requestBody) => {
  return {
    id: requestBody.id,
    todo: requestBody.todo,
    priority: requestBody.priority,
    status: requestBody.status,
    category: requestBody.category,
    dueDate: requestBody.due_date,
  };
};

const hasOnlyStatusProperty = (requestQuery) => {
  return requestQuery.status !== undefined;
};
const hasOnlyPriorityProperty = (requestQuery) => {
  return requestQuery.priority !== undefined;
};
const hasOnlySearch_qProperty = (requestQuery) => {
  return requestQuery.search_q !== undefined;
};
const hasOnlyCategoryProperty = (requestQuery) => {
  return requestQuery.category !== undefined;
};

const hasOnlyTodoProperty = (requestQuery) => {
  return requestQuery.todo !== undefined;
};

const hasOnlyDueDateProperty = (requestQuery) => {
  return requestQuery.dueDate !== undefined;
};

const hasStatusAndPriorityProperty = (requestQuery) => {
  return (
    requestQuery.status !== undefined && requestQuery.priority !== undefined
  );
};
const hasCategoryAndStatusProperty = (requestQuery) => {
  return (
    requestQuery.category !== undefined && requestQuery.status !== undefined
  );
};

const hasCategoryAndPriorityProperty = (requestQuery) => {
  return (
    requestQuery.category !== undefined && requestQuery.priority !== undefined
  );
};

app.get("/todos/", async (request, response) => {
  const { status, priority, search_q = "", category } = request.query;
  let dbQuery = null;
  let dbResponse = null;
  switch (true) {
    case hasOnlyStatusProperty(request.query):
      if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
        dbQuery = `SELECT * FROM todo WHERE status LIKE '${status}'`;
        dbResponse = await db.all(dbQuery);
        response.send(
          dbResponse.map((eachId) => convertSnakeCaseToCamelCase(eachId))
        );
      } else {
        response.status(400);
        response.send("Invalid Todo Status");
      }
      break;
    case hasOnlyPriorityProperty(request.query):
      if (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {
        dbQuery = `SELECT * FROM todo WHERE priority LIKE '${priority}'`;
        dbResponse = await db.all(dbQuery);
        response.send(
          dbResponse.map((eachId) => convertSnakeCaseToCamelCase(eachId))
        );
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }
      break;
    case hasOnlySearch_qProperty(request.query):
      dbQuery = `SELECT * FROM todo WHERE todo LIKE '%${search_q}%'`;
      dbResponse = await db.all(dbQuery);
      response.send(
        dbResponse.map((eachId) => convertSnakeCaseToCamelCase(eachId))
      );
      break;
    case hasOnlyCategoryProperty(request.query):
      if (
        category === "WORK" ||
        category === "HOME" ||
        category === "LEARNING"
      ) {
        dbQuery = `SELECT * FROM todo WHERE category LIKE '${category}'`;
        dbResponse = await db.all(dbQuery);
        response.send(
          dbResponse.map((eachId) => convertSnakeCaseToCamelCase(eachId))
        );
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
      break;
    case hasStatusAndPriorityProperty(request.query):
      if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
        if (
          priority === "HIGH" ||
          priority === "MEDIUM" ||
          priority === "LOW"
        ) {
          dbQuery = `SELECT * FROM todo WHERE status LIKE '${status}' AND priority LIKE '${priority}'`;
          dbResponse = await db.all(dbQuery);
          response.send(
            dbResponse.map((eachId) => convertSnakeCaseToCamelCase(eachId))
          );
        } else {
          response.status(400);
          response.send("Invalid Todo Priority");
        }
      } else {
        response.status(400);
        response.send("Invalid Todo Status");
      }
      break;
    case hasCategoryAndStatusProperty(request.query):
      if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
        if (
          category === "WORK" ||
          category === "HOME" ||
          category === "LEARNING"
        ) {
          dbQuery = `SELECT * FROM todo WHERE category LIKE '${category}' AND status LIKE '${status}'`;
          dbResponse = await db.all(dbQuery);
          response.send(
            dbResponse.map((eachId) => convertSnakeCaseToCamelCase(eachId))
          );
        } else {
          response.status(400);
          response.send("Invalid Todo Category");
        }
      } else {
        response.status(400);
        response.send("Invalid Todo Status");
      }
      break;
    case hasCategoryAndPriorityProperty(request.query):
      if (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {
        if (
          category === "WORK" ||
          category === "HOME" ||
          category === "LEARNING"
        ) {
          dbQuery = `SELECT * FROM todo WHERE category LIKE '${category}' AND priority LIKE '${priority}'`;
          dbResponse = await db.all(dbQuery);
          response.send(
            dbResponse.map((eachId) => convertSnakeCaseToCamelCase(eachId))
          );
        } else {
          response.status(400);
          response.send("Invalid Todo Category");
        }
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }
      break;
  }
});

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const dbQuery = `SELECT * FROM todo WHERE id = ${todoId}`;
  const dbResponse = await db.get(dbQuery);
  response.send(convertSnakeCaseToCamelCase(dbResponse));
});

app.get("/agenda/", async (request, response) => {
  const { date } = request.query;
  if (isMatch(date, "yyyy-MM-dd")) {
    const newDate = format(new Date(date), "yyyy-MM-dd");
    const dbQuery = `SELECT * FROM todo WHERE due_date LIKE '${newDate}'`;
    dbResponse = await db.all(dbQuery);
    response.send(
      dbResponse.map((eachId) => convertSnakeCaseToCamelCase(eachId))
    );
  } else {
    response.status(400);
    response.send("Invalid Due Date");
  }
});

app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status, category, dueDate } = request.body;
  if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
    if (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {
      if (
        category === "WORK" ||
        category === "HOME" ||
        category === "LEARNING"
      ) {
        if (isMatch(dueDate, "yyyy-MM-dd")) {
          const newDate = format(new Date(dueDate), "yyyy-MM-dd");
          const dbQuery = `INSERT INTO todo (id,todo,priority,status,category,due_date) 
                            VALUES(
                                ${id},
                                '${todo}',
                                '${priority}',
                                '${status}',
                                '${category}',
                                '${newDate}'
                            )`;
          await db.run(dbQuery);
          response.send("Todo Successfully Added");
        } else {
          response.status(400);
          response.send("Invalid Due Date");
        }
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
    } else {
      response.status(400);
      response.send("Invalid Todo Priority");
    }
  } else {
    response.status(400);
    response.send("Invalid Todo Status");
  }
});

app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const { todo, priority, status, category, dueDate } = request.body;
  let dbQuery = null;
  switch (true) {
    case hasOnlyStatusProperty(request.body):
      if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
        dbQuery = `UPDATE todo SET status = '${status}' WHERE id = ${todoId}`;
        await db.run(dbQuery);
        response.send("Status Updated");
      } else {
        response.status(400);
        response.send("Invalid Todo Status");
      }
      break;
    case hasOnlyPriorityProperty(request.body):
      if (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {
        dbQuery = `UPDATE todo SET priority = '${priority}' WHERE id = ${todoId}`;
        await db.run(dbQuery);
        response.send("Priority Updated");
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }
      break;
    case hasOnlyTodoProperty(request.body):
      dbQuery = `UPDATE todo SET todo = '${todo}' WHERE id = ${todoId}`;
      await db.run(dbQuery);
      response.send("Todo Updated");
      break;
    case hasOnlyCategoryProperty(request.body):
      if (
        category === "WORK" ||
        category === "HOME" ||
        category === "LEARNING"
      ) {
        dbQuery = `UPDATE todo SET category = '${category}' WHERE id = ${todoId}`;
        await db.run(dbQuery);
        response.send("Category Updated");
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
      break;
    case hasOnlyDueDateProperty(request.body):
      if (isMatch(dueDate, "yyyy-MM-dd")) {
        const newDate = format(new Date(dueDate), "yyyy-MM-dd");
        dbQuery = `UPDATE todo SET due_date = '${newDate}' WHERE id = ${todoId}`;
        await db.run(dbQuery);
        response.send("Due Date Updated");
      } else {
        response.status(400);
        response.send("Invalid Due Date");
      }
      break;
  }
});

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const dbQuery = `DELETE FROM todo WHERE id = ${todoId}`;
  await db.run(dbQuery);
  response.send("Todo Deleted");
});

module.exports = app;
