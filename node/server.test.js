//Import functions to test
const {
    diceSort,
    checkDrink,
    cmpRoll,
    findID,
    unusedPromptsLeft,
    randomPrompt,
    promptHasBeenUsed,
    nextTurn,
    mejerLivesSetup,
    mejerLivesDecrement,
    randomRoom,
    pushArray
} = require('./server');

//----------------------Test enviroment for the 'Meyer' game----------------------
describe('Meyer Tests', () => {
    //Make a mock-up of global variables
    let idArr = [{
        roomId: "testRoomId1",
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
    },
    {
        roomId: "testRoomId2",
        amountConnected: 4,
        userIdArr: ['user1Id', 'user2Id', 'user3Id', 'user4Id'],
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
        currTurn: 3,
        mejerLives: [['user1Id', 6, 'user1Name'], ['user2Id', 4, 'user2Name'],
                     ['user3Id', 1, 'user3Name'], ['user4Id', 5, 'user4Name']]
    },
    {
        roomId: "testRoomId3",
        amountConnected: 2,
        userIdArr: ['user1Id', 'user2Id', 'user3Id'],
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
        mejerLives: []
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
    test('Should determine if everyone should drink', () => {
        const drink1 = checkDrink([3, 2]);
        expect(drink1).toBe(true);
        const drink2 = checkDrink([6, 5]);
        expect(drink2).toBe(false);
    });

    //cmpRoll Test
    test('Should find the best dice roll', () => {
        const cmp1 = cmpRoll([1, 2], [1, 3], 0, idArr);
        expect(cmp1).toBe(true);
        const cmp2 = cmpRoll([6, 5], [2, 2], 0, idArr);
        expect(cmp2).toBe(false);
        const cmp3 = cmpRoll([4, 4], [4, 4], 0, idArr);
        expect(cmp3).toBe(true);
    });

    //findID Test
    test('Should return index of correct room', () => {
        const idTest1 = findID('testRoomId1', idArr);
        expect(idTest1).toBe(0);
        const idTest2 = findID('testRoomId2', idArr);
        expect(idTest2).toBe(1);
        const idTest3 = findID('testRoomId4', idArr);
        expect(idTest3).toBe(undefined);
    });

    //nextTurn Test
    test('Should return id of the player who goes next', () => {
        const next1 = nextTurn(0, idArr);
        expect(next1).toBe('user2Id');
        const next2 = nextTurn(1, idArr);
        expect(next2).toBe('user1Id');
    });

    //mejerLivesSetup Test
    test('Should return a correctly made array in mejerLives', () => {
        const setupTest1 = mejerLivesSetup(2, idArr);
        expect(setupTest1).toStrictEqual([['user1Id', 6], ['user2Id', 6], ['user3Id', 6]])
        const setupTest2 = mejerLivesSetup(0, idArr);
        expect(setupTest2).toStrictEqual([['user1Id', 6], ['user2Id', 6]]);
    });

    //mejerLivesDecrement Test
    test('Should return the mejerLives array, post decrement', () => {
        const decrement1 = mejerLivesDecrement('user1Id', 0, idArr);
        expect(decrement1).toStrictEqual([['user1Id', 5], ['user2Id', 6]]);
        const decrement2 = mejerLivesDecrement('user3Id', 1, idArr);
        expect(decrement2).toStrictEqual([['user1Id', 6, 'user1Name'], ['user2Id', 4, 'user2Name'], ['user4Id', 5, 'user4Name']])
    });
});

//----------------------Test enviroment for the 'Never Have I Ever' game----------------------
describe('NHIE Tests', () => {    
    //Make a mock-up of global variables
    let idArr = [{
        roomId: "testRoomId1",
        amountConnected: 2,
        userIdArr: ['user1Id', 'user2Id'],
        startedGame: 'prompt',

        neverHaveIEverPrompts: ['Test prompt 1', 'Test prompt 2', 'Test prompt 3',
                                'Test prompt 4', 'Test prompt 5', 'Test prompt 6',
                                'Test prompt 7', 'Test prompt 8', 'Test prompt 9'],
        usedPrompts: [0, 4, 8],
        counter: 3,
        voteCount: 0,
        votingRight: 2,
        answerArr: []
    },
    {
        roomId: "testRoomId2",
        amountConnected: 4,
        userIdArr: ['user1Id', 'user2Id', 'user3Id', 'user4Id'],
        startedGame: 'prompt',

        neverHaveIEverPrompts: ['Test prompt 1', 'Test prompt 2', 'Test prompt 3',
                                'Test prompt 4', 'Test prompt 5', 'Test prompt 6',
                                'Test prompt 7', 'Test prompt 8', 'Test prompt 9'],
        usedPrompts: [0, 4, 8, 3, 5],
        counter: 5,
        voteCount: 2,
        votingRight: 4,
        answerArr: [['user1Id', true], ['user4Id', false], ['user3Id', true], ['user2Id', true]]
    },
    {
        roomId: "testRoomId3",
        amountConnected: 4,
        userIdArr: ['user1Id', 'user2Id', 'user3Id', 'user4Id'],
        startedGame: 'prompt',

        neverHaveIEverPrompts: ['Test prompt 1', 'Test prompt 2', 'Test prompt 3',
                                'Test prompt 4', 'Test prompt 5', 'Test prompt 6',
                                'Test prompt 7', 'Test prompt 8', 'Test prompt 9'],
        usedPrompts: [0, 1, 2, 3, 4, 5, 6, 7, 8],
        counter: 9,
        voteCount: 3,
        votingRight: 4,
        answerArr: [['user1Id', true], ['user4Id', false], ['user3Id', true], ['user2Id', true]]
    }];

    //unusedPromptsLeft Test
    test('Should return boolean depending on if all prompts has been used', () => {
        const unusedTest1 = unusedPromptsLeft(0, idArr);
        expect(unusedTest1).toBe(true);
        const unusedTest2 = unusedPromptsLeft(1, idArr);
        expect(unusedTest2).toBe(true);
        const unusedTest3 = unusedPromptsLeft(2, idArr);
        expect(unusedTest3).toBe(false);
    });

    //promptHasBeenUsed Test
    test('Should return a boolean, based on if the prompt on the given index has been used', () => {
        const hasBeenUsed1 = promptHasBeenUsed(2, 0, idArr);
        expect(hasBeenUsed1).toBe(false);
        const hasBeenUsed2 = promptHasBeenUsed(2, 2, idArr);
        expect(hasBeenUsed2).toBe(true);
    });

    //randomPrompt Test
    test('Should return the index to a random prompt, that has not yet been in use', () => {
        //Manipulate randomness to make it predictable
        const mockMath = Object.create(global.Math);
        mockMath.random = () => 0.3;
        global.Math = mockMath;

        const randomTest1 = randomPrompt(0, idArr);
        expect(randomTest1).toBe(2);

        mockMath.random = () => 0.7;
        global.Math = mockMath;

        const randomTest2 = randomPrompt(1, idArr);
        expect(randomTest2).toBe(6);
    });
});

//----------------------Test enviroment for generic functions----------------------
describe('Generic tests', () => {
    //Make a mock-up of global variables
    let idArr = [];
    let testArr1 = ['test1',, 'test3', 'test4', 'test5'];
    let testArr2 = ['test1', 'test2', 'test3',, 'test5'];

    //randomRoom Test - Note: This test does not take the socket object into account since it would be near impossible to mock this object.
    test('Should return the room id, extracted from the newly generated room', () => {
        const randomRoom1 = randomRoom(undefined, 'thisIsARandomString', idArr);
        expect(randomRoom1).toBe('thisIsARandomString');
        const randomRoom2 = randomRoom(undefined, 'aiushiourhgdifugh', idArr);
        expect(randomRoom2).toBe('aiushiourhgdifugh');
    });

    //pushArray Test
    test('Should return the given array post push', () => {
        const pushTest1 = pushArray(testArr1, 1, true);
        expect(pushTest1).toStrictEqual(['test1', 'test3', 'test4', 'test5', undefined]);
        const pushTest2 = pushArray(testArr2, 3, true);
        expect(pushTest2).toStrictEqual(['test1', 'test2', 'test3','test5', undefined])
    });
});