const Rabbit = require('./Rabbit');

let whiteRabbit; let
  blackRabbit;

beforeEach(async () => {
  whiteRabbit = new Rabbit('white');
  blackRabbit = new Rabbit('black');
  blackRabbit.family = 'ninjas';
  blackRabbit.favouriteFood = 'kale';
});

test('Rabbit instances to have at least a type and a family instance fields', () => {
  expect(whiteRabbit).toEqual({ family: 'mammals', type: 'white' });
  expect(blackRabbit).toEqual({ family: 'ninjas', type: 'black', favouriteFood: 'kale' });
});

test('Rabbit to have a family instance field that can be overriden', () => {
  expect(whiteRabbit.family).toEqual('mammals');
  expect(blackRabbit.family).toEqual('ninjas');
});

test('Rabbit.prototype to have a favouriteFood field that can be overriden', () => {
  expect(whiteRabbit.favouriteFood).toEqual('carrots');
  expect(blackRabbit.favouriteFood).toEqual('kale');
});

test('Rabbit to have a speak instance method', () => {
  expect(whiteRabbit.speak('hi')).toEqual('The white rabbit says hi');
  expect(blackRabbit.speak('the cake is a lie')).toEqual('The black rabbit says the cake is a lie');
});

test('Rabbit.prototype to have an eat function', () => {
  expect(whiteRabbit.eat()).toEqual('The white rabbit eats carrots');
  expect(blackRabbit.eat()).toEqual('The black rabbit eats kale');
});

test('Rabbit to have its own implementation of toString', () => {
  expect(whiteRabbit.toString()).toEqual('A white Rabbit of the mammals family who likes eating carrots');
  expect(String(whiteRabbit)).toEqual('A white Rabbit of the mammals family who likes eating carrots');
  expect(blackRabbit.toString()).toEqual('A black Rabbit of the ninjas family who likes eating kale');
  expect(String(blackRabbit)).toEqual('A black Rabbit of the ninjas family who likes eating kale');
});
