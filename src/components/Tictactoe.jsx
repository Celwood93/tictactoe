import React, { useEffect, useState } from "react";
import { Button } from "@material-ui/core";
import { db, waysToWin } from "../constants";
import update from "immutability-helper";

function Tictactoe() {
  const [gameId, setGameId] = useState(window.location.search.substring(4));
  const [gameChallenger, setGameChallenger] = useState();
  const [board, setBoard] = useState();
  const [turn, setTurn] = useState(false);
  const [whoWon, setWhoWon] = useState(0);
  const [invalidGame, setInvalidGame] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkDB() {
      if (!!gameId) {
        const gameRef = db.collection("games").doc(`${gameId}`);
        const checkGame = await gameRef.get();
        if (checkGame.data().active) {
          setInvalidGame(true);
        }
      }
      setLoading(false);
    }
    checkDB();
  }, [gameId]);

  useEffect(() => {
    let observer;
    if ((gameId && gameChallenger) || (gameId && gameChallenger === false)) {
      console.log("Setting the observer");
      const doc = db.collection("games").doc(`${gameId}`);
      observer = doc.onSnapshot(
        docSnapshot => {
          if (docSnapshot.exists) {
            const docState = docSnapshot.data();
            if (docState.active) {
              setBoard(docState.board);
              setWhoWon(docState.winner);
              setTurn(docState.turn === gameChallenger);
            }
          } else {
            console.log("no such document exists");
          }
        },
        err => {
          console.log(`Encountered error: ${err}`);
        }
      );
    }
    return observer; //or a function that takes in observer, calls it, and clears the db or something.
  }, [gameId, gameChallenger]);

  async function createGame() {
    const res = await db.collection("games").add({
      active: false
    });
    window.history.pushState(
      { currUrl: `${window.location.href}/?id=${res.id}` },
      "",
      `?id=${res.id}`
    );
    setGameId(res.id);
    setGameChallenger(true);
  }

  function checkWin(board) {
    const checkToken = gameChallenger ? "1" : "2";
    let draw = true;
    const won = waysToWin.find(cords => {
      return !!cords.reduce((res, arr) => {
        if (board[arr[0]][arr[1]] === 0) {
          draw = false;
        }
        return res && board[arr[0]][arr[1]] === checkToken;
      }, true);
    });

    return draw ? 3 : !won ? 0 : checkToken;
  }

  async function acceptGameChallenge() {
    try {
      const gameRef = db.collection("games").doc(`${gameId}`);
      await gameRef.set(
        {
          active: true,
          winner: 0,
          turn: Math.random() >= 0.5, //here we randomly pick who gets to go first. if its true, challenger gets to go, false challenged gets to go
          board: {
            1: { 1: 0, 2: 0, 3: 0 },
            2: { 1: 0, 2: 0, 3: 0 },
            3: { 1: 0, 2: 0, 3: 0 }
          }
        },
        { merge: true }
      );
      setGameChallenger(false);
    } catch (e) {
      console.log("game does not exist", e);
    }
  }

  function resetGame() {
    window.location.assign(window.location.origin);
  }

  async function updateGameState(val, val2) {
    try {
      const newBoard = update(board, {
        [val]: {
          [val2]: {
            $set: `${gameChallenger ? "1" : "2"}`
          }
        }
      });
      const winner = checkWin(newBoard);
      const gameRef = db.collection("games").doc(`${gameId}`);
      await gameRef.set(
        {
          turn: turn !== gameChallenger,
          winner: winner,
          board: newBoard
        },
        { merge: true }
      );
    } catch (e) {
      console.log("game does not exist");
    }
  }

  return (
    <div>
      {loading ? (
        <div />
      ) : (
        <div>
          {invalidGame ? (
            <div>
              <div> Game has already started</div>
              <Button variant="contained" color="primary" onClick={resetGame}>
                Play New Game?
              </Button>
            </div>
          ) : (
            <div>
              {board ? (
                <div>
                  <div>
                    <div>
                      {whoWon === 0 || whoWon === "0" ? (
                        <div />
                      ) : whoWon === 1 || whoWon === "1" ? (
                        <div>
                          <div>{gameChallenger ? "You Won" : "You Lost"}</div>
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={resetGame}
                          >
                            Play Again?
                          </Button>
                        </div>
                      ) : whoWon === 3 || whoWon === "3" ? (
                        <div>
                          <div>Draw</div>
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={resetGame}
                          >
                            Play Again?
                          </Button>
                        </div>
                      ) : (
                        <div>
                          <div>{gameChallenger ? "You Lost" : "You Won"}</div>
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={resetGame}
                          >
                            Play Again?
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    {[1, 2, 3].map(val => {
                      return (
                        <div key={`${val}`}>
                          {[1, 2, 3].map(val2 => {
                            return (
                              <Button
                                disableElevation={board[val][val2] !== 0} //make it based on board
                                variant="contained"
                                color="primary"
                                key={`${val2}`}
                                style={{
                                  cursor: `${!turn ? "default" : "pointer"}`
                                }}
                                disableRipple={!turn}
                                disabled={whoWon !== 0}
                                onClick={() => {
                                  if (turn) {
                                    updateGameState(val, val2);
                                  }
                                }}
                              >
                                {board[val][val2] === "0" ||
                                board[val][val2] === 0
                                  ? "_"
                                  : board[val][val2] === "1" ||
                                    board[val][val2] === 1
                                  ? "X"
                                  : "O"}
                              </Button>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div>
                  {!!gameId ? (
                    gameChallenger ? (
                      <div>Game url to share: {window.location.href}</div>
                    ) : (
                      <Button variant="contained" onClick={acceptGameChallenge}>
                        Accept Game
                      </Button>
                    )
                  ) : (
                    <Button variant="contained" onClick={createGame}>
                      Start A Game
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Tictactoe;
