import { splitName } from "../src/utils"

test('Split path', () => {
  expect(splitName('a/b')).toStrictEqual(["", "a", "b"]);
});

test('Split path strip slashes', () => {
  expect(splitName('/a///b/')).toStrictEqual(["", "a", "b"]);
});

test('Split path empty', () => {
  expect(splitName('')).toStrictEqual([""]);
  expect(splitName('/')).toStrictEqual([""]);
});


test('Split path dot', () => {
  expect(()=>splitName('/./')).toThrow();
});