import { 
  pieceToFen, 
  boardToFen, 
  gameStateToFen, 
  createMockInitialGameState,
  printBoardToConsole
} from './fen.utils';
import { PieceType, PlayerType, GamePhase } from './src/Utils/Enums';
import { BoardInterface, GameState, PieceInterface } from './game.models';

describe('FEN Utils', () => {
  
  describe('pieceToFen', () => {
    it('should convert player one pieces to uppercase symbols', () => {
      const piece: PieceInterface = {
        piece_type: PieceType.KING,
        piece_owner: PlayerType.PLAYER_ONE,
        rotation_degree: 0
      };
      
      expect(pieceToFen(piece)).toBe('K');
    });

    it('should convert player two pieces to lowercase symbols', () => {
      const piece: PieceInterface = {
        piece_type: PieceType.LASER,
        piece_owner: PlayerType.PLAYER_TWO,
        rotation_degree: 0
      };
      
      expect(pieceToFen(piece)).toBe('l');
    });

    it('should add rotation suffixes correctly', () => {
      const piece90: PieceInterface = {
        piece_type: PieceType.MIRROR,
        piece_owner: PlayerType.PLAYER_ONE,
        rotation_degree: 90
      };
      
      const piece180: PieceInterface = {
        piece_type: PieceType.DIAGONAL_MIRROR,
        piece_owner: PlayerType.PLAYER_TWO,
        rotation_degree: 180
      };
      
      const piece270: PieceInterface = {
        piece_type: PieceType.TRIANGULAR_MIRROR,
        piece_owner: PlayerType.PLAYER_ONE,
        rotation_degree: 270
      };
      
      expect(pieceToFen(piece90)).toBe('M1');
      expect(pieceToFen(piece180)).toBe('d2');
      expect(pieceToFen(piece270)).toBe('T3');
    });

    it('should handle neutral pieces (NONE player)', () => {
      const hyperSquare: PieceInterface = {
        piece_type: PieceType.HYPER_SQUARE,
        piece_owner: PlayerType.NONE,
        rotation_degree: 0
      };
      
      expect(pieceToFen(hyperSquare)).toBe('s');
    });
  });

  describe('FEN Serialization with Initial Game State', () => {
    let mockGameState: GameState;
    
    beforeEach(() => {
      mockGameState = createMockInitialGameState();
    });

    it('should serialize initial game state to FEN and print to console', () => {
      console.log('\n=== LASER CHESS FEN SERIALIZATION TEST ===');
      
      // Print initial game state to console
      console.log('\n=== INITIAL GAME STATE ===');
      console.log('Player One ID:', mockGameState.player_one_id);
      console.log('Player Two ID:', mockGameState.player_two_id);
      console.log('Game Phase:', mockGameState.game_phase);
      console.log('Turn Number:', mockGameState.turn_number);
      console.log('Is Rated:', mockGameState.is_rated);
      console.log('Is Timed:', mockGameState.is_timed);
      console.log('Player One Time Left:', mockGameState.player_one_time_left);
      console.log('Player Two Time Left:', mockGameState.player_two_time_left);
      
      // Print board state in a visual format
      printBoardToConsole(mockGameState.board, 'BOARD STATE (Visual)');
      
      // Serialize to FEN
      const fenString = gameStateToFen(mockGameState);
      
      // Print FEN string to console
      console.log('\n=== FEN SERIALIZATION ===');
      console.log('FEN:', fenString);
      
      // Print FEN breakdown
      const fenParts = fenString.split(' ');
      console.log('\n=== FEN BREAKDOWN ===');
      console.log('Board Position:', fenParts[0]);
      console.log('Active Player:', fenParts[1], '(w = PLAYER_ONE, b = PLAYER_TWO)');
      console.log('Turn Number:', fenParts[2]);
      console.log('Game Phase:', fenParts[3], '(ns = not started, s = started, w1 = player one victory, w2 = player two victory, d = draw)');
      
      // Print board rows breakdown
      console.log('\n=== BOARD ROWS IN FEN ===');
      const boardRows = fenParts[0].split('/');
      for (let i = 0; i < boardRows.length; i++) {
        console.log(`Row ${8 - i} (y=${8 - i}): ${boardRows[i]}`);
      }
      
      // Basic validation of FEN format
      expect(fenParts.length).toBe(4);
      
      const [boardPosition, activePlayer, turnNumber, gamePhase] = fenParts;
      
      // Validate board position format (should have 8 slashes for 9 rows)
      expect(boardPosition.split('/').length).toBe(9);
      
      // Validate active player
      expect(['w', 'b']).toContain(activePlayer);
      
      // Validate turn number
      expect(parseInt(turnNumber, 10)).toBe(0);
      
      // Validate game phase
      expect(gamePhase).toBe('ns');
      
      // Validate active player for initial state (should be PLAYER_ONE)
      expect(activePlayer).toBe('w');
      
      console.log('\n=== TEST VALIDATION RESULTS ===');
      console.log('✓ FEN has 4 parts');
      console.log('✓ Board position has 9 rows');
      console.log('✓ Active player is valid (w/b)');
      console.log('✓ Turn number is 0 for initial state');
      console.log('✓ Game phase is "ns" (not started)');
      console.log('✓ Active player is "w" (PLAYER_ONE) for initial state');
      
      console.log('\n=== FEN SERIALIZATION TEST PASSED ===');
    });

    it('should validate specific piece positions in FEN', () => {
      const boardFen = boardToFen(mockGameState.board);
      const rows = boardFen.split('/');
      
      console.log('\n=== PIECE POSITION VALIDATION ===');
      printBoardToConsole(mockGameState.board, 'BOARD FOR PIECE VALIDATION');
      
      // Bottom row (y=0) - should contain Player One pieces
      const bottomRow = rows[8]; // Last row in FEN represents y=0
      console.log('Bottom row (y=0):', bottomRow);
      
      // Should start with triangular mirrors and contain king, laser
      expect(bottomRow).toContain('T'); // Triangular mirrors
      expect(bottomRow).toContain('K'); // King
      expect(bottomRow).toContain('L'); // Laser
      expect(bottomRow).toContain('D'); // Diagonal mirror
      expect(bottomRow).toContain('H'); // Hyper cube
      
      // Top row (y=8) - should contain Player Two pieces (lowercase)
      const topRow = rows[0]; // First row in FEN represents y=8
      console.log('Top row (y=8):', topRow);
      
      // Should contain lowercase pieces for Player Two
      expect(topRow).toContain('t'); // Triangular mirrors
      expect(topRow).toContain('k'); // King
      expect(topRow).toContain('l'); // Laser
      expect(topRow).toContain('d'); // Diagonal mirror
      expect(topRow).toContain('h'); // Hyper cube
      
      // Middle row (y=4) should contain hyper square
      const middleRow = rows[4]; // 5th row from top represents y=4
      console.log('Middle row (y=4):', middleRow);
      expect(middleRow).toContain('s'); // Hyper square (lowercase for NONE player)
      
      console.log('✓ All piece positions validated correctly');
    });

    it('should handle rotation notations correctly', () => {
      const boardFen = boardToFen(mockGameState.board);
      
      console.log('\n=== ROTATION VALIDATION ===');
      console.log('Board FEN:', boardFen);
      
      // Should contain rotation suffixes
      expect(boardFen).toContain('1'); // 90-degree rotations
      expect(boardFen).toContain('2'); // 180-degree rotations  
      expect(boardFen).toContain('3'); // 270-degree rotations
      
      console.log('✓ Rotation suffixes found in FEN');
    });

    it('should create valid mock initial game state', () => {
      console.log('\n=== MOCK GAME STATE VALIDATION ===');
      
      // Validate game state structure
      expect(mockGameState.game_id).toBe('test-game-123');
      expect(mockGameState.player_one_id).toBe('test_player_1');
      expect(mockGameState.player_two_id).toBe('test_player_2');
      expect(mockGameState.game_phase).toBe(GamePhase.NOT_STARTED);
      expect(mockGameState.turn_number).toBe(0);
      expect(mockGameState.is_rated).toBe(false);
      expect(mockGameState.is_timed).toBe(true);
      
      // Validate board has correct number of cells (9x9 = 81)
      expect(mockGameState.board.cells.length).toBe(81);
      
      // Count pieces
      const pieceCells = mockGameState.board.cells.filter(cell => cell.piece !== null);
      const playerOnePieces = pieceCells.filter(cell => cell.piece?.piece_owner === PlayerType.PLAYER_ONE);
      const playerTwoPieces = pieceCells.filter(cell => cell.piece?.piece_owner === PlayerType.PLAYER_TWO);
      const neutralPieces = pieceCells.filter(cell => cell.piece?.piece_owner === PlayerType.NONE);
      
      console.log('Total pieces:', pieceCells.length);
      console.log('Player One pieces:', playerOnePieces.length);
      console.log('Player Two pieces:', playerTwoPieces.length);
      console.log('Neutral pieces:', neutralPieces.length);
      
      // Each player should have 18 pieces + 1 neutral hyper square
      expect(playerOnePieces.length).toBe(18);
      expect(playerTwoPieces.length).toBe(18);
      expect(neutralPieces.length).toBe(1);
      
      console.log('✓ Mock game state structure validated');
    });
  });

  describe('boardToFen', () => {
    it('should handle empty board correctly', () => {
      const emptyBoard: BoardInterface = {
        cells: []
      };
      
      // Fill with empty cells
      for (let y = 0; y < 9; y++) {
        for (let x = 0; x < 9; x++) {
          emptyBoard.cells.push({
            coordinates: { x, y },
            piece: null,
            auxiliaryPiece: null
          });
        }
      }
      
      const fen = boardToFen(emptyBoard);
      
      // Should be 9 rows of 9 empty squares each
      expect(fen).toBe('9/9/9/9/9/9/9/9/9');
      
      console.log('\n=== EMPTY BOARD FEN ===');
      console.log('Empty board FEN:', fen);
      console.log('✓ Empty board serialization correct');
      
      // Also print the empty board visually
      printBoardToConsole(emptyBoard, 'EMPTY BOARD VISUALIZATION');
    });
  });
}); 
