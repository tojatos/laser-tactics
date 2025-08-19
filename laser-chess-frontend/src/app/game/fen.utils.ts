import { BoardInterface, GameState, PieceInterface } from './game.models';
import { PieceType, PlayerType, GamePhase } from './src/Utils/Enums';

/**
 * FEN (Forsyth-Edwards Notation) utilities for Laser Chess
 * 
 * Format: board_position active_player turn_number game_phase
 * 
 * Piece symbols:
 * - Uppercase for PLAYER_ONE, lowercase for PLAYER_TWO
 * - B/b: BEAM_SPLITTER
 * - X/x: BLOCK  
 * - D/d: DIAGONAL_MIRROR
 * - H/h: HYPER_CUBE
 * - S/s: HYPER_SQUARE
 * - K/k: KING
 * - L/l: LASER
 * - M/m: MIRROR
 * - T/t: TRIANGULAR_MIRROR
 * - Empty squares represented by numbers (count of consecutive empty squares)
 * - Rotation indicated by suffix: 0 (default), 1 (90°), 2 (180°), 3 (270°)
 */

// Map piece types to FEN symbols
const PIECE_SYMBOLS: Record<PieceType, string> = {
  [PieceType.BEAM_SPLITTER]: 'B',
  [PieceType.BLOCK]: 'X',
  [PieceType.DIAGONAL_MIRROR]: 'D',
  [PieceType.HYPER_CUBE]: 'H',
  [PieceType.HYPER_SQUARE]: 'S',
  [PieceType.KING]: 'K',
  [PieceType.LASER]: 'L',
  [PieceType.MIRROR]: 'M',
  [PieceType.TRIANGULAR_MIRROR]: 'T',
  [PieceType.UNKNOWN]: '?'
};

/**
 * Convert a piece to its FEN notation
 */
export function pieceToFen(piece: PieceInterface): string {
  let symbol = PIECE_SYMBOLS[piece.piece_type];
  
  // Apply case based on player
  if (piece.piece_owner === PlayerType.PLAYER_TWO || piece.piece_owner === PlayerType.NONE) {
    symbol = symbol.toLowerCase();
  }
  
  // Add rotation suffix if not default
  let rotationSuffix = '';
  if (piece.rotation_degree === 90) {
    rotationSuffix = '1';
  } else if (piece.rotation_degree === 180) {
    rotationSuffix = '2';
  } else if (piece.rotation_degree === 270) {
    rotationSuffix = '3';
  }
  
  return symbol + rotationSuffix;
}

/**
 * Convert a board to FEN notation
 */
export function boardToFen(board: BoardInterface): string {
  // Create a 9x9 grid to organize pieces by coordinates
  const grid: (PieceInterface | null)[][] = Array(9).fill(null).map(() => Array(9).fill(null));
  
  // Fill the grid with pieces from the cells array
  board.cells.forEach(cell => {
    if (cell.piece) {
      grid[cell.coordinates.y][cell.coordinates.x] = cell.piece;
    }
  });
  
  const boardRows: string[] = [];
  
  // Process board from top to bottom (y=8 to y=0)
  for (let y = 8; y >= 0; y--) {
    let row = '';
    let emptyCount = 0;
    
    // Process row from left to right (x=0 to x=8)
    for (let x = 0; x < 9; x++) {
      const piece = grid[y][x];
      
      if (piece === null) {
        emptyCount++;
      } else {
        // Add empty count if any
        if (emptyCount > 0) {
          row += emptyCount.toString();
          emptyCount = 0;
        }
        
        row += pieceToFen(piece);
      }
    }
    
    // Add remaining empty count
    if (emptyCount > 0) {
      row += emptyCount.toString();
    }
    
    boardRows.push(row);
  }
  
  return boardRows.join('/');
}

/**
 * Convert a game state to FEN notation
 */
