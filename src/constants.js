import firebase from "firebase/app";
import "firebase/firestore";

const config = {
  apiKey: "AIzaSyD2YxmDQk8wUn0V0z3sl3m8BGRlcKR5KCg",
  projectId: "tictactoe-exersice",
  databaseURL: "https://tictactoe-excersice.firebaseio.com"
};
firebase.initializeApp(config);
export const db = firebase.firestore();

export const waysToWin = [
  [[1, 1], [1, 2], [1, 3]],
  [[2, 1], [2, 2], [2, 3]],
  [[3, 1], [3, 2], [3, 3]],
  [[1, 1], [2, 1], [3, 1]],
  [[1, 2], [2, 2], [3, 2]],
  [[1, 3], [2, 3], [3, 3]],
  [[1, 1], [2, 2], [3, 3]],
  [[1, 3], [2, 2], [3, 1]]
];
