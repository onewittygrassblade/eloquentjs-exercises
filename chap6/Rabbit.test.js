const Rabbit = require('./Rabbit');

let whiteRabbit; let
  blackRabbit;

beforeEach(async () => {
  whiteRabbit = new Rabbit('white');
  blackRabbit = new Rabbit('black');
  blackRabbit.family = 'ninjas';
  blackRabbit.favouriteFood = 'kale';
});

describe('Rabbit', () => {
  test('to have at least a type and a family instance fields', () => {
    expect(whiteRabbit).toEqual({ family: 'mammals', type: 'white' });
    expect(blackRabbit).toEqual({ family: 'ninjas', type: 'black', favouriteFood: 'kale' });
  });

  test('to have a family instance field that can be overriden', () => {
    expect(whiteRabbit.family).toEqual('mammals');
    expect(blackRabbit.family).toEqual('ninjas');
  });

  test('have a favouriteFood prototype field that can be overriden', () => {
    expect(whiteRabbit.favouriteFood).toEqual('carrots');
    expect(blackRabbit.favouriteFood).toEqual('kale');
  });

  test('to have a speak instance method', () => {
    expect(whiteRabbit.speak('hi')).toEqual('The white rabbit says hi');
    expect(blackRabbit.speak('the cake is a lie')).toEqual('The black rabbit says the cake is a lie');
  });

  test('to have an eat prototype function', () => {
    expect(whiteRabbit.eat()).toEqual('The white rabbit eats carrots');
    expect(blackRabbit.eat()).toEqual('The black rabbit eats kale');
  });

  test('.toString to return a formatted string representation', () => {
    expect(whiteRabbit.toString()).toEqual('A white Rabbit of the mammals family who likes eating carrots');
    expect(String(whiteRabbit)).toEqual('A white Rabbit of the mammals family who likes eating carrots');
    expect(blackRabbit.toString()).toEqual('A black Rabbit of the ninjas family who likes eating kale');
    expect(String(blackRabbit)).toEqual('A black Rabbit of the ninjas family who likes eating kale');
  });
});