export function gameStateToFen(gameState: GameState): string {
  const boardPosition = boardToFen(gameState.board);
  
  // Determine active player based on turn number (even = PLAYER_ONE, odd = PLAYER_TWO)
  const activePlayer = gameState.turn_number % 2 === 0 ? 'w' : 'b';
  
  // Map game phase to short notation
  const phaseMap: Record<GamePhase, string> = {
    [GamePhase.NOT_STARTED]: 'ns',
    [GamePhase.STARTED]: 's',
    [GamePhase.PLAYER_ONE_VICTORY]: 'w1',
    [GamePhase.PLAYER_TWO_VICTORY]: 'w2',
    [GamePhase.DRAW]: 'd'
  };
  const gamePhase = phaseMap[gameState.game_phase];
  
  return `${boardPosition} ${activePlayer} ${gameState.turn_number} ${gamePhase}`;
}

/**
 * Get visual Unicode symbol for a piece
 */
function getPieceSymbol(piece: PieceInterface): string {
  // Base symbols for each piece type
  const baseSymbols: Record<PieceType, string> = {
    [PieceType.KING]: '♔',           // King crown
    [PieceType.LASER]: '⚡',         // Lightning bolt for laser
    [PieceType.TRIANGULAR_MIRROR]: '◢', // Triangle
    [PieceType.DIAGONAL_MIRROR]: '◇',    // Diamond for diagonal mirror
    [PieceType.MIRROR]: '▬',        // Horizontal line for mirror
    [PieceType.BLOCK]: '■',         // Solid square for block
    [PieceType.BEAM_SPLITTER]: '❖', // Diamond with cross
    [PieceType.HYPER_CUBE]: '⬛',    // Black square
    [PieceType.HYPER_SQUARE]: '◼',  // Medium black square
    [PieceType.UNKNOWN]: '?'
  };

  // Get rotation symbols
  const rotationSymbols: Record<number, string> = {
    0: '',      // No rotation indicator
    90: '↻',    // Clockwise arrow
    180: '↕',   // Up-down arrow
    270: '↺'    // Counter-clockwise arrow
  };

  let symbol = baseSymbols[piece.piece_type];
  
  // Apply player styling - use different Unicode variants for different players
  if (piece.piece_owner === PlayerType.PLAYER_ONE) {
    // Player 1: Use filled/dark symbols (already default for most)
    if (piece.piece_type === PieceType.KING) symbol = '♔'; // White king
    else if (piece.piece_type === PieceType.TRIANGULAR_MIRROR) {
      // Use different triangular orientations based on rotation
      const triangles = ['◢', '◣', '◤', '◥'];
      const rotIndex = piece.rotation_degree / 90;
      symbol = triangles[rotIndex % 4];
    }
    else if (piece.piece_type === PieceType.DIAGONAL_MIRROR) {
      symbol = piece.rotation_degree === 90 ? '◈' : '◇';
    }
    else if (piece.piece_type === PieceType.MIRROR) {
      symbol = piece.rotation_degree === 90 ? '┃' : '▬';
    }
    else if (piece.piece_type === PieceType.LASER) {
      // Use directional arrows based on rotation
      const directions = ['→', '↓', '←', '↑'];
      const rotIndex = piece.rotation_degree / 90;
      symbol = directions[rotIndex % 4];
    }
  } else if (piece.piece_owner === PlayerType.PLAYER_TWO) {
    // Player 2: Use outlined/hollow symbols where possible
    if (piece.piece_type === PieceType.KING) symbol = '♚'; // Black king
    else if (piece.piece_type === PieceType.BLOCK) symbol = '□'; // Hollow square
    else if (piece.piece_type === PieceType.HYPER_CUBE) symbol = '⬜'; // White square
    else if (piece.piece_type === PieceType.HYPER_SQUARE) symbol = '◻'; // White medium square
    else if (piece.piece_type === PieceType.TRIANGULAR_MIRROR) {
      // Use different triangular orientations based on rotation
      const triangles = ['◿', '◺', '◸', '◹']; // Hollow triangles
      const rotIndex = piece.rotation_degree / 90;
      symbol = triangles[rotIndex % 4];
    }
    else if (piece.piece_type === PieceType.DIAGONAL_MIRROR) {
      symbol = piece.rotation_degree === 90 ? '◊' : '♢';
    }
    else if (piece.piece_type === PieceType.MIRROR) {
      symbol = piece.rotation_degree === 90 ? '│' : '─';
    }
    else if (piece.piece_type === PieceType.LASER) {
      // Use double-line arrows for player 2
      const directions = ['⇒', '⇓', '⇐', '⇑'];
      const rotIndex = piece.rotation_degree / 90;
      symbol = directions[rotIndex % 4];
    }
    else if (piece.piece_type === PieceType.BEAM_SPLITTER) symbol = '⬟'; // Hollow diamond
  } else {
    // Neutral pieces (PlayerType.NONE)
    if (piece.piece_type === PieceType.HYPER_SQUARE) symbol = '◉'; // Fisheye for neutral
  }

  return symbol;
}

