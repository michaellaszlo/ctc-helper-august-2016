// This is the main file for the ctc-helper-august-2018 project.
// requires: mikelib.js

var Calc = (function () {
  var timeInputs,
      totalOutput,
      distances = [ 400, 300, 200, 100 ];

  function addButtonCanvas(container, invert) {
    var canvas = M.make('canvas', { parent: container }),
        context = canvas.getContext('2d'),
        width = canvas.width = container.offsetWidth,
        height = canvas.height = container.offsetHeight / 2;
    context.beginPath();
    context.moveTo(width / 5, (invert ? 1 : 4) * height / 5);
    context.lineTo(width / 2, (invert ? 4 : 1) * height / 5);
    context.lineTo(4 * width / 5, (invert ? 1 : 4) * height / 5);
    context.lineWidth = 2;
    context.strokeStyle = '#0c2789';
    context.stroke();
    context.closePath();
  }

  function makeDigitInput(count) {
    var container = M.make('div', { className: 'digitContainer' }),
        plusButton = M.make('div', { className: 'button plus' }),
        minusButton = M.make('div', { className: 'button minus' }),
        digit = M.make('div', { className: 'digit', innerHTML: '0' }),
        input = { container: container, value: 0 };
    plusButton.onclick = function () {
      if (++input.value == count) {
        input.value = 0;
      }
      digit.innerHTML = input.value;
      this.blur();
    };
    minusButton.onclick = function () {
      if (--input.value == -1) {
        input.value = count - 1;
      }
      digit.innerHTML = input.value;
      this.blur();
    };
    M.makeUnselectable(plusButton);
    M.makeUnselectable(minusButton);
    container.appendChild(plusButton);
    container.appendChild(digit);
    container.appendChild(minusButton);
    input.paint = function () {
      addButtonCanvas(plusButton, false);
      addButtonCanvas(minusButton, true);
    };
    return input;
  }

  function makeTimeInput(distance) {
    var container = M.make('div', { className: 'inputContainer' }),
        digits = {},
        input = { container: container, digits: digits };
    container.appendChild(M.make('div', { className: 'label',
        innerHTML: distance + ' m' }));
    container.appendChild((digits.minuteOne = makeDigitInput(10)).container);
    container.appendChild(M.make('div', { innerHTML: ':' }));
    container.appendChild((digits.secondTen = makeDigitInput(6)).container);
    container.appendChild((digits.secondOne = makeDigitInput(10)).container);
    container.appendChild(M.make('div', { innerHTML: '.' }));
    container.appendChild((digits.secondTenth = makeDigitInput(10)).container);
    input.paint = function () {
      Object.keys(digits).forEach(function (key) {
        digits[key].paint();
      });
    };
    return input;
  }

  function load() {
    var i, timeInput,
        wrapper = document.getElementById('wrapper');
    document.getElementById('noJS').style.display = 'none';
    timeInputs = new Array(distances.length);
    for (i = 0; i < timeInputs.length; ++i) {
      timeInput = timeInputs[i] = makeTimeInput(distances[i]);
      wrapper.appendChild(timeInput.container);
      timeInput.paint();
    }
  }

  return {
    load: load
  };
})();
onload = Calc.load;
