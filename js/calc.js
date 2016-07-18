// main file for ctc-helper-august-2016
// requires: mikelib.js

var Calc = (function () {
  var timeInputs,
      totalOutput,
      timeStorage,
      units = [ 600, 100, 10, 1 ],
      distances = [ 400, 300, 200, 100 ];

  function update() {
    var i, distance, timeInput, time,
        times = [];
    for (i = 0; i < distances.length; ++i) {
      distance = distances[i];
      timeInput = timeInputs[distance];
      if (timeInput === undefined) {
        continue;
      }
      time = timeInput.getTime();
      if (time == 0) {
        delete timeStorage[distance];
        timeInput.output.set(0);
        continue;
      }
      timeStorage[distance] = time;
      timeInput.output.set(time * 500 / distance);
      times.push(time);
    }
    localStorage.setItem('timeStorage', JSON.stringify(timeStorage));
  }

  function timeToUnitValues(time) {
    var i, unit,
        values = {},
        round = Math.floor;
    for (i = 0; i < units.length; ++i) {
      unit = units[i];
      if (i == units.length - 1) {
        round = Math.round;
      }
      values[unit] = round(time / unit);
      time -= values[unit] * unit;
    }
    return values;
  }

  function formatPace(time) {
    var values = timeToUnitValues(time);
    return values[600] + ':' + values[100] + values[10] + '.' + values[1];
  }

  function makeOutput() {
    var container = M.make('div', { className: 'outputContainer' }),
        pace = M.make('div', { className: 'pace', parent: container }),
        unit = M.make('div', { className: 'unit', parent: container,
            innerHTML: ' / 500 m' }),
        output = { container: container };
    output.set = function (value) {
      if (value == 0) {
        pace.innerHTML = value;
        M.classAdd(container, 'disabled');
      } else {
        pace.innerHTML = formatPace(value);
        M.classRemove(container, 'disabled');
      }
    };
    return output;
  }

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
    context.fillStyle = '#0c2789';
    context.fill();
    context.closePath();
  }

  function makeDigitInput(count) {
    var container = M.make('div', { className: 'digitContainer' }),
        plusButton = M.make('div', { className: 'button plus' }),
        minusButton = M.make('div', { className: 'button minus' }),
        digit = M.make('div', { className: 'digit', innerHTML: '0' }),
        input = { container: container, value: 0 };
    input.set = function (value) {
      input.value = value;
      digit.innerHTML = value;
      update();
    };
    plusButton.onclick = function () {
      input.set(input.value + 1 == count ? 0 : input.value + 1);
    };
    minusButton.onclick = function () {
      input.set(input.value - 1 == -1 ? count - 1: input.value - 1);
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
        input = { container: container, digits: digits };
    container.appendChild(M.make('div', { className: 'label',
        innerHTML: distance + ' m' }));
    container.appendChild(time);
    time.appendChild((digits[600] = makeDigitInput(10)).container);
    time.appendChild(M.make('div', { innerHTML: ':' }));
    time.appendChild((digits[100] = makeDigitInput(6)).container);
    time.appendChild((digits[10] = makeDigitInput(10)).container);
    time.appendChild(M.make('div', { innerHTML: '.' }));
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
        digits[units[i]].set(values[units[i]]);
      }
    };
    return input;
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
    update();
  }

  return {
    load: load
  };
})();
onload = Calc.load;
