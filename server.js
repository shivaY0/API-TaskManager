const express = require('express');
const mongoose = require('mongoose');
const moment = require('moment')
const {TaskList,Task} = require('./model');
const mongo = require('./dbConnect')


const app = express();
app.use(express.json());


                                                    // Task -1 

// taskList save into db
app.post('/api/tasklist',async(req,res)=>{
    const {name,description,active} = req.body;
    console.log(name,description,active)
    if (!name ) {
        return res.status(400).json({ error :"some input data is not entered properly" });
      }
      const taskList = new TaskList({
        name,
        description,
        active
      });
      await taskList.save();
    
      res.status(201).json({ success: true, taskList });
    })

  
                                                        // Task - 2

// create task and save into db after checking/changing all given condition
app.post("/api/createtask", async (req, res) => {
  let { name, description, dueDate, period, periodType, taskListId } = req.body;

  // Validate inputs , description ->np
  if (!name || !dueDate || !period || !periodType || !taskListId) {
    return res.status(400).json({ error :"some input data is setted properly" });
  }


  //validate  periodType 
  const validPeriodTypes = ["monthly", "quarterly", "yearly"];
  if (!validPeriodTypes.includes(periodType)) {
    return res.status(400).json({ error: "Invalid period type" });
  }

  //checking and converting duedate
  const momentDueDate = moment(dueDate, "DD-MM-YYYY");
  if (!momentDueDate.isValid()) {
    return res.status(400).json({ error: "Invalid due date" });
  }

  // checking and converting period
  const momentPeriod = moment(period, "MMM YYYY");
  if (!momentPeriod.isValid()) {
    return res.status(400).json({ error: "Invalid period" });
  }


// just removing last to letter 'ly' from periodType to make it easy
  periodType = periodType.slice(0,-2);

  //  Validate due date is after end of period
  const momentEndOfPeriod = momentPeriod.clone().endOf(periodType);
  console.log(momentEndOfPeriod,momentDueDate);
  if (momentDueDate.isBefore(momentEndOfPeriod)) {
    return res.status(400).json({ error: "Due date should be after end of period" });
  }

  // Create task and save to database
  const task = new Task({
    name,
    description,
    dueDate: momentDueDate.toDate(),
    period: momentPeriod.format(),
    periodType,
    taskListId
  });
  await task.save();

  res.status(201).json({ success: true, task });
});

                                                        // Task -3
// Get the data and search filter 
app.get("/api/tasklist", async (req, res) => { 
  let { page , limit,searchText } = req.query;
   searchText = searchText || "";
   page = page || 1;
   limit = limit || 10;

  // Calculate skip and limit for pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const count = await Task.countDocuments({ $or: [
    { name: { $regex: searchText, $options: "i" } },
    { description: { $regex: searchText, $options: "i" } }
  ]});

  // Get tasks from database
  const tasks = await Task.find({ $or: [
    { name: { $regex: searchText, $options: "i" } },
    { description: { $regex: searchText, $options: "i" } }
  ]})
    .sort({ period: -1, dueDate: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .populate("taskListId");

    
const getTaskListName = async (id) => {
    console.log(id)
    const taskListName = await TaskList.findById(id);
    if (!taskListName) {
      return "notasklist";// or error 
    }
    return taskListName.name;
  };

  const taskList = await Promise.all(tasks.map(async (task) => {  
    const taskListName = await getTaskListName(task.taskListId);
    console.log(taskListName)
    return {
      name: task.name,
      description: task.description,
      dueDate: moment(task.dueDate).format("DD-MM-YYYY"),
      period: moment(task.period).format("MMM YYYY"),
      periodType: task.periodType,
      taskListName: taskListName,
    };
  }));
  
  res.json({ count, tasks: taskList });
});

app.listen(3000, () => {
  console.log("Server started on port 3000");
});

