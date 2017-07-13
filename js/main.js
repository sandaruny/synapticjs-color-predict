import $ from "jquery";
import synaptic from 'synaptic'; // this line is not needed in the browser

var Neuron = synaptic.Neuron,
  Layer = synaptic.Layer,
  Network = synaptic.Network,
  Trainer = synaptic.Trainer,
  Architect = synaptic.Architect;

const padAndGiveMeTheColor = (hex) => {
  if(hex.length === 1){
    hex = '0' + hex;
  }
  return hex + hex + hex;
}

function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }

  return (Math.floor(0.299 * parseInt(color.substring(1, 3), 16)) +
    Math.floor(0.587 * parseInt(color.substring(3,5), 16)) +
    Math.floor(0.114 * parseInt(color.substring(5,7), 16))).toString(16)
}

const giveTheDamnColor = () => {
  return "#" + padAndGiveMeTheColor(getRandomColor());
}

let ColorArch = new Architect.Perceptron(8,10,2);
let ColorTrainer = new Trainer(ColorArch);

const toBinaryArray = (dec) => {
  let number = dec;
  const converted = [];

  while (number >= 1) {
    converted.unshift(number%2);
    number = Math.floor(number/2);
  }
  if (converted.length < 8) {
     while (converted.length < 8)  converted.unshift(0);
  }
  return converted;
}

const train = (iterations = 20000, forCount=1000) => {
  ColorArch = new Architect.Perceptron(8,10,2);
  ColorTrainer = new Trainer(ColorArch);

  const trainingSet = [];
  for (let i = 0; i < forCount; i ++) {
    const randomColor = parseInt(getRandomColor(), 16);
    let colorOutput;
    if (randomColor < 86) {
      colorOutput = [0,0];
    } else if (randomColor > 170) {
      colorOutput = [1,1];
    } else {
      colorOutput = [0,1];
    }

    const converted = toBinaryArray(randomColor);

    trainingSet.push({
      input: converted,
      output: colorOutput,
    });
    $('#train_iterations').html('Iterations: ' + (i +1));
  }

  ColorTrainer.trainAsync(trainingSet, {
    rate: .1,
    iterations: iterations,
    error: .005,
    log: 1000,
    cost: Trainer.cost.CROSS_ENTROPY
  }).then(results => {
    const testColor = getRandomColor();
    const color = '#' + padAndGiveMeTheColor(testColor);
    $("#colorpicker").val(color)
    getTrainedOutput(color);
    console.log('done!', results)
  });
}


(function (){
  //document.getElementById('color_box').style.background = giveTheDamnColor();
  train();
})()

const getTrainedOutput = (color) => {
    const testColor = color;
    const testColorBinary = toBinaryArray(parseInt(testColor.substring(1,3), 16));
    const out = ColorArch.activate(testColorBinary);

    console.log(out);
    $('#color_out_act').html('Activated: >> ' + JSON.stringify(out));
    out[0] = Math.round(out[0]);
    out[1] = Math.round(out[1]);

    document.getElementById('color_in').style.background = color;
    document.getElementById('color_in_txt').innerHTML = 'GRAYSCALE COLOR: ' + color;

    if (!out[0] && !out[1]) {
      document.getElementById('color_out_txt').innerHTML = 'PREDICTED >> BLACK';
      //document.getElementById('color_out').style.background = '#000000';
    } else if (!out[0] && out[1]) {
      document.getElementById('color_out_txt').innerHTML = 'PREDICTED >> GREY';
      //document.getElementById('color_out').style.background = '#888888';
    } else if (out[0] && out[1]) {
      document.getElementById('color_out_txt').innerHTML = 'PREDICTED >> WHITE';
      //document.getElementById('color_out').style.background = '#FFFFFF';
    }
}

$('#train_network').click(() => {
  const iteration = $("#iterations").val();
  train(iteration, iteration);
});

$('#predict_color').click(() => {
  const color_picker = $("#colorpicker").val();
  console.log(color_picker);
  getTrainedOutput(color_picker);
  //train(iteration, iteration);
});

$("#colorpicker").on('change', function(e, tinycolor) {
  $('#color_in').style('background',tinycolor);
});

