# Tic-Tac-Toe

Two people play tic-tac-toe on one shared device. Nothing outlives the page.

## Language

### Players

**Player**:
One of the two people at the device. Each Player has a name and a Mark.
_Avoid_: User, opponent, side

**Mark**:
The symbol a Player places on the board, either X or O.
_Avoid_: Piece, token, symbol, letter

### Play

**Board**:
The 3×3 grid of nine Cells.
_Avoid_: Grid, field

**Cell**:
One of the nine spaces on the Board. A Cell is either empty or holds a Mark.
_Avoid_: Square, tile, space

**Move**:
A Player placing their Mark in an empty Cell.
_Avoid_: Play, placement

**Turn**:
Whose Move it is next.
_Avoid_: Current player

**Line**:
Any three Cells in a row, column, or diagonal. The Board has eight.
_Avoid_: Row (when the diagonals are included), triple

**Game**:
A single game of tic-tac-toe on one Board, from an empty Board to an Outcome.
_Avoid_: Round, match

**Rematch**:
A new Game between the same Players after an Outcome, keeping their names and Marks.
_Avoid_: Play again, replay, new round

**Restart**:
Abandoning an unfinished Game for a fresh one between the same Players.
_Avoid_: Reset, Rematch (which follows an Outcome)

**New players**:
Leaving the current Game to enter names again, keeping the current names as a starting point.
_Avoid_: Change players, reset, new game

### Outcomes

**Outcome**:
How a Game ended: a Win or a Draw.
_Avoid_: Result, status

**Win**:
The Outcome when one Player's Mark fills a Line.
_Avoid_: Victory

**Draw**:
The Outcome when every Cell is filled and no Line belongs to a single Player.
_Avoid_: Tie, cat's game, stalemate
