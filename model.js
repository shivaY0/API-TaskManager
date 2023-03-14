
const mongoose = require('mongoose');
const mongo = require('./dbConnect');
const tasklistSchema = new mongoose.Schema({
    name:String,
    description:String,
    active:{
        type: Boolean,
        default: true,
      }
})

const taskSchema = new mongoose.Schema({
    name: String,
    description: String,
    dueDate: Date,
    period: String,
    periodType: String,
    taskListId: String,
  
  });
  const TaskList = mongoose.model("TaskList",tasklistSchema);
  const Task = mongoose.model("Task", taskSchema);
module.exports = {TaskList,Task}