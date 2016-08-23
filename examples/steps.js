const status = require('../status.js');
const console = status.console();

console.log('Starting a simple status bar to run while doing work.\n');

var job = status.addItem('job', {
  steps: [
    'Adding hidden agendas',
    'articulating splines',
    'Factoring pay scale',
    'Splatting transforms'
  ]
});

status.start({ pattern: '{spinner.cyan} {job.step}' });


var doneJob = () => {
  job.doneStep(job.count % 2);
  if(job.count >= job.steps.length) {
    status.stop();
    return console.log('All jobs completed!');
  }
  doFakeWork();
}

var doFakeWork = () => setTimeout(doneJob, 1000);
doFakeWork();
