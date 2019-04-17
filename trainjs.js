$(document).ready(function () {

    // Initialize to Firebase
    var config = {
        apiKey: "AIzaSyDYsLoGo9muEk81MyAuZOAzgmMH3hNU76E",
        authDomain: "train-schedule-9b354.firebaseapp.com",
        databaseURL: "https://train-schedule-9b354.firebaseio.com",
        projectId: "train-schedule-9b354",
        storageBucket: "train-schedule-9b354.appspot.com",
        messagingSenderId: "460189908727"
    };

    firebase.initializeApp(config);

    var trainDatabase = firebase.database();

    // Create Variables
    var trainName;
    var trainDestination;
    var firstTrain;
    var trainFrequency = 0;

    $("#add-train").on("click", function() {
        event.preventDefault();
        // Storing and retreiving each new train information
        trainName = $("#train-name").val().trim();
        trainDestination = $("#train-destination").val().trim();
        firstTrain = $("#first-train").val().trim();
        trainFrequency = $("#train-frequency").val().trim();

        // Push train information to database
        trainDatabase.ref().push({
            trainName: trainName,
            trainDestination: trainDestination,
            firstTrain: firstTrain,
            trainFrequency: trainFrequency,
            dateAdded: firebase.database.ServerValue.TIMESTAMP
        });
        $("form")[0].reset();
    });

    trainDatabase.ref().on("child_added", function(childSnapshot) {
        var minutesAway;

        // Change year so first train comes before now
        var firstTrainNew = moment(childSnapshot.val().firstTrain, "hh:mm").subtract(1, "years");
       
        // Difference between the current and firstTrain
        var diffTime = moment().diff(moment(firstTrainNew), "minutes");
        var remainder = diffTime % childSnapshot.val().trainFrequency;
       
        // Calculate minutes until next train
        var minutesAway = childSnapshot.val().trainFrequency - remainder;
       
        // Next train time
        var trainArrive = moment().add(minutesAway, "minutes");
        trainArrive = moment(trainArrive).format("hh:mm");

        $("#add-row").append("<tr><td>" + childSnapshot.val().trainName
                +"</td><td>" + childSnapshot.val().trainDestination
                +"</td><td>" + childSnapshot.val().trainFrequency
                +"</td><td>" + trainArrive 
                +"</td><td>" + minutesAway + "</td></tr>");

            // This handles the errors
        }, function(errorObject) {
            console.log("Errors handled: " + errorObject.code);
    });

    trainDatabase.ref().orderByChild("dateAdded").limitToLast(1).on("child_added", function(snapshot) {
        // Change the HTML to reflect
        $("#name-display").html(snapshot.val().trainName);
        $("#destination-display").html(snapshot.val().destination);
        $("#frequency-display").html(snapshot.val().frequency);
        $("#minAway-display").html(snapshot.val().minAway);
    });
});
    