/**
 * Print board state visually to console
 */
export function printBoardToConsole(board: BoardInterface, title?: string): void {
  let output = '';
  
  if (title) {
    output += `\n=== ${title} ===\n`;
  }
  
  // Create a 9x9 grid to organize pieces by coordinates
  const grid: (PieceInterface | null)[][] = Array(9).fill(null).map(() => Array(9).fill(null));
  
  // Fill the grid with pieces from the cells array
  board.cells.forEach(cell => {
    if (cell.piece) {
      grid[cell.coordinates.y][cell.coordinates.x] = cell.piece;
    }
  });
  
  // Add column headers
  output += '\n  0 1 2 3 4 5 6 7 8\n';
  output += '  ┌─┬─┬─┬─┬─┬─┬─┬─┬─┐\n';
  
  // Add board rows from top to bottom (y=8 to y=0)
  for (let y = 8; y >= 0; y--) {
    const rowPieces: string[] = [];
    for (let x = 0; x < 9; x++) {
      const piece = grid[y][x];
      if (piece === null) {
        rowPieces.push('·');
      } else {
        // Get piece symbol based on type and player
        const symbol = getPieceSymbol(piece);
        rowPieces.push(symbol);
      }
    }
    
    output += `${y} │${rowPieces.join('│')}│\n`;
    
    if (y > 0) {
      output += '  ├─┼─┼─┼─┼─┼─┼─┼─┼─┤\n';
    }
  }
  
  output += '  └─┴─┴─┴─┴─┴─┴─┴─┴─┘\n';
  
  // Add legend
  output += '\nLegend:\n';
  output += '  Player 1 (filled): ♔=King, →=Laser, ◢=TriMirror, ◇=DiagMirror, ▬=Mirror, ■=Block, ❖=BeamSplit, ⬛=HyperCube\n';
  output += '  Player 2 (hollow): ♚=King, ⇒=Laser, ◿=TriMirror, ♢=DiagMirror, ─=Mirror, □=Block, ⬟=BeamSplit, ⬜=HyperCube\n';
  output += '  Neutral: ◉=HyperSquare\n';
  output += '  Rotation: Lasers/Mirrors show direction, Triangular mirrors rotate ◢→◣→◤→◥\n';
  output += '  Empty: · = no piece';
  
  // Output everything as a single log statement
  console.log(output);
}

/**
 * Create mock initial game state for testing
 */
