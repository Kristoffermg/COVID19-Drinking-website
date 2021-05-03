//Import functions to test
const { diceSort, checkDrink, cmpRoll } = require('./server');



//Test enviroment for the 'Meyer' game
describe('Meyer Tests', () => {
    //Make a mock-up of global variables
    id = 0;
    idArr = [{
        roomId: "testRoomId",
        amountConnected: 2,
        userIdArr: ['user1Id', 'user2Id'],
        startedGame: 'dice',
    
        lastRoll: [0,0],
        rollToBeat: [0,0],
        lieRoll: [0,0],
        wasLastLie: false,
        mejerRanks: [
            [ '0', '0' ], [ '3', '2' ],
            [ '4', '1' ], [ '4', '2' ],
            [ '4', '3' ], [ '5', '1' ],
            [ '5', '2' ], [ '5', '3' ],
            [ '5', '4' ], [ '6', '1' ],
            [ '6', '2' ], [ '6', '3' ],
            [ '6', '4' ], [ '6', '5' ],
            [ '1', '1' ], [ '2', '2' ],
            [ '3', '3' ], [ '4', '4' ],
            [ '5', '5' ], [ '6', '6' ],
            [ '1', '3' ], [ '1', '2' ]
        ],
        currTurn: 0,
        mejerLives: [['user1Id', 6, 'user1Name'], ['user2Id', 6, 'user2Name']]
    }];

    //diceSort Test
    test('Should sort meyer dice throw', () => {
        const sortedDice1 = diceSort(5, 6);
        expect(sortedDice1).toStrictEqual([6, 5]);
        const sortedDice2 = diceSort(2, 1);
        expect(sortedDice2).toStrictEqual([1, 2]);
        const sortedDice3 = diceSort(1, 3);
        expect(sortedDice3).toStrictEqual([1, 3]);
    });

    //checkDrink Test
    test('should determine if everyone should drink', () => {
        const drink1 = checkDrink([3, 2]);
        expect(drink1).toBe(true);
        const drink2 = checkDrink([6, 5]);
        expect(drink2).toBe(false);
    });

    //cmpRoll Test
    test('should find the best dice roll', () => {
        const test1 = cmpRoll([1, 2], [1, 3], 0, idArr);
        expect(test1).toBe(true);
        const test2 = cmpRoll([6, 5], [2, 2], 0, idArr);
        expect(test2).toBe(false);
        const test3 = cmpRoll([4, 4], [4, 4], 0, idArr);
        expect(test3).toBe(true);
    });
})

/*
----------TO DO----------
Lav resten af meyer tests
Lav enviroment til NHIE
Lav enviroment til generic funktioner (kun hvis de skal testes)
*/