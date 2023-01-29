const create = require("../cerveza.js").create;
cerveza = create({
  define: {
    sum: () => arr => arr.reduce((a, b) => a + b, 0)
  }
});


let objects = [{
  a: 1,
  b: {
    c: 11,
    d: 11
  }
}, {
  a: 2,
  b: {
    c: 12
  }
}, {
  a: 3
}, {
  a: 4
}]

test('Empty reducer', () => {
  let result = cerveza(objects, {
    a: []
  })
  expect(result).toStrictEqual({
    a: [1, 2, 3, 4]
  });
});

test('Override prop', () => {
  let result = cerveza(objects, {
    a: 'override'
  })
  expect(result).toStrictEqual({
    a: 4
  });
});

test('Sum with named reduce', () => {
  let result = cerveza(objects, {
    a: [{ reduce: (a, b) => a + b }]
  })
  expect(result).toStrictEqual({
    a: 10
  });
});


test('Custom sum', () => {
  let result = cerveza(objects, {
    a: arr => arr.reduce((a, b) => a + b)
  })
  expect(result).toStrictEqual({
    a: 10
  });
});


test('pick by name', () => {
  let result = cerveza(objects, {
    b: [{ pick: 'a' }]
  })
  expect(result).toStrictEqual({
    b: [1, 2, 3, 4]
  });
});

test('pick by function', () => {
  let result = cerveza(objects, {
    b: [{ pick: obj => obj.a }]
  })
  expect(result).toStrictEqual({
    b: [1, 2, 3, 4]
  });
});

test('pick and custom sum', () => {
  let result = cerveza(objects, {
    a: [],
    b: [{ pick: obj => obj.a }, arr => arr.reduce((a, b) => a + b)]
  })
  expect(result).toStrictEqual({
    a: [1, 2, 3, 4],
    b: 10
  });
});

test('pick and defined sum', () => {
  let result = cerveza(objects, {
    a: [],
    b: [{ pick: 'a' }, 'sum']
  })
  expect(result).toStrictEqual({
    a: [1, 2, 3, 4],
    b: 10
  });
});

test('sub props', () => {
  let result = cerveza(objects, {
    a: 'override',
    b: {
      c: 'override',
      d: []
    }
  })
  expect(result).toStrictEqual({
    a: 4,
    b: {
      c: 12,
      d: [11]
    }
  });
});

test('sub props', () => {
  let myCerveza = cerveza.create().processor({
    a: 'override',
    b: {
      c: 'override',
      d: []
    }
  })
  let result = myCerveza(objects)
  expect(result).toStrictEqual({
    a: 4,
    b: {
      c: 12,
      d: [11]
    }
  });
});