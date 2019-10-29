// store elements in memory - avoid slow DOM search process
var button              = document.querySelector("button");
var question_container  = document.querySelector("#question_container");
var answer_field        = document.querySelector("#answer");

var result = {
    task_times: [],
    total_time: 0,      // milliseconds
    answers: [],

    // mean_all_tasks: 0,
    // mean_colour_tasks: 0,
    // mean_no_colour_tasks: 0,
    // mean_diff: 0    // if minus; colour took longer
}

var personal = {
    gender: "m",
    has_deficiency: false,
    experience: "novice",
    experience_in_years: 1,
    study_programme: "",
    know_lang: true,
    know_semantic: false,
    uses_CC: "",
    uses_dark_mode: false,
    double_indent: false
}


var TYPES = ["white", "white", "semantic", "semantic", "syntax", "syntax"];

// Fisher-Yates Shuffle
function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

// shuffle and override default
TYPES = shuffle(TYPES);

var tasks = [
    {   url: "",
        question:"What is the value of 'bar'?",
        correct_answer: "",
        answer_given: "",
        code: "",
        type: "consent",
        time_at_completion: 0,
        time_spent: 0,
        cc: ""
    },
    {   url: "",
        question:"What is the value of 'bar'?",
        correct_answer: "15",
        answer_given: "",
        code: "",
        type: "task",
        time_at_completion: 0,
        time_spent: 0,
        cc: TYPES[0]
    },

    {   url: "",
        question:"What is the value of 'bar'?",
        correct_answer: "2",
        answer_given: "",
        code: "",
        type: "task",
        time_at_completion: 0,
        time_spent: 0,
        cc: TYPES[1]
    },
    {   url: "",
        question:"What is the value of 'bar'?",
        correct_answer: "10",
        answer_given: "",
        code: "",
        type: "task",
        time_at_completion: 0,
        time_spent: 0,
        cc:  TYPES[2]
    },
    {   url: "",
        question:"What is the value of 'bar'?",
        correct_answer: "10",
        answer_given: "",
        code: "",
        type: "task",
        time_at_completion: 0,
        time_spent: 0,
        cc: TYPES[3]
    },
    {
        url: "",
        question:"What is the value of 'bar'?",
        correct_answer: "10",
        answer_given: "",
        code: "",
        type: "task",
        time_at_completion: 0,
        time_spent: 0,
        cc: TYPES[4]
    },
    {
        url: "",
        question:"What is the value of 'bar'?",
        correct_answer: "18",
        answer_given: "",
        code: "",
        type: "last_task",
        time_at_completion: 0,
        time_spent: 0,
        cc: TYPES[5]
    },
    {
        url: "",
        question:"What is the value of 'bar'?",
        correct_answer: "",
        answer_given: "",
        code: "",
        type: "ending",
        time_at_completion: 0,
        time_spent: 0,
        cc: ""
    }
];

// where in the experiment process we currently are
var current_index = 0;
var button_text = "Start test";

// decide the tasks image
tasks.forEach(function(task, index) {
    if(index > 0 && index <= 4) {//< tasks.length - 1) {
        if (task.cc === "white")
            task.url = "img/task" + index + "/white" + ".png";
        else if (task.cc === "syntax")
            task.url = "img/task" + index + "/syntax" + ".png";
        else if (task.cc === "semantic")
            task.url = "img/task" + index + "/semantic" + ".png";

        insertImage(task, index); // still need this one though
    }

    // lazy - because PNG and png
    if(index === 5 || index === 6) {
        if (task.cc === "white")
            task.url = "img/task" + index + "/white" + ".PNG";
        else if (task.cc === "syntax")
            task.url = "img/task" + index + "/syntax" + ".PNG";
        else if (task.cc === "semantic")
            task.url = "img/task" + index + "/semantic" + ".PNG";

        insertImage(task, index); // still need this one though
    }
});


// give last page id value of task{last_index}
var last_task = document.querySelector(".el");
last_task.setAttribute("id", "task" + (tasks.length - 1));

// get started - show first task
show(0);

// hide the question at start
document.querySelector("#question_container").style.display = "none";
button.innerHTML = button_text;