export function createMockInitialGameState(): GameState {
  const cells = [];
  
  // Player One pieces (bottom two rows)
  // Row 0 (y=0)
  cells.push(
    { coordinates: { x: 0, y: 0 }, piece: { piece_type: PieceType.TRIANGULAR_MIRROR, piece_owner: PlayerType.PLAYER_ONE, rotation_degree: 0 }, auxiliaryPiece: null },
    { coordinates: { x: 1, y: 0 }, piece: { piece_type: PieceType.TRIANGULAR_MIRROR, piece_owner: PlayerType.PLAYER_ONE, rotation_degree: 0 }, auxiliaryPiece: null },
    { coordinates: { x: 2, y: 0 }, piece: { piece_type: PieceType.DIAGONAL_MIRROR, piece_owner: PlayerType.PLAYER_ONE, rotation_degree: 0 }, auxiliaryPiece: null },
    { coordinates: { x: 3, y: 0 }, piece: { piece_type: PieceType.HYPER_CUBE, piece_owner: PlayerType.PLAYER_ONE, rotation_degree: 0 }, auxiliaryPiece: null },
    { coordinates: { x: 4, y: 0 }, piece: { piece_type: PieceType.KING, piece_owner: PlayerType.PLAYER_ONE, rotation_degree: 0 }, auxiliaryPiece: null },
    { coordinates: { x: 5, y: 0 }, piece: { piece_type: PieceType.LASER, piece_owner: PlayerType.PLAYER_ONE, rotation_degree: 0 }, auxiliaryPiece: null },
    { coordinates: { x: 6, y: 0 }, piece: { piece_type: PieceType.DIAGONAL_MIRROR, piece_owner: PlayerType.PLAYER_ONE, rotation_degree: 90 }, auxiliaryPiece: null },
    { coordinates: { x: 7, y: 0 }, piece: { piece_type: PieceType.TRIANGULAR_MIRROR, piece_owner: PlayerType.PLAYER_ONE, rotation_degree: 270 }, auxiliaryPiece: null },
    { coordinates: { x: 8, y: 0 }, piece: { piece_type: PieceType.TRIANGULAR_MIRROR, piece_owner: PlayerType.PLAYER_ONE, rotation_degree: 270 }, auxiliaryPiece: null }
  );
  
  // Row 1 (y=1)
  cells.push(
    { coordinates: { x: 0, y: 1 }, piece: { piece_type: PieceType.TRIANGULAR_MIRROR, piece_owner: PlayerType.PLAYER_ONE, rotation_degree: 270 }, auxiliaryPiece: null },
    { coordinates: { x: 1, y: 1 }, piece: { piece_type: PieceType.BLOCK, piece_owner: PlayerType.PLAYER_ONE, rotation_degree: 0 }, auxiliaryPiece: null },
    { coordinates: { x: 2, y: 1 }, piece: { piece_type: PieceType.BLOCK, piece_owner: PlayerType.PLAYER_ONE, rotation_degree: 0 }, auxiliaryPiece: null },
    { coordinates: { x: 3, y: 1 }, piece: { piece_type: PieceType.MIRROR, piece_owner: PlayerType.PLAYER_ONE, rotation_degree: 90 }, auxiliaryPiece: null },
    { coordinates: { x: 4, y: 1 }, piece: { piece_type: PieceType.MIRROR, piece_owner: PlayerType.PLAYER_ONE, rotation_degree: 0 }, auxiliaryPiece: null },
    { coordinates: { x: 5, y: 1 }, piece: { piece_type: PieceType.BEAM_SPLITTER, piece_owner: PlayerType.PLAYER_ONE, rotation_degree: 0 }, auxiliaryPiece: null },
    { coordinates: { x: 6, y: 1 }, piece: { piece_type: PieceType.BLOCK, piece_owner: PlayerType.PLAYER_ONE, rotation_degree: 0 }, auxiliaryPiece: null },
    { coordinates: { x: 7, y: 1 }, piece: { piece_type: PieceType.BLOCK, piece_owner: PlayerType.PLAYER_ONE, rotation_degree: 0 }, auxiliaryPiece: null },
    { coordinates: { x: 8, y: 1 }, piece: { piece_type: PieceType.TRIANGULAR_MIRROR, piece_owner: PlayerType.PLAYER_ONE, rotation_degree: 0 }, auxiliaryPiece: null }
  );
  
  // Empty rows (2-6)
  for (let y = 2; y <= 6; y++) {
    for (let x = 0; x < 9; x++) {
      cells.push({ coordinates: { x, y }, piece: null, auxiliaryPiece: null });
    }
  }
  
  // Center piece (Hyper Square)
  cells.find(cell => cell.coordinates.x === 4 && cell.coordinates.y === 4)!.piece = 
    { piece_type: PieceType.HYPER_SQUARE, piece_owner: PlayerType.NONE, rotation_degree: 0 };
  
  // Player Two pieces (top two rows)
  // Row 7 (y=7)
  cells.push(
    { coordinates: { x: 0, y: 7 }, piece: { piece_type: PieceType.TRIANGULAR_MIRROR, piece_owner: PlayerType.PLAYER_TWO, rotation_degree: 180 }, auxiliaryPiece: null },
    { coordinates: { x: 1, y: 7 }, piece: { piece_type: PieceType.BLOCK, piece_owner: PlayerType.PLAYER_TWO, rotation_degree: 180 }, auxiliaryPiece: null },
    { coordinates: { x: 2, y: 7 }, piece: { piece_type: PieceType.BLOCK, piece_owner: PlayerType.PLAYER_TWO, rotation_degree: 180 }, auxiliaryPiece: null },
    { coordinates: { x: 3, y: 7 }, piece: { piece_type: PieceType.BEAM_SPLITTER, piece_owner: PlayerType.PLAYER_TWO, rotation_degree: 180 }, auxiliaryPiece: null },
    { coordinates: { x: 4, y: 7 }, piece: { piece_type: PieceType.MIRROR, piece_owner: PlayerType.PLAYER_TWO, rotation_degree: 0 }, auxiliaryPiece: null },
    { coordinates: { x: 5, y: 7 }, piece: { piece_type: PieceType.MIRROR, piece_owner: PlayerType.PLAYER_TWO, rotation_degree: 90 }, auxiliaryPiece: null },
    { coordinates: { x: 6, y: 7 }, piece: { piece_type: PieceType.BLOCK, piece_owner: PlayerType.PLAYER_TWO, rotation_degree: 180 }, auxiliaryPiece: null },
    { coordinates: { x: 7, y: 7 }, piece: { piece_type: PieceType.BLOCK, piece_owner: PlayerType.PLAYER_TWO, rotation_degree: 180 }, auxiliaryPiece: null },
    { coordinates: { x: 8, y: 7 }, piece: { piece_type: PieceType.TRIANGULAR_MIRROR, piece_owner: PlayerType.PLAYER_TWO, rotation_degree: 90 }, auxiliaryPiece: null }
  );
  
  // Row 8 (y=8)
  cells.push(
    { coordinates: { x: 0, y: 8 }, piece: { piece_type: PieceType.TRIANGULAR_MIRROR, piece_owner: PlayerType.PLAYER_TWO, rotation_degree: 90 }, auxiliaryPiece: null },
    { coordinates: { x: 1, y: 8 }, piece: { piece_type: PieceType.TRIANGULAR_MIRROR, piece_owner: PlayerType.PLAYER_TWO, rotation_degree: 90 }, auxiliaryPiece: null },
    { coordinates: { x: 2, y: 8 }, piece: { piece_type: PieceType.DIAGONAL_MIRROR, piece_owner: PlayerType.PLAYER_TWO, rotation_degree: 90 }, auxiliaryPiece: null },
    { coordinates: { x: 3, y: 8 }, piece: { piece_type: PieceType.LASER, piece_owner: PlayerType.PLAYER_TWO, rotation_degree: 180 }, auxiliaryPiece: null },
    { coordinates: { x: 4, y: 8 }, piece: { piece_type: PieceType.KING, piece_owner: PlayerType.PLAYER_TWO, rotation_degree: 0 }, auxiliaryPiece: null },
    { coordinates: { x: 5, y: 8 }, piece: { piece_type: PieceType.HYPER_CUBE, piece_owner: PlayerType.PLAYER_TWO, rotation_degree: 0 }, auxiliaryPiece: null },
    { coordinates: { x: 6, y: 8 }, piece: { piece_type: PieceType.DIAGONAL_MIRROR, piece_owner: PlayerType.PLAYER_TWO, rotation_degree: 0 }, auxiliaryPiece: null },
    { coordinates: { x: 7, y: 8 }, piece: { piece_type: PieceType.TRIANGULAR_MIRROR, piece_owner: PlayerType.PLAYER_TWO, rotation_degree: 180 }, auxiliaryPiece: null },
    { coordinates: { x: 8, y: 8 }, piece: { piece_type: PieceType.TRIANGULAR_MIRROR, piece_owner: PlayerType.PLAYER_TWO, rotation_degree: 180 }, auxiliaryPiece: null }
  );
  
  return {
    game_id: 'test-game-123',
    player_one_id: 'test_player_1',
    player_two_id: 'test_player_2',
    player_one_time_left: 600,
    player_two_time_left: 600,
    board: { cells },
    game_phase: GamePhase.NOT_STARTED,
    turn_number: 0,
    is_rated: false,
    is_timed: true,
    game_events: [],
    user_events: []
  };
} 
