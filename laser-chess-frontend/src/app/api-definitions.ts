import { environment } from "src/environments/environment";

export const fullEndpoint = (endpoint: String) => `${environment.API_URL}${environment.API_PREFIX}${endpoint}`

export const usersEndpoint = '/users'
export const tokenEndpoint = '/token'
export const gameStateEndpoint = '/get_game_state'
export const movePieceEndpoint = '/move_piece'
export const rotatePieceEndpoint = '/rotate_piece'
export const shootLaserEndpoint = '/shoot_laser'
export const authWebsocketEndpoint = '/ws_auth'

export const usersFullEndpoint = fullEndpoint(usersEndpoint)
export const tokenFullEndpoint = fullEndpoint(tokenEndpoint)
export const gameStateFullEndpoint = fullEndpoint(gameStateEndpoint)
export const movePieceFullEndpoint = fullEndpoint(movePieceEndpoint)
export const rotatePieceFullEndpoint = fullEndpoint(rotatePieceEndpoint)
export const shootLaserFullEndpoint = fullEndpoint(shootLaserEndpoint)