// all progress logic - progress/state change only happens on button click
button.addEventListener("click", function() {
    const TYPE = tasks[current_index].type;
    record_data();
    changeButtonText("NEXT");


    if(TYPE === "consent") {
        showElement("#question_container");
    }
    if(TYPE === "task") {
        saveAnswer();
    }
    if(TYPE === "last_task") {
        saveAnswer();
        hideElement("#question_container");
        hideElement("button");
        calculate_time_spent_on_each_tasks();
        calculate_total_time();
        saveResults();
    }

    show(++current_index);
    const QUESTION = tasks[current_index].question;     // next page/question/task
    changeQuestion(QUESTION);                           // insert the text for the next question to display... do it in show? or after
    resetAnswer();
    answer_field.focus();                               // focus the answer field automatically when moving to the next task
});


//////////////////////////////////////
function record_data() {
    tasks[current_index].time_at_completion = new Date().getTime();
    tasks[current_index].answer_given = document.querySelector("#answer").value; //this doesnt really do anything anymore due to the line below
}


//////////////////////////////////////
function changeButtonText(text) {
    button_text = text;
    button.innerHTML = button_text;
}


//////////////////////////////////////
function show(nr) {
    hide_all_tasks();
    if(nr < tasks.length)
        document.querySelector("#task"+nr).style.display = "block";
    else
        console.log("No more tasks to show");
}


//////////////////////////////////////
function hide_all_tasks() {
    tasks.forEach(function(task, index) {
        document.querySelector("#task"+index).style.display = "none";
    });
}


//////////////////////////////////////
function saveResults() {
    // Create a root reference
    var storageRef = firebase.storage().ref();

    // Create a reference to file
    var timestamp = new Date().getTime();
    var textfileRef = storageRef.child('filetoupload'  + timestamp + '.txt');

    // create a new, "unique", file to upload - result is stringified and put in the file
    var file = new File([JSON.stringify(result)], "filetoupload" + timestamp + ".txt", {type: "text/plain"}); // use the Blob or File API

    // upload
    textfileRef.put(file).then(function(snapshot) {
      console.log('Uploaded a blob or file!');
      console.log(snapshot);
    });
}


//////////////////////////////////////
function insertImage(task, index) {
    var img = document.createElement("img");
    img.setAttribute("id", "task" + index);
    img.src = task.url;
    document.querySelector("#content_container").append(img);
    img.style.display = "none";
}



/**
 *  Statistical analysis
 */
//////////////////////////////////////
function calculate_total_time() {
    var sum = 0;

    result.task_times.forEach(function(time) {
        sum += time.time;
    });
    result.total_time = sum;
}


//////////////////////////////////////
function calculate_time_spent_on_each_tasks() {
    tasks.forEach(function(task, index) {
        // dont calc for first, can for last, it doesnt matter then
        if(index > 0  && index < tasks.length - 1) {
            var time_spent = (task.time_at_completion - tasks[index - 1].time_at_completion) / 1000;
            console.log("answer: " + task.correct_answer + " index:" + index + " timespent:" + time_spent);

            result.task_times.push({time: time_spent, cc: task.cc});

        }
    });
}

// doesnt work with semantic - old function
//////////////////////////////////////
function calcMeans() {
    var mean_c = mean_nc = 0;
    result.mean_all_tasks = result.total_time / result.task_times.length;

    result.task_times.forEach(function(task_time) {
        if(task_time.time.cc === true)  // white
            mean_nc += task_time.time;
        else                            //colour
            mean_c += task_time.time;
    });

    result.mean_colour_tasks = mean_c / result.task_times.length;
    result.mean_no_colour_tasks = mean_nc /  result.task_times.length;

    // if minus; colour took longer
    result.mean_diff = result.mean_no_colour_tasks - result.mean_colour_tasks;
}


function calcMedians() {
    result.task_times.forEach(function(task_time) {
        if(task_time.time.cc === true) {
            result.task_times.sort(function(a, b) { return a - b });
            mean_nc += task_time.time;
        }
        else {
            mean_c += task_time.time;
        }
    });
}


/**
 * ALIASES
 */
//////////////////////////////////////
function changeQuestion(text) {
    document.querySelector("#question").innerHTML = text;
}

//////////////////////////////////////
function saveAnswer() {
    result.answers.push(document.querySelector("#answer").value);
}


//////////////////////////////////////
function resetAnswer() {
    document.querySelector("#answer").value = "";
}


//////////////////////////////////////
function hideElement(el) {
    document.querySelector(el).style.display = "none";
}


//////////////////////////////////////
function showElement(el) {
    document.querySelector(el).style.display = "block";
}
