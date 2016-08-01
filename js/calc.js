// main file for ctc-helper-august-2016
// requires: mikelib.js

var Calc = (function () {
  var timeInputs,
      totalOutput,
      timeStorage,
      units = [ 600, 100, 10, 1 ],
      distances = [ 400, 300, 200, 100 ];

  function update() {
    var i, distance, timeInput, digits, punctuation, time, pace,
        total = 0,
        count = 0;
    for (i = 0; i < distances.length; ++i) {
      distance = distances[i];
      timeInput = timeInputs[distance];
      if (timeInput === undefined) {
        continue;
      }
      digits = timeInput.digits;
      punctuation = timeInput.punctuation;
      if (digits[600].value == 0) {
        M.classAdd(digits[600].container, 'disabled');
        M.classAdd(punctuation.colon, 'disabled');
      } else {
        M.classRemove(digits[600].container, 'disabled');
        M.classRemove(punctuation.colon, 'disabled');
      }
      time = timeInput.getTime();
      timeStorage[distance] = time;
      pace = time * 500 / distance;
      timeInput.output.setPace(pace);
      if (time == 0) {
        M.classAdd(timeInput.container, 'disabled');
      } else {
        M.classRemove(timeInput.container, 'disabled');
        total += pace;
        ++count;
      }
    }
    localStorage.setItem('timeStorage', JSON.stringify(timeStorage));
    if (totalOutput === undefined) {
      return;
    }
    if (count != distances.length) {
      totalOutput.setTotal(0);
      M.classAdd(totalOutput.container, 'disabled');
    } else  {
      totalOutput.setTotal(total);
      M.classRemove(totalOutput.container, 'disabled');
    }
  }

  function timeToUnitValues(time) {
    var i, unit,
        values = {};
    for (i = 0; i < units.length - 1; ++i) {
      unit = units[i];
      values[unit] = Math.floor(time / unit);
      time -= values[unit] * unit;
    }
    unit = units[units.length - 1];
    values[unit] = Math.round(time / unit);
    return values;
  }

  function formatTime(time) {
    var values = timeToUnitValues(Math.round(time));
    return values[600] + ':' + values[100] + values[10] + '.' + values[1];
  }

  function makeOutput() {
    var container = M.make('div', { className: 'outputContainer' }),
        pace = M.make('div', { className: 'pace', parent: container }),
        unit = M.make('div', { className: 'unit', parent: container,
            innerHTML: ' / 500 m' }),
        output = { container: container };
    output.setPace = function (value) {
      pace.innerHTML = formatTime(value);
    };
    return output;
  }

  function addButtonCanvas(container, invert) {
    var canvas = M.make('canvas', { parent: container }),
        context = canvas.getContext('2d'),
        width = canvas.width = container.offsetWidth,
        height = canvas.height = container.offsetHeight * 0.6;
    context.beginPath();
    context.moveTo(width / 5, (invert ? 1 : 4) * height / 5);
    context.lineTo(width / 2, (invert ? 4 : 1) * height / 5);
    context.lineTo(4 * width / 5, (invert ? 1 : 4) * height / 5);
    context.lineWidth = 2;
    context.fillStyle = '#196798';
    context.fill();
    context.closePath();
  }

  function makeDigitInput(count) {
    var container = M.make('div', { className: 'digitContainer' }),
        plusButton = M.make('div', { className: 'button plus' }),
        minusButton = M.make('div', { className: 'button minus' }),
        digit = M.make('div', { className: 'digit', innerHTML: '0' }),
        input = { container: container, value: 0 };
    input.setDigit = function (value) {
      input.value = value;
      digit.innerHTML = value;
      update();
    };
    plusButton.onclick = function () {
      input.setDigit(input.value + 1 == count ? 0 : input.value + 1);
    };
    minusButton.onclick = function () {
      input.setDigit(input.value - 1 == -1 ? count - 1: input.value - 1);
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
    var container = M.make('div', { className: 'timeContainer' }),
        time = M.make('div', { className: 'time' }),
        digits = {},
        punctuation = {},
        input = { container: container, timeContainer: time, digits: digits,
            punctuation: punctuation };
    container.appendChild(M.make('div', { className: 'label',
        innerHTML: distance + ' m' }));
    container.appendChild(M.make('span', { innerHTML: ' ' }));
    container.appendChild(time);
    container.appendChild(M.make('span', { innerHTML: ' ' }));
    time.appendChild((digits[600] = makeDigitInput(10)).container);
    time.appendChild(punctuation.colon = M.make('div', { innerHTML: ':' }));
    time.appendChild((digits[100] = makeDigitInput(6)).container);
    time.appendChild((digits[10] = makeDigitInput(10)).container);
    time.appendChild(punctuation.dot = M.make('div', { innerHTML: '.' }));
    time.appendChild((digits[1] = makeDigitInput(10)).container);
    container.appendChild((input.output = makeOutput()).container);
    input.paint = function () {
      var i;
      for (i = 0; i < units.length; ++i) {
        digits[units[i]].paint();
      }
    };
    input.getTime = function () {
      var i, time = 0;
      for (i = 0; i < units.length; ++i) {
        time += units[i] * digits[units[i]].value;
      }
      return time;
    };
    input.setTime = function (time) {
      var i, values = timeToUnitValues(time);
      for (i = 0; i < units.length; ++i) {
        digits[units[i]].setDigit(values[units[i]]);
      }
    };
    return input;
  }

  function makeTimeOutput(distance) {
    var container = M.make('div', { className: 'timeContainer total' }),
        time = M.make('div', { className: 'time' }),
        pace = makeOutput(),
        output = { container: container };
    container.appendChild(M.make('div', { className: 'label',
        innerHTML: 'CTC score' }));
    container.appendChild(M.make('span', { innerHTML: ' ' }));
    container.appendChild(time);
    container.appendChild(M.make('span', { innerHTML: ' ' }));
    container.appendChild(pace.container);
    output.setTotal = function (total) {
      time.innerHTML = formatTime(total);
      pace.setPace(Math.round(total / 4));
    };
    return output;
  }

  function load() {
    var timeInput, distance, time,
        wrapper = document.getElementById('wrapper'),
        stored = localStorage.getItem('timeStorage');
    timeStorage = (stored === null ? {} : JSON.parse(stored));
    document.getElementById('noJS').style.display = 'none';
    timeInputs = {};
    for (i = 0; i < distances.length; ++i) {
      distance = distances[i];
      timeInput = timeInputs[distance] = makeTimeInput(distance);
      wrapper.appendChild(timeInput.container);
      timeInput.paint();
      time = timeStorage[distance];
      if (time !== undefined) {
        timeInput.setTime(time);
      }
    }
    totalOutput = makeTimeOutput();
    wrapper.appendChild(totalOutput.container);
    update();
  }

  return {
    load: load
  };
})();
onload = Calc.load;
