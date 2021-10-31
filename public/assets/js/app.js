/* global SpeechRecognition: true */

console.clear();


const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.interimResults = true;


let p = document.createElement('p');
const words = document.querySelector('.words');
words.appendChild(p);


recognition.start();
recognition.addEventListener('end', recognition.start);

let kinesis = null;
var username = prompt("What is your name?");

recognition.addEventListener('result', e => {
  const transcript = Array.from(e.results)
    .map(result => result[0])
    .map(result => result.transcript)
    .join('');

  p.textContent = transcript;


  if (e.results[0].isFinal) {
    p = document.createElement('p');
    words.appendChild(p);

    pushToKinesis(transcript);
  }

  autoScroll();
});


// Auto scroll only if required
let lastScrollHeight = document.body.scrollHeight;

function autoScroll() {
  if (document.body.scrollHeight > lastScrollHeight) {
    lastScrollHeight = document.body.scrollHeight;
    window.scrollTo(0,document.body.scrollHeight);
  }
}





AWS.config.update(awsCredentials);

AWS.config.credentials.get(function(err) {
  if (err) {
      alert('Error retrieving credentials.');
      console.error(err);
      return;
  }else{
    console.log("Credentials Loaded")
  }
  // create Amazon Kinesis service object
  kinesis = new AWS.Kinesis({
      apiVersion: '2013-12-02'
  });
});

function pushToKinesis(text){
  console.log("Start Push to kinesis " + text);
  var recordData = [];

  var record = {
    Data: username+'-'+text,
    PartitionKey: username
  };
  recordData.push(record);

  // upload data to Amazon Kinesis
  kinesis.putRecords({
    Records: recordData,
    StreamName: 'yata-sentence-stream'
  }, function(err, data) {
    if (err) {
        console.error(err);
    }
  });

  recordData = [];
}




